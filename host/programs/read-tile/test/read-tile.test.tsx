// The read-tile rendered against fixture substrate, in process: what the author
// sees in the window, asserted structurally. Each case is one scope shape from
// programs.md §3.5's inference table, plus the states the pins added.
import { ReadTile, mode, mount, settle, text, texts, unmount, useTransport, type Mounted } from './harness.ts'
import { afterEach, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '@openlight/sdk/fixture'
import type { Declaration } from '@openlight/sdk'

const PROCESS = 'p_read'

/** A run of `read` on `target`: the process chunk plus its one argument. */
function frame(target: string[]): Declaration {
  return {
    chunks: [
      { id: PROCESS, body: { status: 'running' } },
      { id: 'arg', name: 'request', body: { target } },
      { id: 'boundary', body: {} },
    ],
    placements: [
      { chunk: 'arg', scope: PROCESS, type: 'instance' },
      { chunk: 'boundary', scope: PROCESS, type: 'relates' },
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

async function show(process = PROCESS): Promise<Mounted> {
  open = await mount(<ReadTile process={process} />)
  return open
}

test('an unordered scope of several members renders as cards', async () => {
  field([
    frame(['session']),
    {
      chunks: [
        { id: 'session', name: 'main', body: { text: 'Initial session.' } },
        { id: 'a', name: 'alpha', body: { text: 'first' } },
        { id: 'b', name: 'beta', body: { status: 'running' } },
      ],
      placements: [
        { chunk: 'a', scope: 'session', type: 'instance' },
        { chunk: 'b', scope: 'session', type: 'instance' },
      ],
    },
  ])
  const tile = await show()

  expect(mode(tile)).toBe('cards')
  expect(text(tile, 'h1')).toBe('main')
  expect(text(tile, '[data-part="head"] [data-part="prose"]')).toBe('Initial session.')
  // Context leads: the address the scope was opened by, then the subject.
  expect(
    [...tile.container.querySelectorAll('[data-part="head"] > *')].map((node) =>
      node.getAttribute('data-part'),
    ),
  ).toEqual(['chips', 'title', 'prose'])
  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['alpha', 'beta'])
  // State is a slot of its own, not another run of text in the row.
  expect(texts(tile, '[data-part="row"] [data-part="text"]')).toEqual(['first'])
  expect(texts(tile, '[data-part="status"]')).toEqual(['running'])
  expect(text(tile, '[data-part="foot"]')).toContain('2 members')
})

test('a row reads as a hierarchy: name, id, state, time', async () => {
  field([
    frame(['session']),
    {
      chunks: [
        { id: 'session', name: 'main' },
        {
          id: 'run-01',
          name: 'compose',
          body: {
            status: 'failed',
            started: Date.now(),
            error: 'engine shutdown',
            pid: 4711,
            timeout_ms: 86_400_000,
          },
        },
        { id: 'run-02', name: 'draft', body: { text: 'a note' } },
      ],
      placements: [
        { chunk: 'run-01', scope: 'session', type: 'instance' },
        { chunk: 'run-02', scope: 'session', type: 'instance' },
      ],
    },
  ])
  const tile = await show()

  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['compose', 'draft'])
  // The id sits beside the name — a named member still shows what it *is*.
  expect(texts(tile, '[data-part="row"] [data-part="id"]')).toEqual(['run-01', 'run-02'])
  expect(texts(tile, '[data-part="status"]')).toEqual(['failed'])
  // A failure is marked at the state, not shouted across the row.
  expect(tile.container.querySelector('[data-part="status"][data-status="failed"]')).not.toBe(null)
  // A run from today reads as a clock; an older one would read as its day.
  expect(texts(tile, '[data-part="time"]')).toEqual([expect.stringMatching(/^\d\d:\d\d$/)])

  // The state cluster sits with the content it describes — inside the same line
  // as the name and id, not orphaned past the row's far edge.
  const line = tile.container.querySelector('[data-part="name"]')!.parentElement!
  expect([...line.children].map((node) => node.getAttribute('data-part'))).toEqual([
    'name',
    'id',
    'status',
    'time',
  ])

  // Engine bookkeeping is not resting content; the failure's reason is.
  expect(texts(tile, '[data-part="row"] [data-part="text"]')).toEqual([
    'error engine shutdown',
    'a note',
  ])
})

test('an ordered scope renders as a sequence, rows in seq order', async () => {
  field([
    frame(['log']),
    {
      chunks: [
        { id: 'log', name: 'log', spec: { ordered: true } },
        { id: 't3', name: 'third' },
        { id: 't1', name: 'first' },
        { id: 't2', name: 'second' },
      ],
      placements: [
        { chunk: 't3', scope: 'log', type: 'instance', seq: 3 },
        { chunk: 't1', scope: 'log', type: 'instance', seq: 1 },
        { chunk: 't2', scope: 'log', type: 'instance', seq: 2 },
      ],
    },
  ])
  const tile = await show()

  expect(mode(tile)).toBe('sequence')
  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['first', 'second', 'third'])
  expect(texts(tile, '[data-part="seq"]')).toEqual(['1', '2', '3'])
})

test('a single member renders as a document, placement type visible', async () => {
  field([
    frame(['plan']),
    {
      chunks: [
        { id: 'plan', name: 'plan' },
        { id: 'note', name: 'note', body: { text: 'the note', status: 'draft' } },
      ],
      placements: [{ chunk: 'note', scope: 'plan', type: 'relates' }],
    },
  ])
  const tile = await show()

  expect(mode(tile)).toBe('document')
  expect(text(tile, '[data-part="document"] [data-part="title"]')).toBe('note')
  expect(text(tile, '[data-part="document"] [data-part="prose"]')).toBe('the note')
  expect(texts(tile, '[data-part="field"] dt')).toEqual(['status'])
  expect(texts(tile, '[data-part="document"] [data-ui="pill"]')).toEqual(['placed on plan'])
})

test('an empty scope invites what its spec accepts', async () => {
  field([
    frame(['tab']),
    { chunks: [{ id: 'tab', name: 'tab', spec: { accepts: ['tile'] } }], placements: [] },
  ])
  const tile = await show()

  expect(mode(tile)).toBe('invitation')
  expect(text(tile, '[data-part="note"]')).toContain('Empty scope')
  expect(text(tile, '[data-part="note"]')).toContain('tile')
})

test('a root that resolves to nothing renders as an unresolved reference', async () => {
  field([frame(['gone'])])
  const tile = await show()

  expect(mode(tile)).toBe('unresolved')
  expect(texts(tile, '[data-part="note"] code')).toEqual(['gone'])
})

test('a nameless member falls back to its truncated id, in monospace', async () => {
  field([
    frame(['session']),
    {
      chunks: [
        { id: 'session', name: 'main' },
        { id: '01K9ZQ2M4V8N7B3C5D6E7F8G9H', body: { status: 'running' } },
        { id: 'b', name: 'beta' },
      ],
      placements: [
        { chunk: '01K9ZQ2M4V8N7B3C5D6E7F8G9H', scope: 'session', type: 'instance' },
        { chunk: 'b', scope: 'session', type: 'instance' },
      ],
    },
  ])
  const tile = await show()

  expect(texts(tile, '[data-part="name"][data-id="true"]')).toEqual(['01K9ZQ2M4V8N…'])
  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['01K9ZQ2M4V8N…', 'beta'])
})

test('a read outside the boundary renders a quiet error, never a blank', async () => {
  const handle = field([
    { chunks: [{ id: 'visible', name: 'visible' }, { id: 'hidden', name: 'hidden' }], placements: [] },
  ])
  const spawned = handle.spawnIdentity(['visible'], [])
  handle.commitAsHost({
    chunks: [{ id: 'arg', name: 'request', body: { target: ['hidden'] } }],
    placements: [{ chunk: 'arg', scope: spawned.process, type: 'instance' }],
  })
  handle.actAs(spawned.process)
  const tile = await show(spawned.process)

  expect(text(tile, '[data-part="error"]')).toContain('hidden')
  expect(mode(tile)).toBe(null)
})

test('a commit on the viewed scope re-renders the tile', async () => {
  const handle = field([
    frame(['session']),
    {
      chunks: [
        { id: 'session', name: 'main' },
        { id: 'a', name: 'alpha' },
        { id: 'b', name: 'beta' },
      ],
      placements: [
        { chunk: 'a', scope: 'session', type: 'instance' },
        { chunk: 'b', scope: 'session', type: 'instance' },
      ],
    },
  ])
  const tile = await show()
  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['alpha', 'beta'])

  await settle(() =>
    handle.commitAsHost({
      chunks: [{ id: 'c', name: 'gamma' }],
      placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
    }),
  )

  expect(texts(tile, '[data-part="row"] [data-part="name"]')).toEqual(['alpha', 'beta', 'gamma'])
  expect(mode(tile)).toBe('cards')
})

test('a run with no target argument says so rather than rendering nothing', async () => {
  field([
    {
      chunks: [{ id: PROCESS, body: { status: 'running' } }, { id: 'boundary', body: {} }],
      placements: [{ chunk: 'boundary', scope: PROCESS, type: 'relates' }],
    },
  ])
  const tile = await show()

  expect(text(tile, '[data-part="quiet"]')).toContain('no target argument')
})
