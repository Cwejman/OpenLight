import { buildTileTree } from '$lib/server/substrate.ts'

export function load() {
  return { tree: buildTileTree('view-root') }
}
