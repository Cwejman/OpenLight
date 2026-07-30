// VM transport (sdk.md, *VM transport*): requests are JSON lines on stdout, the
// engine's responses and events are JSON lines on stdin. Same demultiplexing as
// the webview transport — shape decides.
import { isEvent, type Event, type Request, type Response } from '../protocol.ts'
import type { Transport } from '../transport.ts'
import { EngineError } from '../types.ts'

export type StdioStreams = {
  stdin: {
    on: (event: string, handler: (chunk: string | Uint8Array) => void) => void
    setEncoding?: (encoding: string) => void
    resume?: () => void
  }
  stdout: { write: (line: string) => unknown }
}

/** The runtime's own stdio, read off the global rather than a typed `process`
 *  import — the SDK carries no runtime type dependency. */
function runtimeStreams(): StdioStreams {
  const runtime = (globalThis as { process?: StdioStreams }).process
  if (!runtime?.stdin) throw new EngineError('TRANSPORT_CLOSED', 'no stdio on this runtime')
  return runtime
}

export function stdioTransport(io: StdioStreams = runtimeStreams()): Transport {
  const pending = new Map<number, { resolve: (r: Response) => void; reject: (e: unknown) => void }>()
  let onEvent: (event: Event) => void = () => {}
  let buffer = ''

  const deliver = (line: string): void => {
    if (line.trim() === '') return
    const message: unknown = JSON.parse(line)
    if (isEvent(message)) {
      onEvent(message)
      return
    }
    const response = message as Response
    const settle = typeof response.id === 'number' ? pending.get(response.id) : undefined
    if (settle) {
      pending.delete(response.id as number)
      settle.resolve(response)
    }
  }

  io.stdin.setEncoding?.('utf8')
  io.stdin.on('data', (chunk) => {
    // Lines arrive split across chunks; the tail stays buffered until its newline.
    buffer += typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk)
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) deliver(line)
  })
  io.stdin.on('end', () => {
    const closed = new EngineError('TRANSPORT_CLOSED', 'the engine closed this program\'s stdio')
    for (const call of pending.values()) call.reject(closed)
    pending.clear()
  })
  io.stdin.resume?.()

  return {
    send(request: Request): Promise<Response> {
      return new Promise<Response>((resolve, reject) => {
        pending.set(request.id, { resolve, reject })
        io.stdout.write(`${JSON.stringify(request)}\n`)
      })
    },
    onEvent(handler) {
      onEvent = handler
    },
  }
}
