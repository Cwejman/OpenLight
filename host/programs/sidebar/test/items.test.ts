// The sidebar's pure half: the session it reads off its own call frame, the
// items that session holds, and the menu entries each item's state offers
// (host.md §Sidebar, programs.md §3.2).
import { describe, expect, test } from 'bun:test'
import {
  CONTEXT_MENU,
  analyzeTree,
  closeTile,
  entries,
  hiddenId,
  hideDeclaration,
  items,
  openInTile,
  programNamed,
  sessionArgument,
  shortId,
  stamp,
  tabOf,
  type MenuContext,
  type TreeInfo,
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

// ---- the tile tree the tiling verbs act on ----------------------------------

/** A tile chunk as a scope walk surfaces it. */
function tile(id: string, body: Record<string, unknown>, on: [string, number][], relates?: string): ChunkItem {
  return {
    id,
    body,
    placements: [
      { scope_id: 'host/tile', type_: 'instance' },
      ...on.map(([scope, seq]) => ({ scope_id: scope, type_: 'instance' as const, seq })),
      ...(relates ? [{ scope_id: relates, type_: 'relates' as const }] : []),
      { scope_id: 'engine/mount:/x/agents', type_: 'relates' as const },
    ],
  }
}

describe('the tree, distilled', () => {
  test('the tab is the session member typed on host/tab', () => {
    const members: ChunkItem[] = [
      { id: 'p_1', placements: [{ scope_id: 'engine/process', type_: 'instance' }] },
      { id: 'tab-main', placements: [{ scope_id: 'host/tab', type_: 'instance' }] },
    ]
    expect(tabOf(members)).toBe('tab-main')
    expect(tabOf([])).toBe(null)
  })

  test('a single-leaf tab: the root is the leaf, its process mounted at the tab', () => {
    const tree = analyzeTree('tab-main', [tile('tile-first', {}, [['tab-main', 1]], 'p_read')])
    expect(tree.root).toEqual({ id: 'tile-first', seq: 1 })
    const mount = tree.mounts.get('p_read')!
    expect(mount).toEqual({
      leaf: 'tile-first',
      parent: 'tab-main',
      parentIsTab: true,
      sibling: null,
      grandparent: null,
      parentSeq: 1,
    })
  })

  test('a split tab: each leaf knows its split, sibling and where the split hangs', () => {
    const tree = analyzeTree('tab-main', [
      tile('split-1', { direction: 'horizontal', ratio: 0.5 }, [['tab-main', 1]]),
      tile('leaf-a', {}, [['split-1', 1]], 'p_a'),
      tile('leaf-b', {}, [['split-1', 2]], 'p_b'),
    ])
    expect(tree.root).toEqual({ id: 'split-1', seq: 1 })
    expect(tree.mounts.get('p_b')).toEqual({
      leaf: 'leaf-b',
      parent: 'split-1',
      parentIsTab: false,
      sibling: 'leaf-a',
      grandparent: 'tab-main',
      parentSeq: 1,
    })
  })

  test('a closed tile still relating its process is not a mount — only tree members are', () => {
    const tree = analyzeTree('tab-main', [
      tile('tile-first', {}, [['tab-main', 1]], 'p_read'),
      // In the gathered set by id, but placed on nothing in the tree.
      tile('tile-closed', {}, [], 'p_old'),
    ])
    expect(tree.mounts.has('p_old')).toBe(false)
    expect(tree.mounts.has('p_read')).toBe(true)
  })
})

describe('the tiling declarations', () => {
  const IDS = { split: 'tile-split-x', leaf: 'tile-open-x' }
  const singleLeaf: TreeInfo = analyzeTree('tab-main', [
    tile('tile-first', {}, [['tab-main', 1]], 'p_read'),
  ])

  test('open in tile: stage types the new tiles, graft splits the root', () => {
    const [stage, graft] = openInTile(singleLeaf, 'p_new', IDS)
    // Stage: create and type — nothing touches the tree yet (the engine's
    // write-boundary walk sees pre-commit state; items.ts Op note).
    expect(stage!.chunks.map((chunk) => chunk.id)).toEqual(['tile-split-x', 'tile-open-x'])
    expect(stage!.chunks[0]!.body).toEqual({ direction: 'horizontal', ratio: 0.5 })
    expect(stage!.placements).toEqual([
      { chunk: 'tile-split-x', scope: 'host/tile', type: 'instance' },
      { chunk: 'tile-open-x', scope: 'host/tile', type: 'instance' },
    ])
    // Graft: the split takes the root's place; old root and new leaf beneath
    // it, seq choosing sides; the leaf displays the process.
    expect(graft!.placements).toEqual([
      { chunk: 'tile-split-x', scope: 'tab-main', type: 'instance', seq: 1 },
      { chunk: 'tile-first', scope: 'tab-main', type: 'instance', active: false },
      { chunk: 'tile-first', scope: 'tile-split-x', type: 'instance', seq: 1 },
      { chunk: 'tile-open-x', scope: 'tile-split-x', type: 'instance', seq: 2 },
      { chunk: 'tile-open-x', scope: 'p_new', type: 'relates' },
    ])
  })

  test('open in tile on an empty tab: the new leaf becomes the root, no split', () => {
    const empty: TreeInfo = { tab: 'tab-main', root: null, mounts: new Map() }
    const [stage, graft] = openInTile(empty, 'p_new', IDS)
    expect(stage!.chunks.map((chunk) => chunk.id)).toEqual(['tile-open-x'])
    expect(graft!.placements).toEqual([
      { chunk: 'tile-open-x', scope: 'tab-main', type: 'instance', seq: 1 },
      { chunk: 'tile-open-x', scope: 'p_new', type: 'relates' },
    ])
  })

  test('close tile: the one-child split collapses, the sibling re-seats at its seq', () => {
    const tree = analyzeTree('tab-main', [
      tile('split-1', { direction: 'horizontal', ratio: 0.5 }, [['tab-main', 1]]),
      tile('leaf-a', {}, [['split-1', 1]], 'p_a'),
      tile('leaf-b', {}, [['split-1', 2]], 'p_b'),
    ])
    expect(closeTile(tree.mounts.get('p_b')!)).toEqual({
      chunks: [],
      placements: [
        { chunk: 'leaf-b', scope: 'split-1', type: 'instance', active: false },
        { chunk: 'leaf-a', scope: 'split-1', type: 'instance', active: false },
        { chunk: 'split-1', scope: 'tab-main', type: 'instance', active: false },
        { chunk: 'leaf-a', scope: 'tab-main', type: 'instance', seq: 1 },
      ],
      message: 'close tile',
    })
  })

  test('close tile at the root: the tab empties — a legal state', () => {
    expect(closeTile(singleLeaf.mounts.get('p_read')!)).toEqual({
      chunks: [],
      placements: [
        { chunk: 'tile-first', scope: 'tab-main', type: 'instance', active: false },
      ],
      message: 'close tile',
    })
  })

  test('hide: the session-local marker, and the process placed relates onto it', () => {
    expect(hiddenId('session-main')).toBe('session-main-hidden')
    const declaration = hideDeclaration('session-main', 'p_old')
    expect(declaration.chunks[0]!.id).toBe('session-main-hidden')
    expect(declaration.placements).toEqual([
      { chunk: 'session-main-hidden', scope: 'session-main', type: 'relates' },
      { chunk: 'p_old', scope: 'session-main-hidden', type: 'relates' },
    ])
  })
})

describe('the context menu the strip composes', () => {
  const item = (live: boolean, process = 'p_read') => ({
    process,
    name: process,
    nameIsId: true,
    program: 'read-tile',
    programId: 'host/read-tile',
    status: live ? 'running' : 'completed',
    live,
    failed: false,
  })
  const IDS = { split: 'tile-split-x', leaf: 'tile-open-x' }
  const tree = analyzeTree('tab-main', [tile('tile-first', {}, [['tab-main', 1]], 'p_read')])
  const menu: MenuContext = { session: 'session-main', tree, ids: IDS }
  const listed = (live: boolean, process = 'p_read') => entries(item(live, process), menu)

  test('every item answers with the same menu, tiling verbs beside jump', () => {
    expect(listed(true).map((entry) => entry.label)).toEqual([
      'Jump to tile',
      'Open in tile',
      'Close tile',
      'Inspect',
      'Terminate',
      'Review changes',
      'New from this',
      'Hide',
    ])
  })

  test('terminate cancels this process, and only while it is alive', () => {
    const running = listed(true)[4]!
    expect(running.op).toEqual({ kind: 'cancel', process: 'p_read' })
    expect(running.disabled).toBe(false)
    // Listed on a stopped one too — greyed, never hidden.
    const stopped = listed(false)[4]!
    expect(stopped.op).toEqual({ kind: 'cancel', process: 'p_read' })
    expect(stopped.disabled).toBe(true)
  })

  test('open in tile commits the staged split for a live, unmounted item', () => {
    const open = listed(true, 'p_other')[1]!
    expect(open.disabled).toBeUndefined()
    expect(open.op).toEqual({ kind: 'commit', declarations: openInTile(tree, 'p_other', IDS) })
    // Already displayed by a leaf: multi-mount is an open — greyed, with why.
    const mounted = listed(true, 'p_read')[1]!
    expect(mounted.disabled).toBe(true)
    expect(mounted.reason).toBe('already in a tile')
    // Ended: nothing to mount a viewer on.
    const dead = listed(false, 'p_other')[1]!
    expect(dead.disabled).toBe(true)
    expect(dead.reason).toBe('the run has ended')
  })

  test('close tile commits the collapse for a mounted item, greys otherwise', () => {
    const close = listed(true, 'p_read')[2]!
    expect(close.op).toEqual({
      kind: 'commit',
      declarations: [closeTile(tree.mounts.get('p_read')!)],
    })
    const unmounted = listed(true, 'p_other')[2]!
    expect(unmounted.disabled).toBe(true)
    expect(unmounted.reason).toBe('not in a tile')
  })

  test('hide commits the marker for a terminal item; a live one says why not', () => {
    const rest = listed(false, 'p_old')[7]!
    expect(rest.op).toEqual({
      kind: 'commit',
      declarations: [hideDeclaration('session-main', 'p_old')],
    })
    const live = listed(true)[7]!
    expect(live.disabled).toBe(true)
    expect(live.reason).toBe('a running process is engine-pinned')
  })

  test('new from this stays greyed with the reason visible — a launch lands nowhere', () => {
    const entry = listed(false)[6]!
    expect(entry.op).toEqual({ kind: 'none' })
    expect(entry.disabled).toBe(true)
    expect(entry.reason).toBe('launches into nowhere until a tile can receive it')
  })

  test('with no tree to read, every tiling verb greys rather than guessing', () => {
    const blind = entries(item(true), { session: 'session-main', tree: null, ids: IDS })
    expect(blind[1]!.disabled).toBe(true)
    expect(blind[1]!.reason).toBe('no tree to split')
    expect(blind[2]!.disabled).toBe(true)
    // Jump waits on a focus concept — said, not just greyed.
    expect(blind[0]!.reason).toBe('no focus concept yet')
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
