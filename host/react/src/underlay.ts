// The shadow underlay — where a floating surface's depth actually lives.
//
// A tile is a webview, and a webview is clipped to its own rect: a shadow drawn
// by the program inside it casts into nothing. So the aura is drawn *beneath*
// the tiles instead, by one full-window webview the rim creates first (bottom of
// the z-order) and never lets take a click. This module is that webview's whole
// page: it imports the shared token stylesheet, so styling stays here rather
// than crossing into Rust, and it exposes one global the rim calls with the
// only thing the rim knows — the tile leaves' rectangles, in window coordinates.
//
// It is not a program: no process, no scope, no engine. It is the canvas the
// window's depth is painted on.
import { styles } from './styles.ts'

/** One tile leaf's geometry, as the rim's `geometry::walk` hands it over. */
export type Rect = { x: number; y: number; width: number; height: number }

declare global {
  interface Window {
    /** Called by the rim on mount and on every layout change. */
    __openlight_underlay?: (rects: Rect[]) => void
    /** What the rim said before this module loaded (its init script buffers). */
    __openlight_rects?: Rect[]
  }
}

/** One aura per rect, positioned where the tile is — pure but for the DOM. */
export function render(host: HTMLElement, rects: Rect[]): void {
  host.replaceChildren(
    ...rects.map((rect) => {
      const aura = document.createElement('div')
      aura.dataset.ui = 'aura'
      aura.style.left = `${rect.x}px`
      aura.style.top = `${rect.y}px`
      aura.style.width = `${rect.width}px`
      aura.style.height = `${rect.height}px`
      return aura
    }),
  )
}

// Layout only — the radius and the aura itself are tokens in `styles.ts`.
const CSS = `
  /* Nothing here is ever a target: the underlay spans the whole window, and the
     surfaces it sits under must keep every click. */
  html, body { pointer-events: none }
  [data-ui="underlay"] { position: fixed; inset: 0 }
  /* An outer box-shadow never paints inside the box that casts it, so the aura
     is a halo around the tile and nothing else — the tile's own white card,
     edge to edge in its webview, covers the rest. */
  [data-ui="aura"] {
    position: absolute;
    border-radius: var(--ol-radius); box-shadow: var(--ol-shadow-aura);
  }
`

const sheet = document.createElement('style')
sheet.textContent = styles + CSS
document.head.appendChild(sheet)

const host = document.createElement('div')
host.dataset.ui = 'underlay'
document.body.appendChild(host)

const buffered = window.__openlight_rects ?? []
window.__openlight_underlay = (rects: Rect[]) => render(host, rects)
window.__openlight_underlay(buffered)
