import type { TileLeaf, TileNode, TileSplit } from './tiles'

export type Direction = 'left' | 'right' | 'up' | 'down'
export type Axis = 'horizontal' | 'vertical'

export type Side = 0 | 1
export type Path = Array<{ split: TileSplit; side: Side }>

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function pathTo(root: TileNode, id: string, acc: Path = []): Path | null {
  if (root.id === id) return acc
  if (root.type !== 'split') return null
  for (const side of [0, 1] as Side[]) {
    const found = pathTo(root.children[side], id, [...acc, { split: root, side }])
    if (found) return found
  }
  return null
}

export function findLeaf(root: TileNode, id: string): TileLeaf | null {
  if (root.id === id && root.type === 'leaf') return root
  if (root.type !== 'split') return null
  return findLeaf(root.children[0], id) ?? findLeaf(root.children[1], id)
}

export function firstLeafId(node: TileNode): string {
  return node.type === 'leaf' ? node.id : firstLeafId(node.children[0])
}

/** Client-only: move focus to the leaf in the given direction. No substrate write. */
export function navigate(root: TileNode, leafId: string, dir: Direction): string {
  const path = pathTo(root, leafId)
  if (!path) return leafId
  const axis: Axis = dir === 'left' || dir === 'right' ? 'horizontal' : 'vertical'
  const goSecond = dir === 'right' || dir === 'down'
  for (let i = path.length - 1; i >= 0; i--) {
    const step = path[i]
    if (step.split.direction !== axis) continue
    if (goSecond && step.side === 0) return firstLeafId(step.split.children[1])
    if (!goSecond && step.side === 1) return firstLeafId(step.split.children[0])
  }
  return leafId
}
