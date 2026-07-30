// Subscription lifecycle and event routing (sdk.md, *Reactivity* and
// *Subscription lifecycle*).
import { sdk, useTransport } from './harness.ts'
import { describe, expect, test } from 'bun:test'
import type { Event, Request, Response, SubEvent, Transport } from '../src/index.ts'

type Harness = {
  sent: Request[]
  emit: (event: Event) => void
  transport: Transport
}

function engineDouble(ids: string[] = ['sub_1', 'sub_2']): Harness {
  const sent: Request[] = []
  let deliver: (event: Event) => void = () => {}
  let issued = 0
  const transport: Transport = {
    async send(request: Request): Promise<Response> {
      sent.push(request)
      if (request.op === 'subscribe') {
        return { id: request.id, result: { subscriptionId: ids[issued++] } }
      }
      return { id: request.id, result: {} }
    },
    onEvent(handler) {
      deliver = handler
    },
  }
  return { sent, emit: (event) => deliver(event), transport }
}

/** Let the subscribe round-trip settle — the thunk is returned synchronously. */
const settled = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('subscribe', () => {
  test('routes scope_changed to the matching callback only', async () => {
    const harness = engineDouble()
    useTransport(harness.transport)

    const first: SubEvent[] = []
    const second: SubEvent[] = []
    sdk.subscribe(['a'], (event) => first.push(event))
    sdk.subscribe(['b'], (event) => second.push(event))
    await settled()

    const commit = { id: 'c2', timestamp: 't', branch: 'main', chunks_modified: [], placements_modified: [] }
    harness.emit({ event: 'scope_changed', subscriptionId: 'sub_2', commit })

    expect(first).toEqual([])
    expect(second).toEqual([{ kind: 'changed', commit }])
  })

  test('lagged fires only on the listed subscriptions', async () => {
    const harness = engineDouble()
    useTransport(harness.transport)

    const first: SubEvent[] = []
    const second: SubEvent[] = []
    sdk.subscribe(['a'], (event) => first.push(event))
    sdk.subscribe(['b'], (event) => second.push(event))
    await settled()

    harness.emit({ event: 'lagged', subscriptionIds: ['sub_1'] })

    expect(first).toEqual([{ kind: 'lagged' }])
    expect(second).toEqual([])
  })

  test('subscription_invalid delivers once and kills the subscription', async () => {
    const harness = engineDouble()
    useTransport(harness.transport)

    const seen: SubEvent[] = []
    const stop = sdk.subscribe(['a'], (event) => seen.push(event))
    await settled()

    harness.emit({ event: 'subscription_invalid', subscriptionId: 'sub_1', reason: 'scope unreachable' })
    harness.emit({ event: 'lagged', subscriptionIds: ['sub_1'] })

    expect(seen).toEqual([{ kind: 'invalid', reason: 'scope unreachable' }])

    // Calling the thunk after an invalidation is a no-op — no unsubscribe op.
    stop()
    await settled()
    expect(harness.sent.filter((r) => r.op === 'unsubscribe')).toEqual([])
  })

  test('the thunk unsubscribes and stops delivery', async () => {
    const harness = engineDouble()
    useTransport(harness.transport)

    const seen: SubEvent[] = []
    const stop = sdk.subscribe(['a'], (event) => seen.push(event))
    await settled()
    stop()
    await settled()

    harness.emit({ event: 'lagged', subscriptionIds: ['sub_1'] })

    expect(seen).toEqual([])
    expect(harness.sent.at(-1)).toMatchObject({ op: 'unsubscribe', subscriptionId: 'sub_1' })
  })

  test('unsubscribing before the id arrives still unsubscribes', async () => {
    const harness = engineDouble()
    useTransport(harness.transport)

    const stop = sdk.subscribe(['a'], () => {})
    stop()
    await settled()

    expect(harness.sent.map((r) => r.op)).toEqual(['subscribe', 'unsubscribe'])
  })

  test('a rejected subscribe surfaces as a dead subscription', async () => {
    useTransport({
      async send(request) {
        return { id: request.id, error: { code: 'BOUNDARY_VIOLATION', message: 'out of reach' } }
      },
      onEvent() {},
    })

    const seen: SubEvent[] = []
    sdk.subscribe(['a'], (event) => seen.push(event))
    await settled()

    expect(seen).toEqual([{ kind: 'invalid', reason: 'out of reach' }])
  })
})
