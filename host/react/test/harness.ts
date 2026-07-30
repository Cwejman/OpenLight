// The SDK selects its transport once, at module load (sdk.md, *Transports*),
// and `useScope` imports the SDK statically. So the pre-set transport — selection
// order 1 — is installed here, and the hook is reached through the dynamic import
// below, which is what guarantees the ordering.
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Event, Request, Response, Transport } from '@openlight/sdk'

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

export const { useScope } = await import('../src/useScope.ts')

export type Probe = Transport & {
  /** Every op the hook issued, in order. */
  ops: string[]
  /** Push an event the wrapped engine would not raise on its own (`lagged`). */
  emit: (event: Event) => void
  /** Withhold the nth `scope` response until `release` — the in-flight case. */
  hold: (nth: number) => void
  release: () => void
}

/** Wrap a transport so a test can watch its traffic and stall one response. */
export function probe(inner: Transport): Probe {
  const ops: string[] = []
  let deliver: (event: Event) => void = () => {}
  let holdAt: number | null = null
  let release: () => void = () => {}
  let scopes = 0

  inner.onEvent((event) => deliver(event))

  return {
    ops,
    async send(request: Request): Promise<Response> {
      ops.push(request.op)
      const response = inner.send(request)
      if (request.op === 'scope' && scopes++ === holdAt) {
        await new Promise<void>((resolve) => {
          release = resolve
        })
      }
      return response
    },
    onEvent(next) {
      deliver = next
    },
    emit(event) {
      deliver(event)
    },
    hold(nth) {
      holdAt = nth
    },
    release() {
      release()
    },
  }
}

export type Mounted = { root: Root; container: HTMLElement }

export async function mount(element: ReactNode): Promise<Mounted> {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(element)
  })
  return { root, container }
}

export async function render(mounted: Mounted, element: ReactNode): Promise<void> {
  await act(async () => {
    mounted.root.render(element)
  })
}

export async function unmount(mounted: Mounted): Promise<void> {
  await act(async () => {
    mounted.root.unmount()
  })
  mounted.container.remove()
}

/**
 * Let queued promise jobs and the hook's re-fetch settle inside `act`. Anything
 * that provokes a state update (an event, a released response) belongs in the
 * optional action so React sees it inside the same batch.
 */
export async function settle(action?: () => void): Promise<void> {
  await act(async () => {
    action?.()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}
