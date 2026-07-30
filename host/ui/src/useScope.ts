// The one hook v0.1 ships (sdk.md, *React helpers*). Subscribe first, then
// fetch: a commit landing between the two produces an event the SDK receives
// during the in-flight fetch, and the re-fetch it triggers supersedes it — so
// there is no lost-event window, at the cost of one extra fetch per mount.
import { useEffect, useState } from 'react'
import { scope, subscribe, type ChunkId, type ScopeOpts, type ScopeResult } from '@openlight/sdk'

export function useScope(scopes: ChunkId[], opts?: ScopeOpts): ScopeResult | undefined {
  const [result, setResult] = useState<ScopeResult | undefined>(undefined)

  // The effect depends on the *values*, not the arrays' identity — a caller
  // passing a fresh literal every render must not re-subscribe.
  const request = JSON.stringify([scopes, opts ?? null])

  useEffect(() => {
    const [ids, options] = JSON.parse(request) as [ChunkId[], ScopeOpts | null]
    let live = true
    // Only the newest fetch may land: an event-driven re-fetch can resolve
    // before the fetch it supersedes.
    let issued = 0
    setResult(undefined)

    const refetch = async (): Promise<void> => {
      const ticket = ++issued
      try {
        const next = await scope(ids, options ?? undefined)
        if (live && ticket === issued) setResult(next)
      } catch {
        // A read the identity cannot make leaves the hook empty — its contract
        // carries no error channel (recorded gap against sdk.md).
        if (live && ticket === issued) setResult(undefined)
      }
    }

    const unsubscribe = subscribe(ids, (event) => {
      if (!live) return
      if (event.kind === 'invalid') {
        live = false
        setResult(undefined)
        return
      }
      void refetch()
    })
    void refetch()

    return () => {
      live = false
      unsubscribe()
    }
  }, [request])

  return result
}
