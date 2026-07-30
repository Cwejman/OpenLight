// The wire shapes (engine.md, *The Program Protocol*): requests out, responses
// and events in, one JSON shape over every transport. Mirrors
// `engine/src/protocol.rs` — that file is ground truth for every field name here.
import { EngineError, type EngineErrorCode } from './types.ts'

export type Request = {
  id: number
  op: string
  [field: string]: unknown
}

export type Response = {
  id: number | null
  result?: unknown
  error?: { code: EngineErrorCode; message: string }
}

export type Event =
  | { event: 'scope_changed'; subscriptionId: string; commit: unknown }
  | { event: 'lagged'; subscriptionIds: string[] }
  | { event: 'subscription_invalid'; subscriptionId: string; reason: string }

let counter = 0

/** Every request has a monotonic id; every response pairs the same id. */
export function nextId(): number {
  counter += 1
  return counter
}

/**
 * The demultiplexer both transports share: an incoming message is an event when
 * it names one (`event`), a response when it pairs an id with `result` or
 * `error`. Shape decides, not the channel it arrived on.
 */
export function isEvent(message: unknown): message is Event {
  return typeof (message as Event | null)?.event === 'string'
}

export function isResponse(message: unknown): message is Response {
  const candidate = message as Response | null
  return (
    typeof candidate?.id === 'number' &&
    (candidate.result !== undefined || candidate.error !== undefined)
  )
}

/** A response is the op's result, or the error the caller's promise rejects with. */
export function unwrap(response: Response): unknown {
  if (response.error) throw new EngineError(response.error.code, response.error.message)
  return response.result
}
