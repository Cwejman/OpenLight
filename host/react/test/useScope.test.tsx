// `useScope`'s contract (sdk.md, *React helpers*): subscribe first, then fetch;
// re-fetch on every event; unsubscribe on unmount; a dead subscription returns
// undefined. Driven over the SDK's in-process fixture transport, so the hook is
// exercised against real engine semantics without a host.
import { probe, mount, render, settle, unmount, useScope, useTransport, type Probe } from './harness.ts'
import { beforeEach, describe, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '@openlight/sdk/fixture'

const FIELD = {
  chunks: [
    { id: 'session', name: 'main', body: { text: 'the session' } },
    { id: 'other', name: 'other' },
    { id: 'a', name: 'alpha' },
    { id: 'b', name: 'beta' },
  ],
  placements: [
    { chunk: 'a', scope: 'session', type: 'instance' as const },
    { chunk: 'b', scope: 'other', type: 'instance' as const },
  ],
}

let engine: FixtureTransport
let wire: Probe

beforeEach(() => {
  engine = fixtureTransport({ given: [FIELD] })
  wire = probe(engine)
  useTransport(wire)
})

function Members({ scopes }: { scopes: string[] }) {
  const result = useScope(scopes)
  return <i>{result ? result.chunks.map((c) => c.id).join(',') : 'pending'}</i>
}

const shown = (mounted: { container: HTMLElement }) => mounted.container.textContent

test('subscribes before it fetches — the order is load-bearing', async () => {
  const mounted = await mount(<Members scopes={['session']} />)
  await settle()

  expect(wire.ops.slice(0, 2)).toEqual(['subscribe', 'scope'])
  await unmount(mounted)
})

test('undefined until the first fetch resolves, then the result', async () => {
  wire.hold(0)
  const mounted = await mount(<Members scopes={['session']} />)
  expect(shown(mounted)).toBe('pending')

  await settle(() => wire.release())
  expect(shown(mounted)).toBe('a')
  await unmount(mounted)
})

describe('reactivity', () => {
  test('re-fetches on scope_changed', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    expect(shown(mounted)).toBe('a')

    await settle(() =>
      engine.commitAsHost({
        chunks: [{ id: 'c', name: 'gamma' }],
        placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
      }),
    )

    expect(shown(mounted)).toBe('a,c')
    await unmount(mounted)
  })

  test('re-fetches on lagged — the missed-events recovery', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    const before = wire.ops.filter((op) => op === 'scope').length
    const subscription = [...engine.engine.subscriptions.keys()][0]!

    // A commit whose broadcast the subscriber missed: the field moved, no
    // scope_changed reached this callback.
    engine.engine.subscriptions.clear()
    engine.commitAsHost({
      chunks: [{ id: 'c', name: 'gamma' }],
      placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
    })
    await settle(() => wire.emit({ event: 'lagged', subscriptionIds: [subscription] }))

    expect(wire.ops.filter((op) => op === 'scope').length).toBe(before + 1)
    expect(shown(mounted)).toBe('a,c')
    await unmount(mounted)
  })

  test('an event-driven re-fetch supersedes an in-flight initial fetch', async () => {
    wire.hold(0)
    const mounted = await mount(<Members scopes={['session']} />)

    // The commit lands while the first fetch is still in flight — exactly the
    // window subscribe-before-fetch exists to cover.
    await settle(() =>
      engine.commitAsHost({
        chunks: [{ id: 'c', name: 'gamma' }],
        placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
      }),
    )
    expect(shown(mounted)).toBe('a,c')

    // The stale first fetch resolves last and must not win.
    await settle(() => wire.release())
    expect(shown(mounted)).toBe('a,c')
    await unmount(mounted)
  })

  test('a dead subscription returns undefined and stops re-fetching', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    const subscription = [...engine.engine.subscriptions.keys()][0]!

    await settle(() =>
      wire.emit({ event: 'subscription_invalid', subscriptionId: subscription, reason: 'unreachable' }),
    )
    expect(shown(mounted)).toBe('pending')

    const after = wire.ops.filter((op) => op === 'scope').length
    await settle(() =>
      engine.commitAsHost({
        chunks: [{ id: 'c', name: 'gamma' }],
        placements: [{ chunk: 'c', scope: 'session', type: 'instance' }],
      }),
    )
    expect(wire.ops.filter((op) => op === 'scope').length).toBe(after)
    await unmount(mounted)
  })
})

describe('lifecycle', () => {
  test('unsubscribes on unmount', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    expect(engine.engine.subscriptions.size).toBe(1)

    await unmount(mounted)
    await settle()
    expect(wire.ops).toContain('unsubscribe')
    expect(engine.engine.subscriptions.size).toBe(0)
  })

  test('a changed scope set re-subscribes and re-fetches', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    expect(shown(mounted)).toBe('a')

    await render(mounted, <Members scopes={['other']} />)
    await settle()

    expect(shown(mounted)).toBe('b')
    expect(engine.engine.subscriptions.size).toBe(1)
    await unmount(mounted)
  })

  test('a fresh array of the same ids does not re-subscribe', async () => {
    const mounted = await mount(<Members scopes={['session']} />)
    await settle()
    const subscribes = wire.ops.filter((op) => op === 'subscribe').length

    await render(mounted, <Members scopes={['session']} />)
    await settle()

    expect(wire.ops.filter((op) => op === 'subscribe').length).toBe(subscribes)
    await unmount(mounted)
  })
})
