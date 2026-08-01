// Substrate semantics for the fixture transport: chunks, placements, commits,
// branches — the claims db/fixtures/ records, in memory. Mirrors the db crate's
// shape (`db/src/ops/commit.rs`, `db/src/validate.rs`, `db/src/ops/scope/`), which
// is what lets both implementations run the same cases.
import { EngineError } from '../types.ts'
import type {
  ChunkId,
  ChunkItem,
  Commit,
  CommitId,
  Declaration,
  Dim,
  Placement,
  PlacementType,
  ScopeResult,
  Spec,
} from '../types.ts'

export type ChunkRow = { name?: string; spec: Spec; body: Record<string, unknown> }
export type PlacementRow = {
  chunk: ChunkId
  scope: ChunkId
  type: PlacementType
  seq?: number
  /** Write order — duplicate explicit seqs stand, and tie by commit order. */
  order: number
}

/** Current state of one branch in one store: the db's two `current_*` tables. */
export type Snapshot = {
  chunks: Map<ChunkId, ChunkRow>
  placements: Map<string, PlacementRow> // key: `${chunk}\u0000${scope}`
}

export type Store = {
  id: string
  mode: 'read-write' | 'read-only'
  branch: string // the branch this mount tracks
  branches: Map<string, CommitId>
  states: Map<string, Snapshot>
  commits: Map<CommitId, Commit>
  chunkVersions: { chunk: ChunkId; commit: CommitId; row: ChunkRow | null }[]
  placementVersions: (PlacementRow & { commit: CommitId; active: boolean })[]
}

/** A read view: the active store's snapshot first, then each peer's. */
export type View = Snapshot[]

export const placementKey = (chunk: ChunkId, scope: ChunkId): string => `${chunk}\u0000${scope}`

let sequence = 0
const newId = (prefix: string): string => `${prefix}_${(sequence += 1).toString().padStart(6, '0')}`

let writeOrder = 0

export function createStore(id: string, mode: Store['mode'], branch = 'main'): Store {
  const root: Commit = {
    id: newId('commit'),
    timestamp: new Date(0).toISOString(),
    branch,
    chunks_modified: [],
    placements_modified: [],
  }
  return {
    id,
    mode,
    branch,
    branches: new Map([[branch, root.id]]),
    states: new Map([[branch, { chunks: new Map(), placements: new Map() }]]),
    commits: new Map([[root.id, root]]),
    chunkVersions: [],
    placementVersions: [],
  }
}

export function snapshotOf(store: Store, branch: string): Snapshot {
  const state = store.states.get(branch)
  if (!state) throw new EngineError('NOT_FOUND', `branch ${branch}`)
  return state
}

export function headOf(store: Store, branch: string): CommitId {
  const head = store.branches.get(branch)
  if (!head) throw new EngineError('NOT_FOUND', `branch ${branch}`)
  return head
}

// ---- writes ----------------------------------------------------------------

/**
 * Apply a declaration to `store` on `branch`, mutating the live snapshot the
 * view holds — so placements later in the same declaration see the earlier ones
 * (the two-pass write-then-validate substrate.md depends on). Validation is the
 * caller's, run against the post-write state.
 */
export function applyDeclaration(
  store: Store,
  view: View,
  declaration: Declaration,
  branch: string,
  processId?: string,
): { commit: Commit; touched: Set<ChunkId> } {
  const state = snapshotOf(store, branch)
  const parent = headOf(store, branch)
  const commitId = newId('commit')
  const touched = new Set<ChunkId>()
  const chunksModified: ChunkId[] = []
  const placementsModified: [ChunkId, ChunkId][] = []

  for (const declared of declaration.chunks) {
    const id = declared.id ?? newId('chunk')
    if (declared.removed) {
      store.chunkVersions.push({ chunk: id, commit: commitId, row: null })
      removeChunk(state, id, placementsModified)
    } else {
      const row: ChunkRow = {
        name: declared.name,
        spec: declared.spec ?? {},
        body: declared.body ?? {},
      }
      store.chunkVersions.push({ chunk: id, commit: commitId, row })
      state.chunks.set(id, row)
    }
    touched.add(id)
    chunksModified.push(id)
  }

  for (const declared of declaration.placements) {
    // Residency is not a write requirement (substrate.md, *Peers*): chunk ids are
    // globally unique, so a placement may reference a scope another db holds —
    // or one that resolves nowhere yet. Reads report that as `unresolved`.
    const active = declared.active ?? true
    let seq = declared.seq
    if (active && declared.type === 'instance' && seq === undefined) {
      // Evaluated as each placement is applied, so multiple appends in one
      // declaration see each other's just-applied rows.
      if (effectiveContract(view, declared.scope).ordered) seq = nextSeq(view, declared.scope)
    }
    const row: PlacementRow = {
      chunk: declared.chunk,
      scope: declared.scope,
      type: declared.type,
      seq,
      order: (writeOrder += 1),
    }
    store.placementVersions.push({ ...row, commit: commitId, active })
    if (active) state.placements.set(placementKey(row.chunk, row.scope), row)
    else state.placements.delete(placementKey(row.chunk, row.scope))
    touched.add(declared.chunk)
    placementsModified.push([declared.chunk, declared.scope])
  }

  const commit: Commit = {
    id: commitId,
    parent_id: parent,
    timestamp: new Date().toISOString(),
    message: declaration.message,
    process_id: processId,
    branch,
    chunks_modified: chunksModified,
    placements_modified: placementsModified,
  }
  store.commits.set(commitId, commit)
  store.branches.set(branch, commitId)
  return { commit, touched }
}

/** Logical removal: the chunk leaves current state, and so does every placement
 *  involving it — as the placed chunk or as the scope. Version rows stay. */
function removeChunk(state: Snapshot, id: ChunkId, modified: [ChunkId, ChunkId][]): void {
  if (!state.chunks.has(id)) throw new EngineError('NOT_FOUND', `chunk ${id}`)
  for (const [entry, row] of state.placements) {
    if (row.chunk === id || row.scope === id) {
      modified.push([row.chunk, row.scope])
      state.placements.delete(entry)
    }
  }
  state.chunks.delete(id)
}

function nextSeq(view: View, scope: ChunkId): number {
  const seqs = membersOf(view, scope).map((p) => p.seq ?? 0)
  return Math.max(0, ...seqs) + 1
}

/** Run a write and undo it wholly if it throws — the atomicity of a declaration. */
export function transact<T>(store: Store, branch: string, write: () => T): T {
  const state = snapshotOf(store, branch)
  const chunks = new Map(state.chunks)
  const placements = new Map(state.placements)
  const marks = {
    chunkVersions: store.chunkVersions.length,
    placementVersions: store.placementVersions.length,
    head: headOf(store, branch),
  }
  try {
    return write()
  } catch (error) {
    state.chunks.clear()
    for (const [id, row] of chunks) state.chunks.set(id, row)
    state.placements.clear()
    for (const [id, row] of placements) state.placements.set(id, row)
    store.chunkVersions.length = marks.chunkVersions
    store.placementVersions.length = marks.placementVersions
    store.branches.set(branch, marks.head)
    throw error
  }
}

/** Fork a branch from a commit, materializing its state (substrate.md, *Branches*). */
export function fork(store: Store, branch: string, at: CommitId): void {
  if (!store.commits.has(at)) throw new EngineError('NOT_FOUND', `commit ${at}`)
  store.branches.set(branch, at)
  store.states.set(branch, stateAt(store, at))
}

/** Reconstruct state as of a commit by walking its ancestry — nearest version wins. */
export function stateAt(store: Store, at: CommitId): Snapshot {
  if (!store.commits.has(at)) throw new EngineError('NOT_FOUND', `commit ${at}`)
  const ancestry = new Set<CommitId>()
  let cursor: CommitId | undefined = at
  while (cursor) {
    ancestry.add(cursor)
    cursor = store.commits.get(cursor)?.parent_id
  }
  const state: Snapshot = { chunks: new Map(), placements: new Map() }
  for (const version of store.chunkVersions) {
    if (!ancestry.has(version.commit)) continue
    if (version.row) state.chunks.set(version.chunk, version.row)
    else state.chunks.delete(version.chunk)
  }
  for (const version of store.placementVersions) {
    if (!ancestry.has(version.commit)) continue
    const { commit: _commit, active, ...row } = version
    if (active) state.placements.set(placementKey(row.chunk, row.scope), row)
    else state.placements.delete(placementKey(row.chunk, row.scope))
  }
  // A placement is live only while both its endpoints are.
  for (const [entry, row] of state.placements) {
    if (!state.chunks.has(row.chunk) || !state.chunks.has(row.scope)) {
      state.placements.delete(entry)
    }
  }
  return state
}

// ---- view helpers ----------------------------------------------------------

/** First hit wins, as federated `get` does across mounts. */
export function chunkOf(view: View, id: ChunkId): ChunkRow | undefined {
  for (const snapshot of view) {
    const row = snapshot.chunks.get(id)
    if (row) return row
  }
  return undefined
}

export function allChunks(view: View): ChunkId[] {
  const ids = new Set<ChunkId>()
  for (const snapshot of view) for (const id of snapshot.chunks.keys()) ids.add(id)
  return [...ids]
}

/** Placements union across the field — a cross-db placement lives in one store,
 *  its scope chunk in another. */
export function placementsOf(view: View, chunk: ChunkId): PlacementRow[] {
  return view.flatMap((snapshot) => [...snapshot.placements.values()].filter((p) => p.chunk === chunk))
}

export function membersOf(view: View, scope: ChunkId): PlacementRow[] {
  return view.flatMap((snapshot) => [...snapshot.placements.values()].filter((p) => p.scope === scope))
}

export function placementOf(view: View, chunk: ChunkId, scope: ChunkId): PlacementRow | undefined {
  for (const snapshot of view) {
    const row = snapshot.placements.get(placementKey(chunk, scope))
    if (row) return row
  }
  return undefined
}

export function instanceParents(view: View, chunk: ChunkId): ChunkId[] {
  return placementsOf(view, chunk)
    .filter((p) => p.type === 'instance')
    .map((p) => p.scope)
}

// ---- validation ------------------------------------------------------------

export type Contract = {
  ordered: boolean
  required: Set<string>
  unique: Set<string>
  acceptsDeclared: boolean
  accepts: Set<ChunkId>
}

/**
 * The effective contract for chunks placed `instance` on a scope: the scope's own
 * non-propagating spec folded with the propagating spec of every archetype the
 * scope is transitively instance of (substrate.md, *Spec validation*). Each
 * part's `accepts` names resolve within that part's own scope.
 */
export function effectiveContract(view: View, scope: ChunkId): Contract {
  const contract: Contract = {
    ordered: false,
    required: new Set(),
    unique: new Set(),
    acceptsDeclared: false,
    accepts: new Set(),
  }
  const own = chunkOf(view, scope)?.spec
  if (own && !own.propagate && !isEmptySpec(own)) fold(view, scope, own, contract)
  for (const ancestor of instanceAncestors(view, scope)) {
    const spec = chunkOf(view, ancestor)?.spec
    if (spec?.propagate) fold(view, ancestor, spec, contract)
  }
  return contract
}

function fold(view: View, resolutionScope: ChunkId, spec: Spec, contract: Contract): void {
  contract.ordered ||= spec.ordered === true
  for (const field of spec.required ?? []) contract.required.add(field)
  for (const field of spec.unique ?? []) contract.unique.add(field)
  if ((spec.accepts ?? []).length > 0) {
    contract.acceptsDeclared = true
    for (const name of spec.accepts ?? []) {
      for (const id of resolveName(view, resolutionScope, name)) contract.accepts.add(id)
    }
  }
}

function isEmptySpec(spec: Spec): boolean {
  return (
    !spec.ordered &&
    !spec.propagate &&
    (spec.accepts ?? []).length === 0 &&
    (spec.required ?? []).length === 0 &&
    (spec.unique ?? []).length === 0
  )
}

function instanceAncestors(view: View, chunk: ChunkId): ChunkId[] {
  const seen = new Set<ChunkId>()
  const frontier = [chunk]
  while (frontier.length > 0) {
    for (const parent of instanceParents(view, frontier.pop()!)) {
      if (seen.has(parent)) continue
      seen.add(parent)
      frontier.push(parent)
    }
  }
  return [...seen]
}

/** Chunks named `name` placed on `scope` — any placement type: type definitions
 *  are relates-placed and must stay resolvable (substrate.md, *Archetypes*). */
function resolveName(view: View, scope: ChunkId, name: string): ChunkId[] {
  return membersOf(view, scope)
    .filter((p) => chunkOf(view, p.chunk)?.name === name)
    .map((p) => p.chunk)
}

/** Hold every touched chunk to the contract of every scope it is instance on. */
export function validateTouched(view: View, touched: Iterable<ChunkId>): void {
  for (const id of touched) {
    const row = chunkOf(view, id)
    if (!row) continue // removed in this declaration — nothing to hold to a contract
    const placements = placementsOf(view, id)
    const instanceScopes = new Set(placements.filter((p) => p.type === 'instance').map((p) => p.scope))

    for (const placement of placements) {
      if (placement.type !== 'instance') continue
      const scope = placement.scope
      checkNameUnique(view, scope, id, row.name)
      const contract = effectiveContract(view, scope)
      if (contract.ordered && placement.seq === undefined) {
        throw violation(scope, `ordered scope requires a seq on ${id}`)
      }
      if (contract.acceptsDeclared) {
        const memberships = [...instanceScopes].filter((s) => contract.accepts.has(s))
        if (memberships.length === 0) {
          throw violation(scope, `${id} is not an instance of any accepted type`)
        }
        if (memberships.length >= 2) {
          throw violation(scope, `${id} is an instance of two accepted types — ambiguous`)
        }
      }
      for (const field of contract.required) {
        if (row.body[field] === undefined) throw violation(scope, `${id} lacks required key '${field}'`)
      }
      for (const field of contract.unique) {
        if (row.body[field] === undefined) continue
        const clash = membersOf(view, scope)
          .filter((p) => p.type === 'instance' && p.chunk !== id)
          .some((p) => same(chunkOf(view, p.chunk)?.body[field], row.body[field]))
        if (clash) throw violation(scope, `${id} duplicates '${field}' across ${scope}'s instances`)
      }
    }
  }
}

function checkNameUnique(view: View, scope: ChunkId, chunk: ChunkId, name?: string): void {
  if (name === undefined) return
  const collision = membersOf(view, scope).some(
    (p) => p.type === 'instance' && p.chunk !== chunk && chunkOf(view, p.chunk)?.name === name,
  )
  if (collision) throw violation(scope, `a different chunk named '${name}' is already instance on ${scope}`)
}

function violation(scope: ChunkId, detail: string): EngineError {
  return new EngineError('VALIDATION_ERROR', `${detail} (scope ${scope})`)
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

// ---- reads -----------------------------------------------------------------

export type ReadShape = {
  exclude?: ChunkId[]
  match_?: string
  limit?: number
  offset?: number
  body?: boolean
}

export function scopeRead(view: View, roots: ChunkId[], opts: ReadShape, head: CommitId): ScopeResult {
  const excluded = opts.exclude ?? []
  const placedOnAll = (chunk: ChunkId, type?: PlacementType): boolean =>
    roots.every((root) => {
      const placement = placementOf(view, chunk, root)
      return placement !== undefined && (type === undefined || placement.type === type)
    })
  const kept = (chunk: ChunkId): boolean =>
    !excluded.some((root) => placementOf(view, chunk, root) !== undefined) &&
    matchesFts(view, chunk, opts.match_)

  const ids = allChunks(view)
  const members = ids.filter((id) => placedOnAll(id) && kept(id))
  const countByType = (type: PlacementType): number =>
    ids.filter((id) => placedOnAll(id, type) && kept(id)).length

  const ordered = roots.length === 1 && effectiveContract(view, roots[0]!).ordered
  const sorted = ordered
    ? [...members].sort(
        (a, b) =>
          seqOn(view, a, roots[0]!) - seqOn(view, b, roots[0]!) ||
          orderOn(view, a, roots[0]!) - orderOn(view, b, roots[0]!),
      )
    : [...members].sort()

  return {
    head,
    // A root resolving to no chunk is a dead reference, reported as metadata
    // rather than an error — an empty real scope stays distinguishable.
    unresolved: roots.filter((root) => chunkOf(view, root) === undefined),
    total: ids.length,
    in_scope: members.length,
    // The empty conjunction holds for both placement types.
    in_scope_instance: roots.length === 0 ? members.length : countByType('instance'),
    in_scope_relates: roots.length === 0 ? members.length : countByType('relates'),
    chunks: window(sorted, ordered, opts.limit, opts.offset).map((id) =>
      hydrate(view, id, opts.body !== false),
    ),
    dimensions: dimensions(view, roots),
  }
}

/** Ordered scopes page tail-first (substrate.md): offset walks backward from the
 *  latest entries; the returned window stays in ascending seq order. */
function window<T>(items: T[], ordered: boolean, limit?: number, offset = 0): T[] {
  if (!ordered) return items.slice(offset, limit === undefined ? undefined : offset + limit)
  const end = Math.max(0, items.length - offset)
  return items.slice(limit === undefined ? 0 : Math.max(0, end - limit), end)
}

function seqOn(view: View, chunk: ChunkId, scope: ChunkId): number {
  return placementOf(view, chunk, scope)?.seq ?? Number.MAX_SAFE_INTEGER
}

function orderOn(view: View, chunk: ChunkId, scope: ChunkId): number {
  return placementOf(view, chunk, scope)?.order ?? 0
}

export function hydrate(view: View, id: ChunkId, body: boolean): ChunkItem {
  const row = chunkOf(view, id)!
  const placements: Placement[] = placementsOf(view, id).map((p) => ({
    scope_id: p.scope,
    type_: p.type,
    seq: p.seq,
  }))
  const item: ChunkItem = { id, placements }
  if (row.name !== undefined) item.name = row.name
  if (!isEmptySpec(row.spec)) item.spec = row.spec
  if (body) item.body = row.body
  return item
}

/** Dimensions describe what the in-scope set reaches. As in the db crate, they
 *  are computed before `exclude` and `match_` narrow the result (a divergence
 *  recorded on the board, honored here so both implementations agree). */
function dimensions(view: View, roots: ChunkId[]): Dim[] {
  const members = allChunks(view).filter((id) =>
    roots.every((root) => placementOf(view, id, root) !== undefined),
  )
  const dims = new Map<ChunkId, Dim>()
  for (const member of members) {
    for (const placement of placementsOf(view, member)) {
      const dim = dims.get(placement.scope) ?? {
        id: placement.scope,
        name: chunkOf(view, placement.scope)?.name,
        count: 0,
        instance: 0,
        relates: 0,
      }
      dim.count += 1
      if (placement.type === 'instance') dim.instance += 1
      else dim.relates += 1
      dims.set(placement.scope, dim)
    }
  }
  return [...dims.values()].sort((a, b) => b.count - a.count)
}

/** FTS over chunk names and the string values in bodies (substrate.md,
 *  *Full-text search*). Every term must appear as a word. */
function matchesFts(view: View, chunk: ChunkId, query?: string): boolean {
  if (!query) return true
  const row = chunkOf(view, chunk)!
  const text = [row.name ?? '', ...strings(row.body)].join(' ').toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .every((term) => {
      // FTS5's one syntax this emulation honors: a trailing `*` makes the
      // term a token prefix — the shape completion queries send. The word
      // boundary already prefixes; the star only drops from the literal.
      const prefix = term.endsWith('*') ? term.slice(0, -1) : term
      return new RegExp(`\\b${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text)
    })
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}
