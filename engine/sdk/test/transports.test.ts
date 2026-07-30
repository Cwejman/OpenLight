// The two built-in transports: framing, and the shape-based demultiplexing both
// share (sdk.md, *Transports*; host.md, *Transport*).
import { describe, expect, test } from 'bun:test'
import { wryTransport, type WryWindow } from '../src/transports/wry.ts'
import { stdioTransport, type StdioStreams } from '../src/transports/stdio.ts'
import type { Event } from '../src/transport.ts'

function fakeWindow(): WryWindow & { posted: string[] } {
  const posted: string[] = []
  return {
    posted,
    __wry_ipc: { postMessage: (message: string) => posted.push(message) },
  } as WryWindow & { posted: string[] }
}

describe('wry transport', () => {
  test('posts JSON through __wry_ipc and resolves through __sdk.resolve', async () => {
    const view = fakeWindow()
    const transport = wryTransport(view)

    const pending = transport.send({ id: 1, op: 'scope', scopes: [] })
    expect(JSON.parse(view.posted[0]!)).toEqual({ id: 1, op: 'scope', scopes: [] })

    // The host injects the *full* response envelope (host.md, Transport).
    view.__sdk!.resolve(1, { id: 1, result: { total: 0 } })
    expect(await pending).toEqual({ id: 1, result: { total: 0 } })
  })

  test('__sdk.event delivers unsolicited events', () => {
    const view = fakeWindow()
    const transport = wryTransport(view)
    const seen: Event[] = []
    transport.onEvent((event) => seen.push(event))

    view.__sdk!.event({ event: 'lagged', subscriptionIds: ['sub_1'] })

    expect(seen).toEqual([{ event: 'lagged', subscriptionIds: ['sub_1'] }])
  })

  test('demultiplexes by message shape, not by which hook was called', async () => {
    const view = fakeWindow()
    const transport = wryTransport(view)
    const seen: Event[] = []
    transport.onEvent((event) => seen.push(event))

    const pending = transport.send({ id: 7, op: 'exit' })
    view.__sdk!.event({ id: 7, result: {} })
    view.__sdk!.resolve(0, { event: 'scope_changed', subscriptionId: 'sub_1', commit: { id: 'c1' } })

    expect(await pending).toEqual({ id: 7, result: {} })
    expect(seen[0]).toMatchObject({ event: 'scope_changed' })
  })
})

function fakeStdio(): StdioStreams & { written: string[]; feed(chunk: string): void; end(): void } {
  const written: string[] = []
  const handlers: Record<string, (chunk: string) => void> = {}
  return {
    written,
    feed: (chunk: string) => handlers.data?.(chunk),
    end: () => handlers.end?.(''),
    stdin: {
      on(event: string, handler: (chunk: string | Uint8Array) => void) {
        handlers[event] = handler as (chunk: string) => void
      },
      setEncoding() {},
      resume() {},
    },
    stdout: { write: (line: string) => written.push(line) },
  } as StdioStreams & { written: string[]; feed(chunk: string): void; end(): void }
}

describe('stdio transport', () => {
  test('writes one JSON line per request', async () => {
    const io = fakeStdio()
    const transport = stdioTransport(io)

    const pending = transport.send({ id: 1, op: 'exit' })
    expect(io.written[0]).toBe('{"id":1,"op":"exit"}\n')

    io.feed('{"id":1,"result":{}}\n')
    expect(await pending).toEqual({ id: 1, result: {} })
  })

  test('reassembles lines split across chunks and routes events', async () => {
    const io = fakeStdio()
    const transport = stdioTransport(io)
    const seen: Event[] = []
    transport.onEvent((event) => seen.push(event))

    const pending = transport.send({ id: 2, op: 'exit' })
    io.feed('{"event":"lagged","subscriptionIds":["sub_1"]}\n{"id":2,')
    io.feed('"result":{"ok":true}}\n')

    expect(await pending).toEqual({ id: 2, result: { ok: true } })
    expect(seen).toEqual([{ event: 'lagged', subscriptionIds: ['sub_1'] }])
  })

  test('stdin closing rejects pending calls as TRANSPORT_CLOSED', async () => {
    const io = fakeStdio()
    const transport = stdioTransport(io)

    const pending = transport.send({ id: 3, op: 'exit' })
    io.end()

    const failure = await pending.catch((e: unknown) => e)
    expect(failure).toMatchObject({ code: 'TRANSPORT_CLOSED' })
  })
})
