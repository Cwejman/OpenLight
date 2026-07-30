// TS mirror of the substrate library types (sdk.md, *Types*). The Rust source is
// authoritative — `db/src/types.rs` for the substrate shapes, `engine/src/protocol.rs`
// for how they cross the wire. Where the two spellings differ, the wire wins:
// a placement is declared with `type` and read back with `type_`.

export type ChunkId = string
export type CommitId = string
export type ProcessId = ChunkId
export type PlacementType = 'instance' | 'relates'

export type Spec = {
  ordered?: boolean
  accepts?: string[]
  required?: string[]
  unique?: string[]
  propagate?: boolean
}

export type Placement = {
  scope_id: ChunkId
  type_: PlacementType
  seq?: number
}

export type ChunkItem = {
  id: ChunkId
  name?: string
  spec?: Spec
  body?: Record<string, unknown>
  placements?: Placement[]
}

export type ChunkDeclaration = {
  id?: ChunkId
  name?: string
  spec?: Spec
  body?: Record<string, unknown>
  removed?: boolean
}

export type PlacementSpec = {
  chunk: ChunkId
  scope: ChunkId
  type: PlacementType
  seq?: number
  active?: boolean // false deactivates an existing placement; defaults true
}

export type Declaration = {
  chunks: ChunkDeclaration[]
  placements: PlacementSpec[]
  message?: string
}

/** The protocol's projection of db's `Includes`: only `body` crosses the wire. */
export type Includes = {
  body?: boolean
}

export type ScopeOpts = {
  branch?: string
  at?: CommitId
  match_?: string
  exclude?: ChunkId[] // negation — set difference, either placement type;
  //                     roots boundary-checked
  limit?: number // a single ordered scope reads tail-first: latest
  offset?: number // entries by default, offset pages backward, the
  //                window itself ascending by seq (db.md)
  include?: Includes // { body: false } = survey read, no bodies
}

export type ReadOpts = {
  branch?: string
  at?: CommitId
  include?: Includes
}

export type Edge = {
  id: ChunkId
  name?: string
  count: number
  instance: number
  relates: number
}

export type Dim = {
  id: ChunkId
  name?: string
  count: number
  instance: number
  relates: number
  edges?: Edge[]
}

export type ScopeResult = {
  head: CommitId
  /**
   * Roots that resolve to no chunk — a dead reference is metadata, not an error
   * (db/fixtures/queries.json, `scope/unresolved-*`). Optional here because the
   * engine's `scope_result_json` does not carry it yet: the ruling landed on the
   * board with the db pass, ahead of the wire.
   */
  unresolved?: ChunkId[]
  total: number
  in_scope: number
  in_scope_instance: number
  in_scope_relates: number
  chunks: ChunkItem[]
  dimensions: Dim[]
}

export type Commit = {
  id: CommitId
  parent_id?: CommitId
  timestamp: string
  message?: string
  process_id?: ProcessId // which run caused this commit; absent for host-initiated commits
  branch: string // which branch it landed on — the event's only carrier
  chunks_modified: ChunkId[]
  placements_modified: [ChunkId, ChunkId][]
}

export type RunArgs = {
  chunks: ChunkDeclaration[]
  mode?: 'child' | 'launch' // child (default): nested, cascades with caller;
  //                           launch: detached, session-placed, survives caller
  readBoundary: ChunkId[] // scope roots — the SDK builds a fresh boundary chunk per run
  writeBoundary: ChunkId[] // same — programs always supply roots
  timeout_ms?: number
}

export type TaggedRead =
  | { tag: string; scopes: ChunkId[]; opts?: ScopeOpts }
  | { tag: string; chunkId: ChunkId; opts?: ReadOpts }

export type BatchResult = {
  head: CommitId // the one snapshot every sub-query resolved at
  results: Record<string, ScopeResult | ChunkItem | null | EngineError>
}

export type DryRunResult = {
  valid: boolean
  errors: EngineError[]
}

export type EngineErrorCode =
  | 'BOUNDARY_VIOLATION'
  | 'READ_ONLY_MOUNT'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RUN_FAILED'
  | 'INVALID_REQUEST'
  | 'TRANSPORT_CLOSED'

/**
 * Errors arrive as rejected promises (sdk.md, *Reads*). An `Error` subclass
 * rather than a bare `{ code, message }` object: same fields, plus the stack a
 * program author needs to find the call that failed.
 */
export class EngineError extends Error {
  readonly code: EngineErrorCode

  constructor(code: EngineErrorCode, message: string) {
    super(message)
    this.name = 'EngineError'
    this.code = code
  }
}

export type SubEvent =
  | { kind: 'changed'; commit: Commit }
  | { kind: 'lagged' }
  | { kind: 'invalid'; reason: string }
