// The shadow underlay's page: it draws where the rim says, and it is never in
// the way. Importing the module *is* loading the page — the body mounts.
import { expect, test } from 'bun:test'
// Reached by file, never through the package index: that path pulls `useScope`
// and with it the SDK, which picks its transport the moment it loads — and this
// suite's neighbours install theirs first (see `test/harness.ts`).
import { render } from '../src/underlay.ts'
import { styles } from '../src/styles.ts'

const sheet = (): string =>
  [...document.querySelectorAll('style')].map((node) => node.textContent ?? '').join('\n')

const auras = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('[data-ui="underlay"] [data-ui="aura"]'),
]

test('the page mounts its own host, drained of the rects the rim buffered', () => {
  expect(document.querySelector('[data-ui="underlay"]')).not.toBe(null)
  expect(typeof window.__openlight_underlay).toBe('function')
  expect(auras()).toEqual([])
})

test('one aura per rect, placed exactly where the tile is', () => {
  window.__openlight_underlay!([
    { x: 240, y: 14, width: 1026, height: 812 },
    { x: 10.5, y: 0, width: 1, height: 2 },
  ])

  expect(auras().map((node) => node.style.cssText)).toEqual([
    'left: 240px; top: 14px; width: 1026px; height: 812px;',
    'left: 10.5px; top: 0px; width: 1px; height: 2px;',
  ])
})

test('a new layout replaces the last one — auras never accumulate', () => {
  window.__openlight_underlay!([{ x: 1, y: 2, width: 3, height: 4 }])
  expect(auras().length).toBe(1)

  window.__openlight_underlay!([])
  expect(auras()).toEqual([])
})

test('render is the whole of it: any element, any rects', () => {
  const host = document.createElement('div')
  render(host, [{ x: 0, y: 0, width: 8, height: 9 }])
  expect(host.children.length).toBe(1)
  expect((host.firstElementChild as HTMLElement).dataset.ui).toBe('aura')
})

test('the aura is the token, and nothing on the page takes a click', () => {
  const css = sheet()
  expect(css).toContain(styles)
  // Only what the page adds on top of the shared tokens.
  const own = css.slice(css.indexOf(styles) + styles.length)
  expect(own).toContain('box-shadow: var(--ol-shadow-aura)')
  expect(own).toContain('border-radius: var(--ol-radius)')
  expect(own).toContain('pointer-events: none')
  // The aura is drawn beneath the surfaces; it never paints a fill of its own.
  expect(own).not.toContain('background')
})
