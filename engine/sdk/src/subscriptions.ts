// Subscription registry and event router (sdk.md, *Reactivity*, *Subscription
// lifecycle*). One registry keyed by the engine's subscription id; the router
// demultiplexes incoming events onto the right callback.
import { call } from './surface.ts'
import { transport } from './transport.ts'
import type { Event } from './protocol.ts'
import type { ChunkId, Commit, SubEvent } from './types.ts'

const callbacks = new Map<string, (event: SubEvent) => void>()

function route(event: Event): void {
  if (event.event === 'lagged') {
    // The engine names the affected subscriptions; subscribers without an id in
    // the list see nothing.
    for (const id of event.subscriptionIds) callbacks.get(id)?.({ kind: 'lagged' })
    return
  }
  const callback = callbacks.get(event.subscriptionId)
  if (!callback) return
  if (event.event === 'scope_changed') {
    callback({ kind: 'changed', commit: event.commit as Commit })
    return
  }
  // Invalidated server-side: the subscription is already gone there.
  callbacks.delete(event.subscriptionId)
  callback({ kind: 'invalid', reason: event.reason })
}

transport.onEvent(route)

/**
 * Register on a set of scopes. The thunk unsubscribes; calling it after an
 * `invalid` event is a no-op. A rejected registration (a scope outside the read
 * boundary) reaches the caller the only way an imperative subscription can — as
 * a dead subscription.
 */
export function subscribe(scopes: ChunkId[], callback: (event: SubEvent) => void): () => void {
  let id: string | null = null
  let stopped = false

  void call('subscribe', { scopes }).then(
    (result) => {
      id = (result as { subscriptionId: string }).subscriptionId
      if (stopped) drop(id)
      else callbacks.set(id, callback)
    },
    (error: Error) => callback({ kind: 'invalid', reason: error.message }),
  )

  return () => {
    stopped = true
    if (id && callbacks.has(id)) drop(id)
  }
}

function drop(id: string): void {
  callbacks.delete(id)
  void call('unsubscribe', { subscriptionId: id }).catch(() => {})
}
