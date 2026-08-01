// The completion's pure half — the future completion *program*'s body: a
// string in, matching scopes out (complete.ts). The FTS itself is the field's;
// what is tested here is the query it is asked and the offer built from it.
import { describe, expect, test } from 'bun:test'
import { ftsQuery, options } from '../src/complete.ts'
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

describe('the completion offer', () => {
  test('every typed term becomes a token prefix', () => {
    expect(ftsQuery('tim')).toBe('tim*')
    expect(ftsQuery('  first  paint ')).toBe('first* paint*')
    expect(ftsQuery('   ')).toBe('')
  })

  test('the offer is named matches, standing dimensions dropped, capped', () => {
    const found = options(
      result([
        { id: 'timing-first-paint', name: 'first-paint' },
        { id: 'session-main', name: 'main' },
        // An unnamed chunk (a process, an event) is reached by its id, never
        // offered by a name it does not have.
        { id: '01KYX8G0WB' },
        { id: 'nameless', name: '' },
      ]),
      ['session-main'],
    )
    expect(found).toEqual([{ id: 'timing-first-paint', name: 'first-paint' }])

    const many = result(
      Array.from({ length: 12 }, (_, n) => ({ id: `c${n}`, name: `match-${n}` })),
    )
    expect(options(many, []).length).toBe(8)
  })
})
