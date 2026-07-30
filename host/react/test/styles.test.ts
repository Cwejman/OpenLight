// The visual-language pins the shared stylesheet is answerable for (author
// ruling, *the depth language*). Everything here is a rule about what a program
// may draw, so it is checked in the one place every program inlines.
import { expect, test } from 'bun:test'
import { styles } from '../src/styles.ts'

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

/** The declaration block of the first rule with this exact selector. */
function rule(selector: string): string {
  const at = styles.indexOf(`\n${selector}`)
  if (at < 0) throw new Error(`no rule for ${selector}`)
  return styles.slice(styles.indexOf('{', at), styles.indexOf('}', at))
}
