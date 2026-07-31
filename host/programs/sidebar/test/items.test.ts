// The sidebar's pure half: the session it reads off its own call frame, the
// items that session holds, and the menu entries each item's state offers
// (host.md §Sidebar, programs.md §3.2).
import { describe, expect, test } from 'bun:test'
import {
  CONTEXT_MENU,
  entries,
  items,
  programNamed,
  sessionArgument,
  shortId,
  stamp,
} from '../src/items.ts'
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
})

describe('the order: life before rest, then recency', () => {
  test('the living rise above the stopped, however the field returns them', () => {
    const list = listed([
      process('p_dead_1', 'host/read-tile', { status: 'failed', started: 30 }),
      process('p_live', 'host/read-tile', { status: 'running', started: 10 }),
      process('p_dead_2', 'host/read-tile', { status: 'completed', started: 40 }),
      process('p_pending', 'host/read-tile', { status: 'pending', started: 20 }),
    ])
    expect(list.map((item) => item.process)).toEqual([
      'p_pending',
      'p_live',
      'p_dead_2',
      'p_dead_1',
    ])
  })

  test('within a group, newest first', () => {
    const list = listed([
      process('p_old', 'host/read-tile', { status: 'failed', started: 1 }),
      process('p_new', 'host/read-tile', { status: 'failed', started: 3 }),
      process('p_mid', 'host/read-tile', { status: 'failed', started: 2 }),
    ])
    expect(list.map((item) => item.process)).toEqual(['p_new', 'p_mid', 'p_old'])
    expect(list[0]!.started).toBe(3)
  })

  test('a process with no start keeps the order it arrived in, under the dated ones', () => {
    const list = listed([
      process('p_undated_1', 'host/read-tile', { status: 'failed' }),
      process('p_dated', 'host/read-tile', { status: 'failed', started: 5 }),
      process('p_undated_2', 'host/read-tile', { status: 'failed' }),
    ])
    expect(list.map((item) => item.process)).toEqual(['p_dated', 'p_undated_1', 'p_undated_2'])
    expect(list[1]!.started).toBeUndefined()
  })

  test('a long-stale session still opens on its two running processes', () => {
    const stale = Array.from({ length: 17 }, (_, index) =>
      process(`p_stale_${index}`, 'host/read-tile', { status: 'failed', started: 100 + index }),
    )
    const list = listed([
      ...stale,
      process('p_sidebar', 'host/sidebar', { status: 'running', started: 900 }),
      process('p_read', 'host/read-tile', { status: 'running', started: 901 }),
    ])
    expect(list.slice(0, 2).map((item) => item.process)).toEqual(['p_read', 'p_sidebar'])
    expect(list.slice(2).every((item) => !item.live)).toBe(true)
  })

  test('the program is the instance placement the program scope also holds', () => {
    const list = listed([
      process('p_1', 'host/read-tile', { status: 'running' }),
      process('p_2', 'host/sidebar', { status: 'running' }),
    ])
    expect(list.map((item) => item.program)).toEqual(['read-tile', 'sidebar'])
    // And the id beside the name — what *new from this* runs.
    expect(list.map((item) => item.programId)).toEqual(['host/read-tile', 'host/sidebar'])
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

describe('the context menu the strip composes', () => {
  const item = (live: boolean, programId?: string) => ({
    process: 'p_read',
    name: 'p_read',
    nameIsId: true,
    program: 'read-tile',
    ...(programId === undefined ? {} : { programId }),
    status: live ? 'running' : 'completed',
    live,
    failed: false,
  })
  const listed = (live: boolean, programId = 'host/read-tile') => entries(item(live, programId))

  test('every item answers with the same menu, in the spec order', () => {
    expect(listed(true).map((entry) => entry.label)).toEqual([
      'Jump to tile',
      'Inspect',
      'Terminate',
      'Review changes',
      'New from this',
      'Hide',
    ])
  })

  test('terminate cancels this process, and only while it is alive', () => {
    const running = listed(true)[2]!
    expect(running.op).toEqual({ kind: 'cancel', process: 'p_read' })
    expect(running.disabled).toBe(false)
    // Listed on a stopped one too — greyed, never hidden.
    const stopped = listed(false)[2]!
    expect(stopped.op).toEqual({ kind: 'cancel', process: 'p_read' })
    expect(stopped.disabled).toBe(true)
  })

  test('new from this runs the same program again', () => {
    expect(listed(false)[4]!.op).toEqual({ kind: 'run', program: 'host/read-tile' })
    expect(listed(false)[4]!.disabled).toBe(false)
    // With no program to name, it is inert rather than a run of nothing.
    const unknown = entries(item(true))[4]!
    expect(unknown.op).toEqual({ kind: 'none' })
    expect(unknown.disabled).toBe(true)
  })

  test('what has no machinery yet is listed, inert and greyed — never hidden', () => {
    const inert = listed(true).filter((entry) => entry.op.kind === 'none')
    expect(inert.map((entry) => entry.label)).toEqual([
      'Jump to tile',
      'Inspect',
      'Review changes',
      'Hide',
    ])
    expect(inert.every((entry) => entry.disabled)).toBe(true)
  })
})

test('the menu program is found by name, not by a hard-coded id', () => {
  const programs = [
    { id: 'host/read-tile', name: 'read-tile' },
    { id: 'host/context-menu', name: CONTEXT_MENU },
  ]
  expect(programNamed(programs, CONTEXT_MENU)).toBe('host/context-menu')
  expect(programNamed([], CONTEXT_MENU)).toBe(null)
})

test('short ids are shown whole', () => {
  expect(shortId('p_1')).toBe('p_1')
})

test('when a run began: a clock today, the day itself otherwise', () => {
  const now = new Date(2026, 6, 31, 14, 5).getTime()
  expect(stamp(now, now)).toMatch(/^\d\d:\d\d$/)
  expect(stamp(new Date(2026, 6, 31, 0, 1).getTime(), now)).toMatch(/^\d\d:\d\d$/)
  expect(stamp(new Date(2026, 6, 29, 14, 5).getTime(), now)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
  expect(stamp(new Date(2025, 11, 31, 23, 59).getTime(), now)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
})
