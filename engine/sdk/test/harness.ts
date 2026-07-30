// The SDK selects its transport once, at module load. Tests therefore install a
// pre-set transport (selection order 1 in sdk.md, *Transports*) that delegates to
// whichever double the current test wants, and import the SDK afterwards — the
// dynamic import below is what guarantees the ordering.
import type { Event, Request, Response, Transport } from '../src/transport.ts'

let impl: Transport | null = null
let handler: ((event: Event) => void) | null = null

const delegate: Transport = {
  send(request: Request): Promise<Response> {
    if (!impl) return Promise.reject(new Error('no transport installed for this test'))
    return impl.send(request)
  },
  onEvent(next) {
    handler = next
  },
}

globalThis.__openlight_transport = delegate

/** Point the SDK at a double for the duration of a test. */
export function useTransport(next: Transport): void {
  impl = next
  next.onEvent((event) => handler?.(event))
}

export const sdk = await import('../src/index.ts')
