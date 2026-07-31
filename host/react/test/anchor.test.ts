// Anchoring across surfaces: a click inside one webview, a menu on another that
// spans the window. The host stamps where a surface sits (`host/src/page.rs`);
// this is the addition that makes the two coordinate spaces one.
import { expect, test } from 'bun:test'
import { origin, windowPoint } from '../src/anchor.ts'

test('a click is carried from the surface it landed on into the window', () => {
  // The sidebar strip: 14 in from the window's left, 10 down (the rim's bleed).
  expect(origin({ x: 14, y: 10 }, { clientX: 120, clientY: 64 })).toEqual({ x: 134, y: 74 })
})

test('a surface the host never placed anchors where it was clicked', () => {
  // Not a lie, a floor: a full-window surface *is* at the origin, and a page
  // with no stamp has nothing better to say than what it saw.
  expect(origin(undefined, { clientX: 8, clientY: 3 })).toEqual({ x: 8, y: 3 })
  expect(windowPoint({ clientX: 8, clientY: 3 })).toEqual({ x: 8, y: 3 })
})

test('the live reading is the stamp the host left on the window', () => {
  window.__openlight_origin = { x: 100, y: 40 }
  expect(windowPoint({ clientX: 5, clientY: 5 })).toEqual({ x: 105, y: 45 })
  delete window.__openlight_origin
})
