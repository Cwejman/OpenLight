// The fixtures' assertion vocabulary (db/fixtures/README.md, engine/fixtures/README.md),
// bound once for both adapters.
import type { ChunkItem, ScopeResult } from '../src/index.ts'

export type Expect = {
  contains?: string[]
  excludes?: string[]
  ids?: string[]
  ordered_ids?: string[]
  counts?: { total?: number; in_scope?: number }
  has_body?: boolean
  unresolved?: string[]
  null?: boolean
  id?: string
}

export function checkScope(expect: Expect, result: ScopeResult): void {
  const got = result.chunks.map((c) => c.id)
  for (const id of expect.contains ?? []) {
    if (!got.includes(id)) throw new Error(`missing ${id}; got [${got}]`)
  }
  for (const id of expect.excludes ?? []) {
    if (got.includes(id)) throw new Error(`must not contain ${id}; got [${got}]`)
  }
  if (expect.ids) {
    const want = [...expect.ids].sort().join(',')
    const have = [...got].sort().join(',')
    if (want !== have) throw new Error(`expected exactly [${want}]; got [${have}]`)
  }
  if (expect.ordered_ids && got.join(',') !== expect.ordered_ids.join(',')) {
    throw new Error(`expected sequence [${expect.ordered_ids}]; got [${got}]`)
  }
  // `counts.total` is the fixtures' name for the full-set count of the query —
  // ScopeResult.in_scope (ScopeResult.total counts the whole branch).
  const total = expect.counts?.total ?? expect.counts?.in_scope
  if (total !== undefined && result.in_scope !== total) {
    throw new Error(`expected full-set count ${total}; got in_scope ${result.in_scope}`)
  }
  if (expect.unresolved) {
    const want = [...expect.unresolved].sort().join(',')
    const have = [...(result.unresolved ?? [])].sort().join(',')
    if (want !== have) throw new Error(`expected unresolved [${want}]; got [${have}]`)
  }
  if (expect.has_body === false) {
    const carrier = result.chunks.find((c) => c.body !== undefined)
    if (carrier) throw new Error(`survey read carried a body on ${carrier.id}`)
  }
}

export function checkGet(expect: Expect, item: ChunkItem | null): void {
  if (expect.null === true) {
    if (item !== null) throw new Error(`expected null, got ${item.id}`)
    return
  }
  if (item === null) throw new Error('expected a chunk, got null')
  if (expect.id !== undefined && item.id !== expect.id) {
    throw new Error(`expected ${expect.id}, got ${item.id}`)
  }
}

/** Run every case in a file, reporting all failures together. */
export async function runCases<C extends { case: string }>(
  file: string,
  cases: C[],
  run: (c: C) => Promise<void>,
): Promise<void> {
  const failures: string[] = []
  for (const item of cases) {
    try {
      await run(item)
    } catch (error) {
      failures.push(`  ${item.case} — ${(error as Error).message}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(`${failures.length}/${cases.length} cases failed in ${file}:\n${failures.join('\n')}`)
  }
}
