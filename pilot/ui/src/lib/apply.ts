import { invalidateAll } from '$app/navigation'
import type { Declaration } from '../../../ol/src/index.ts'

/**
 * Post a Declaration to the substrate via the apply endpoint and refresh
 * the page data so the UI reflects the new substrate state.
 */
export async function applyMutation(decl: Declaration): Promise<void> {
  const res = await fetch('/api/apply', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(decl),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`apply failed: ${res.status} ${text}`)
  }
  await invalidateAll()
}
