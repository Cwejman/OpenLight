// The semantic components the host's surfaces share (board, *Author review
// rulings (window v0)*). Each stamps a `data-ui` marker: the marker is what
// `ol.css`'s semantic layer styles, and what the probe lane reads — so the DOM
// report says *card*, *item*, *menu*, not a class soup.
//
// The division of labour with Tailwind runs through every component here: the
// marker carries what the *visual language* rules on — surface fill, the card
// radius, the two depth registers — and Tailwind classes carry the rest. The
// semantic layer sits in `@layer components`, so a class written here or on a
// surface always wins over it.
//
// Deliberately thin. A component earns its place here when two surfaces need
// the same *meaning* (a card, a strip item, a pill, a menu); layout stays with
// the surface, passed through `className` (conventions.md: plain repetition
// beats a clever wrapper).
import type { MouseEvent, ReactNode } from 'react'

/** A rounded surface with a shadow under it — a tile, a menu's host, a panel. */
export function Card({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div data-ui="card" className={className}>
      {children}
    </div>
  )
}

/**
 * One row of a strip. Life rises as a card, rest falls flat (host.md §Visual
 * Language) — the same shape a tile has, from the same shadow token.
 */
export function StripItem({
  live,
  status,
  className,
  onClick,
  children,
}: {
  live: boolean
  status?: string
  className?: string
  onClick?: (event: MouseEvent<HTMLLIElement>) => void
  children?: ReactNode
}) {
  return (
    <li
      data-ui="item"
      data-live={live}
      data-status={status}
      className={className}
      onClick={onClick}
    >
      {children}
    </li>
  )
}

/**
 * A member's state: the word at the small size, with an optional dot beside it
 * — one accent for a failure, the off-ink for anything else. Both surfaces
 * carry this cluster, so the two things it gets wrong by default are tuned
 * here and nowhere else:
 *
 * 1. It aligns on the **baseline**, inside as well as out. A flex box only
 *    offers a baseline when one of its own items is baseline-aligned; centred
 *    items make it synthesize one from its bottom edge, and the small word then
 *    hangs below the line of the larger text leading the row.
 * 2. The dot is not text. Baseline-aligned it meets the baseline by its bottom
 *    edge — its centre half its own 5px above it — and the half-pixel lift
 *    carries that centre the rest of the way to the word's x-height centre
 *    (~2.8px at 11px SF). It reads as a mark *on* the word, not beneath it.
 *
 * The surface names its own region through `part` and its placement through
 * `className`; nothing else about the cluster is a surface's to decide.
 */
export function Status({
  status,
  dot,
  part,
  className,
}: {
  status: string
  dot?: 'quiet' | 'error'
  part?: string
  className?: string
}) {
  return (
    <span
      data-ui="status"
      data-part={part}
      data-status={status}
      className={`inline-flex shrink-0 items-baseline gap-2 text-small text-ink-faint ${className ?? ''}`}
    >
      {dot ? (
        <span
          data-ui="dot"
          className={`size-2.5 shrink-0 -translate-y-[0.5px] rounded-full ${dot === 'error' ? 'bg-error/70' : 'bg-ink-off'}`}
        />
      ) : null}
      {status}
    </span>
  )
}

/** A small rounded label — an id, a placement, a mode. Tabs are these too. */
export function Pill({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      data-ui="pill"
      className={`inline-flex items-center rounded-full bg-hover px-4 py-1 text-small whitespace-nowrap text-ink-soft ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

export type MenuAction = { id: string; label: string; enabled: boolean }

/**
 * The interim context menu — positioned at a point, listing actions, dismissed
 * by its own backdrop.
 *
 * **Interim by ruling** (board, *Author review rulings (window v0)*): context
 * menus are not per-program. The settled design is verbs-from-the-field raised
 * by the host over an overlay; this component holds the shape until that
 * machinery lands, so exactly one copy of the markup exists in the meantime.
 */
export function Menu({
  x,
  y,
  head,
  actions,
  onPick,
  onDismiss,
}: {
  x: number
  y: number
  head?: string
  actions: MenuAction[]
  onPick: (action: MenuAction) => void
  onDismiss: () => void
}) {
  return (
    <>
      {/* Dismissal is always available (programs.md §3.5, *with respect*). The
          backdrop takes the next click, so it lies over the surface. */}
      <div data-ui="backdrop" className="fixed inset-0 z-1" onClick={onDismiss} />
      <div data-ui="menu" className="fixed z-2 min-w-[168px] p-2" style={{ left: x, top: y }}>
        {head ? (
          <div data-ui="menu-head" className="px-4 pt-2 pb-3 text-small text-ink-faint">
            {head}
          </div>
        ) : null}
        {actions.map((action) => (
          <button
            data-ui="action"
            key={action.id}
            className="block w-full cursor-default rounded-soft px-4 py-2 text-left enabled:hover:bg-hover disabled:text-ink-off"
            disabled={!action.enabled}
            onClick={() => onPick(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </>
  )
}
