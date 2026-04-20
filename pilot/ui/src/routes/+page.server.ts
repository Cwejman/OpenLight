import { getDb } from '$lib/server/substrate.ts'
import { scope } from '../../../ol/src/index.ts'
import type { ChunkItem } from '../../../ol/src/index.ts'
import type { TileNode } from '$lib/tiles'

/**
 * The tile tree lives in the substrate. A chunk is a tile if it's an instance
 * of the `split` or `leaf` archetype. The tree root is the tile chunk with no
 * parent-tile placement. Children of a split are tile chunks placed on it by
 * seq.
 */
function buildTileTree(): TileNode {
  const db = getDb()
  const splits = scope(db, ['split'], { connected: false }).chunks.items
  const leaves = scope(db, ['leaf'], { connected: false }).chunks.items
  const all = [...splits, ...leaves]
  const byId = new Map(all.map((c) => [c.id, c]))

  const splitIds = new Set(splits.map((c) => c.id))
  const leafIds = new Set(leaves.map((c) => c.id))

  const hasParentTile = (c: ChunkItem) =>
    c.placements.some(
      (p) => p.type === 'instance' && (splitIds.has(p.scope_id) || leafIds.has(p.scope_id)),
    )

  const root = all.find((c) => !hasParentTile(c))
  if (!root) throw new Error('no tree root found')

  return toTile(root, byId, splitIds)
}

function toTile(
  chunk: ChunkItem,
  byId: Map<string, ChunkItem>,
  splitIds: Set<string>,
): TileNode {
  if (splitIds.has(chunk.id)) {
    const body = chunk.body as Record<string, unknown>
    const children = [...byId.values()]
      .filter((c) =>
        c.placements.some((p) => p.scope_id === chunk.id && p.type === 'instance'),
      )
      .sort((a, b) => seqOn(a, chunk.id) - seqOn(b, chunk.id))
    if (children.length !== 2) throw new Error(`split ${chunk.id} has ${children.length} children`)
    return {
      type: 'split',
      id: chunk.id,
      direction: (body.direction as 'horizontal' | 'vertical') ?? 'horizontal',
      ratio: (body.ratio as number) ?? 0.5,
      children: [
        toTile(children[0]!, byId, splitIds),
        toTile(children[1]!, byId, splitIds),
      ],
    }
  }
  const body = chunk.body as Record<string, unknown>
  return {
    type: 'leaf',
    id: chunk.id,
    scope: (body.scope as string[]) ?? [],
    history: (body.history as string[][]) ?? [],
    mode: (body.mode as string) ?? 'read',
  }
}

function seqOn(chunk: ChunkItem, scopeId: string): number {
  const p = chunk.placements.find((p) => p.scope_id === scopeId && p.type === 'instance')
  return p?.seq ?? 0
}

function listAllChunks() {
  const field = scope(getDb(), [], { body: false, placements: false, connected: false })
  return field.chunks.items
    .filter((c) => c.name !== undefined)
    .map((c) => ({ id: c.id, name: c.name as string }))
}

export function load() {
  return {
    tree: buildTileTree(),
    allChunks: listAllChunks(),
  }
}
