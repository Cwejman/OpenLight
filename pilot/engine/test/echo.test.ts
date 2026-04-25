import { describe, test, expect } from 'bun:test'
import { resolve } from 'path'
import { scope } from '../../db/src/index.ts'
import { seedTestDb } from './helpers.ts'
import { runDispatch } from '../src/run.ts'
import { apply } from '../../db/src/index.ts'
import type { Engine } from '../src/types.ts'

/**
 * Re-point echo's executable to the real file in pilot/project/programs.
 * The seeded helper uses relative paths that assume a different cwd — this
 * overrides to an absolute path so the test runs from any cwd.
 */
const withRealEchoExecutable = (): Engine => {
  const db = seedTestDb()
  const echoPath = resolve(import.meta.dir, '..', '..', 'project', 'programs', 'echo.ts')
  apply(db, {
    chunks: [
      {
        id: 'echo',
        body: {
          text: 'Echoes the input message back as an answer',
          executable: echoPath,
          boundary: 'process',
          timeout_ms: 30000,
        },
      },
    ],
  })
  return { db, processes: new Map() }
}

describe('echo program end-to-end', () => {
  test('dispatch with a message produces an echoed output chunk', async () => {
    const engine = withRealEchoExecutable()

    const { dispatchId } = runDispatch(engine, 'echo', {
      chunks: [
        {
          body: { text: 'hello world' },
          placements: [{ scope_id: 'message', type: 'instance' }],
        },
      ],
      readBoundary: ['agent'],
      writeBoundary: ['agent'],
    })

    const handle = engine.processes.get(dispatchId)!
    await handle.process.exited
    // Let the last status update apply.
    await new Promise((r) => setTimeout(r, 50))

    const result = scope(engine.db, [dispatchId])
    const status = (result.scope[0]!.body as Record<string, unknown>).status
    expect(status).toBe('completed')

    // Find the echo output: a chunk related to the dispatch that is NOT a
    // boundary container (those are also `relates` on dispatch).
    const isBoundaryContainer = (c: { placements: Array<{ scope_id: string; type: string }> }) =>
      c.placements.some(
        (p) =>
          (p.scope_id === 'read-boundary' || p.scope_id === 'write-boundary') &&
          p.type === 'instance',
      )
    const output = result.chunks.items.find(
      (c) =>
        !isBoundaryContainer(c) &&
        c.placements.some((p) => p.scope_id === dispatchId && p.type === 'relates'),
    )
    expect(output).toBeDefined()
    expect((output!.body as Record<string, unknown>).text).toBe('echo: hello world')
  })
})
