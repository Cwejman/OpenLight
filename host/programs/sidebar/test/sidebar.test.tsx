// The sidebar rendered against fixture substrate, in process: what the author
// sees in the strip, asserted structurally. Life rises as a card, rest falls
// flat (host.md §Visual Language); a click answers with the context menu
// §Sidebar names, and nothing it lists acts yet.
import {
  Sidebar,
  click,
  edges,
  mount,
  settle,
  text,
  texts,
  unmount,
  useTransport,
  type Mounted,
} from './harness.ts'
import { afterEach, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '@openlight/sdk/fixture'
import type { Declaration } from '@openlight/sdk'

const SIDEBAR = 'p_sidebar'
const SESSION = 'session-main'

/** A run of `sidebar` on the session: the process chunk plus its one argument. */
function frame(session = SESSION): Declaration {
  return {
    chunks: [
      { id: SIDEBAR, body: { status: 'running' } },
      { id: 'arg', name: 'request', body: { session } },
      { id: 'boundary', body: {} },
    ],
    placements: [
      { chunk: 'arg', scope: SIDEBAR, type: 'instance' },
      { chunk: 'boundary', scope: SIDEBAR, type: 'relates' },
    ],
  }
}

/** The archetypes and programs every case stands on (bootstrap.md's shapes). */
function ground(): Declaration {
  return {
    chunks: [
      { id: 'engine/process', name: 'process' },
      { id: 'engine/program', name: 'program' },
      { id: SESSION, name: 'main' },
      { id: 'host/read-tile', name: 'read-tile' },
      { id: 'host/sidebar', name: 'sidebar' },
    ],
    placements: [
      { chunk: 'host/read-tile', scope: 'engine/program', type: 'instance' },
      { chunk: 'host/sidebar', scope: 'engine/program', type: 'instance' },
    ],
  }
}

/** One run in the session: `instance` on engine/process, on its program, on the session. */
function process(id: string, program: string, body: Record<string, unknown>): Declaration {
  return {
    chunks: [{ id, body }],
    placements: [
      { chunk: id, scope: 'engine/process', type: 'instance' },
      { chunk: id, scope: program, type: 'instance' },
      { chunk: id, scope: SESSION, type: 'instance' },
    ],
  }
}

function field(given: Declaration[]): FixtureTransport {
  const handle = fixtureTransport({ given })
  useTransport(handle)
  return handle
}

let open: Mounted | null = null

afterEach(async () => {
  if (open) await unmount(open)
  open = null
})

async function show(process = SIDEBAR): Promise<Mounted> {
  open = await mount(<Sidebar process={process} />)
  return open
}

test('running processes are cards, terminal ones flat, each named by its program', async () => {
  field([
    ground(),
    frame(),
    process(SIDEBAR, 'host/sidebar', { status: 'running', started: 2 }),
    process('p_read', 'host/read-tile', { status: 'running', started: 3 }),
    process('p_old', 'host/read-tile', { status: 'completed', started: 1 }),
  ])
  const strip = await show()

  // Life before rest, then recency (items.ts — the steward's ordering pin).
  expect(texts(strip, '[data-ui="item"] [data-part="program"]')).toEqual(['read-tile', 'sidebar', 'read-tile'])
  expect(texts(strip, '[data-ui="item"][data-live="true"] [data-part="program"]')).toEqual(['read-tile', 'sidebar'])
  expect(texts(strip, '[data-ui="item"][data-live="false"] [data-part="program"]')).toEqual(['read-tile'])
})

test('a stale session opens on what is alive: the running cards lead the strip', async () => {
  const stale = Array.from({ length: 12 }, (_, index) =>
    process(`p_stale_${index}`, 'host/read-tile', {
      status: 'failed',
      error: 'engine shutdown',
      started: 100 + index,
    }),
  )
  field([
    ground(),
    frame(),
    ...stale,
    process(SIDEBAR, 'host/sidebar', { status: 'running', started: 900 }),
    process('p_read', 'host/read-tile', { status: 'running', started: 901 }),
  ])
  const strip = await show()

  const listed = [...strip.container.querySelectorAll('[data-ui="item"]')]
  expect(listed.length).toBe(14)
  expect(listed.slice(0, 2).map((node) => node.getAttribute('data-status'))).toEqual([
    'running',
    'running',
  ])
  expect(listed.slice(0, 2).map((node) => node.getAttribute('data-live'))).toEqual([
    'true',
    'true',
  ])
  // Then the rest, newest first — nothing alive is ever below something stopped.
  expect(listed.slice(2).every((node) => node.getAttribute('data-live') === 'false')).toBe(true)
  expect(listed[2]!.textContent).toContain('failed')
  expect(strip.container.querySelector('[data-ui="item"]')!.textContent).toContain('read-tile')
})

test('a pending process has not come to rest — it renders as a card', async () => {
  field([ground(), frame(), process('p_new', 'host/read-tile', { status: 'pending' })])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"][data-live="true"] [data-part="program"]')).toEqual(['read-tile'])
})

test('a failed process falls flat, carrying an error mark', async () => {
  field([
    ground(),
    frame(),
    process('p_dead', 'host/read-tile', { status: 'failed', error: 'engine restart' }),
  ])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"][data-live="false"] [data-part="program"]')).toEqual(['read-tile'])
  expect(text(strip, '[data-ui="item"] [data-part="mark"]')).toBe('failed')
  // The mark rides the program's line; the id that truncates has its own,
  // so the two can never meet.
  expect(strip.container.querySelector('[data-part="mark"]')!.parentElement).not.toBe(
    strip.container.querySelector('[data-part="name"]')!.parentElement,
  )
  expect(text(strip, '[data-ui="item"] [data-part="process"]')).toBe('p_dead')
})

test('a live card says as much about itself as a dead row: state and when it began', async () => {
  field([
    ground(),
    frame(),
    process('p_read', 'host/read-tile', { status: 'running', started: Date.now() }),
    process('p_old', 'host/read-tile', { status: 'completed', started: Date.now() }),
  ])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"][data-live="true"] [data-part="mark"]')).toEqual(['running'])
  expect(texts(strip, '[data-ui="item"][data-live="false"] [data-part="mark"]')).toEqual([
    'completed',
  ])
  // Both carry a time, in the same shape — today as a clock, older as its day.
  expect(texts(strip, '[data-ui="item"] [data-part="time"]')).toEqual([
    expect.stringMatching(/^\d\d:\d\d$/),
    expect.stringMatching(/^\d\d:\d\d$/),
  ])
})

test('a process the engine never dated shows no time rather than a false one', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"] [data-part="time"]')).toEqual([])
})

test('a process carries its own identity beside its program', async () => {
  field([ground(), frame(), process('01K9ZQ2M4V8N7B3C5D6E7F8G9H', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"] [data-part="name"][data-id="true"]')).toEqual(['01K9ZQ2M4V8N7B…'])
})

test('members of the session that are not processes are not sidebar items', async () => {
  field([
    ground(),
    frame(),
    process('p_read', 'host/read-tile', { status: 'running' }),
    {
      chunks: [{ id: 'tab-1', name: 'work' }],
      placements: [{ chunk: 'tab-1', scope: SESSION, type: 'instance' }],
    },
  ])
  const strip = await show()

  expect(texts(strip, '[data-ui="item"] [data-part="program"]')).toEqual(['read-tile'])
})

test('a click answers with the context menu, positioned at the point', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()
  expect(strip.container.querySelector('[data-ui="menu"]')).toBe(null)

  await click(strip, '[data-ui="item"]', { x: 120, y: 64 })

  expect(texts(strip, '[data-ui="menu"] [data-ui="action"]')).toEqual([
    'Jump to tile',
    'Inspect',
    'Terminate',
    'Review changes',
    'New from this',
    'Hide',
  ])
  const menu = strip.container.querySelector('[data-ui="menu"]') as HTMLElement
  expect(menu.style.left).toBe('120px')
  expect(menu.style.top).toBe('64px')

  // Dismissal is always available.
  await click(strip, '[data-ui="backdrop"]')
  expect(strip.container.querySelector('[data-ui="menu"]')).toBe(null)
})

test('the menu offers terminate to a running process and review to a terminal one', async () => {
  field([
    ground(),
    frame(),
    process('p_read', 'host/read-tile', { status: 'running' }),
    process('p_old', 'host/read-tile', { status: 'completed' }),
  ])
  const strip = await show()

  const disabled = (): string[] =>
    [...open!.container.querySelectorAll('[data-ui="menu"] [data-ui="action"]')]
      .filter((node) => (node as HTMLButtonElement).disabled)
      .map((node) => node.textContent ?? '')

  await click(strip, '[data-ui="item"][data-live="true"]')
  expect(disabled()).toEqual(['Review changes'])

  await click(strip, '[data-ui="item"][data-live="false"]')
  expect(disabled()).toEqual(['Terminate'])
})

test('picking an action says it is not built rather than pretending', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  await click(strip, '[data-ui="item"]')
  await click(strip, '[data-ui="menu"] [data-ui="action"]:nth-of-type(3)')

  expect(strip.container.querySelector('[data-ui="menu"]')).toBe(null)
  expect(text(strip, '[data-part="notice"]')).toBe('Terminate — not built yet')
})

test('a commit on the session re-renders the strip', async () => {
  const handle = field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()
  expect(texts(strip, '[data-ui="item"][data-live="true"] [data-part="program"]')).toEqual(['read-tile'])

  await settle(() => handle.commitAsHost(process('p_two', 'host/sidebar', { status: 'running' })))
  expect(texts(strip, '[data-ui="item"] [data-part="program"]')).toEqual(['read-tile', 'sidebar'])

  // And the same for a status change: the card falls flat where it stands.
  await settle(() =>
    handle.commitAsHost({ chunks: [{ id: 'p_read', body: { status: 'completed' } }], placements: [] }),
  )
  expect(texts(strip, '[data-ui="item"][data-live="false"] [data-part="program"]')).toEqual(['read-tile'])
  expect(texts(strip, '[data-ui="item"][data-live="true"] [data-part="program"]')).toEqual(['sidebar'])
})

test('a session holding no processes says so rather than rendering nothing', async () => {
  field([ground(), frame()])
  const strip = await show()

  expect(text(strip, '[data-part="quiet"]')).toContain('no processes')
})

test('a run with no session argument says so rather than rendering nothing', async () => {
  field([
    ground(),
    {
      chunks: [{ id: SIDEBAR, body: { status: 'running' } }, { id: 'boundary', body: {} }],
      placements: [{ chunk: 'boundary', scope: SIDEBAR, type: 'relates' }],
    },
  ])
  const strip = await show()

  expect(text(strip, '[data-part="quiet"]')).toContain('no session argument')
})

// The edge fades (author ruling, *the depth language*): the strip is flat on
// the canvas, so it dissolves content at an edge instead of clipping it — but
// only at an edge that has something past it, and only while it does.

test('at rest at the top the strip fades neither edge', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  const region = strip.container.querySelector('[data-part="strip"]')!
  expect(region.getAttribute('data-fade-top')).toBe('false')
  expect(region.getAttribute('data-fade-bottom')).toBe('false')
})

test('an edge fades exactly when content runs past it', () => {
  const box = (scrollTop: number, clientHeight: number, scrollHeight: number) => ({
    scrollTop,
    clientHeight,
    scrollHeight,
  })

  // Content that fits: neither edge, whatever the strip is asked.
  expect(edges(box(0, 400, 400))).toEqual({ top: false, bottom: false })
  // At the top of a longer list: the bottom alone.
  expect(edges(box(0, 400, 900))).toEqual({ top: false, bottom: true })
  // Somewhere in the middle: both.
  expect(edges(box(120, 400, 900))).toEqual({ top: true, bottom: true })
  // At the end: the top alone — and a sub-pixel remainder is not content.
  expect(edges(box(500, 400, 900))).toEqual({ top: true, bottom: false })
  expect(edges(box(499.6, 400, 900))).toEqual({ top: true, bottom: false })
})
