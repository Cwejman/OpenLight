// The shared substrate conformance cases (db/fixtures/) driven through the SDK's
// own op surface over the in-process fixture transport. The fixtures carry
// semantics; this adapter binds them to `commit` / `scope` / `get` — the same
// cases the db crate runs, so the two implementations cannot drift apart.
import { sdk, useTransport } from './harness.ts'
import { describe, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '../src/transports/fixture.ts'
import { checkScope, runCases, type Expect } from './expectations.ts'
import type { ChunkDeclaration, CommitId, Declaration, PlacementSpec } from '../src/index.ts'

const FIXTURES = new URL('../../../db/fixtures/', import.meta.url)

type Step = {
  chunks?: ChunkDeclaration[]
  placements?: PlacementSpec[]
  remove?: { chunks: string[] }
  as?: string
  branch?: string
  fork?: { branch: string; at: string }
}

type Read = {
  scope?: string[]
  fts?: string
  exclude?: string[]
  limit?: number
  offset?: number
  at?: string
  branch?: string
  include?: { body?: boolean }
  expect: Expect
}

type Case = {
  case: string
  spec: string
  given?: Step[]
  when: Step
  then: { rejected?: boolean; reason?: string; reads?: Read[] }
}

function declarationOf(step: Step): Declaration {
  const removed: ChunkDeclaration[] = (step.remove?.chunks ?? []).map((id) => ({ id, removed: true }))
  return { chunks: [...(step.chunks ?? []), ...removed], placements: step.placements ?? [] }
}

async function applyStep(
  handle: FixtureTransport,
  step: Step,
  labels: Map<string, CommitId>,
): Promise<void> {
  if (step.fork) {
    const at = labels.get(step.fork.at)
    if (!at) throw new Error(`unknown commit label ${step.fork.at}`)
    handle.fork(step.fork.branch, at)
    return
  }
  // The protocol carries no branch on `commit` (branch ops are engine.md's open
  // R1), so branch-targeted writes go through the field directly; everything
  // else is a real SDK call.
  const commit = step.branch
    ? handle.commitAsHost(declarationOf(step), step.branch)
    : await sdk.commit(declarationOf(step))
  if (step.as) labels.set(step.as, commit.id)
}

async function checkAtomic(item: Case): Promise<void> {
  const given = new Set((item.given ?? []).flatMap((step) => (step.chunks ?? []).map((c) => c.id)))
  for (const chunk of item.when.chunks ?? []) {
    if (given.has(chunk.id)) continue
    const found = await sdk.get(chunk.id!)
    if (found) throw new Error(`chunk ${chunk.id} readable after rejection`)
  }
  const givenPlacements = new Set(
    (item.given ?? []).flatMap((step) => (step.placements ?? []).map((p) => `${p.chunk}\u0000${p.scope}`)),
  )
  for (const placement of item.when.placements ?? []) {
    if (givenPlacements.has(`${placement.chunk}\u0000${placement.scope}`)) continue
    const found = await sdk.get(placement.chunk)
    if (found?.placements?.some((p) => p.scope_id === placement.scope)) {
      throw new Error(`placement ${placement.chunk} -> ${placement.scope} readable after rejection`)
    }
  }
}

async function runCase(item: Case): Promise<void> {
  const handle = fixtureTransport()
  useTransport(handle)
  const labels = new Map<string, CommitId>()

  for (const [i, step] of (item.given ?? []).entries()) {
    await applyStep(handle, step, labels).catch((e: Error) => {
      throw new Error(`given[${i}] failed: ${e.message}`)
    })
  }

  const outcome = await applyStep(handle, item.when, labels).then(
    () => null,
    (error: Error) => error,
  )

  if (item.then.rejected) {
    if (!outcome) throw new Error('expected rejection, but the commit succeeded')
    return checkAtomic(item)
  }
  if (outcome) throw new Error(`when was rejected: ${outcome.message}`)

  for (const [i, read] of (item.then.reads ?? []).entries()) {
    const at = read.at ? labels.get(read.at) : undefined
    if (read.at && !at) throw new Error(`unknown commit label ${read.at}`)
    const result = await sdk.scope(read.scope ?? [], {
      branch: read.branch,
      at,
      match_: read.fts,
      exclude: read.exclude,
      limit: read.limit,
      offset: read.offset,
      include: read.include,
    })
    try {
      checkScope(read.expect, result)
    } catch (error) {
      throw new Error(`reads[${i}]: ${(error as Error).message}`)
    }
  }
}

const files = ['naming.json', 'ordering.json', 'queries.json', 'validation.json', 'history.json']

describe('db/fixtures through the SDK surface', () => {
  for (const file of files) {
    test(file, async () => {
      const cases: Case[] = await Bun.file(new URL(file, FIXTURES)).json()
      expect(cases.length).toBeGreaterThan(0)
      await runCases(file, cases, runCase)
    })
  }
})
