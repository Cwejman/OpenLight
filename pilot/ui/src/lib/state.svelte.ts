import type { TileNode } from './tiles'

export type ChunkSummary = { id: string; name: string }

type View = {
  root: TileNode
  focusedId: string
  zoomedId: string | null
  paletteOpen: boolean
  paletteInitialQuery: string
  paletteChordMode: boolean
  scopeSelectorOpen: boolean
  allChunks: ChunkSummary[]
}

const initial: TileNode = {
  type: 'leaf',
  id: 'view-root',
  scope: [],
  history: [],
  mode: 'read',
}

export const view: View = $state({
  root: initial,
  focusedId: initial.id,
  zoomedId: null,
  paletteOpen: false,
  paletteInitialQuery: '',
  paletteChordMode: false,
  scopeSelectorOpen: false,
  allChunks: [],
})

export function setAllChunks(chunks: ChunkSummary[]) {
  view.allChunks = chunks
}

export function openScopeSelector() {
  view.scopeSelectorOpen = true
}

export function closeScopeSelector() {
  view.scopeSelectorOpen = false
}

// chordMode: treat further keystrokes as chord extension; auto-execute when
// the query exactly matches a command keybind.
export function openPalette(initialQuery = '', chordMode = false) {
  view.paletteInitialQuery = initialQuery
  view.paletteChordMode = chordMode
  view.paletteOpen = true
}

export function closePalette() {
  view.paletteOpen = false
  view.paletteInitialQuery = ''
  view.paletteChordMode = false
}

/** Mirror the substrate-derived tree into local state. Only writer for view.root. */
export function hydrate(root: TileNode) {
  view.root = root
  if (!findLeafId(root, view.focusedId)) {
    view.focusedId = firstLeafId(root)
  }
  if (view.zoomedId && !findLeafId(root, view.zoomedId)) {
    view.zoomedId = null
  }
}

function firstLeafId(n: TileNode): string {
  return n.type === 'leaf' ? n.id : firstLeafId(n.children[0])
}

function findLeafId(n: TileNode, id: string): boolean {
  if (n.type === 'leaf') return n.id === id
  return findLeafId(n.children[0], id) || findLeafId(n.children[1], id)
}
