// The SDK ↔ engine contract: what the SDK puts on the wire must be exactly what
// `engine/src/protocol.rs` parses, and what the engine answers must decode back.
// Every field name here is read off `handle()` in protocol.rs.
import { sdk, useTransport } from './harness.ts'
import { describe, expect, test } from 'bun:test'
import type { Event, Request, Response, Transport } from '../src/transport.ts'

function recorder(reply: (request: Request) => unknown): { sent: Request[]; transport: Transport } {
  const sent: Request[] = []
  const transport: Transport = {
    async send(request: Request): Promise<Response> {
      sent.push(request)
      return { id: request.id, result: reply(request) }
    },
    onEvent(_handler: (event: Event) => void) {},
  }
  return { sent, transport }
}

const emptyScope = {
  head: 'c1',
  total: 0,
  in_scope: 0,
  in_scope_instance: 0,
  in_scope_relates: 0,
  chunks: [],
  dimensions: [],
}

describe('request encoding', () => {
  test('scope carries scopes and the opts the engine parses', async () => {
    const { sent, transport } = recorder(() => emptyScope)
    useTransport(transport)

    await sdk.scope(['a', 'b'], {
      match_: 'session today',
      exclude: ['hidden'],
      limit: 50,
      offset: 10,
      branch: 'dev',
      at: 'c9',
      include: { body: false },
    })

    expect(sent[0]).toMatchObject({
      op: 'scope',
      scopes: ['a', 'b'],
      opts: {
        match_: 'session today',
        exclude: ['hidden'],
        limit: 50,
        offset: 10,
        branch: 'dev',
        at: 'c9',
        include: { body: false },
      },
    })
    expect(typeof sent[0]!.id).toBe('number')
  })

  test('ids are monotonic across ops', async () => {
    const { sent, transport } = recorder(() => emptyScope)
    useTransport(transport)

    await sdk.scope([])
    await sdk.scope([])

    expect((sent[1]!.id as number) > (sent[0]!.id as number)).toBe(true)
  })

  test('get uses chunkId', async () => {
    const { sent, transport } = recorder(() => null)
    useTransport(transport)

    expect(await sdk.get('chunk_abc')).toBe(null)
    expect(sent[0]).toMatchObject({ op: 'get', chunkId: 'chunk_abc' })
  })

  test('readBatch sends tagged reads under op read_batch', async () => {
    const { sent, transport } = recorder(() => ({ head: 'c1', results: {} }))
    useTransport(transport)

    await sdk.readBatch([
      { tag: 'a', scopes: ['s1'] },
      { tag: 'b', chunkId: 'c2', opts: { include: { body: false } } },
    ])

    expect(sent[0]).toMatchObject({
      op: 'read_batch',
      reads: [
        { tag: 'a', scopes: ['s1'] },
        { tag: 'b', chunkId: 'c2', opts: { include: { body: false } } },
      ],
    })
  })

  test('commit sends the declaration; placements use the wire key `type`', async () => {
    const { sent, transport } = recorder(() => ({ id: 'c2', branch: 'main' }))
    useTransport(transport)

    await sdk.commit({
      chunks: [{ id: 'x', body: { text: 'hi' } }],
      placements: [{ chunk: 'x', scope: 's', type: 'instance', seq: 1 }],
      message: 'note',
    })

    expect(sent[0]).toMatchObject({
      op: 'commit',
      declaration: {
        chunks: [{ id: 'x', body: { text: 'hi' } }],
        placements: [{ chunk: 'x', scope: 's', type: 'instance', seq: 1 }],
        message: 'note',
      },
    })
    expect(sent[0]!.dry_run).toBeUndefined()
  })

  test('dryRun maps to the wire flag dry_run', async () => {
    const { sent, transport } = recorder(() => ({ valid: true, errors: [] }))
    useTransport(transport)

    const result = await sdk.commit({ chunks: [], placements: [] }, { dryRun: true })

    expect(sent[0]).toMatchObject({ op: 'commit', dry_run: true })
    expect(result).toEqual({ valid: true, errors: [] })
  })

  test('run puts the program beside args; mode rides inside args', async () => {
    const { sent, transport } = recorder(() => ({ process: 'p_1' }))
    useTransport(transport)

    const started = await sdk.run('filesystem', {
      chunks: [{ id: 'arg', body: { path: '/tmp' } }],
      mode: 'launch',
      readBoundary: ['r'],
      writeBoundary: ['w'],
      timeout_ms: 5000,
    })

    expect(sent[0]).toMatchObject({
      op: 'run',
      program: 'filesystem',
      args: {
        chunks: [{ id: 'arg', body: { path: '/tmp' } }],
        mode: 'launch',
        readBoundary: ['r'],
        writeBoundary: ['w'],
        timeout_ms: 5000,
      },
    })
    expect(started).toEqual({ process: 'p_1' })
  })

  test('awaitRun sends op await with processes and results_only', async () => {
    const { sent, transport } = recorder(() => ({ p_1: emptyScope }))
    useTransport(transport)

    await sdk.awaitRun(['p_1', 'p_2'], { resultsOnly: true })

    expect(sent[0]).toMatchObject({
      op: 'await',
      processes: ['p_1', 'p_2'],
      opts: { results_only: true },
    })
  })

  test('cancel and exit', async () => {
    const { sent, transport } = recorder(() => ({}))
    useTransport(transport)

    await sdk.cancel('p_1')
    await sdk.exit()

    expect(sent[0]).toMatchObject({ op: 'cancel', process: 'p_1' })
    expect(sent[1]).toMatchObject({ op: 'exit' })
  })

  test('subscribe and unsubscribe', async () => {
    const { sent, transport } = recorder((request) =>
      request.op === 'subscribe' ? { subscriptionId: 'sub_1' } : {},
    )
    useTransport(transport)

    const stop = sdk.subscribe(['my-session'], () => {})
    await Promise.resolve()
    await Promise.resolve()
    stop()
    await Promise.resolve()

    expect(sent[0]).toMatchObject({ op: 'subscribe', scopes: ['my-session'] })
    expect(sent[1]).toMatchObject({ op: 'unsubscribe', subscriptionId: 'sub_1' })
  })
})

describe('response decoding', () => {
  test('a result envelope resolves to the result', async () => {
    useTransport({
      async send(request) {
        return { id: request.id, result: { ...emptyScope, total: 3 } }
      },
      onEvent() {},
    })

    expect((await sdk.scope(['s'])).total).toBe(3)
  })

  test('an error envelope rejects with code and message', async () => {
    useTransport({
      async send(request) {
        return {
          id: request.id,
          error: { code: 'BOUNDARY_VIOLATION', message: 'scope s is not reachable' },
        }
      },
      onEvent() {},
    })

    const failure = await sdk.scope(['s']).catch((e: unknown) => e)
    expect(failure).toMatchObject({
      code: 'BOUNDARY_VIOLATION',
      message: 'scope s is not reachable',
    })
    expect(failure).toBeInstanceOf(Error)
  })
})
