// The in-process fixture transport: the whole op surface without a host, so
// programs and hooks are testable on fixture semantics alone.
import { sdk, useTransport } from './harness.ts'
import { beforeEach, describe, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '../src/transports/fixture.ts'
import type { SubEvent } from '../src/index.ts'

const echoProgram = {
  chunks: [{ id: 'echo', name: 'echo', body: { runtime: 'vm', executable: 'echo.ts' } }],
  placements: [{ chunk: 'echo', scope: 'engine/program', type: 'instance' as const }],
}

let handle: FixtureTransport

beforeEach(() => {
  handle = fixtureTransport({ given: [echoProgram] })
  useTransport(handle)
})

describe('reads and writes', () => {
  test('a commit lands and reads back', async () => {
    await sdk.commit({
      chunks: [{ id: 's', name: 's' }, { id: 'c', body: { text: 'hello' } }],
      placements: [{ chunk: 'c', scope: 's', type: 'instance' }],
    })

    const result = await sdk.scope(['s'])
    expect(result.chunks.map((c) => c.id)).toEqual(['c'])
    expect(result.chunks[0]!.body).toEqual({ text: 'hello' })
    expect(await sdk.get('c')).toMatchObject({ id: 'c' })
    expect(await sdk.get('nope')).toBe(null)
  })

  test('dryRun validates without writing', async () => {
    await sdk.commit({
      chunks: [{ id: 'tools', name: 'tools', spec: { required: ['program'] } }],
      placements: [],
    })

    const check = await sdk.commit(
      {
        chunks: [{ id: 't1', body: { note: 'no program key' } }],
        placements: [{ chunk: 't1', scope: 'tools', type: 'instance' }],
      },
      { dryRun: true },
    )

    expect(check.valid).toBe(false)
    expect(check.errors[0]!.code).toBe('VALIDATION_ERROR')
    expect(await sdk.get('t1')).toBe(null)
  })

  test('readBatch resolves tagged sub-queries at one snapshot', async () => {
    await sdk.commit({
      chunks: [{ id: 's', name: 's' }, { id: 'c', body: {} }],
      placements: [{ chunk: 'c', scope: 's', type: 'instance' }],
    })

    const batch = await sdk.readBatch([
      { tag: 'members', scopes: ['s'] },
      { tag: 'one', chunkId: 'c' },
      { tag: 'missing', chunkId: 'ghost' },
    ])

    expect(batch.head).toBeTruthy()
    expect((batch.results.members as { chunks: { id: string }[] }).chunks.map((c) => c.id)).toEqual(['c'])
    expect(batch.results.one).toMatchObject({ id: 'c' })
    expect(batch.results.missing).toBe(null)
  })
})

describe('process control', () => {
  test('run spawns a program; awaitRun returns its final scope', async () => {
    handle.register('echo', async ({ process, call }) => {
      await call({
        op: 'commit',
        declaration: {
          chunks: [{ id: 'out', body: { ok: true } }],
          placements: [{ chunk: 'out', scope: process, type: 'instance' }],
        },
      })
    })

    const started = await sdk.run('echo', { chunks: [], readBoundary: [], writeBoundary: [] })
    const results = await sdk.awaitRun([started.process])

    expect(results[started.process]!.chunks.map((c) => c.id)).toContain('out')
  })

  test('run on an unknown program is NOT_FOUND', async () => {
    const failure = await sdk
      .run('ghost', { chunks: [], readBoundary: [], writeBoundary: [] })
      .catch((e: unknown) => e)
    expect(failure).toMatchObject({ code: 'NOT_FOUND' })
  })

  test('cancel terminates a running process', async () => {
    handle.register('echo', () => new Promise(() => {})) // never settles on its own

    const started = await sdk.run('echo', { chunks: [], readBoundary: [], writeBoundary: [] })
    await sdk.cancel(started.process)
    const results = await sdk.awaitRun([started.process])

    const status = results[started.process]!.chunks.find((c) => c.id === started.process)
    expect(await sdk.get(started.process)).toMatchObject({ body: { status: 'failed' } })
    expect(status).toBeUndefined() // the process chunk is the scope, not a member
  })
})

describe('reactivity', () => {
  test('a commit touching a subscribed scope fires changed', async () => {
    await sdk.commit({ chunks: [{ id: 's', name: 's' }], placements: [] })

    const seen: SubEvent[] = []
    sdk.subscribe(['s'], (event) => seen.push(event))
    await new Promise((resolve) => setTimeout(resolve, 0))

    await sdk.commit({
      chunks: [{ id: 'c', body: {} }],
      placements: [{ chunk: 'c', scope: 's', type: 'instance' }],
    })

    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ kind: 'changed' })
  })

  test('unsubscribing stops delivery', async () => {
    await sdk.commit({ chunks: [{ id: 's', name: 's' }], placements: [] })

    const seen: SubEvent[] = []
    const stop = sdk.subscribe(['s'], (event) => seen.push(event))
    await new Promise((resolve) => setTimeout(resolve, 0))
    stop()
    await new Promise((resolve) => setTimeout(resolve, 0))

    await sdk.commit({
      chunks: [{ id: 'c', body: {} }],
      placements: [{ chunk: 'c', scope: 's', type: 'instance' }],
    })

    expect(seen).toEqual([])
  })
})
