// The sidebar's pure half: the session it was handed, the items that session
// holds, and the actions an item's state offers (host.md §Sidebar,
// programs.md §3.2). The rendering half imports these; the tests drive them.
import type { ChunkId, ChunkItem, ScopeResult } from '@openlight/sdk'

/** Every process is `instance` on this archetype (engine.md, *Program and Process*). */
export const ENGINE_PROCESS: ChunkId = 'engine/process'
/** Every program is `instance` on this one — the sidebar's third read root. */
export const ENGINE_PROGRAM: ChunkId = 'engine/program'

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
 */
export type Op =
  | { kind: 'run'; program: ChunkId; args?: Record<string, unknown>; read?: ChunkId[]; write?: ChunkId[] }
  | { kind: 'cancel'; process: ChunkId }
  | { kind: 'none' }

export type Entry = { label: string; op: Op; disabled?: boolean }

/**
 * The context menu any item answers a click with (host.md §Sidebar,
 * programs.md §3.2), in the spec's order. Two of them act:
 *
 * - *terminate* cancels the run, while it is alive. The menu's authority is the
 *   write boundary the strip grants it — `[session]` reaches every process
 *   placed on the session (engine.md, R3).
 * - *new from this* launches the same program again, detached, so it outlives
 *   the menu that started it.
 *
 * The rest are listed, greyed, and inert — the foolproof path shows every
 * capability whether or not its machinery exists yet:
 *
 * **Recorded gaps.** *jump to tile* is specced "(if surfaced)" and v0 cannot
 * tell — the tile tree is still composed rim-side, so no `host/tile` relates a
 * process in the field to read. *inspect* waits on the inspector program,
 * *review changes* on branch ops (engine.md R1), *hide* on the session-local
 * `hidden` chunk and R10 negation. And *new from this* launches with no
 * argument at all: programs.md §3.2 wants a launch form pre-filled from the
 * frame, which is the palette's machinery, not the strip's.
 */
export function entries(item: Item): Entry[] {
  return [
    { label: 'Jump to tile', op: { kind: 'none' }, disabled: true },
    { label: 'Inspect', op: { kind: 'none' }, disabled: true },
    { label: 'Terminate', op: { kind: 'cancel', process: item.process }, disabled: !item.live },
    { label: 'Review changes', op: { kind: 'none' }, disabled: true },
    {
      label: 'New from this',
      op:
        item.programId === undefined
          ? { kind: 'none' }
          : { kind: 'run', program: item.programId },
      disabled: item.programId === undefined,
    },
    { label: 'Hide', op: { kind: 'none' }, disabled: true },
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
