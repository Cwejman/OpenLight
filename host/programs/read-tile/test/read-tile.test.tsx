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
  expect(text(tile, '.head .prose')).toBe('Initial session.')
  expect(texts(tile, '.row .name')).toEqual(['alpha', 'beta'])
  expect(texts(tile, '.row .text')).toEqual(['first', 'status running'])
  expect(text(tile, '.foot')).toContain('2 members')
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
  expect(texts(tile, '.row .name')).toEqual(['first', 'second', 'third'])
  expect(texts(tile, '.row .seq')).toEqual(['1', '2', '3'])
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
  expect(text(tile, '.document h2')).toBe('note')
  expect(text(tile, '.document .prose')).toBe('the note')
  expect(texts(tile, '.field dt')).toEqual(['status'])
  expect(texts(tile, '.document [data-ui="pill"]')).toEqual(['placed on plan'])
})

test('an empty scope invites what its spec accepts', async () => {
  field([
    frame(['tab']),
    { chunks: [{ id: 'tab', name: 'tab', spec: { accepts: ['tile'] } }], placements: [] },
  ])
  const tile = await show()

  expect(mode(tile)).toBe('invitation')
  expect(text(tile, '.note')).toContain('Empty scope')
  expect(text(tile, '.note')).toContain('tile')
})

test('a root that resolves to nothing renders as an unresolved reference', async () => {
  field([frame(['gone'])])
  const tile = await show()

  expect(mode(tile)).toBe('unresolved')
  expect(texts(tile, '.note code')).toEqual(['gone'])
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

  expect(texts(tile, '.row .name.mono')).toEqual(['01K9ZQ2M4V8N…'])
  expect(texts(tile, '.row .name')).toEqual(['01K9ZQ2M4V8N…', 'beta'])
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

  expect(text(tile, '.error')).toContain('hidden')
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
  expect(texts(tile, '.row .name')).toEqual(['alpha', 'beta'])

  await settle(() =>
    handle.commitAsHost({
      chunks: [{ id: 'c', name: 'gamma' }],
      placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
    }),
  )

  expect(texts(tile, '.row .name')).toEqual(['alpha', 'beta', 'gamma'])
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

  expect(text(tile, '.quiet')).toContain('no target argument')
})
