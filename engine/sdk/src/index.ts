/// <reference path="./globals.d.ts" />
// @openlight/sdk — the surface programs import to reach the substrate (sdk.md).
// The reference above is the one home for the ambient window/global names: it
// rides the package's types, so importers inherit them without re-declaring.
// Functions only: no DOM, no rendering. Importing this module selects the
// transport for the runtime it finds itself in.
export { awaitRun, cancel, commit, exit, get, readBatch, run, scope } from './surface.ts'
export { subscribe } from './subscriptions.ts'

export type { Event, Request, Response, Transport } from './transport.ts'
export type {
  BatchResult,
  ChunkDeclaration,
  ChunkId,
  ChunkItem,
  Commit,
  CommitId,
  Declaration,
  Dim,
  DryRunResult,
  Edge,
  EngineErrorCode,
  Includes,
  Placement,
  PlacementSpec,
  PlacementType,
  ProcessId,
  ReadOpts,
  RunArgs,
  ScopeOpts,
  ScopeResult,
  Spec,
  SubEvent,
  TaggedRead,
} from './types.ts'
export { EngineError } from './types.ts'
