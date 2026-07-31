// The sidebar rendered against fixture substrate, in process: what the author
// sees in the strip, asserted structurally. Life rises as a card, rest falls
// flat (host.md §Visual Language); a click raises the real context menu — its
// own overlay program, run with the entries and the anchor as its argument.
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
import { get, scope, type Declaration } from '@openlight/sdk'

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
      { id: 'host/context-menu', name: 'context-menu', body: { surface: 'overlay' } },
    ],
    placements: [
      { chunk: 'host/read-tile', scope: 'engine/program', type: 'instance' },
      { chunk: 'host/sidebar', scope: 'engine/program', type: 'instance' },
      { chunk: 'host/context-menu', scope: 'engine/program', type: 'instance' },
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

test('a click runs the context menu, anchored where the window saw the click', async () => {
  const handle = field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()
  const before = new Set(handle.engine.processes.keys())
  // The strip is a webview inset in the window; the overlay spans the window.
  window.__openlight_origin = { x: 14, y: 10 }

  await click(strip, '[data-ui="item"]', { x: 120, y: 64 })

  // Nothing was drawn in the strip: the menu is another program's surface.
  expect(strip.container.querySelector('[data-ui="menu"]')).toBe(null)
  const raised = [...handle.engine.processes.keys()].filter((pid) => !before.has(pid))
  expect(raised.length).toBe(1)

  const request = (await scope([])).chunks.find((chunk) => chunk.body?.anchor)
  expect(request?.body?.anchor).toEqual({ x: 134, y: 74 })
  expect(request?.body?.head).toBe('read-tile')
  const entries = request?.body?.entries as { label: string; op: { kind: string } }[]
  expect(entries.map((entry) => entry.label)).toEqual([
    'Jump to tile',
    'Open in tile',
    'Close tile',
    'Inspect',
    'Terminate',
    'Review changes',
    'New from this',
    'Hide',
  ])
  // It is a run of the menu program, found by name.
  const item = await get(raised[0]!)
  expect(item?.placements?.some((p) => p.scope_id === 'host/context-menu')).toBe(true)
})

test('the entries carry the state the item is in — terminate only while it lives', async () => {
  const handle = field([
    ground(),
    frame(),
    process('p_read', 'host/read-tile', { status: 'running' }),
    process('p_old', 'host/read-tile', { status: 'completed' }),
  ])
  const strip = await show()

  const picked = async (selector: string): Promise<Record<string, boolean>> => {
    await click(strip, selector)
    const requests = (await scope([])).chunks.filter((chunk) => chunk.body?.anchor)
    const entries = requests[requests.length - 1]!.body!.entries as {
      label: string
      disabled?: boolean
    }[]
    return Object.fromEntries(entries.map((entry) => [entry.label, entry.disabled === true]))
  }

  // New from this is greyed either way — a launch from the menu lands on no
  // session and no tile (the swap.rs pin; board part 0). Hide acts only on
  // rest: a live process's placements are engine-pinned.
  const live = await picked('[data-ui="item"][data-live="true"]')
  expect([live['Terminate'], live['New from this'], live['Hide']]).toEqual([false, true, true])
  const rest = await picked('[data-ui="item"][data-live="false"]')
  expect([rest['Terminate'], rest['New from this'], rest['Hide']]).toEqual([true, true, false])
  expect(handle.engine.processes.size).toBeGreaterThan(0)
})

test('with no menu program in the field the strip says so rather than swallowing the click', async () => {
  field([
    {
      chunks: [
        { id: 'engine/process', name: 'process' },
        { id: 'engine/program', name: 'program' },
        { id: SESSION, name: 'main' },
        { id: 'host/read-tile', name: 'read-tile' },
      ],
      placements: [{ chunk: 'host/read-tile', scope: 'engine/program', type: 'instance' }],
    },
    frame(),
    process('p_read', 'host/read-tile', { status: 'running' }),
  ])
  const strip = await show()

  await click(strip, '[data-ui="item"]')

  expect(text(strip, '[data-part="notice"]')).toContain('no context-menu program')
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
