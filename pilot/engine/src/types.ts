import type { Db, ChunkDeclaration } from '../../db/src/types.ts'

export type Engine = {
  readonly db: Db
  /** Running processes tracked for cancel/shutdown. */
  readonly processes: Map<string, ProcessHandle>
  /**
   * Absolute path to the project directory (parent of `.ol/`). Program
   * executable paths from the substrate are resolved relative to this.
   * Optional — when omitted, executables must be absolute paths.
   */
  readonly projectRoot?: string
}

export type DispatchArgs = {
  /** Chunks to place on the process, as assembled by the caller. */
  readonly chunks: readonly ChunkDeclaration[]
  /** Scope IDs for the read boundary. */
  readonly readBoundary: readonly string[]
  /** Scope IDs for the write boundary. */
  readonly writeBoundary: readonly string[]
  /** Timeout in ms. Defaults to the program's body.timeout_ms if not provided. */
  readonly timeout?: number
}

export type DispatchResult = {
  /** The created process chunk's ID. */
  readonly dispatchId: string
}

export type DispatchContext = {
  readonly db: Db
  /** The process chunk ID this context is built for. */
  readonly dispatchId: string
  readonly readBoundaryRoots: readonly string[]
  readonly writeBoundaryRoots: readonly string[]
  readonly protectedChunkIds: ReadonlySet<string>
  /** The program chunk ID this process runs. */
  readonly programId: string
}

export type ProcessHandle = {
  readonly dispatchId: string
  readonly process: import('bun').Subprocess
  readonly timeout?: ReturnType<typeof setTimeout>
}

// ── Protocol types ──

export type ProtocolRequest =
  | { readonly id: number; readonly op: 'scope'; readonly scopes: readonly string[] }
  | { readonly id: number; readonly op: 'search'; readonly query: string }
  | { readonly id: number; readonly op: 'apply'; readonly declaration: { readonly chunks: readonly ChunkDeclaration[] } }
  | { readonly id: number; readonly op: 'run'; readonly program: string; readonly args: DispatchArgs }
  | { readonly id: number; readonly op: 'await'; readonly processes: readonly string[] }

export type ProtocolResponse =
  | { readonly id: number; readonly result: unknown }
  | { readonly id: number; readonly error: { readonly code: string; readonly message: string } }

export type ProtocolErrorCode =
  | 'BOUNDARY_VIOLATION'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RUN_FAILED'
  | 'INVALID_REQUEST'
