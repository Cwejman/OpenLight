import type { TileNode } from './tiles'

type View = {
  root: TileNode
  focusedId: string
  zoomedId: string | null
  paletteOpen: boolean
  paletteInitialQuery: string
  paletteChordMode: boolean
}

const initial: TileNode = { type: 'leaf', id: 'view-root', scope: [], mode: 'read' }

export const view: View = $state({
  root: initial,
  focusedId: initial.id,
  zoomedId: null,
  paletteOpen: false,
  paletteInitialQuery: '',
  paletteChordMode: false,
})

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

export function setRoot(root: TileNode, focusedId?: string) {
  view.root = root
  if (focusedId !== undefined) view.focusedId = focusedId
}

export function hydrate(root: TileNode) {
  view.root = root
  view.focusedId = firstLeaf(root)
  view.zoomedId = null
}

function firstLeaf(n: TileNode): string {
  return n.type === 'leaf' ? n.id : firstLeaf(n.children[0])
}
