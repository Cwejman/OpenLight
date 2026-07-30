// The engine conformance cases (engine/fixtures/) driven through the SDK's op
// surface: boundary identity and federation, issued as real protocol requests
// against the fixture transport. Same case format as db/fixtures plus `mounts`
// and `process` (engine/fixtures/README.md).
import { sdk, useTransport } from './harness.ts'
import { describe, expect, test } from 'bun:test'
import { fixtureTransport, type FixtureTransport } from '../src/transports/fixture.ts'
import { checkGet, checkScope, runCases, type Expect } from './expectations.ts'
import type { ChunkDeclaration, Declaration, PlacementSpec, ScopeResult } from '../src/index.ts'

const FIXTURES = new URL('../../fixtures/', import.meta.url)

type Step = {
  chunks?: ChunkDeclaration[]
  placements?: PlacementSpec[]
  remove?: { chunks: string[] }
}

type When = Step & {
  op?: 'scope' | 'get'
  scopes?: string[]
  chunk?: string
  exclude?: string[]
  limit?: number
  offset?: number
  fts?: string
  include?: { body?: boolean }
}

type Case = {
  case: string
  spec: string
  mounts?: Record<string, Step[]>
  given?: Step[]
  process?: { read: string[]; write: string[] }
  when: When
  then: {
    rejected?: boolean
    code?: string
    result?: Expect
    reads?: { scope: string[]; expect: Expect }[]
  }
}

function declarationOf(step: Step, substitute: (id: string) => string): Declaration {
  const chunks: ChunkDeclaration[] = (step.chunks ?? []).map((c) => ({
    ...c,
    id: substitute(c.id!),
  }))
  const removed: ChunkDeclaration[] = (step.remove?.chunks ?? []).map((id) => ({
    id: substitute(id),
    removed: true,
  }))
  const placements: PlacementSpec[] = (step.placements ?? []).map((p) => ({
    ...p,
    chunk: substitute(p.chunk),
    scope: substitute(p.scope),
  }))
  return { chunks: [...chunks, ...removed], placements }
}

/** The acting identity's ids, as the fixtures address them. */
function substituter(acting: { process: string; readBoundary: string; writeBoundary: string } | null) {
  return (id: string): string => {
    if (!acting) return id
    if (id === '$process') return acting.process
    if (id === '$read_boundary') return acting.readBoundary
    if (id === '$write_boundary') return acting.writeBoundary
    return id
  }
}

type Outcome =
  | { kind: 'committed' }
  | { kind: 'scope'; result: ScopeResult }
  | { kind: 'get'; item: Awaited<ReturnType<typeof sdk.get>> }
  | { kind: 'rejected'; error: { code?: string; message: string } }

async function executeWhen(when: When, substitute: (id: string) => string): Promise<Outcome> {
  try {
    if (when.op === 'scope') {
      const result = await sdk.scope((when.scopes ?? []).map(substitute), {
        exclude: when.exclude?.map(substitute),
        limit: when.limit,
        offset: when.offset,
        match_: when.fts,
        include: when.include,
      })
      return { kind: 'scope', result }
    }
    if (when.op === 'get') {
      return { kind: 'get', item: await sdk.get(substitute(when.chunk!)) }
    }
    await sdk.commit(declarationOf(when, substitute))
    return { kind: 'committed' }
  } catch (error) {
    return { kind: 'rejected', error: error as { code?: string; message: string } }
  }
}

async function runCase(item: Case): Promise<void> {
  const mounts = Object.fromEntries(
    Object.entries(item.mounts ?? {}).map(([name, steps]) => [
      name,
      steps.map((step) => declarationOf(step, (id) => id)),
    ]),
  )
  const handle: FixtureTransport = fixtureTransport({ mounts })
  useTransport(handle)

  for (const [i, step] of (item.given ?? []).entries()) {
    try {
      handle.commitAsHost(declarationOf(step, (id) => id))
    } catch (error) {
      throw new Error(`given[${i}] failed: ${(error as Error).message}`)
    }
  }

  const acting = item.process ? handle.spawnIdentity(item.process.read, item.process.write) : null
  const substitute = substituter(acting)
  handle.actAs(acting ? acting.process : null)

  const outcome = await executeWhen(item.when, substitute)
  handle.actAs(null) // post-state reads are host-context, as in the Rust adapter

  if (item.then.rejected) {
    if (outcome.kind !== 'rejected') throw new Error('expected rejection, but the op succeeded')
    if (item.then.code && outcome.error.code !== item.then.code) {
      throw new Error(`expected ${item.then.code}, got ${outcome.error.code} (${outcome.error.message})`)
    }
    return checkAtomic(item, substitute)
  }
  if (outcome.kind === 'rejected') throw new Error(`op rejected: ${outcome.error.message}`)

  if (item.then.result) {
    if (outcome.kind === 'scope') return checkScope(item.then.result, outcome.result)
    if (outcome.kind === 'get') return checkGet(item.then.result, outcome.item)
    throw new Error('expected an op result, got a commit')
  }

  for (const [i, read] of (item.then.reads ?? []).entries()) {
    const result = await sdk.scope(read.scope.map(substitute))
    try {
      checkScope(read.expect, result)
    } catch (error) {
      throw new Error(`reads[${i}]: ${(error as Error).message}`)
    }
  }
}

/** A rejected commit must be atomic: nothing from `when` readable afterward. */
async function checkAtomic(item: Case, substitute: (id: string) => string): Promise<void> {
  if (item.when.op) return // reads have no side effects to verify
  const preexisting = new Set(
    [...(item.given ?? []), ...Object.values(item.mounts ?? {}).flat()].flatMap((step) =>
      (step.chunks ?? []).map((c) => c.id!),
    ),
  )
  for (const chunk of item.when.chunks ?? []) {
    const id = substitute(chunk.id!)
    if (preexisting.has(chunk.id!) || chunk.id!.startsWith('$')) continue
    if (await sdk.get(id)) throw new Error(`chunk ${id} readable after rejection`)
  }
}

const files = ['boundary.json', 'federation.json']

describe('engine/fixtures through the SDK surface', () => {
  for (const file of files) {
    test(file, async () => {
      const cases: Case[] = await Bun.file(new URL(file, FIXTURES)).json()
      expect(cases.length).toBeGreaterThan(0)
      await runCases(file, cases, runCase)
    })
  }
})
