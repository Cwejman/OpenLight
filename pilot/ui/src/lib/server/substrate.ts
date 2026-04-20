import { resolve } from 'path'
import { bootstrap } from '../../../../engine/src/index.ts'
import { scope } from '../../../../ol/src/index.ts'
import type { TileNode } from '../tiles.ts'

const DB_PATH = resolve(process.cwd(), '../project/.ol/db')

let engine: ReturnType<typeof bootstrap>

export function getDb() {
  if (!engine) {
    engine = bootstrap(DB_PATH)
  }
  return engine.db
}

/** Check if a chunk is an instance of a given type by its placements. */
const isInstanceOf = (
  chunk: { placements: readonly { scope_id: string; type: string }[] },
  typeId: string,
): boolean => chunk.placements.some((p) => p.scope_id === typeId && p.type === 'instance')

/** Build a tile tree by reading the substrate recursively from a root chunk. */
export function buildTileTree(chunkId: string): TileNode {
  const db = getDb()
  const result = scope(db, [chunkId])
  const chunk = result.scope[0]

  if (!chunk) {
    return { type: 'leaf', id: chunkId, scope: [], mode: 'read' }
  }

  if (isInstanceOf(chunk, 'split')) {
    const children = result.chunks.items
      .filter((c) => isInstanceOf(c, 'leaf') || isInstanceOf(c, 'split'))
      .sort((a, b) => {
        const aSeq = a.placements.find((p) => p.scope_id === chunkId)?.seq ?? 0
        const bSeq = b.placements.find((p) => p.scope_id === chunkId)?.seq ?? 0
        return (aSeq ?? 0) - (bSeq ?? 0)
      })

    const body = chunk.body as Record<string, unknown>
    return {
      type: 'split',
      id: chunk.id,
      direction: (body.direction as 'horizontal' | 'vertical') ?? 'horizontal',
      ratio: (body.ratio as number) ?? 0.5,
      children: [
        buildTileTree(children[0]!.id),
        buildTileTree(children[1]!.id),
      ],
    }
  }

  // Leaf
  const body = chunk.body as Record<string, unknown>
  return {
    type: 'leaf',
    id: chunk.id,
    scope: (body.scope as string[]) ?? [],
    mode: (body.mode as string) ?? 'read',
  }
}
