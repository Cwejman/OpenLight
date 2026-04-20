import type { ChunkDeclaration, Declaration } from '../../../ol/src/index.ts'
import type { TileLeaf, TileNode } from './tiles'
import { pathTo, newId, findLeaf } from './tile-ops'
import type { Direction, Axis, Side } from './tile-ops'

/** Parent split of a tile node in the client tree. Null if tile is root. */
function findParent(tree: TileNode, id: string): { parentId: string; seq: Side } | null {
  const path = pathTo(tree, id)
  if (!path || path.length === 0) return null
  const last = path[path.length - 1]
  return { parentId: last.split.id, seq: last.side }
}

/** Scope a leaf to a new set of chunks; push old scope onto history. */
export function navigateMutation(leaf: TileLeaf, newScope: string[]): Declaration {
  const history = leaf.scope.length > 0 ? [...leaf.history, leaf.scope] : leaf.history
  return {
    chunks: [
      { id: leaf.id, body: { scope: newScope, history, mode: leaf.mode } },
    ],
  }
}

/** Pop the history stack. Returns null if nothing to pop. */
export function backMutation(leaf: TileLeaf): Declaration | null {
  if (leaf.history.length === 0) return null
  const prev = leaf.history[leaf.history.length - 1]!
  return {
    chunks: [
      {
        id: leaf.id,
        body: {
          scope: prev,
          history: leaf.history.slice(0, -1),
          mode: leaf.mode,
        },
      },
    ],
  }
}

/**
 * Split a leaf: introduce a new split chunk; the leaf becomes its first child,
 * a new empty leaf is the second. The new split takes the leaf's place in the
 * parent (if any).
 */
export function splitMutation(
  tree: TileNode,
  leafId: string,
  axis: Axis,
): { decl: Declaration; newLeafId: string } {
  const parent = findParent(tree, leafId)
  const splitId = newId('split')
  const newLeafId = newId('leaf')

  const chunks: ChunkDeclaration[] = []

  // Old leaf: drop its current parent-tile placement (if any), place under new split.
  chunks.push({
    id: leafId,
    placements: [
      ...(parent
        ? [{ scope_id: parent.parentId, type: 'instance' as const, removed: true }]
        : []),
      { scope_id: splitId, type: 'instance' as const, seq: 0 },
    ],
  })

  // New split chunk: instance of the split archetype, placed where old leaf was.
  chunks.push({
    id: splitId,
    body: { direction: axis, ratio: 0.5 },
    placements: [
      { scope_id: 'split', type: 'instance' as const },
      ...(parent
        ? [{ scope_id: parent.parentId, type: 'instance' as const, seq: parent.seq }]
        : []),
    ],
  })

  // New leaf chunk: second child of the new split.
  chunks.push({
    id: newLeafId,
    body: { scope: [], history: [], mode: 'read' },
    placements: [
      { scope_id: 'leaf', type: 'instance' as const },
      { scope_id: splitId, type: 'instance' as const, seq: 1 },
    ],
  })

  return { decl: { chunks }, newLeafId }
}

/**
 * Close a leaf: remove the leaf and its parent split; sibling takes the
 * parent's place. Returns null if the leaf is the root (can't close last tile).
 */
export function closeMutation(
  tree: TileNode,
  leafId: string,
): { decl: Declaration; focusId: string } | null {
  const path = pathTo(tree, leafId)
  if (!path || path.length === 0) return null
  const last = path[path.length - 1]
  const parentSplit = last.split
  const siblingSide = (1 - last.side) as Side
  const sibling = parentSplit.children[siblingSide]

  // Grandparent: the split containing parentSplit, if any.
  const grand = path.length >= 2 ? path[path.length - 2] : null

  const chunks: ChunkDeclaration[] = [
    // Closed leaf: removed.
    { id: leafId, removed: true },
    // Parent split: removed.
    { id: parentSplit.id, removed: true },
    // Sibling: drop placement on the parent split; take the parent's seat.
    {
      id: sibling.id,
      placements: [
        { scope_id: parentSplit.id, type: 'instance' as const, removed: true },
        ...(grand
          ? [{ scope_id: grand.split.id, type: 'instance' as const, seq: grand.side }]
          : []),
      ],
    },
  ]

  // Focus moves to the sibling (or its first leaf if sibling is a split).
  const focusId = sibling.type === 'leaf' ? sibling.id : firstLeafIdOf(sibling)

  return { decl: { chunks }, focusId }
}

function firstLeafIdOf(node: TileNode): string {
  return node.type === 'leaf' ? node.id : firstLeafIdOf(node.children[0])
}

/** Resize: push the nearest matching split's divider toward `dir`. */
export function resizeMutation(
  tree: TileNode,
  leafId: string,
  dir: Direction,
  delta = 0.05,
): Declaration | null {
  const path = pathTo(tree, leafId)
  if (!path) return null
  const axis: Axis = dir === 'left' || dir === 'right' ? 'horizontal' : 'vertical'
  for (let i = path.length - 1; i >= 0; i--) {
    const step = path[i]
    if (step.split.direction !== axis) continue
    const sign = dir === 'right' || dir === 'down' ? 1 : -1
    const nextRatio = Math.min(0.95, Math.max(0.05, step.split.ratio + sign * delta))
    return {
      chunks: [
        {
          id: step.split.id,
          body: { direction: step.split.direction, ratio: nextRatio },
        },
      ],
    }
  }
  return null
}

/** Rotate: toggle the parent split's direction. */
export function rotateMutation(tree: TileNode, leafId: string): Declaration | null {
  const path = pathTo(tree, leafId)
  if (!path || path.length === 0) return null
  const parent = path[path.length - 1].split
  const nextDir: Axis = parent.direction === 'horizontal' ? 'vertical' : 'horizontal'
  return {
    chunks: [
      { id: parent.id, body: { direction: nextDir, ratio: parent.ratio } },
    ],
  }
}

/** Swap: swap the seq values of the two children of the parent split. */
export function swapMutation(tree: TileNode, leafId: string): Declaration | null {
  const path = pathTo(tree, leafId)
  if (!path || path.length === 0) return null
  const parent = path[path.length - 1].split
  const [a, b] = parent.children
  return {
    chunks: [
      {
        id: a.id,
        placements: [{ scope_id: parent.id, type: 'instance' as const, seq: 1 }],
      },
      {
        id: b.id,
        placements: [{ scope_id: parent.id, type: 'instance' as const, seq: 0 }],
      },
    ],
  }
}

/** Equalize: reset every split's ratio to 0.5. */
export function equalizeMutation(tree: TileNode): Declaration {
  const chunks: ChunkDeclaration[] = []
  walk(tree, (n) => {
    if (n.type === 'split') {
      chunks.push({ id: n.id, body: { direction: n.direction, ratio: 0.5 } })
    }
  })
  return { chunks }
}

function walk(node: TileNode, visit: (n: TileNode) => void): void {
  visit(node)
  if (node.type === 'split') {
    walk(node.children[0], visit)
    walk(node.children[1], visit)
  }
}
