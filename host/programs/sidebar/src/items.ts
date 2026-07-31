// The sidebar's pure half: the session it was handed, the items that session
// holds, the actions an item's state offers (host.md §Sidebar, programs.md
// §3.2), and the tiling declarations those actions commit (host.md §The
// Composition Types). The rendering half imports these; the tests drive them.
import type { ChunkId, ChunkItem, Declaration, ScopeResult } from '@openlight/sdk'

/** Every process is `instance` on this archetype (engine.md, *Program and Process*). */
export const ENGINE_PROCESS: ChunkId = 'engine/process'
/** Every program is `instance` on this one — the sidebar's third read root. */
export const ENGINE_PROGRAM: ChunkId = 'engine/program'
/** The composition archetypes the tiling verbs read and write (host.md). */
export const HOST_TAB: ChunkId = 'host/tab'
export const HOST_TILE: ChunkId = 'host/tile'

/**
 * The session-local hidden marker (programs.md §3.2): derived from the session
 * so the strip can exclude it before it exists — an unresolved exclude root is
 * an empty exclusion. Mirrors `host/src/seed.rs`'s `hidden_id`.
 */
export function hiddenId(session: ChunkId): ChunkId {
  return `${session}-hidden`
}

export type Item = {
  process: ChunkId
  /** Process chunks carry no name; the truncated id disambiguates (read-tile's pin). */
  name: string
  nameIsId: boolean
  /** The program this run runs — its name, or its truncated id when unread. */
  program: string
  /** The same program by id — what *new from this* runs. Absent when the
   *  process's placements name none (a field the strip cannot read whole). */
  programId?: ChunkId
  status: string
  /** host.md §Visual Language: life rises as a card, rest falls flat. */
  live: boolean
  failed: boolean
  /** `body.error` on a failed process (engine.md, *Terminal cleanup*). */
  error?: string
  /** `body.started` — epoch ms, written at run (engine.md). Recency sorts by it. */
  started?: number
}

/**
 * `pending` is neither of §Visual Language's two forms — the spec names running
 * (card) and completed/failed (flat) only. Read as life, not rest: a process
 * the engine has not yet spawned has not come to rest. Recorded gap against
 * host.md §Visual Language.
 */
const TERMINAL = ['completed', 'failed']

/**
 * The session this run renders — the sidebar's one argument, off its own call
 * frame (programs.md §1, *the call frame*).
 *
 * **Recorded gap.** programs.md §3.2 declares no argument type for the sidebar;
 * host.md boot step 10 gives it boundaries but no arguments. The key read here
 * is `session`, one argument chunk per role (§1's granularity rule).
 */
export function sessionArgument(frame: ScopeResult): ChunkId | null {
  for (const chunk of frame.chunks) {
    const session = chunk.body?.session
    if (typeof session === 'string') return session
  }
  return null
}

/**
 * The session's processes: **life before rest, then recency** — running and
 * pending first, terminal ones newest-first beneath them (steward pin against
 * host.md §Sidebar, which rules on the two *forms* but named no order; a
 * session accumulates its past runs forever, so the engine's raw order buries
 * what is alive).
 *
 * Recency is `body.started`; a process without one keeps the engine's order
 * within its group (stable), never jumping ahead of a dated sibling.
 */
export function items(session: ScopeResult, programs: ChunkItem[], root: ChunkId): Item[] {
  const names = new Map(programs.map((program) => [program.id, program.name]))
  const list = session.chunks.filter(isProcess).map((chunk) => {
    const status = typeof chunk.body?.status === 'string' ? chunk.body.status : 'unknown'
    const error = typeof chunk.body?.error === 'string' ? chunk.body.error : undefined
    const started = typeof chunk.body?.started === 'number' ? chunk.body.started : undefined
    const program = programOf(chunk, names, root)
    return {
      process: chunk.id,
      name: chunk.name ?? shortId(chunk.id),
      nameIsId: chunk.name === undefined,
      program: program === null ? 'unknown program' : (names.get(program) ?? shortId(program)),
      ...(program === null ? {} : { programId: program }),
      status,
      live: !TERMINAL.includes(status),
      failed: status === 'failed',
      ...(error === undefined ? {} : { error }),
      ...(started === undefined ? {} : { started }),
    }
  })
  return order(list)
}

/** Life before rest, then newest first; ties keep the order they arrived in. */
export function order(list: Item[]): Item[] {
  return list
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        Number(b.item.live) - Number(a.item.live) ||
        (b.item.started ?? 0) - (a.item.started ?? 0) ||
        a.index - b.index,
    )
    .map((entry) => entry.item)
}

function isProcess(chunk: ChunkItem): boolean {
  return (chunk.placements ?? []).some(
    (placement) => placement.type_ === 'instance' && placement.scope_id === ENGINE_PROCESS,
  )
}

/**
 * A process is `instance` on the program it runs (engine.md) — so the program
 * is the instance placement the `engine/program` scope also holds. When that
 * scope has not been read (or does not carry it), the remaining instance
 * placement that is neither the process archetype nor the viewed session is the
 * program, shown as its truncated id.
 */
function programOf(
  chunk: ChunkItem,
  names: Map<ChunkId, string | undefined>,
  root: ChunkId,
): ChunkId | null {
  const scopes = (chunk.placements ?? [])
    .filter((placement) => placement.type_ === 'instance')
    .map((placement) => placement.scope_id)
    .filter((scope) => scope !== ENGINE_PROCESS && scope !== root)
  return scopes.find((scope) => names.has(scope)) ?? scopes[0] ?? null
}

/** The program the strip raises its menu on, found by name (the name-lookup
 *  convention — ids are generated, names are the stable handle). */
export const CONTEXT_MENU = 'context-menu'

export function programNamed(programs: ChunkItem[], name: string): ChunkId | null {
  return programs.find((program) => program.name === name)?.id ?? null
}

/**
 * What an entry does when picked, as `context-menu` reads it. Declared here
 * rather than imported: the two are separate programs, glued by a substrate
 * argument, not by a shared module — the contract is the chunk's shape.
 * `host/programs/context-menu/src/entries.ts` is its other reading.
 *
 * `commit` carries declarations in order because one gesture may need two
 * commits: the engine's write-boundary walk runs against pre-commit state, so
 * a bounded identity cannot place onto a tile born in the same declaration —
 * open-in-tile stages (create + type) and then grafts (wire the tree).
 */
export type Op =
  | { kind: 'run'; program: ChunkId; args?: Record<string, unknown>; read?: ChunkId[]; write?: ChunkId[] }
  | { kind: 'cancel'; process: ChunkId }
  | { kind: 'commit'; declarations: Declaration[] }
  | { kind: 'none' }

export type Entry = {
  label: string
  op: Op
  disabled?: boolean
  /** Why a disabled entry cannot act — shown beside the label. */
  reason?: string
}

// ---- the tile tree, as the strip reads it ------------------------------------

/**
 * The current tab's tree, distilled to what the tiling verbs need. Built from
 * the tile chunks the strip gathers by walking scope reads from the tab (its
 * boundary reaches tiles through the tab's instance chain; the archetype
 * itself it cannot open).
 */
export type TreeInfo = {
  tab: ChunkId
  /** The tile placed on the tab, with its seq — null for an empty tab. */
  root: { id: ChunkId; seq: number } | null
  /** Per displayed process: its leaf and where the leaf hangs. */
  mounts: Map<ChunkId, MountInfo>
}

export type MountInfo = {
  leaf: ChunkId
  /** The split holding the leaf, or the tab when the leaf is the root. */
  parent: ChunkId
  parentIsTab: boolean
  /** The split's other child — what survives the collapse. */
  sibling: ChunkId | null
  /** Where the split hangs, and at what seq — the collapse re-seats there. */
  grandparent: ChunkId | null
  parentSeq: number
}

/** The tab among a session's members: the chunk typed `instance` on `host/tab`. */
export function tabOf(members: ChunkItem[]): ChunkId | null {
  const tab = members.find((chunk) =>
    (chunk.placements ?? []).some(
      (placement) => placement.type_ === 'instance' && placement.scope_id === HOST_TAB,
    ),
  )
  return tab?.id ?? null
}

/** Whether a chunk is a tile — typed `instance` on the tile archetype. */
export function isTile(chunk: ChunkItem): boolean {
  return (chunk.placements ?? []).some(
    (placement) => placement.type_ === 'instance' && placement.scope_id === HOST_TILE,
  )
}

/**
 * Distill gathered tile chunks into [`TreeInfo`]. Tree edges are instance
 * placements onto the tab or another tile; a leaf's process is its relates
 * placement (mount-provenance relates, `engine/mount:*`, are synthesized rows
 * and never processes).
 */
export function analyzeTree(tab: ChunkId, tiles: ChunkItem[]): TreeInfo {
  const ids = new Set(tiles.map((tile) => tile.id))
  const edges = tiles.flatMap((tile) =>
    (tile.placements ?? [])
      .filter((p) => p.type_ === 'instance' && (p.scope_id === tab || ids.has(p.scope_id)))
      .map((p) => ({ tile: tile.id, scope: p.scope_id, seq: p.seq ?? 0 })),
  )
  const rootEdge = edges.find((edge) => edge.scope === tab)
  const root = rootEdge ? { id: rootEdge.tile, seq: rootEdge.seq } : null

  const mounts = new Map<ChunkId, MountInfo>()
  for (const tile of tiles) {
    const inTree = edges.some((edge) => edge.tile === tile.id)
    if (!inTree) continue // a closed tile's chunk persists; it is not a leaf
    const process = (tile.placements ?? []).find(
      (p) => p.type_ === 'relates' && !p.scope_id.startsWith('engine/mount'),
    )?.scope_id
    if (!process) continue
    const up = edges.find((edge) => edge.tile === tile.id)
    if (!up) continue
    if (up.scope === tab) {
      mounts.set(process, {
        leaf: tile.id,
        parent: tab,
        parentIsTab: true,
        sibling: null,
        grandparent: null,
        parentSeq: up.seq,
      })
      continue
    }
    const split = up.scope
    const sibling = edges.find((edge) => edge.scope === split && edge.tile !== tile.id)
    const splitUp = edges.find((edge) => edge.tile === split)
    mounts.set(process, {
      leaf: tile.id,
      parent: split,
      parentIsTab: false,
      sibling: sibling?.tile ?? null,
      grandparent: splitUp?.scope ?? null,
      parentSeq: splitUp?.seq ?? 1,
    })
  }
  return { tab, root, mounts }
}

// ---- the tiling declarations -------------------------------------------------

/**
 * Open a process in a tile (host.md §Tile Geometry semantics): the root
 * becomes a horizontal split of the existing tree and a new leaf relating the
 * process. Two commits — stage types the new tiles on the archetype, graft
 * wires them (see [`Op`]'s note). An empty tab takes the new leaf as its root.
 */
export function openInTile(
  tree: TreeInfo,
  process: ChunkId,
  ids: { split: ChunkId; leaf: ChunkId },
): Declaration[] {
  const leafChunk = { id: ids.leaf, body: {} }
  const relates = { chunk: ids.leaf, scope: process, type: 'relates' as const }
  if (!tree.root) {
    return [
      {
        chunks: [leafChunk],
        placements: [{ chunk: ids.leaf, scope: HOST_TILE, type: 'instance' }],
        message: 'open in tile: stage',
      },
      {
        chunks: [],
        placements: [{ chunk: ids.leaf, scope: tree.tab, type: 'instance', seq: 1 }, relates],
        message: 'open in tile: graft',
      },
    ]
  }
  return [
    {
      chunks: [{ id: ids.split, body: { direction: 'horizontal', ratio: 0.5 } }, leafChunk],
      placements: [
        { chunk: ids.split, scope: HOST_TILE, type: 'instance' },
        { chunk: ids.leaf, scope: HOST_TILE, type: 'instance' },
      ],
      message: 'open in tile: stage',
    },
    {
      chunks: [],
      placements: [
        { chunk: ids.split, scope: tree.tab, type: 'instance', seq: tree.root.seq },
        { chunk: tree.root.id, scope: tree.tab, type: 'instance', active: false },
        { chunk: tree.root.id, scope: ids.split, type: 'instance', seq: 1 },
        { chunk: ids.leaf, scope: ids.split, type: 'instance', seq: 2 },
        relates,
      ],
      message: 'open in tile: graft',
    },
  ]
}

/**
 * Close a tile: remove the leaf placement; a split left with one child
 * collapses — the sibling re-seats where the split hung, at the split's seq
 * (the simplification rule host.md's binary tree implies). The tile chunks
 * persist; the substrate is lossless.
 */
export function closeTile(mount: MountInfo): Declaration {
  if (mount.parentIsTab) {
    return {
      chunks: [],
      placements: [{ chunk: mount.leaf, scope: mount.parent, type: 'instance', active: false }],
      message: 'close tile',
    }
  }
  const placements: Declaration['placements'] = [
    { chunk: mount.leaf, scope: mount.parent, type: 'instance', active: false },
  ]
  if (mount.sibling && mount.grandparent) {
    placements.push(
      { chunk: mount.sibling, scope: mount.parent, type: 'instance', active: false },
      { chunk: mount.parent, scope: mount.grandparent, type: 'instance', active: false },
      { chunk: mount.sibling, scope: mount.grandparent, type: 'instance', seq: mount.parentSeq },
    )
  }
  return { chunks: [], placements, message: 'close tile' }
}

/**
 * Hide an item (programs.md §3.2): a relates placement onto the session-local
 * `hidden` chunk — non-destructive un-show; the strip's read excludes the
 * marker as a root. The marker is (re-)declared each time — idempotent.
 */
export function hideDeclaration(session: ChunkId, process: ChunkId): Declaration {
  const hidden = hiddenId(session)
  return {
    chunks: [{ id: hidden, name: 'hidden', body: { text: 'Un-shown sidebar entries.' } }],
    placements: [
      { chunk: hidden, scope: session, type: 'relates' },
      { chunk: process, scope: hidden, type: 'relates' },
    ],
    message: 'hide from sidebar',
  }
}

/** Fresh readable tile ids for one open-in-tile gesture. */
export function mintTileIds(now = Date.now()): { split: ChunkId; leaf: ChunkId } {
  const suffix = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return { split: `tile-split-${suffix}`, leaf: `tile-open-${suffix}` }
}

/** What the tiling verbs need beyond the item: the tree and the session. */
export type MenuContext = {
  session: ChunkId
  /** Null when the tree walk failed — the tiling verbs grey out honestly. */
  tree: TreeInfo | null
  ids: { split: ChunkId; leaf: ChunkId }
}

/**
 * The context menu any item answers a click with (host.md §Sidebar,
 * programs.md §3.2), in the spec's order with the tiling verbs beside *jump*.
 * The acting entries:
 *
 * - *open in tile* commits the split (host.md semantics) — for a live process
 *   not already displayed by a leaf. Multi-mount of one process is an open
 *   (host.md §What Is Open), so an already-mounted item greys.
 * - *close tile* removes the leaf and collapses the one-child split — for an
 *   item some leaf displays.
 * - *terminate* cancels the run, while it is alive; the menu's authority is
 *   the write boundary the strip grants it (engine.md, R3).
 * - *hide* places the process relates onto the session's hidden marker — for
 *   terminal items only: a live process's placements are engine domain
 *   (engine/ops/commit.rs, protected chunks), so a live item's hide greys
 *   with the reason.
 *
 * The rest are listed, greyed, and inert — the foolproof path shows every
 * capability whether or not its machinery exists yet. **Recorded gaps:**
 * *jump to tile* waits on a focus concept (none exists — nothing tracks which
 * tile is focused); *inspect* on the inspector program; *review changes* on
 * branch ops (engine.md R1); *new from this* on the engine placing a menu
 * launch onto a session (a launch from the menu lands on no session and no
 * tile — the swap.rs pin), so it stays greyed with the reason visible.
 */
export function entries(item: Item, menu: MenuContext): Entry[] {
  const mounted = menu.tree?.mounts.get(item.process) ?? null
  const openable = item.live && !mounted && menu.tree !== null
  const open: Entry =
    openable && menu.tree
      ? { label: 'Open in tile', op: { kind: 'commit', declarations: openInTile(menu.tree, item.process, menu.ids) } }
      : {
          label: 'Open in tile',
          op: { kind: 'none' },
          disabled: true,
          reason: !item.live ? 'the run has ended' : mounted ? 'already in a tile' : 'no tree to split',
        }
  const close: Entry = mounted
    ? { label: 'Close tile', op: { kind: 'commit', declarations: [closeTile(mounted)] } }
    : { label: 'Close tile', op: { kind: 'none' }, disabled: true, reason: 'not in a tile' }
  const hide: Entry = item.live
    ? {
        label: 'Hide',
        op: { kind: 'none' },
        disabled: true,
        reason: 'a running process is engine-pinned',
      }
    : { label: 'Hide', op: { kind: 'commit', declarations: [hideDeclaration(menu.session, item.process)] } }
  return [
    { label: 'Jump to tile', op: { kind: 'none' }, disabled: true, reason: 'no focus concept yet' },
    open,
    close,
    { label: 'Inspect', op: { kind: 'none' }, disabled: true },
    { label: 'Terminate', op: { kind: 'cancel', process: item.process }, disabled: !item.live },
    { label: 'Review changes', op: { kind: 'none' }, disabled: true },
    {
      label: 'New from this',
      op: { kind: 'none' },
      disabled: true,
      reason: 'launches into nowhere until a tile can receive it',
    },
    hide,
  ]
}

export function shortId(id: ChunkId, keep = 14): string {
  return id.length > keep ? `${id.slice(0, keep)}…` : id
}

/**
 * When a run started, as the shortest thing that still places it: today is a
 * wall clock, any other day is that day. A session accumulates runs forever, so
 * a bare `18:00` on a row from last week is a lie the strip must not tell.
 * (The read-tile's rows say it the same way — one vocabulary, two surfaces.)
 */
export function stamp(ms: number, now = Date.now()): string {
  const at = new Date(ms)
  const today = new Date(now)
  const sameDay =
    at.getFullYear() === today.getFullYear() &&
    at.getMonth() === today.getMonth() &&
    at.getDate() === today.getDate()
  return sameDay
    ? `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
    : at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
