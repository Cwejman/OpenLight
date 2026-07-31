/// <reference path="./globals.d.ts" />
// Anchoring across surfaces: one surface points, another surface renders there.
//
// A context menu, a palette, a popup-at-point (programs.md §3.5, *verbs from
// the field*) is its own program on its own webview spanning the window. The
// surface that raises it says *where* — and the only coordinates a click hands
// it are its own webview's. This is the translation, in one place.

export type Point = { x: number; y: number }

/** Where a click inside this surface landed, in the window the overlay spans. */
export function windowPoint(event: { clientX: number; clientY: number }): Point {
  return origin(typeof window === 'undefined' ? undefined : window.__openlight_origin, event)
}

/** The pure half — the host's stamp, plus the point the page saw. */
export function origin(at: Point | undefined, event: { clientX: number; clientY: number }): Point {
  return { x: (at?.x ?? 0) + event.clientX, y: (at?.y ?? 0) + event.clientY }
}
