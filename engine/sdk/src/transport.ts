// Transport selection happens once, at module load (sdk.md, *Transports*): a
// pre-set transport wins, then the webview's wry channel, then a VM program's
// stdio. Order matters — a pre-set transport is how a runtime that fits neither
// pattern (and every test) reaches the surface, so it is checked first, and the
// wry check precedes stdio because a webview may also expose a `process` shim.
import { stdioTransport } from './transports/stdio.ts'
import { wryTransport } from './transports/wry.ts'
import { EngineError } from './types.ts'

export type { Event, Request, Response } from './protocol.ts'
import type { Event, Request, Response } from './protocol.ts'

export type Transport = {
  send(request: Request): Promise<Response>
  onEvent(handler: (event: Event) => void): void
}

function select(): Transport {
  if (globalThis.__openlight_transport) return globalThis.__openlight_transport
  // `window` is typed as always present but is absent outside a page.
  const view = globalThis.window as Window | undefined
  if (view?.__wry_ipc) return wryTransport(view)
  const runtime = (globalThis as { process?: { stdin?: unknown } }).process
  if (runtime?.stdin) return stdioTransport(runtime as Parameters<typeof stdioTransport>[0])
  throw new EngineError(
    'TRANSPORT_CLOSED',
    'no transport detected: expected globalThis.__openlight_transport, window.__wry_ipc, or process.stdin',
  )
}

export const transport: Transport = select()
