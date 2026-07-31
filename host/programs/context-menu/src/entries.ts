// `context-menu` — the pure half: the request the run was handed, and what
// picking an entry does.
//
// The menu is deliberately dumb (board, *Next unit ruled: context menu*). It
// does not know what a process is, what a sidebar is, or which programs accept
// what. Its caller composes the list; the menu renders it, and executes the one
// op the person picked under the boundary the caller granted. Registry-generated
// entries (programs.md §3.5, *verbs from the field*) are the caller's evolution,
// not this program's.
import {
  cancel,
  commit,
  run,
  type ChunkId,
  type Declaration,
  type ProcessId,
  type ScopeResult,
} from '@openlight/sdk'
import type { MenuAction } from '@openlight/react'

/** What an entry does when it is picked. `none` is a listed-but-inert verb. */
export type Op =
  | {
      kind: 'run'
      program: ChunkId
      /** The argument chunk's body — one `request` chunk per role (programs.md §1). */
      args?: Record<string, unknown>
      /**
       * The boundary roots the new run gets, intersected with this menu's own
       * (engine.md, *Boundaries*). Beyond the mandated `{ program, args }`
       * because a run with no roots can read and write nothing at all — a
       * caller granting a verb must say what the verb may reach.
       */
      read?: ChunkId[]
      write?: ChunkId[]
    }
  | { kind: 'cancel'; process: ProcessId }
  /**
   * A general write, executed under the menu's granted boundary — the engine
   * validates, the menu stays dumb. Declarations run in order, stopping at
   * the first refusal: one gesture may need a staged pair (the caller's
   * composition; the sidebar's open-in-tile is the precedent).
   */
  | { kind: 'commit'; declarations: Declaration[] }
  | { kind: 'none' }

export type Entry = {
  label: string
  op: Op
  /** Listed, greyed, unpickable — the foolproof path shows every capability. */
  disabled?: boolean
  /** Why a greyed entry cannot act — rendered beside its label. */
  reason?: string
}

/** The one argument chunk (key: `request`), in window coordinates. */
export type Request = {
  anchor: { x: number; y: number }
  entries: Entry[]
  /** Optional caption above the list — what the entries are about. */
  head?: string
}

/**
 * The request off this run's own call frame (programs.md §1). Anything that is
 * not a well-formed request is no request: an overlay spans the window and
 * takes every click, so the surface must be able to tell that it has nothing to
 * show and leave rather than render half a menu.
 */
export function request(frame: ScopeResult): Request | null {
  for (const chunk of frame.chunks) {
    const body = chunk.body
    if (!body) continue
    const anchor = point(body.anchor)
    const entries = list(body.entries)
    if (anchor && entries) {
      return { anchor, entries, ...(typeof body.head === 'string' ? { head: body.head } : {}) }
    }
  }
  return null
}

function point(value: unknown): { x: number; y: number } | null {
  const at = value as { x?: unknown; y?: unknown } | null | undefined
  return typeof at?.x === 'number' && typeof at.y === 'number' ? { x: at.x, y: at.y } : null
}

function list(value: unknown): Entry[] | null {
  if (!Array.isArray(value)) return null
  const entries = value.filter(isEntry)
  return entries.length === value.length ? entries : null
}

function isEntry(value: unknown): value is Entry {
  const entry = value as { label?: unknown; op?: { kind?: unknown } } | null
  if (typeof entry?.label !== 'string') return false
  const kind = entry.op?.kind
  return kind === 'run' || kind === 'cancel' || kind === 'commit' || kind === 'none'
}

/**
 * The entries as the shared `Menu` reads them; the index is the identity. A
 * greyed entry's reason rides its label — the person sees *why* a capability
 * cannot act, not just that it cannot.
 */
export function actions(entries: Entry[]): MenuAction[] {
  return entries.map((entry, index) => {
    const enabled = !entry.disabled && entry.op.kind !== 'none'
    const label =
      !enabled && entry.reason ? `${entry.label} — ${entry.reason}` : entry.label
    return { id: String(index), label, enabled }
  })
}

/**
 * The next row the keyboard may land on, wrapping, skipping what cannot be
 * picked. `-1` (nothing active) enters the list from whichever end is asked
 * for. A list with nothing pickable stays where it is.
 */
export function move(entries: Entry[], active: number, delta: number): number {
  const pickable = actions(entries).map((action) => action.enabled)
  if (!pickable.some(Boolean)) return active
  const count = entries.length
  let next = active < 0 ? (delta > 0 ? -1 : 0) : active
  for (let step = 0; step < count; step += 1) {
    next = (next + delta + count) % count
    if (pickable[next]) return next
  }
  return active
}

/**
 * Execute one op under this menu's identity — the point of the design: the
 * caller grants reach once, at spawn, and the pick spends it. `none` does
 * nothing; the surface exits either way.
 */
export async function perform(op: Op): Promise<void> {
  if (op.kind === 'cancel') {
    await cancel(op.process)
    return
  }
  if (op.kind === 'commit') {
    // In order, first refusal aborts the rest — a graft never lands on a
    // stage the engine rejected.
    for (const declaration of op.declarations) {
      await commit(declaration)
    }
    return
  }
  if (op.kind === 'run') {
    // A surface launches; it never runs children (engine.md, run modes) — the
    // menu is gone a moment later, and a child would go with it.
    await run(op.program, {
      chunks: op.args ? [{ name: 'request', body: op.args }] : [],
      mode: 'launch',
      readBoundary: op.read ?? [],
      writeBoundary: op.write ?? [],
    })
  }
}
