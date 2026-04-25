import { resolve, dirname } from 'path'
import { open, apply, scope } from '../../db/src/index.ts'
import type { Engine } from './types.ts'

/**
 * Initialize the engine. Opens the database, reconciles stuck processes
 * from a previous session (marks pending/running as failed).
 */
export const bootstrap = (dbPath: string): Engine => {
  const db = open(dbPath)
  // Project root: the directory above `.ol/`, where the user's program
  // executables live.
  const projectRoot = dirname(dirname(resolve(dbPath)))
  const engine: Engine = { db, processes: new Map(), projectRoot }

  // Reconcile stale processes: find all process instances with
  // status 'pending' or 'running' and mark them failed.
  const processScope = scope(db, ['process'])
  for (const item of processScope.chunks.items) {
    const body = item.body as Record<string, unknown>
    if (body.status === 'pending' || body.status === 'running') {
      apply(db, {
        chunks: [{ id: item.id, body: { status: 'failed', error: 'engine restart' } }],
      })
    }
  }

  return engine
}
