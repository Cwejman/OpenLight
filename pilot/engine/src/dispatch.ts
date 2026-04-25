import { apply, scope } from '../../db/src/index.ts'
import { generateId } from '../../db/src/id.ts'
import type { Db, ChunkDeclaration } from '../../db/src/types.ts'
import type { DispatchArgs, DispatchResult } from './types.ts'

/**
 * Look up a program chunk by ID. Verifies it exists and is an instance
 * of the `program` archetype.
 */
const resolveProgram = (db: Db, programId: string): void => {
  const result = scope(db, [programId])
  if (result.scope.length === 0) {
    throw new Error(`Program not found: ${programId}`)
  }
  const chunk = result.scope[0]!
  const isProgram = chunk.placements.some(
    (p) => p.scope_id === 'program' && p.type === 'instance',
  )
  if (!isProgram) {
    throw new Error(`Chunk ${programId} is not a program`)
  }
}

/**
 * Build the Declaration that creates a process from a program. Produces:
 * 1. The process chunk (instance of the program + the `process` archetype)
 * 2. Read-boundary chunk with scope references
 * 3. Write-boundary chunk with scope references
 * 4. Argument chunks with added process-instance placement
 */
const buildDispatchDeclaration = (
  programId: string,
  args: DispatchArgs,
): { dispatchId: string; declaration: { chunks: ChunkDeclaration[] } } => {
  const dispatchId = generateId()
  const rbId = generateId()
  const wbId = generateId()

  const chunks: ChunkDeclaration[] = [
    // 1. The process chunk — instance of the program AND the `process` archetype
    {
      id: dispatchId,
      body: { status: 'pending' },
      placements: [
        { scope_id: programId, type: 'instance' },
        { scope_id: 'process', type: 'instance' },
      ],
    },

    // 2. Read-boundary chunk. Instance of the `read-boundary` archetype
    //    (type membership), related to the process (execution configuration,
    //    not structural content), related to each scope it governs.
    {
      id: rbId,
      placements: [
        { scope_id: 'read-boundary', type: 'instance' },
        { scope_id: dispatchId, type: 'relates' },
      ],
    },
    ...args.readBoundary.map((scopeRef) => ({
      id: scopeRef,
      placements: [{ scope_id: rbId, type: 'relates' as const }],
    })),

    // 3. Write-boundary chunk — same shape.
    {
      id: wbId,
      placements: [
        { scope_id: 'write-boundary', type: 'instance' },
        { scope_id: dispatchId, type: 'relates' },
      ],
    },
    ...args.writeBoundary.map((scopeRef) => ({
      id: scopeRef,
      placements: [{ scope_id: wbId, type: 'relates' as const }],
    })),

    // 4. Argument chunks — engine adds an instance placement on the process
    //    so the substrate's accepts check sees them.
    ...args.chunks.map((chunk) => ({
      ...chunk,
      placements: [
        ...(chunk.placements ?? []),
        { scope_id: dispatchId, type: 'instance' as const },
      ],
    })),
  ]

  return { dispatchId, declaration: { chunks } }
}

/**
 * Dispatch a program: create its process chunk and run-time boundaries
 * in one atomic apply().
 */
export const createDispatch = (
  db: Db,
  programId: string,
  args: DispatchArgs,
): DispatchResult => {
  resolveProgram(db, programId)

  const { dispatchId, declaration } = buildDispatchDeclaration(programId, args)

  apply(db, declaration, { dispatch: dispatchId })

  return { dispatchId }
}
