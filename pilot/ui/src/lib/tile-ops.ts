import type { TileLeaf, TileNode, TileSplit } from './tiles'

export type Direction = 'left' | 'right' | 'up' | 'down'
export type Axis = 'horizontal' | 'vertical'

type Side = 0 | 1
type Path = Array<{ split: TileSplit; side: Side }>

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function pathTo(root: TileNode, id: string, acc: Path = []): Path | null {
  if (root.id === id) return acc
  if (root.type !== 'split') return null
  for (const side of [0, 1] as Side[]) {
    const found = pathTo(root.children[side], id, [...acc, { split: root, side }])
    if (found) return found
  }
  return null
}

function replaceNode(
  root: TileNode,
  id: string,
  replacer: (node: TileNode) => TileNode,
): TileNode {
  if (root.id === id) return replacer(root)
  if (root.type !== 'split') return root
  return {
    ...root,
    children: [
      replaceNode(root.children[0], id, replacer),
      replaceNode(root.children[1], id, replacer),
    ] as [TileNode, TileNode],
  }
}

function firstLeafId(node: TileNode): string {
  return node.type === 'leaf' ? node.id : firstLeafId(node.children[0])
}

export function split(
  root: TileNode,
  leafId: string,
  axis: Axis,
): { root: TileNode; focusId: string } {
  const newLeaf: TileLeaf = {
    type: 'leaf',
    id: newId('leaf'),
    scope: [],
    mode: 'read',
  }
  const nextRoot = replaceNode(root, leafId, (orig) => ({
    type: 'split',
    id: newId('split'),
    direction: axis,
    ratio: 0.5,
    children: [orig, newLeaf],
  }))
  return { root: nextRoot, focusId: newLeaf.id }
}

export function close(
  root: TileNode,
  leafId: string,
): { root: TileNode; focusId: string } | null {
  if (root.id === leafId) return null
  const path = pathTo(root, leafId)
  if (!path || path.length === 0) return null
  const last = path[path.length - 1]
  const sibling = last.split.children[(1 - last.side) as Side]
  const nextRoot = replaceNode(root, last.split.id, () => sibling)
  return { root: nextRoot, focusId: firstLeafId(sibling) }
}

export function navigate(
  root: TileNode,
  leafId: string,
  dir: Direction,
): string {
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

// Resize pushes the nearest split's divider toward `dir`.
// Ratio is first child's share; right/down increases it, left/up decreases.
export function resize(
  root: TileNode,
  leafId: string,
  dir: Direction,
  delta = 0.05,
): TileNode {
  const path = pathTo(root, leafId)
  if (!path) return root
  const axis: Axis = dir === 'left' || dir === 'right' ? 'horizontal' : 'vertical'
  for (let i = path.length - 1; i >= 0; i--) {
    const step = path[i]
    if (step.split.direction !== axis) continue
    const sign = dir === 'right' || dir === 'down' ? 1 : -1
    const nextRatio = Math.min(0.95, Math.max(0.05, step.split.ratio + sign * delta))
    return replaceNode(root, step.split.id, (n) =>
      n.type === 'split' ? { ...n, ratio: nextRatio } : n,
    )
  }
  return root
}

export function rotate(root: TileNode, leafId: string): TileNode {
  const path = pathTo(root, leafId)
  if (!path || path.length === 0) return root
  const parent = path[path.length - 1].split
  return replaceNode(root, parent.id, (n) =>
    n.type === 'split'
      ? { ...n, direction: n.direction === 'horizontal' ? 'vertical' : 'horizontal' }
      : n,
  )
}

export function swap(root: TileNode, leafId: string): TileNode {
  const path = pathTo(root, leafId)
  if (!path || path.length === 0) return root
  const parent = path[path.length - 1].split
  return replaceNode(root, parent.id, (n) =>
    n.type === 'split'
      ? { ...n, children: [n.children[1], n.children[0]] as [TileNode, TileNode] }
      : n,
  )
}

export function equalize(root: TileNode): TileNode {
  if (root.type !== 'split') return root
  return {
    ...root,
    ratio: 0.5,
    children: [equalize(root.children[0]), equalize(root.children[1])] as [TileNode, TileNode],
  }
}

export function findLeaf(root: TileNode, id: string): TileLeaf | null {
  if (root.id === id && root.type === 'leaf') return root
  if (root.type !== 'split') return null
  return findLeaf(root.children[0], id) ?? findLeaf(root.children[1], id)
}
