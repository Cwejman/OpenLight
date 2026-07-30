// What the read-tile derives before it renders anything: the call frame's
// argument, and the view the scope's *shape* asks for (programs.md §3.5,
// *Viewing the substrate*). Pure — the rendering half imports these, the tests
// drive them directly.
import type { ChunkId, ChunkItem, ScopeResult } from '@openlight/sdk'

export type Member = {
  chunk: ChunkItem
  /** Order within the viewed scope, when the placement carries one. */
  seq?: number
  /** How the member sits in the viewed scope. Rendered in Document mode only. */
  placement?: 'instance' | 'relates'
}

/**
 * The first rung of the interface-inference ladder, in the order it is checked
 * — first match wins. `table`, `history` and the inspector hand-off (the other
 * rows of programs.md §3.5's table) are not built in v0.1.
 *
 * The table's rows as written are not disjoint: "mixed / unordered → Cards" sits
 * above "a single chunk → Document" and "empty scope → Invitation", so under
 * first-match-wins those two rows are unreachable. Cards is therefore read as
 * the catch-all and checked last (recorded gap against programs.md §3.5).
 */
export type View =
  | { mode: 'unresolved'; roots: ChunkId[] }
  | { mode: 'sequence'; members: Member[] }
  | { mode: 'document'; member: Member }
  | { mode: 'invitation'; accepts: string[] }
  | { mode: 'cards'; members: Member[] }

export function infer(roots: ChunkId[], rootChunks: ChunkItem[], result: ScopeResult): View {
  const unresolved = result.unresolved ?? []
  if (unresolved.length > 0) return { mode: 'unresolved', roots: unresolved }

  const members = memberize(roots, result.chunks)
  if (rootChunks.some((chunk) => chunk.spec?.ordered)) {
    return { mode: 'sequence', members: bySeq(members) }
  }
  if (members.length === 1) return { mode: 'document', member: members[0]! }
  if (members.length === 0) {
    const accepts = rootChunks.flatMap((chunk) => chunk.spec?.accepts ?? [])
    return { mode: 'invitation', accepts: [...new Set(accepts)] }
  }
  return { mode: 'cards', members }
}

/** The scope ids the run was given — `read`'s one required argument (§3.5). */
export function argumentTarget(frame: ScopeResult): ChunkId[] {
  for (const chunk of frame.chunks) {
    const target = chunk.body?.target
    if (typeof target === 'string') return [target]
    if (Array.isArray(target) && target.every((id) => typeof id === 'string')) {
      return target as ChunkId[]
    }
  }
  return []
}

/** Pin: `name` when present, else the id truncated — enough to disambiguate. */
export function displayName(chunk: ChunkItem): { text: string; isId: boolean } {
  return chunk.name
    ? { text: chunk.name, isId: false }
    : { text: shortId(chunk.id), isId: true }
}

export function shortId(id: ChunkId, keep = 12): string {
  return id.length > keep ? `${id.slice(0, keep)}…` : id
}

/** `body.text` as prose; anything else as its scalar keys, compactly. */
export function leadingText(chunk: ChunkItem, limit = 160): string {
  const body = chunk.body
  if (!body) return ''
  if (typeof body.text === 'string') return truncate(body.text, limit)
  const pairs = Object.entries(body)
    .filter(([, value]) => value === null || typeof value !== 'object')
    .map(([key, value]) => `${key} ${value}`)
  return truncate(pairs.join(' · '), limit)
}

export function bodyEntries(chunk: ChunkItem): [string, string][] {
  return Object.entries(chunk.body ?? {})
    .filter(([key]) => key !== 'text')
    .map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)])
}

function truncate(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > limit ? `${flat.slice(0, limit)}…` : flat
}

function memberize(roots: ChunkId[], chunks: ChunkItem[]): Member[] {
  return chunks.map((chunk) => {
    const placement = chunk.placements?.find((p) => roots.includes(p.scope_id))
    return {
      chunk,
      ...(placement?.seq === undefined ? {} : { seq: placement.seq }),
      ...(placement === undefined ? {} : { placement: placement.type_ }),
    }
  })
}

/**
 * Ascending by seq; members without one keep the engine's order behind them
 * (`Array.prototype.sort` is stable).
 */
function bySeq(members: Member[]): Member[] {
  return [...members].sort((a, b) => (a.seq ?? Infinity) - (b.seq ?? Infinity))
}
