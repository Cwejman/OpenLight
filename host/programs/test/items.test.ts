// The sidebar's pure half: the session it reads off its own call frame, the
// items that session holds, and the actions each item's state offers
// (host.md §Sidebar, programs.md §3.2).
import { describe, expect, test } from 'bun:test'
import { actions, items, sessionArgument, shortId } from '../src/sidebar/items.ts'
import type { ChunkItem, ScopeResult } from '@openlight/sdk'

function result(chunks: ChunkItem[]): ScopeResult {
  return {
    head: 'commit_1',
    total: chunks.length,
    in_scope: chunks.length,
    in_scope_instance: chunks.length,
    in_scope_relates: 0,
    chunks,
    dimensions: [],
  }
}

/** A process as the engine writes it: instance on the archetype, its program, the session. */
function process(id: string, program: string, body: Record<string, unknown>): ChunkItem {
  return {
    id,
    body,
    placements: [
      { scope_id: 'engine/process', type_: 'instance' },
      { scope_id: program, type_: 'instance' },
      { scope_id: 'session-main', type_: 'instance' },
    ],
  }
}

const PROGRAMS: ChunkItem[] = [
  { id: 'host/read-tile', name: 'read-tile' },
  { id: 'host/sidebar', name: 'sidebar' },
]

const listed = (chunks: ChunkItem[]) => items(result(chunks), PROGRAMS, 'session-main')

describe('the argument off the call frame', () => {
  test('the session this run renders', () => {
    const frame = result([{ id: 'boundary', body: {} }, { id: 'arg', name: 'request', body: { session: 'session-main' } }])
    expect(sessionArgument(frame)).toBe('session-main')
  })

  test('a frame with no argument names no session', () => {
    expect(sessionArgument(result([{ id: 'boundary', body: {} }]))).toBe(null)
  })
})

describe('the session as items', () => {
  test('only processes — session membership is not sidebar presence on its own', () => {
    const list = listed([
      process('p_1', 'host/read-tile', { status: 'running' }),
      { id: 'tab-1', name: 'work', placements: [{ scope_id: 'session-main', type_: 'instance' }] },
    ])
    expect(list.map((item) => item.process)).toEqual(['p_1'])
  })

  test('life rises, rest falls: running and pending live, completed and failed do not', () => {
    const list = listed([
      process('p_1', 'host/read-tile', { status: 'running' }),
      process('p_2', 'host/read-tile', { status: 'pending' }),
      process('p_3', 'host/read-tile', { status: 'completed' }),
      process('p_4', 'host/read-tile', { status: 'failed', error: 'timeout' }),
    ])
    expect(list.map((item) => item.live)).toEqual([true, true, false, false])
    expect(list.map((item) => item.failed)).toEqual([false, false, false, true])
    expect(list[3]!.error).toBe('timeout')
  })

  test('the program is the instance placement the program scope also holds', () => {
    const list = listed([
      process('p_1', 'host/read-tile', { status: 'running' }),
      process('p_2', 'host/sidebar', { status: 'running' }),
    ])
    expect(list.map((item) => item.program)).toEqual(['read-tile', 'sidebar'])
  })

  test('an unread program falls back to its truncated id, never a blank', () => {
    const list = items(
      result([process('p_1', 'host/some-other-program', { status: 'running' })]),
      [],
      'session-main',
    )
    expect(list[0]!.program).toBe('host/some-othe…')
  })

  test('a process carries its own identity: name when it has one, truncated id otherwise', () => {
    const named: ChunkItem = { ...process('p_1', 'host/read-tile', {}), name: 'nightly' }
    const list = listed([named, process('01K9ZQ2M4V8N7B3C5D6E7F8G9H', 'host/read-tile', {})])
    expect(list.map((item) => [item.name, item.nameIsId])).toEqual([
      ['nightly', false],
      ['01K9ZQ2M4V8N7B…', true],
    ])
  })

  test('a bodiless process is not a lie — its status reads unknown, and it stays live', () => {
    const list = listed([process('p_1', 'host/read-tile', {})])
    expect(list[0]!.status).toBe('unknown')
    expect(list[0]!.live).toBe(true)
  })
})

describe('the context menu', () => {
  const labels = (live: boolean) =>
    actions({ process: 'p', name: 'p', nameIsId: true, program: 'x', status: 's', live, failed: false })

  test('every item answers with the same menu, in the spec order', () => {
    expect(labels(true).map((action) => action.label)).toEqual([
      'Jump to tile',
      'Inspect',
      'Terminate',
      'Review changes',
      'New from this',
      'Hide',
    ])
  })

  test('state gates what fits: terminate a running one, review a stopped one', () => {
    const running = new Map(labels(true).map((action) => [action.id, action.enabled]))
    const stopped = new Map(labels(false).map((action) => [action.id, action.enabled]))
    expect([running.get('terminate'), running.get('review')]).toEqual([true, false])
    expect([stopped.get('terminate'), stopped.get('review')]).toEqual([false, true])
  })
})

test('short ids are shown whole', () => {
  expect(shortId('p_1')).toBe('p_1')
})
