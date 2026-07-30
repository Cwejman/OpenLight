// The semantic components the host's surfaces share (board, *Author review
// rulings (window v0)*). Each stamps a `data-ui` marker: the marker is what
// `styles.ts` styles, and what the probe lane reads — so the DOM report says
// *card*, *item*, *menu*, not a class soup.
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
  onClick,
  children,
}: {
  live: boolean
  status?: string
  onClick?: (event: MouseEvent<HTMLLIElement>) => void
  children?: ReactNode
}) {
  return (
    <li data-ui="item" data-live={live} data-status={status} onClick={onClick}>
      {children}
    </li>
  )
}

/** A small rounded label — an id, a placement, a mode. Tabs are these too. */
export function Pill({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span data-ui="pill" className={className}>
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
      {/* Dismissal is always available (programs.md §3.5, *with respect*). */}
      <div data-ui="backdrop" onClick={onDismiss} />
      <div data-ui="menu" style={{ left: x, top: y }}>
        {head ? <div data-ui="menu-head">{head}</div> : null}
        {actions.map((action) => (
          <button
            data-ui="action"
            key={action.id}
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
