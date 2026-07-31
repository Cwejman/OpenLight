// The visual-language pins the shared stylesheet is answerable for (author
// ruling, *the depth language*). Everything here is a rule about what a program
// may draw, so it is checked in the one place every surface loads: `ol.css` —
// the sheet the host compiles per surface and the shell links.
import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const styles = readFileSync(new URL('../src/ol.css', import.meta.url), 'utf8')

test('the shadow CSS may draw is one soft, centred token', () => {
  expect(styles).toContain('--ol-shadow-soft: 0 0 10px rgba(0, 0, 0, .05)')
  // The tile's aura is the host's now — no token here casts one.
  expect(styles).not.toContain('--ol-shadow-aura')
  expect(styles).not.toContain('--ol-shadow-contact')
  expect(styles).not.toContain('--ol-shadow:')
  expect(styles).not.toContain('--ol-lift')
})

test('an in-flow card takes the soft shadow; a floating surface takes none', () => {
  const item = rule('[data-ui="item"][data-live="true"]')
  expect(item).toContain('box-shadow: var(--ol-shadow-soft)')

  const card = rule('[data-ui="card"]')
  expect(card).not.toContain('box-shadow')

  // Both card kinds are the same white on the canvas, cut to the same corner.
  for (const block of [card, item]) {
    expect(block).toContain('background: var(--ol-surface)')
    expect(block).toContain('border-radius: var(--ol-radius)')
  }
})

test('programs never style a scrollbar — the platform owns the affordance', () => {
  expect(styles).not.toContain('::-webkit-scrollbar')
  expect(styles).not.toContain('scrollbar-width')
  expect(styles).not.toContain('--ol-scroll')
  // What is left of a scrolling region is the fact that it scrolls.
  expect(rule('[data-scroll]')).toContain('overflow-y: auto')
})

test('the tokens stay the one source: @theme maps them and defines nothing', () => {
  const theme = rule('@theme')
  // Every colour, radius and font Tailwind knows points back at a token.
  for (const [, value] of theme.matchAll(/--(?:color|radius|font)-[\w*-]+: ([^;]+);/g)) {
    expect(value).toMatch(/^var\(--ol-|^initial$/)
  }
  // And the defaults a closed visual language must not inherit are cleared.
  for (const namespace of ['--color-*', '--text-*', '--font-*', '--radius-*']) {
    expect(theme).toContain(`${namespace}: initial`)
  }
})

test('the semantic layer sits under the utilities, so a class always wins', () => {
  // Everything keyed on a `data-ui` marker lives in `@layer components`; an
  // unlayered rule would outrank every utility written on the markup.
  const components = styles.indexOf('@layer components')
  expect(components).toBeGreaterThan(0)
  expect(styles.indexOf('[data-ui=')).toBeGreaterThan(components)
})

/** The block of the first rule with this exact selector, at any indent. */
function rule(selector: string): string {
  const at = styles.search(new RegExp(`\\n *${escape(selector)}[ ,{]`))
  if (at < 0) throw new Error(`no rule for ${selector}`)
  return styles.slice(styles.indexOf('{', at), styles.indexOf('}', at))
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
