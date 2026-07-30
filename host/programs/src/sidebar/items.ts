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
  status: string
  /** host.md §Visual Language: life rises as a card, rest falls flat. */
  live: boolean
  failed: boolean
  /** `body.error` on a failed process (engine.md, *Terminal cleanup*). */
  error?: string
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
 * The session's processes, in the order the engine returns them.
 *
 * **Recorded gap.** Nothing specs the sidebar's ordering — `host/session` is
 * unordered, so no placement carries a seq, and neither host.md §Sidebar nor
 * programs.md §3.2 names a sort. The engine's order stands rather than an
 * invented one.
 */
export function items(session: ScopeResult, programs: ChunkItem[], root: ChunkId): Item[] {
  const names = new Map(programs.map((program) => [program.id, program.name]))
  return session.chunks.filter(isProcess).map((chunk) => {
    const status = typeof chunk.body?.status === 'string' ? chunk.body.status : 'unknown'
    const error = typeof chunk.body?.error === 'string' ? chunk.body.error : undefined
    return {
      process: chunk.id,
      name: chunk.name ?? shortId(chunk.id),
      nameIsId: chunk.name === undefined,
      program: programOf(chunk, names, root),
      status,
      live: !TERMINAL.includes(status),
      failed: status === 'failed',
      ...(error === undefined ? {} : { error }),
    }
  })
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
): string {
  const scopes = (chunk.placements ?? [])
    .filter((placement) => placement.type_ === 'instance')
    .map((placement) => placement.scope_id)
    .filter((scope) => scope !== ENGINE_PROCESS && scope !== root)
  const known = scopes.find((scope) => names.has(scope))
  if (known !== undefined) return names.get(known) ?? shortId(known)
  return scopes.length > 0 ? shortId(scopes[0]!) : 'unknown program'
}

export type Action = {
  id: string
  label: string
  /** State gating only: every action's *effect* is unbuilt at v0. */
  enabled: boolean
}

/**
 * The context menu any item answers a click with (host.md §Sidebar,
 * programs.md §3.2), in the spec's order. Nothing here acts: v0 positions and
 * lists, and the surface says so when one is picked.
 *
 * **Recorded gap.** *jump to tile* is specced "(if surfaced)" — v0 cannot tell:
 * the tile tree is still composed rim-side, so no `host/tile` relates a process
 * in the field to read. It is listed enabled, ungated, until the tree lands as
 * chunks. Container expansion (§3.2, groups and recipes) is likewise unbuilt.
 */
export function actions(item: Item): Action[] {
  return [
    { id: 'jump', label: 'Jump to tile', enabled: true },
    { id: 'inspect', label: 'Inspect', enabled: true },
    { id: 'terminate', label: 'Terminate', enabled: item.live },
    { id: 'review', label: 'Review changes', enabled: !item.live },
    { id: 'new', label: 'New from this', enabled: true },
    { id: 'hide', label: 'Hide', enabled: true },
  ]
}

export function shortId(id: ChunkId, keep = 14): string {
  return id.length > keep ? `${id.slice(0, keep)}…` : id
}
