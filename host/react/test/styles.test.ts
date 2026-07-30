// The visual-language pins the shared stylesheet is answerable for (author
// ruling, *the depth language*). Everything here is a rule about what a program
// may draw, so it is checked in the one place every program inlines.
import { expect, test } from 'bun:test'
import { styles } from '../src/styles.ts'

test('depth has two registers, and each is named once', () => {
  expect(styles).toContain('--ol-shadow-contact: 0 1px 2px rgba(0, 0, 0, .04)')
  expect(styles).toContain('--ol-shadow-aura: 0 0 24px rgba(0, 0, 0, .05)')
  // The old single shadow, and the room it needed, are gone with it.
  expect(styles).not.toContain('--ol-shadow:')
  expect(styles).not.toContain('--ol-lift')
})

test('an in-flow card takes the contact shadow; a floating surface takes none', () => {
  const item = rule('[data-ui="item"][data-live="true"]')
  expect(item).toContain('box-shadow: var(--ol-shadow-contact)')

  const card = rule('[data-ui="card"]')
  expect(card).toContain('background: var(--ol-surface)')
  expect(card).toContain('border-radius: var(--ol-radius)')
  expect(card).not.toContain('box-shadow')
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
