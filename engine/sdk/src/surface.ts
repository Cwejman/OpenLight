// The substrate surface (sdk.md, *The Substrate Surface*). Each function is one
// protocol op: build the request the engine parses, unwrap the response.
import { nextId, unwrap, type Request } from './protocol.ts'
import { transport } from './transport.ts'
import type {
  BatchResult,
  ChunkId,
  ChunkItem,
  Commit,
  Declaration,
  DryRunResult,
  ProcessId,
  ReadOpts,
  RunArgs,
  ScopeOpts,
  ScopeResult,
  TaggedRead,
} from './types.ts'

/** Issue one op under this program's identity. Also used by `subscriptions.ts`. */
export async function call(op: string, fields: Omit<Request, 'id' | 'op'> = {}): Promise<unknown> {
  return unwrap(await transport.send({ id: nextId(), op, ...fields }))
}

export async function scope(scopes: ChunkId[], opts?: ScopeOpts): Promise<ScopeResult> {
  return (await call('scope', opts ? { scopes, opts } : { scopes })) as ScopeResult
}

export async function get(chunkId: ChunkId, opts?: ReadOpts): Promise<ChunkItem | null> {
  return (await call('get', opts ? { chunkId, opts } : { chunkId })) as ChunkItem | null
}

export async function readBatch(reads: TaggedRead[]): Promise<BatchResult> {
  return (await call('read_batch', { reads })) as BatchResult
}

export function commit(declaration: Declaration): Promise<Commit>
export function commit(declaration: Declaration, opts: { dryRun: true }): Promise<DryRunResult>
export async function commit(
  declaration: Declaration,
  opts?: { dryRun: true },
): Promise<Commit | DryRunResult> {
  const request = opts?.dryRun ? { declaration, dry_run: true } : { declaration }
  return (await call('commit', request)) as Commit | DryRunResult
}

export async function run(programId: ChunkId, args: RunArgs): Promise<{ process: ProcessId }> {
  return (await call('run', { program: programId, args })) as { process: ProcessId }
}

/**
 * Named to dodge `await` (a TypeScript reserved word); the wire op is `await`.
 * Resolves when each named process reaches a terminal state.
 */
export async function awaitRun(
  processIds: ProcessId[],
  opts?: { resultsOnly?: boolean },
): Promise<Record<ProcessId, ScopeResult>> {
  const request = opts?.resultsOnly
    ? { processes: processIds, opts: { results_only: true } }
    : { processes: processIds }
  return (await call('await', request)) as Record<ProcessId, ScopeResult>
}

export async function cancel(processId: ProcessId): Promise<void> {
  await call('cancel', { process: processId })
}

export async function exit(): Promise<void> {
  await call('exit')
}
