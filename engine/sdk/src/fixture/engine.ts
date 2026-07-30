// Engine semantics for the fixture transport: mounts, boundaries, processes and
// subscriptions over the in-memory field. Mirrors `engine/src/` — boundary walks
// (`boundary.rs`), the commit gate (`ops/commit.rs`), federated reads
// (`ops/scope.rs`), so engine/fixtures/ runs here unchanged.
import {
  allChunks,
  applyDeclaration,
  chunkOf,
  createStore,
  fork,
  headOf,
  hydrate,
  instanceParents,
  placementKey,
  placementsOf,
  scopeRead,
  snapshotOf,
  stateAt,
  transact,
  validateTouched,
  type Store,
  type View,
} from './field.ts'
import { EngineError } from '../types.ts'
import type { Event } from '../protocol.ts'
import type {
  ChunkId,
  ChunkItem,
  Commit,
  CommitId,
  Declaration,
  ProcessId,
  ScopeResult,
} from '../types.ts'

export const ENGINE_PROGRAM = 'engine/program'
export const ENGINE_PROCESS = 'engine/process'
export const ENGINE_MOUNT = 'engine/mount'
export const READ_BOUNDARY = 'engine/read-boundary'
export const WRITE_BOUNDARY = 'engine/write-boundary'
export const PROGRAMS_RESULT = 'programs/result'

const BOOTSTRAP = [ENGINE_PROGRAM, ENGINE_PROCESS, READ_BOUNDARY, WRITE_BOUNDARY, PROGRAMS_RESULT]

/** An empty conjunction is the universal set (host context, open program). */
type Boundary = { sets: ChunkId[][] }

type ProcessSlot = {
  parent: ProcessId | null
  read: Boundary
  write: Boundary
  protected: ChunkId[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  watchers: (() => void)[]
}

export type Context = { process: ProcessId | null }

/** A program body for the fixture runtime: it speaks the protocol under its own
 *  process identity, the way a real VM or webview program does. */
export type FixtureProgram = (api: {
  process: ProcessId
  call: (request: { op: string } & Record<string, unknown>) => Promise<unknown>
}) => void | Promise<void>

export type FixtureEngine = {
  stores: Store[]
  processes: Map<ProcessId, ProcessSlot>
  subscriptions: Map<string, { process: ProcessId | null; scopes: ChunkId[] }>
  programs: Map<ChunkId, FixtureProgram>
  emit: (event: Event) => void
}

let sequence = 0
const newId = (prefix: string): string => `${prefix}_${(sequence += 1).toString().padStart(6, '0')}`

export function createEngine(peers: Record<string, Declaration[]> = {}): FixtureEngine {
  const active = createStore('active', 'read-write')
  const engine: FixtureEngine = {
    stores: [active],
    processes: new Map(),
    subscriptions: new Map(),
    programs: new Map(),
    emit: () => {},
  }
  seed(active, {
    chunks: BOOTSTRAP.map((id) => ({ id, name: id.split('/')[1] })),
    placements: [],
  })
  for (const [name, declarations] of Object.entries(peers)) {
    const peer = createStore(name, 'read-only')
    for (const declaration of declarations) seed(peer, declaration)
    engine.stores.push(peer)
  }
  return engine
}

function seed(store: Store, declaration: Declaration): void {
  applyDeclaration(store, [snapshotOf(store, store.branch)], declaration, store.branch)
}

const active = (engine: FixtureEngine): Store => engine.stores[0]!

/** Every mount's snapshot at the branch it tracks; `at` is honored on the
 *  read-write mount only, as the engine does. */
function viewOf(engine: FixtureEngine, branch?: string, at?: CommitId): View {
  return engine.stores.map((store) => {
    if (store.mode === 'read-only') return snapshotOf(store, store.branch)
    return at ? stateAt(store, at) : snapshotOf(store, branch ?? store.branch)
  })
}

// ---- boundaries ------------------------------------------------------------

const UNIVERSAL: Boundary = { sets: [] }
const narrowed = (boundary: Boundary, roots: ChunkId[]): Boundary => ({
  sets: [...boundary.sets, roots],
})

function boundariesOf(engine: FixtureEngine, ctx: Context): { read: Boundary; write: Boundary } {
  if (!ctx.process) return { read: UNIVERSAL, write: UNIVERSAL }
  const slot = engine.processes.get(ctx.process)
  if (!slot) throw new EngineError('NOT_FOUND', `process ${ctx.process} is not active`)
  return { read: slot.read, write: slot.write }
}

const isVirtual = (id: ChunkId): boolean => id === ENGINE_MOUNT || id.startsWith('engine/mount:')

/** Can this identity open `target` as a scope? The walk is the instance chain;
 *  the process's own id is implicitly a root in both boundaries. */
function canOpen(view: View, boundary: Boundary, process: ProcessId | null, target: ChunkId): boolean {
  if (boundary.sets.length === 0) return true
  if (process && reaches(view, target, [process])) return true
  return boundary.sets.every((roots) => reaches(view, target, roots))
}

/** Openable, or placed (instance or relates alike) on an openable scope — "once
 *  a scope is opened, everything placed on it is visible". */
function canReadChunk(view: View, boundary: Boundary, process: ProcessId | null, target: ChunkId): boolean {
  if (canOpen(view, boundary, process, target)) return true
  return placementsOf(view, target).some((p) => canOpen(view, boundary, process, p.scope))
}

function reaches(view: View, target: ChunkId, roots: ChunkId[]): boolean {
  const seen = new Set<ChunkId>()
  const frontier = [target]
  while (frontier.length > 0) {
    const current = frontier.pop()!
    if (roots.includes(current)) return true
    if (seen.has(current)) continue
    seen.add(current)
    if (current.startsWith('engine/mount:')) frontier.push(ENGINE_MOUNT)
    else if (isVirtual(current)) continue // no chain into the field
    else frontier.push(...instanceParents(view, current))
  }
  return false
}

// ---- reads -----------------------------------------------------------------

export function scopeOp(
  engine: FixtureEngine,
  ctx: Context,
  scopes: ChunkId[],
  opts: {
    branch?: string
    at?: CommitId
    match_?: string
    exclude?: ChunkId[]
    limit?: number
    offset?: number
    include?: { body?: boolean }
  } = {},
): ScopeResult {
  const view = viewOf(engine, opts.branch, opts.at)
  const boundary = boundariesOf(engine, ctx).read
  for (const root of [...scopes, ...(opts.exclude ?? [])]) {
    if (!canOpen(view, boundary, ctx.process, root)) {
      throw new EngineError('BOUNDARY_VIOLATION', `scope ${root} is not reachable from the read boundary`)
    }
  }
  if (scopes[0] === ENGINE_MOUNT) return mountListing(engine)

  const head = opts.at ?? headOf(active(engine), opts.branch ?? active(engine).branch)
  const result = scopeRead(
    view,
    scopes,
    {
      exclude: opts.exclude,
      match_: opts.match_,
      limit: opts.limit,
      offset: opts.offset,
      body: opts.include?.body,
    },
    head,
  )
  if (scopes.length > 0 || boundary.sets.length === 0) return result

  // Whole-field reads are not scoped by an opened door; filter per chunk.
  const visible = result.chunks.filter((c) => canReadChunk(view, boundary, ctx.process, c.id))
  const count = allChunks(view).filter((id) => canReadChunk(view, boundary, ctx.process, id)).length
  return { ...result, chunks: visible, in_scope: count, in_scope_instance: count, in_scope_relates: count }
}

export function getOp(
  engine: FixtureEngine,
  ctx: Context,
  chunkId: ChunkId,
  opts: { branch?: string; at?: CommitId; include?: { body?: boolean } } = {},
): ChunkItem | null {
  const view = viewOf(engine, opts.branch, opts.at)
  const boundary = boundariesOf(engine, ctx).read
  if (isVirtual(chunkId)) {
    if (!canOpen(view, boundary, ctx.process, chunkId)) throw outsideRead(chunkId)
    if (chunkId === ENGINE_MOUNT) return { id: chunkId, name: 'mount', body: {}, placements: [] }
    return mountListing(engine).chunks.find((chunk) => chunk.id === chunkId) ?? null
  }
  // The engine's sentence order is the contract: a chunk that exists nowhere is
  // the documented null; an existing chunk outside the boundary rejects.
  if (!chunkOf(view, chunkId)) return null
  if (!canReadChunk(view, boundary, ctx.process, chunkId)) throw outsideRead(chunkId)
  return hydrate(view, chunkId, opts.include?.body !== false)
}

const outsideRead = (id: ChunkId): EngineError =>
  new EngineError('BOUNDARY_VIOLATION', `chunk ${id} is not reachable from the read boundary`)

/** `engine/mount` — archetype and instances synthesized from the live registry. */
function mountListing(engine: FixtureEngine): ScopeResult {
  const chunks: ChunkItem[] = engine.stores.map((store) => ({
    id: `${ENGINE_MOUNT}:${store.id}`,
    name: store.id,
    body: { project_id: store.id, branch: store.branch, mode: store.mode },
    placements: [{ scope_id: ENGINE_MOUNT, type_: 'instance' as const }],
  }))
  return {
    head: '',
    total: chunks.length,
    in_scope: chunks.length,
    in_scope_instance: chunks.length,
    in_scope_relates: 0,
    chunks,
    dimensions: [],
  }
}

// ---- writes ----------------------------------------------------------------

export function commitOp(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
): Commit {
  const gate = gateErrors(engine, ctx, declaration, branch)[0]
  if (gate) throw gate
  return write(engine, ctx, declaration, branch) // validation lives in the write itself
}

export function dryRunOp(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
): { valid: boolean; errors: { code: string; message: string }[] } {
  const errors = gateErrors(engine, ctx, declaration, branch)
  const validation = trialWrite(engine, ctx, declaration, branch)
  if (validation) errors.push(validation)
  return {
    valid: errors.length === 0,
    errors: errors.map((e) => ({ code: e.code, message: e.message })),
  }
}

/** The engine's gate, in its order: protected chunks, read-only mounts, write
 *  boundary. Spec validation follows, inside the write. */
function gateErrors(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
): EngineError[] {
  return [
    checkProtected(engine, declaration),
    readOnlyConflict(engine, declaration),
    checkWriteBoundary(engine, ctx, declaration, branch),
  ].filter((error): error is EngineError => error !== null)
}

const ROLLBACK = Symbol('trial write')

/** Full validation without writing — the live-form affordance behind `dry_run`. */
function trialWrite(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
): EngineError | null {
  try {
    write(engine, ctx, declaration, branch, { trial: true })
  } catch (error) {
    if (error !== ROLLBACK) return error as EngineError
  }
  return null
}

function write(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
  opts: { trial?: boolean } = {},
): Commit {
  const store = active(engine)
  const target = branch ?? store.branch
  const commit = transact(store, target, () => {
    // The view holds the live snapshot, so placements later in the declaration
    // see the earlier ones — the two-pass write-then-validate.
    const view = viewOf(engine, target)
    const applied = applyDeclaration(store, view, declaration, target, ctx.process ?? undefined)
    validateTouched(view, applied.touched)
    if (opts.trial) throw ROLLBACK
    return applied.commit
  })
  dispatchCommit(engine, commit)
  return commit
}

/** A run's contract — its process chunk and boundary chunks — is fixed at spawn. */
function checkProtected(engine: FixtureEngine, declaration: Declaration): EngineError | null {
  const processes = new Set(engine.processes.keys())
  const boundaries = new Set(
    [...engine.processes].flatMap(([pid, slot]) => slot.protected.filter((id) => id !== pid)),
  )
  const fixed = (kind: string, id: ChunkId): EngineError =>
    new EngineError('BOUNDARY_VIOLATION', `${kind} ${id} is engine domain — fixed for the run`)

  for (const chunk of declaration.chunks) {
    if (chunk.id === undefined) continue
    if (processes.has(chunk.id)) return fixed('process chunk', chunk.id)
    if (boundaries.has(chunk.id)) return fixed('boundary chunk', chunk.id)
  }
  for (const placement of declaration.placements) {
    if (boundaries.has(placement.scope)) return fixed('boundary chunk', placement.scope)
    if (boundaries.has(placement.chunk)) return fixed('boundary chunk', placement.chunk)
    if (processes.has(placement.chunk)) return fixed('process chunk', placement.chunk)
    // placement.scope being a process chunk is the normal path: programs write
    // results into their own process scope.
  }
  return null
}

/** Rejected only when the declaration modifies a record *resident* in a
 *  read-only mount. Reference is not modification. */
function readOnlyConflict(engine: FixtureEngine, declaration: Declaration): EngineError | null {
  for (const store of engine.stores.filter((s) => s.mode === 'read-only')) {
    const state = snapshotOf(store, store.branch)
    for (const chunk of declaration.chunks) {
      if (chunk.id !== undefined && state.chunks.has(chunk.id)) {
        return new EngineError('READ_ONLY_MOUNT', `chunk ${chunk.id} is resident in read-only mount ${store.id}`)
      }
    }
    for (const placement of declaration.placements) {
      if (state.placements.has(placementKey(placement.chunk, placement.scope))) {
        return new EngineError(
          'READ_ONLY_MOUNT',
          `placement ${placement.chunk} -> ${placement.scope} is resident in read-only mount ${store.id}`,
        )
      }
    }
  }
  return null
}

/** Every placement lands content in its scope; every declaration naming an
 *  existing chunk modifies it. Both must fall within the write boundary. */
function checkWriteBoundary(
  engine: FixtureEngine,
  ctx: Context,
  declaration: Declaration,
  branch?: string,
): EngineError | null {
  const boundary = boundariesOf(engine, ctx).write
  if (boundary.sets.length === 0) return null
  const view = viewOf(engine, branch)
  for (const placement of declaration.placements) {
    if (!canOpen(view, boundary, ctx.process, placement.scope)) {
      return new EngineError('BOUNDARY_VIOLATION', `scope ${placement.scope} is outside the write boundary`)
    }
  }
  for (const chunk of declaration.chunks) {
    if (chunk.id === undefined || !chunkOf(view, chunk.id)) continue // a new chunk touches no existing scope
    if (!canReadChunk(view, boundary, ctx.process, chunk.id)) {
      return new EngineError('BOUNDARY_VIOLATION', `chunk ${chunk.id} is outside the write boundary`)
    }
  }
  return null
}

export function forkOp(engine: FixtureEngine, branch: string, at: CommitId): void {
  fork(active(engine), branch, at)
}

// ---- reactivity ------------------------------------------------------------

export function subscribeOp(engine: FixtureEngine, ctx: Context, scopes: ChunkId[]): string {
  const view = viewOf(engine)
  const boundary = boundariesOf(engine, ctx).read
  for (const scope of scopes) {
    if (!canOpen(view, boundary, ctx.process, scope)) {
      throw new EngineError('BOUNDARY_VIOLATION', `scope ${scope} is not reachable from the read boundary`)
    }
  }
  const id = newId('sub')
  engine.subscriptions.set(id, { process: ctx.process, scopes })
  return id
}

export function unsubscribeOp(engine: FixtureEngine, id: string): void {
  engine.subscriptions.delete(id)
}

/** The touched scope set (engine.md, *The chain*): what changed, plus the scopes
 *  the changed chunks sit in. */
function dispatchCommit(engine: FixtureEngine, commit: Commit): void {
  const view = viewOf(engine, commit.branch)
  const touched = new Set<ChunkId>(commit.chunks_modified)
  for (const [chunk, scope] of commit.placements_modified) {
    touched.add(chunk)
    touched.add(scope)
  }
  for (const chunk of commit.chunks_modified) {
    for (const placement of placementsOf(view, chunk)) touched.add(placement.scope)
  }
  for (const [id, subscription] of engine.subscriptions) {
    if (subscription.scopes.some((scope) => touched.has(scope))) {
      engine.emit({ event: 'scope_changed', subscriptionId: id, commit })
    }
  }
}

// ---- processes -------------------------------------------------------------

export type Spawned = { process: ProcessId; readBoundary: ChunkId; writeBoundary: ChunkId }

/**
 * One atomic creation commit: the process chunk, its two boundary chunks, the
 * caller's argument chunks (engine.md, *Process Creation*). The slot exists
 * before the write, so cancel and timeout always land on a known id.
 */
export function createProcess(
  engine: FixtureEngine,
  ctx: Context,
  programId: ChunkId,
  args: {
    chunks?: Declaration['chunks']
    mode?: 'child' | 'launch'
    readBoundary?: ChunkId[]
    writeBoundary?: ChunkId[]
  },
): Spawned {
  const view = viewOf(engine)
  if (!chunkOf(view, programId)) throw new EngineError('NOT_FOUND', `program ${programId}`)

  const caller = boundariesOf(engine, ctx)
  const pid = newId('process')
  const readChunk = newId('read-boundary')
  const writeChunk = newId('write-boundary')
  const readRoots = args.readBoundary ?? []
  const writeRoots = args.writeBoundary ?? []

  engine.processes.set(pid, {
    parent: args.mode === 'launch' ? null : ctx.process,
    read: narrowed(caller.read, readRoots),
    write: narrowed(caller.write, writeRoots),
    protected: [pid, readChunk, writeChunk],
    status: 'pending',
    watchers: [],
  })

  const declaration: Declaration = {
    chunks: [
      { id: pid, body: { status: 'pending', program: programId } },
      { id: readChunk, body: {} },
      { id: writeChunk, body: {} },
      ...(args.chunks ?? []),
    ],
    placements: [
      { chunk: pid, scope: programId, type: 'instance' },
      { chunk: pid, scope: ENGINE_PROCESS, type: 'instance' },
      ...(ctx.process && args.mode !== 'launch'
        ? [{ chunk: pid, scope: ctx.process, type: 'instance' as const }]
        : []),
      { chunk: readChunk, scope: READ_BOUNDARY, type: 'instance' },
      { chunk: readChunk, scope: pid, type: 'relates' },
      { chunk: writeChunk, scope: WRITE_BOUNDARY, type: 'instance' },
      { chunk: writeChunk, scope: pid, type: 'relates' },
      ...readRoots.map((root) => ({ chunk: root, scope: readChunk, type: 'relates' as const })),
      ...writeRoots.map((root) => ({ chunk: root, scope: writeChunk, type: 'relates' as const })),
      ...(args.chunks ?? [])
        .filter((chunk) => chunk.id !== undefined)
        .map((chunk) => ({ chunk: chunk.id!, scope: pid, type: 'instance' as const })),
    ],
  }

  try {
    write(engine, { process: null }, declaration)
  } catch (error) {
    engine.processes.delete(pid)
    throw error
  }
  return { process: pid, readBoundary: readChunk, writeBoundary: writeChunk }
}

export function runOp(
  engine: FixtureEngine,
  ctx: Context,
  programId: ChunkId,
  args: Parameters<typeof createProcess>[3],
): { process: ProcessId } {
  const spawned = createProcess(engine, ctx, programId, args)
  const body = engine.programs.get(programId)
  if (!body) return { process: spawned.process } // stays running until cancelled — a resident program
  setStatus(engine, spawned.process, 'running')
  void Promise.resolve()
    .then(() =>
      body({
        process: spawned.process,
        call: async (request) => dispatch(engine, { process: spawned.process }, { id: 0, ...request }),
      }),
    )
    .then(
      () => setStatus(engine, spawned.process, 'completed'),
      () => setStatus(engine, spawned.process, 'failed'),
    )
  return { process: spawned.process }
}

function setStatus(engine: FixtureEngine, pid: ProcessId, status: ProcessSlot['status']): void {
  const slot = engine.processes.get(pid)
  if (!slot || isTerminal(slot.status)) return
  slot.status = status
  const body = { ...chunkOf(viewOf(engine), pid)?.body, status }
  write(engine, { process: null }, { chunks: [{ id: pid, body }], placements: [] })
  if (!isTerminal(status)) return
  for (const watcher of slot.watchers.splice(0)) watcher()
  for (const [id, subscription] of engine.subscriptions) {
    if (subscription.process === pid) engine.subscriptions.delete(id)
  }
}

const isTerminal = (status: ProcessSlot['status']): boolean =>
  status === 'completed' || status === 'failed'

export async function awaitOp(
  engine: FixtureEngine,
  ctx: Context,
  processes: ProcessId[],
  resultsOnly: boolean,
): Promise<Record<ProcessId, ScopeResult>> {
  await Promise.all(
    processes.map((pid) => {
      const slot = engine.processes.get(pid)
      if (!slot) throw new EngineError('NOT_FOUND', `process ${pid}`)
      if (isTerminal(slot.status)) return Promise.resolve()
      return new Promise<void>((resolve) => slot.watchers.push(resolve))
    }),
  )
  const results: Record<ProcessId, ScopeResult> = {}
  for (const pid of processes) {
    const result = scopeOp(engine, ctx, [pid])
    results[pid] = resultsOnly ? onlyResults(engine, result) : result
  }
  return results
}

/** `results_only` keeps chunks instance on a result-role archetype. */
function onlyResults(engine: FixtureEngine, result: ScopeResult): ScopeResult {
  const view = viewOf(engine)
  const chunks = result.chunks.filter((chunk) =>
    placementsOf(view, chunk.id).some((p) => p.type === 'instance' && isResultRole(view, p.scope)),
  )
  return { ...result, chunks, in_scope: chunks.length }
}

function isResultRole(view: View, scope: ChunkId): boolean {
  return scope === PROGRAMS_RESULT || instanceParents(view, scope).includes(PROGRAMS_RESULT)
}

export function cancelOp(engine: FixtureEngine, ctx: Context, target: ProcessId): void {
  const slot = engine.processes.get(target)
  if (!slot) throw new EngineError('NOT_FOUND', `process ${target}`)
  if (!authorizedToCancel(engine, ctx, target)) {
    throw new EngineError('BOUNDARY_VIOLATION', `process ${target} is not cancellable from here`)
  }
  setStatus(engine, target, 'failed')
}

/** Authorized when the target is a descendant of the caller, or the target's
 *  process chunk is within the caller's write boundary. Idempotent. */
function authorizedToCancel(engine: FixtureEngine, ctx: Context, target: ProcessId): boolean {
  if (!ctx.process) return true
  let cursor = engine.processes.get(target)?.parent ?? null
  while (cursor) {
    if (cursor === ctx.process) return true
    cursor = engine.processes.get(cursor)?.parent ?? null
  }
  return canOpen(viewOf(engine), boundariesOf(engine, ctx).write, ctx.process, target)
}

export function exitOp(engine: FixtureEngine, ctx: Context): void {
  if (ctx.process) setStatus(engine, ctx.process, 'completed')
}

// ---- dispatch --------------------------------------------------------------

/** One wire request under the given identity — the mirror of protocol.rs's `handle`. */
export async function dispatch(
  engine: FixtureEngine,
  ctx: Context,
  request: { id: number; op?: string } & Record<string, unknown>,
): Promise<unknown> {
  const opts = (request.opts ?? {}) as Parameters<typeof scopeOp>[3]
  switch (request.op) {
    case 'scope':
      return scopeOp(engine, ctx, ids(request.scopes), opts)
    case 'get':
      return getOp(engine, ctx, id(request.chunkId, 'chunkId'), opts)
    case 'read_batch':
      return readBatchOp(engine, ctx, request.reads)
    case 'commit': {
      const declaration = request.declaration as Declaration | undefined
      if (!declaration) throw new EngineError('INVALID_REQUEST', 'missing declaration')
      return request.dry_run === true
        ? dryRunOp(engine, ctx, declaration)
        : commitOp(engine, ctx, declaration)
    }
    case 'run':
      return runOp(engine, ctx, id(request.program, 'program'), (request.args ?? {}) as never)
    case 'await':
      return awaitOp(engine, ctx, ids(request.processes), (request.opts as { results_only?: boolean })?.results_only === true)
    case 'cancel':
      cancelOp(engine, ctx, id(request.process, 'process'))
      return {}
    case 'exit':
      exitOp(engine, ctx)
      return {}
    case 'subscribe':
      return { subscriptionId: subscribeOp(engine, ctx, ids(request.scopes)) }
    case 'unsubscribe':
      unsubscribeOp(engine, id(request.subscriptionId, 'subscriptionId'))
      return {}
    default:
      throw new EngineError('INVALID_REQUEST', `unknown op '${String(request.op)}'`)
  }
}

/** Tagged sub-queries resolved at one snapshot; per-tag results or per-tag errors. */
function readBatchOp(engine: FixtureEngine, ctx: Context, reads: unknown): unknown {
  if (!Array.isArray(reads)) throw new EngineError('INVALID_REQUEST', 'read_batch requires reads')
  const head = headOf(active(engine), active(engine).branch)
  const results: Record<string, unknown> = {}
  type Read = { tag: string; scopes?: ChunkId[]; chunkId?: ChunkId; opts?: Parameters<typeof scopeOp>[3] }
  for (const read of reads as Read[]) {
    if (typeof read.tag !== 'string') throw new EngineError('INVALID_REQUEST', 'read missing tag')
    try {
      results[read.tag] =
        read.chunkId !== undefined
          ? getOp(engine, ctx, read.chunkId, { ...read.opts, at: head })
          : scopeOp(engine, ctx, read.scopes ?? [], { ...read.opts, at: head })
    } catch (error) {
      const failure = error as EngineError
      results[read.tag] = { error: { code: failure.code, message: failure.message } }
    }
  }
  return { head, results }
}

function ids(value: unknown): ChunkId[] {
  if (!Array.isArray(value)) throw new EngineError('INVALID_REQUEST', 'expected an id array')
  return value.map((entry) => id(entry, 'id'))
}

function id(value: unknown, field: string): ChunkId {
  if (typeof value !== 'string') throw new EngineError('INVALID_REQUEST', `missing ${field}`)
  return value
}
