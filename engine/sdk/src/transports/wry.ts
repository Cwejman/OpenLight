// Webview transport (sdk.md, *Webview transport*; host.md, *Transport*): requests
// go out through wry's IPC channel, responses and events come back as calls the
// host injects on the page — `__sdk.resolve(<id>, <payload>)` and `__sdk.event(<payload>)`.
import { isEvent, type Event, type Request, type Response } from '../protocol.ts'
import type { Transport } from '../transport.ts'
import { EngineError } from '../types.ts'

/** The two names this transport touches; their shapes live in `globals.d.ts`. */
export type WryWindow = Pick<Window, '__wry_ipc' | '__sdk'>

export function wryTransport(view: WryWindow = window): Transport {
  const ipc = view.__wry_ipc
  if (!ipc) throw new EngineError('TRANSPORT_CLOSED', 'window.__wry_ipc is not installed')

  const pending = new Map<number, (response: Response) => void>()
  let onEvent: (event: Event) => void = () => {}

  // Both hooks accept both message kinds: the host's dispatch logic knows only
  // the names, and shape is what decides (engine.md, *Events*).
  const deliver = (payload: unknown): void => {
    if (isEvent(payload)) {
      onEvent(payload)
      return
    }
    const response = payload as Response
    const settle = typeof response?.id === 'number' ? pending.get(response.id) : undefined
    if (settle) {
      pending.delete(response.id as number)
      settle(response)
    }
  }

  view.__sdk = {
    resolve: (_id, payload) => deliver(payload),
    event: (payload) => deliver(payload),
  }

  return {
    send(request: Request): Promise<Response> {
      return new Promise<Response>((resolve) => {
        pending.set(request.id, resolve)
        ipc.postMessage(JSON.stringify(request))
      })
    },
    onEvent(handler) {
      onEvent = handler
    },
  }
}
