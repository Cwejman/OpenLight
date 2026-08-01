// The read-tile's pure half: the argument it reads off its own call frame, and
// the view its target's shape asks for (programs.md §3.5).
import { describe, expect, test } from 'bun:test'
import {
  argumentChunk,
  argumentTarget,
  bodyEntries,
  displayName,
  infer,
  leadingText,
  meta,
  retargetDeclaration,
  shortId,
  stamp,
} from '../src/view.ts'
import type { ChunkItem, ScopeResult } from '@openlight/sdk'

function result(chunks: ChunkItem[], extra: Partial<ScopeResult> = {}): ScopeResult {
  return {
    head: 'commit_1',
    total: chunks.length,
    in_scope: chunks.length,
    in_scope_instance: chunks.length,
    in_scope_relates: 0,
    chunks,
    dimensions: [],
    ...extra,
  }
}

const placed = (id: string, scope: string, seq?: number, type: 'instance' | 'relates' = 'instance'): ChunkItem => ({
  id,
  placements: [{ scope_id: scope, type_: type, ...(seq === undefined ? {} : { seq }) }],
})

describe('the argument off the call frame', () => {
  test('an array of scope ids', () => {
    const frame = result([
      { id: 'boundary', body: {} },
      { id: 'arg', name: 'request', body: { target: ['session-main'] } },
    ])
    expect(argumentTarget(frame)).toEqual(['session-main'])
  })

  test('a single id is one root', () => {
    expect(argumentTarget(result([{ id: 'arg', body: { target: 'session-main' } }]))).toEqual([
      'session-main',
    ])
  })

  test('a frame with no argument names no target', () => {
    expect(argumentTarget(result([{ id: 'boundary', body: {} }]))).toEqual([])
  })
})

describe('the inference ladder', () => {
  const root = (spec?: ChunkItem['spec']): ChunkItem[] => [{ id: 's', name: 'scope', ...(spec ? { spec } : {}) }]

  test('unresolved roots win over everything — a dead reference is its own state', () => {
    const view = infer(['s'], root(), result([placed('a', 's')], { unresolved: ['s'] }))
    expect(view).toEqual({ mode: 'unresolved', roots: ['s'] })
  })

  test('an ordered scope reads as a sequence, seq ascending', () => {
    const view = infer(
      ['s'],
      root({ ordered: true }),
      result([placed('c', 's', 3), placed('a', 's', 1), placed('b', 's', 2)]),
    )
    expect(view.mode).toBe('sequence')
    if (view.mode !== 'sequence') return
    expect(view.members.map((m) => m.chunk.id)).toEqual(['a', 'b', 'c'])
  })

  test('members without a seq keep the engine order, behind the ordered ones', () => {
    const view = infer(['s'], root({ ordered: true }), result([placed('x', 's'), placed('y', 's'), placed('a', 's', 1)]))
    if (view.mode !== 'sequence') throw new Error('expected sequence')
    expect(view.members.map((m) => m.chunk.id)).toEqual(['a', 'x', 'y'])
  })

  test('one member reads as a document, with its placement type', () => {
    const view = infer(['s'], root(), result([placed('a', 's', undefined, 'relates')]))
    expect(view).toMatchObject({ mode: 'document', member: { placement: 'relates' } })
  })

  test('an empty scope invites what its spec accepts', () => {
    const view = infer(['s'], root({ accepts: ['tab', 'process'] }), result([]))
    expect(view).toEqual({ mode: 'invitation', accepts: ['tab', 'process'] })
  })

  test('several unordered members read as cards', () => {
    const view = infer(['s'], root(), result([placed('a', 's'), placed('b', 's')]))
    expect(view.mode).toBe('cards')
    if (view.mode !== 'cards') return
    expect(view.members.map((m) => m.placement)).toEqual(['instance', 'instance'])
  })

  test('a member placed on another root of the intersection still carries its placement', () => {
    const view = infer(['s', 't'], root(), result([placed('a', 't'), placed('b', 's')]))
    if (view.mode !== 'cards') throw new Error('expected cards')
    expect(view.members.every((m) => m.placement === 'instance')).toBe(true)
  })
})

describe('display', () => {
  test('name when present, truncated id otherwise', () => {
    expect(displayName({ id: 'x', name: 'main' })).toEqual({ text: 'main', isId: false })
    expect(displayName({ id: '01K9ZQ2M4V8N7B3C5D6E7F8G9H' })).toEqual({
      text: '01K9ZQ2M4V8N…',
      isId: true,
    })
  })

  test('short ids are shown whole', () => {
    expect(shortId('host/tile')).toBe('host/tile')
  })

  test('body.text is prose; a bodiless chunk shows nothing', () => {
    expect(leadingText({ id: 'a', body: { text: 'the  session\n' } })).toBe('the session')
    expect(leadingText({ id: 'a' })).toBe('')
  })

  test('a body without text shows its scalar keys — containers and the promoted ones dropped', () => {
    expect(
      leadingText({ id: 'a', body: { status: 'running', capabilities: [], started: 12, kind: 'run' } }),
    ).toBe('kind run')
  })

  test('engine bookkeeping is not resting content — the failure reason is', () => {
    expect(
      leadingText({
        id: 'a',
        body: { status: 'failed', error: 'engine shutdown', pid: 4711, timeout_ms: 86_400_000 },
      }),
    ).toBe('error engine shutdown')
  })

  test('state and time are read out of the body for slots of their own', () => {
    expect(meta({ id: 'a', body: { status: 'running', started: 1_700_000_000_000 } })).toEqual({
      status: 'running',
      time: stamp(1_700_000_000_000),
    })
    // Nothing to say is said as nothing — never as an empty slot.
    expect(meta({ id: 'a', body: { text: 'prose' } })).toEqual({})
    expect(meta({ id: 'a' })).toEqual({})
  })

  test('a stamp is a clock today and a day otherwise — shape, whatever the zone', () => {
    const now = new Date(2026, 6, 31, 14, 5).getTime()
    expect(stamp(now, now)).toMatch(/^\d\d:\d\d$/)
    // Same day, other hour: still the clock.
    expect(stamp(new Date(2026, 6, 31, 3, 9).getTime(), now)).toMatch(/^\d\d:\d\d$/)
    // Two days back, and last year: the day, never a bare time.
    expect(stamp(new Date(2026, 6, 29, 14, 5).getTime(), now)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
    expect(stamp(new Date(2025, 6, 31, 14, 5).getTime(), now)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
  })

  test('body entries drop the prose key and stringify the rest', () => {
    expect(bodyEntries({ id: 'a', body: { text: 'prose', status: 'running', roots: ['s'] } })).toEqual([
      ['status', 'running'],
      ['roots', '["s"]'],
    ])
  })

  test('long prose is cut', () => {
    expect(leadingText({ id: 'a', body: { text: 'x'.repeat(200) } }, 10)).toBe(`${'x'.repeat(10)}…`)
  })

  test('a retarget carries the request chunk whole and rewrites only its target', () => {
    const request: ChunkItem = {
      id: 'arg',
      name: 'request',
      body: { target: ['session'], depth: 2 },
    }
    const declaration = retargetDeclaration(request, ['timing-first-paint', 'p_1'])
    expect(declaration.chunks).toEqual([
      {
        id: 'arg',
        // A declaration replaces the record wholesale — dropping the name
        // here would silently strip it (the session-patch precedent).
        name: 'request',
        body: { target: ['timing-first-paint', 'p_1'], depth: 2 },
      },
    ])
    expect(declaration.placements).toEqual([])

    // The chunk a retarget rewrites is the one the argument was read from.
    const frame = result([
      { id: 'p', body: { status: 'running' } },
      request,
    ])
    expect(argumentChunk(frame)?.id).toBe('arg')
    expect(argumentChunk(result([{ id: 'p', body: {} }]))).toBeUndefined()
  })
})
