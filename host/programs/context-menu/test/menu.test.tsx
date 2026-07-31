// The context menu rendered against fixture substrate, in process: what the
// person sees on the overlay pane, and what picking an entry actually does —
// the op goes through the SDK under the menu's own identity, then the program
// ends itself (board, *Next unit ruled: context menu*).
import {
  ContextMenu,
  click,
  mount,
  press,
  settle,
  texts,
  unmount,
  useTransport,
  type Mounted,
} from './harness.ts'
import { afterEach, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '@openlight/sdk/fixture'
import { get, scope, type ChunkId, type ProcessId } from '@openlight/sdk'
import type { Entry } from '../src/entries.ts'

const SESSION = 'session-main'
const READ_TILE = 'host/read-tile'

/** The archetypes and the one program a run entry can name. */
const ground = {
  chunks: [
    { id: SESSION, name: 'main' },
    { id: READ_TILE, name: 'read-tile', body: { runtime: 'webview', executable: 'x' } },
  ],
  placements: [{ chunk: READ_TILE, scope: 'engine/program', type: 'instance' as const }],
}

let open: Mounted | null = null

afterEach(async () => {
  if (open) await unmount(open)
  open = null
})

function field(): FixtureTransport {
  const handle = fixtureTransport({ given: [ground] })
  useTransport(handle)
  return handle
}

/**
 * Raise the menu the way the sidebar does: a process holding the run's identity
 * and the boundary its caller granted, with one `request` chunk on its own call
 * frame.
 *
 * `reaches` stands for what the granted roots cover. In the live system the
 * root is the session and it reaches every process placed on it; the fixture's
 * bare identities are placed on no session, so the cases name the reach
 * directly — the authority rule under test (engine.md: *within the caller's
 * write boundary*) is the same either way.
 */
async function raise(
  handle: FixtureTransport,
  entries: Entry[],
  reaches: ChunkId[] = [],
): Promise<{ menu: ProcessId; shown: Mounted }> {
  const roots = [SESSION, ...reaches]
  const spawned = handle.spawnIdentity(roots, roots)
  const argument = `menu-request-${spawned.process}`
  handle.commitAsHost({
    chunks: [
      { id: argument, name: 'request', body: { head: 'read-tile', anchor: { x: 120, y: 64 }, entries } },
    ],
    placements: [{ chunk: argument, scope: spawned.process, type: 'instance' }],
  })
  handle.actAs(spawned.process)
  open = await mount(<ContextMenu process={spawned.process} />)
  return { menu: spawned.process, shown: open }
}

async function statusOf(process: ProcessId): Promise<unknown> {
  return (await get(process))?.body?.status
}

function activeLabels(mounted: Mounted): string[] {
  return [...mounted.container.querySelectorAll('[data-ui="action"][data-active="true"]')].map(
    (node) => node.textContent ?? '',
  )
}

test('the entries the caller named are the menu, at the anchor it named', async () => {
  const { shown } = await raise(field(), [
    { label: 'Terminate', op: { kind: 'cancel', process: 'p_read' } },
    { label: 'New from this', op: { kind: 'run', program: READ_TILE } },
    { label: 'Inspect', op: { kind: 'none' }, disabled: true },
  ])

  expect(texts(shown, '[data-ui="menu"] [data-ui="action"]')).toEqual([
    'Terminate',
    'New from this',
    'Inspect',
  ])
  const panel = shown.container.querySelector('[data-ui="menu"]') as HTMLElement
  expect(panel.style.left).toBe('120px')
  expect(panel.style.top).toBe('64px')
  // The caption says what the entries are about; the backdrop takes the clicks.
  expect(texts(shown, '[data-ui="menu-head"]')).toEqual(['read-tile'])
  expect(shown.container.querySelector('[data-ui="backdrop"]')).not.toBe(null)
})

test('an entry that cannot act is listed and greyed, never hidden', async () => {
  const { shown } = await raise(field(), [
    { label: 'Terminate', op: { kind: 'cancel', process: 'p_read' } },
    { label: 'Review', op: { kind: 'none' } },
    { label: 'Hide', op: { kind: 'run', program: READ_TILE }, disabled: true },
  ])

  const disabled = [...shown.container.querySelectorAll('[data-ui="action"]')]
    .filter((node) => (node as HTMLButtonElement).disabled)
    .map((node) => node.textContent)
  // An inert op and an explicitly disabled entry are both unpickable — the
  // foolproof path shows every capability, whether or not it can act now.
  expect(disabled).toEqual(['Review', 'Hide'])
})

test('picking a cancel entry terminates the process, then the menu ends itself', async () => {
  const handle = field()
  const target = handle.spawnIdentity([SESSION], [SESSION])
  const { menu, shown } = await raise(
    handle,
    [{ label: 'Terminate', op: { kind: 'cancel', process: target.process } }],
    [target.process],
  )
  expect(await statusOf(target.process)).toBe('pending')

  await click(shown, '[data-ui="action"]')

  expect(await statusOf(target.process)).toBe('failed')
  expect(await statusOf(menu)).toBe('completed')
})

test('picking a run entry launches the program with the argument the caller wrote', async () => {
  const handle = field()
  const { menu, shown } = await raise(handle, [
    {
      label: 'New from this',
      op: {
        kind: 'run',
        program: READ_TILE,
        args: { target: [SESSION] },
        read: [SESSION],
        write: [SESSION],
      },
    },
  ])
  const before = new Set(handle.engine.processes.keys())

  await click(shown, '[data-ui="action"]')

  const spawned = [...handle.engine.processes.keys()].filter((pid) => !before.has(pid))
  expect(spawned.length).toBe(1)
  expect(await statusOf(menu)).toBe('completed')

  // It is a run of that program, and the argument the entry carried was
  // declared with it.
  handle.actAs(null)
  const item = await get(spawned[0]!)
  expect(item?.placements?.some((p) => p.scope_id === READ_TILE && p.type_ === 'instance')).toBe(true)
  // **Recorded gap** (engine/sdk, not this program): the fixture engine places
  // an argument chunk on the new process only when the caller gave it an id,
  // while `engine/src/ops/run.rs` mints one and always places it. So the
  // argument is asserted in the field rather than on the call frame — the
  // frame reading is the one the real engine gives.
  const written = await scope([])
  expect(written.chunks.find((chunk) => chunk.name === 'request')?.body?.target).toEqual([SESSION])
})

test('picking a commit entry writes the declarations in order, then the menu ends itself', async () => {
  const handle = field()
  const { menu, shown } = await raise(
    handle,
    [
      {
        label: 'Open in tile',
        op: {
          kind: 'commit',
          declarations: [
            {
              chunks: [{ id: 'tile-open-1', body: {} }],
              placements: [],
              message: 'open in tile: stage',
            },
            {
              chunks: [],
              placements: [{ chunk: 'tile-open-1', scope: SESSION, type: 'relates' }],
              message: 'open in tile: graft',
            },
          ],
        },
      },
    ],
    ['tile-open-1'],
  )

  await click(shown, '[data-ui="action"]')

  handle.actAs(null)
  const tile = await get('tile-open-1')
  expect(tile).not.toBe(null)
  expect(tile?.placements?.some((p) => p.scope_id === SESSION && p.type_ === 'relates')).toBe(true)
  expect(await statusOf(menu)).toBe('completed')
})

test('a commit outside the granted boundary is refused — and the menu still leaves', async () => {
  const handle = field()
  const { menu, shown } = await raise(handle, [
    {
      label: 'Open in tile',
      op: {
        kind: 'commit',
        declarations: [
          {
            chunks: [{ id: 'tile-open-1', body: {} }],
            // The read-tile program chunk lies outside [SESSION]: placing onto
            // it must refuse under the menu's write boundary.
            placements: [{ chunk: 'tile-open-1', scope: READ_TILE, type: 'instance' }],
          },
        ],
      },
    },
  ])

  await click(shown, '[data-ui="action"]')

  handle.actAs(null)
  expect(await get('tile-open-1')).toBe(null)
  expect(await statusOf(menu)).toBe('completed')
})

test('a greyed entry says why it cannot act, beside its label', async () => {
  const { shown } = await raise(field(), [
    {
      label: 'New from this',
      op: { kind: 'none' },
      disabled: true,
      reason: 'launches into nowhere until a tile can receive it',
    },
    { label: 'Terminate', op: { kind: 'cancel', process: 'p_read' } },
  ])

  expect(texts(shown, '[data-ui="action"]')).toEqual([
    'New from this — launches into nowhere until a tile can receive it',
    'Terminate',
  ])
})

test('the backdrop dismisses without acting', async () => {
  const handle = field()
  const target = handle.spawnIdentity([SESSION], [SESSION])
  const { menu, shown } = await raise(
    handle,
    [{ label: 'Terminate', op: { kind: 'cancel', process: target.process } }],
    [target.process],
  )

  await click(shown, '[data-ui="backdrop"]')

  expect(await statusOf(target.process)).toBe('pending')
  expect(await statusOf(menu)).toBe('completed')
})

test('arrows move and enter picks, skipping what cannot act', async () => {
  const handle = field()
  const target = handle.spawnIdentity([SESSION], [SESSION])
  const { menu, shown } = await raise(
    handle,
    [
      { label: 'Jump to tile', op: { kind: 'none' } },
      { label: 'Terminate', op: { kind: 'cancel', process: target.process } },
    ],
    [target.process],
  )

  // The first row cannot act, so the first arrow lands past it — and wrapping
  // passes it again, back onto the only row that can.
  await press('ArrowDown')
  expect(activeLabels(shown)).toEqual(['Terminate'])
  await press('ArrowDown')
  expect(activeLabels(shown)).toEqual(['Terminate'])

  await press('Enter')
  expect(await statusOf(target.process)).toBe('failed')
  expect(await statusOf(menu)).toBe('completed')
})

test('escape leaves the pane without acting', async () => {
  const handle = field()
  const { menu, shown } = await raise(handle, [
    { label: 'New from this', op: { kind: 'run', program: READ_TILE } },
  ])
  const before = handle.engine.processes.size
  expect(shown.container.querySelector('[data-ui="menu"]')).not.toBe(null)

  await press('Escape')

  expect(handle.engine.processes.size).toBe(before)
  expect(await statusOf(menu)).toBe('completed')
})

test('a run handed no readable request leaves rather than holding the window', async () => {
  const handle = field()
  const spawned = handle.spawnIdentity([SESSION], [SESSION])
  handle.actAs(spawned.process)
  open = await mount(<ContextMenu process={spawned.process} />)

  // Nothing is drawn — an overlay pane spans the window and takes every click,
  // so one with nothing to show must not sit there.
  expect(open.container.querySelector('[data-ui="menu"]')).toBe(null)
  expect(open.container.querySelector('[data-ui="backdrop"]')).toBe(null)
  await settle()
  expect(await statusOf(spawned.process)).toBe('completed')
})
