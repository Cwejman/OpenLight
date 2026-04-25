import { isAbsolute, resolve } from 'path'
import { scope } from '../../db/src/index.ts'
import { createDispatch } from './dispatch.ts'
import { buildDispatchContext } from './boundary.ts'
import { spawnInvocable } from './process.ts'
import type { Engine, DispatchArgs, DispatchResult } from './types.ts'

/**
 * Run a program in one call: create the process chunk and spawn the
 * executable. Returns immediately with the process ID; the program
 * runs asynchronously. Resolves `body.executable` against project root.
 * `body.timeout_ms` as a default unless args.timeout is given.
 *
 * Non-absolute executable paths are resolved relative to `engine.projectRoot`.
 */
export const runDispatch = (
  engine: Engine,
  programId: string,
  args: DispatchArgs,
): DispatchResult => {
  const { dispatchId } = createDispatch(engine.db, programId, args)

  const inv = scope(engine.db, [programId]).scope[0]
  if (!inv) throw new Error(`program not found: ${programId}`)
  const body = inv.body as Record<string, unknown>
  const executable = body.executable as string | undefined
  if (!executable) throw new Error(`program ${programId} has no executable`)

  const resolvedExecutable = isAbsolute(executable)
    ? executable
    : engine.projectRoot
      ? resolve(engine.projectRoot, executable)
      : executable

  const timeoutMs = args.timeout ?? (body.timeout_ms as number | undefined)
  const ctx = buildDispatchContext(engine.db, dispatchId, programId)
  spawnInvocable(engine, ctx, resolvedExecutable, timeoutMs)

  return { dispatchId }
}
