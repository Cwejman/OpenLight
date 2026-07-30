// The sidebar rendered against fixture substrate, in process: what the author
// sees in the strip, asserted structurally. Life rises as a card, rest falls
// flat (host.md §Visual Language); a click answers with the context menu
// §Sidebar names, and nothing it lists acts yet.
import {
  Sidebar,
  click,
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
  expect(texts(strip, '.item .program')).toEqual(['read-tile', 'sidebar', 'read-tile'])
  expect(texts(strip, '.item.card .program')).toEqual(['read-tile', 'sidebar'])
  expect(texts(strip, '.item.flat .program')).toEqual(['read-tile'])
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

  const listed = [...strip.container.querySelectorAll('.item')]
  expect(listed.length).toBe(14)
  expect(listed.slice(0, 2).map((node) => node.getAttribute('data-status'))).toEqual([
    'running',
    'running',
  ])
  expect(listed.slice(0, 2).map((node) => node.className)).toEqual(['item card', 'item card'])
  // Then the rest, newest first — nothing alive is ever below something stopped.
  expect(listed.slice(2).every((node) => node.className === 'item flat')).toBe(true)
  expect(listed[2]!.textContent).toContain('failed')
  expect(strip.container.querySelector('.item')!.textContent).toContain('read-tile')
})

test('a pending process has not come to rest — it renders as a card', async () => {
  field([ground(), frame(), process('p_new', 'host/read-tile', { status: 'pending' })])
  const strip = await show()

  expect(texts(strip, '.item.card .program')).toEqual(['read-tile'])
})

test('a failed process falls flat, carrying an error mark', async () => {
  field([
    ground(),
    frame(),
    process('p_dead', 'host/read-tile', { status: 'failed', error: 'engine restart' }),
  ])
  const strip = await show()

  expect(texts(strip, '.item.flat .program')).toEqual(['read-tile'])
  expect(text(strip, '.item .mark')).toBe('failed')
})

test('a process carries its own identity beside its program', async () => {
  field([ground(), frame(), process('01K9ZQ2M4V8N7B3C5D6E7F8G9H', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  expect(texts(strip, '.item .name.mono')).toEqual(['01K9ZQ2M4V8N7B…'])
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

  expect(texts(strip, '.item .program')).toEqual(['read-tile'])
})

test('a click answers with the context menu, positioned at the point', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()
  expect(strip.container.querySelector('.menu')).toBe(null)

  await click(strip, '.item', { x: 120, y: 64 })

  expect(texts(strip, '.menu .action')).toEqual([
    'Jump to tile',
    'Inspect',
    'Terminate',
    'Review changes',
    'New from this',
    'Hide',
  ])
  const menu = strip.container.querySelector('.menu') as HTMLElement
  expect(menu.style.left).toBe('120px')
  expect(menu.style.top).toBe('64px')

  // Dismissal is always available.
  await click(strip, '.backdrop')
  expect(strip.container.querySelector('.menu')).toBe(null)
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
    [...open!.container.querySelectorAll('.menu .action')]
      .filter((node) => (node as HTMLButtonElement).disabled)
      .map((node) => node.textContent ?? '')

  await click(strip, '.item.card')
  expect(disabled()).toEqual(['Review changes'])

  await click(strip, '.item.flat')
  expect(disabled()).toEqual(['Terminate'])
})

test('picking an action says it is not built rather than pretending', async () => {
  field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()

  await click(strip, '.item')
  await click(strip, '.menu .action:nth-of-type(3)')

  expect(strip.container.querySelector('.menu')).toBe(null)
  expect(text(strip, '.notice')).toBe('Terminate — not built yet')
})

test('a commit on the session re-renders the strip', async () => {
  const handle = field([ground(), frame(), process('p_read', 'host/read-tile', { status: 'running' })])
  const strip = await show()
  expect(texts(strip, '.item.card .program')).toEqual(['read-tile'])

  await settle(() => handle.commitAsHost(process('p_two', 'host/sidebar', { status: 'running' })))
  expect(texts(strip, '.item .program')).toEqual(['read-tile', 'sidebar'])

  // And the same for a status change: the card falls flat where it stands.
  await settle(() =>
    handle.commitAsHost({ chunks: [{ id: 'p_read', body: { status: 'completed' } }], placements: [] }),
  )
  expect(texts(strip, '.item.flat .program')).toEqual(['read-tile'])
  expect(texts(strip, '.item.card .program')).toEqual(['sidebar'])
})

test('a session holding no processes says so rather than rendering nothing', async () => {
  field([ground(), frame()])
  const strip = await show()

  expect(text(strip, '.quiet')).toContain('no processes')
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

  expect(text(strip, '.quiet')).toContain('no session argument')
})
