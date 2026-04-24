import { isAbsolute, resolve } from 'path'
import { scope } from '../../db/src/index.ts'
import { createDispatch } from './dispatch.ts'
import { buildDispatchContext } from './boundary.ts'
import { spawnInvocable } from './process.ts'
import type { Engine, DispatchArgs, DispatchResult } from './types.ts'

/**
 * Create a dispatch and spawn its invocable in one call. Returns
 * immediately with the dispatch ID — the invocable runs asynchronously.
 * Reads the invocable's `body.executable` to locate the binary; uses
 * `body.timeout_ms` as a default unless args.timeout is given.
 *
 * Non-absolute executable paths are resolved relative to `engine.projectRoot`.
 */
export const runDispatch = (
  engine: Engine,
  invocableId: string,
  args: DispatchArgs,
): DispatchResult => {
  const { dispatchId } = createDispatch(engine.db, invocableId, args)

  const inv = scope(engine.db, [invocableId]).scope[0]
  if (!inv) throw new Error(`invocable not found: ${invocableId}`)
  const body = inv.body as Record<string, unknown>
  const executable = body.executable as string | undefined
  if (!executable) throw new Error(`invocable ${invocableId} has no executable`)

  const resolvedExecutable = isAbsolute(executable)
    ? executable
    : engine.projectRoot
      ? resolve(engine.projectRoot, executable)
      : executable

  const timeoutMs = args.timeout ?? (body.timeout_ms as number | undefined)
  const ctx = buildDispatchContext(engine.db, dispatchId, invocableId)
  spawnInvocable(engine, ctx, resolvedExecutable, timeoutMs)

  return { dispatchId }
}
