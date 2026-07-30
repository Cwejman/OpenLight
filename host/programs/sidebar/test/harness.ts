// The SDK selects its transport once, at module load (sdk.md, *Transports*), and
// the sidebar imports it through `@openlight/react`. So the pre-set transport —
// selection order 1 — is installed here, and the tile is reached through the
// dynamic import below, which is what guarantees the ordering.
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

;(globalThis as Record<string, unknown>).__openlight_transport = delegate

export function useTransport(next: Transport): void {
  impl = next
  next.onEvent((event) => handler?.(event))
}

export const { Sidebar } = await import('../src/sidebar.tsx')

export type Mounted = { root: Root; container: HTMLElement }

export async function mount(element: ReactNode): Promise<Mounted> {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(element)
  })
  await settle()
  return { root, container }
}

export async function unmount(mounted: Mounted): Promise<void> {
  await act(async () => {
    mounted.root.unmount()
  })
  mounted.container.remove()
}

/** Let queued promise jobs and every follow-on fetch settle inside `act`. */
export async function settle(action?: () => void): Promise<void> {
  await act(async () => {
    action?.()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

/** A user's click, at a point — the context menu is positioned from it. */
export async function click(
  mounted: Mounted,
  selector: string,
  at: { x: number; y: number } = { x: 0, y: 0 },
): Promise<void> {
  const node = mounted.container.querySelector(selector)
  if (!node) throw new Error(`nothing to click at ${selector}`)
  await settle(() => {
    node.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, clientX: at.x, clientY: at.y }),
    )
  })
}

export function texts(mounted: Mounted, selector: string): string[] {
  return [...mounted.container.querySelectorAll(selector)].map((node) => node.textContent ?? '')
}

export function text(mounted: Mounted, selector: string): string {
  return mounted.container.querySelector(selector)?.textContent ?? ''
}
