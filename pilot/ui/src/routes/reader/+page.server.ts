import { error } from '@sveltejs/kit'
import { getDb } from '$lib/server/substrate.ts'
import { scope } from '../../../../ol/src/index.ts'
import type { ChunkItem, ConnectedScope, Spec } from '../../../../ol/src/types.ts'

export type ReaderItem = {
  id: string
  name: string | undefined
  body: Record<string, unknown>
  spec: Spec
  instanceScopes: string[]
  relatesScopes: string[]
  seq: number | undefined
}

export type ReaderData = {
  scopeIds: string[]
  scopeChunks: { id: string; name: string | undefined; spec: Spec }[]
  items: ReaderItem[]
  connected: ConnectedScope[]
  counts: { total: number; in_scope: number; instance: number; relates: number }
}

export function load({ url }): ReaderData {
  const scopeParam = url.searchParams.get('scope')
  if (!scopeParam) {
    error(400, 'Missing scope parameter')
  }

  const scopeIds = scopeParam.split(',').filter(Boolean)
  if (scopeIds.length === 0) {
    error(400, 'Empty scope parameter')
  }

  const db = getDb()
  const result = scope(db, scopeIds)

  if (result.scope.length === 0) {
    error(404, `Scope not found: ${scopeIds.join(', ')}`)
  }

  const scopeChunks = result.scope.map((c) => ({
    id: c.id,
    name: c.name,
    spec: c.spec,
  }))

  // Determine if the scope is ordered (any scope chunk has ordered spec)
  const isOrdered = scopeChunks.some((s) => s.spec.ordered)

  const items: ReaderItem[] = result.chunks.items.map((item: ChunkItem) => {
    const instanceScopes: string[] = []
    const relatesScopes: string[] = []
    let seq: number | undefined

    for (const p of item.placements) {
      if (scopeIds.includes(p.scope_id)) {
        if (p.type === 'instance') {
          instanceScopes.push(p.scope_id)
          if (p.seq !== undefined) seq = p.seq
        } else {
          relatesScopes.push(p.scope_id)
        }
      }
    }

    return {
      id: item.id,
      name: item.name,
      body: item.body,
      spec: item.spec,
      instanceScopes,
      relatesScopes,
      seq,
    }
  })

  // Sort by seq if ordered
  if (isOrdered) {
    items.sort((a, b) => (a.seq ?? Infinity) - (b.seq ?? Infinity))
  } else {
    // Group by instance placements: items with instance come first
    items.sort((a, b) => {
      const aInst = a.instanceScopes.length > 0 ? 0 : 1
      const bInst = b.instanceScopes.length > 0 ? 0 : 1
      return aInst - bInst
    })
  }

  return {
    scopeIds,
    scopeChunks,
    items,
    connected: result.connected as ConnectedScope[],
    counts: {
      total: result.chunks.total,
      in_scope: result.chunks.in_scope,
      instance: result.chunks.instance,
      relates: result.chunks.relates,
    },
  }
}
