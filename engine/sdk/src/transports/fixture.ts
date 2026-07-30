// In-process fixture transport: the whole op surface over fixture semantics, so
// programs and hooks are testable without a host. Not a production transport —
// install it by hand (`globalThis.__openlight_transport = fixtureTransport()`)
// before importing the SDK, which is selection order 1 in sdk.md.
import {
  commitOp,
  createEngine,
  createProcess,
  dispatch,
  forkOp,
  type Context,
  type FixtureEngine,
  type FixtureProgram,
  type Spawned,
} from '../fixture/engine.ts'
import { EngineError } from '../types.ts'
import type { Event, Request, Response } from '../protocol.ts'
import type { Transport } from '../transport.ts'
import type { ChunkId, Commit, CommitId, Declaration, ProcessId } from '../types.ts'

export type FixtureOptions = {
  /** Read-only peer mounts, each seeded with declarations before mounting. */
  mounts?: Record<string, Declaration[]>
  /** Declarations applied to the active project under host identity. */
  given?: Declaration[]
  /** Program bodies the fixture runtime spawns on `run`. */
  programs?: Record<ChunkId, FixtureProgram>
}

export type FixtureTransport = Transport & {
  engine: FixtureEngine
  /** Speak as a process rather than as the host — what the host's IPC handler
   *  does when it attaches `Context` to an incoming request. */
  actAs(process: ProcessId | null): void
  /** Create an acting identity with run-level boundaries, without a program body. */
  spawnIdentity(read: ChunkId[], write: ChunkId[]): Spawned
  commitAsHost(declaration: Declaration, branch?: string): Commit
  /** Branch ops have no protocol op yet (engine.md's open R1). */
  fork(branch: string, at: CommitId): void
  register(programId: ChunkId, body: FixtureProgram): void
}

const FIXTURE_PROGRAM = 'fixture/program'

export function fixtureTransport(options: FixtureOptions = {}): FixtureTransport {
  const engine = createEngine(options.mounts ?? {})
  const host: Context = { process: null }
  let identity: Context = { process: null }
  let onEvent: (event: Event) => void = () => {}
  engine.emit = (event) => onEvent(event)

  for (const declaration of options.given ?? []) commitOp(engine, host, declaration)
  for (const [id, body] of Object.entries(options.programs ?? {})) engine.programs.set(id, body)

  return {
    engine,
    async send(request: Request): Promise<Response> {
      try {
        return { id: request.id, result: (await dispatch(engine, identity, request)) ?? null }
      } catch (error) {
        const failure =
          error instanceof EngineError
            ? error
            : new EngineError('INVALID_REQUEST', (error as Error).message)
        return { id: request.id, error: { code: failure.code, message: failure.message } }
      }
    },
    onEvent(handler) {
      onEvent = handler
    },
    actAs(process) {
      identity = { process }
    },
    spawnIdentity(read, write) {
      if (!engine.processes.size) {
        // The identity needs a program to be an instance of, as every process is.
        commitOp(engine, host, {
          chunks: [{ id: FIXTURE_PROGRAM, name: 'fixture-program', body: { runtime: 'fixture' } }],
          placements: [],
        })
      }
      return createProcess(engine, host, FIXTURE_PROGRAM, {
        readBoundary: read,
        writeBoundary: write,
      })
    },
    commitAsHost(declaration, branch) {
      return commitOp(engine, host, declaration, branch)
    },
    fork(branch, at) {
      forkOp(engine, branch, at)
    },
    register(programId, body) {
      engine.programs.set(programId, body)
    },
  }
}
