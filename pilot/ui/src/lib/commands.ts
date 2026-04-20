import { view, openScopeSelector } from './state.svelte'
import { navigate, findLeaf } from './tile-ops'
import * as mut from './tile-mutations'
import { applyMutation } from './apply'

export type Command = {
  id: string
  name: string
  hint?: string
  keybind?: string
  run: () => void | Promise<void>
}

const focused = () => view.focusedId

// Layout commands write Declarations to the substrate. Focus/zoom stay
// client-side (transient UI state).

export const commands: Command[] = [
  {
    id: 'split-h',
    name: 'Split horizontal',
    keybind: 'sh',
    run: async () => {
      const { decl, newLeafId } = mut.splitMutation(view.root, focused(), 'horizontal')
      view.focusedId = newLeafId
      await applyMutation(decl)
    },
  },
  {
    id: 'split-v',
    name: 'Split vertical',
    keybind: 'sv',
    run: async () => {
      const { decl, newLeafId } = mut.splitMutation(view.root, focused(), 'vertical')
      view.focusedId = newLeafId
      await applyMutation(decl)
    },
  },
  {
    id: 'close',
    name: 'Close tile',
    keybind: 'w',
    run: async () => {
      const res = mut.closeMutation(view.root, focused())
      if (!res) return
      view.focusedId = res.focusId
      await applyMutation(res.decl)
    },
  },
  {
    id: 'nav-left',
    name: 'Navigate left',
    keybind: 'h',
    run: () => {
      view.focusedId = navigate(view.root, focused(), 'left')
    },
  },
  {
    id: 'nav-down',
    name: 'Navigate down',
    keybind: 'j',
    run: () => {
      view.focusedId = navigate(view.root, focused(), 'down')
    },
  },
  {
    id: 'nav-up',
    name: 'Navigate up',
    keybind: 'k',
    run: () => {
      view.focusedId = navigate(view.root, focused(), 'up')
    },
  },
  {
    id: 'nav-right',
    name: 'Navigate right',
    keybind: 'l',
    run: () => {
      view.focusedId = navigate(view.root, focused(), 'right')
    },
  },
  {
    id: 'resize-left',
    name: 'Resize left',
    keybind: 'H',
    run: async () => {
      const decl = mut.resizeMutation(view.root, focused(), 'left')
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'resize-down',
    name: 'Resize down',
    keybind: 'J',
    run: async () => {
      const decl = mut.resizeMutation(view.root, focused(), 'down')
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'resize-up',
    name: 'Resize up',
    keybind: 'K',
    run: async () => {
      const decl = mut.resizeMutation(view.root, focused(), 'up')
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'resize-right',
    name: 'Resize right',
    keybind: 'L',
    run: async () => {
      const decl = mut.resizeMutation(view.root, focused(), 'right')
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'swap',
    name: 'Swap tiles',
    keybind: 'x',
    run: async () => {
      const decl = mut.swapMutation(view.root, focused())
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'rotate',
    name: 'Rotate split',
    keybind: 'r',
    run: async () => {
      const decl = mut.rotateMutation(view.root, focused())
      if (decl) await applyMutation(decl)
    },
  },
  {
    id: 'zoom',
    name: 'Zoom toggle',
    keybind: 'z',
    run: () => {
      view.zoomedId = view.zoomedId ? null : focused()
    },
  },
  {
    id: 'equalize',
    name: 'Equalize',
    keybind: '=',
    run: async () => {
      await applyMutation(mut.equalizeMutation(view.root))
    },
  },
  {
    id: 'change-scope',
    name: 'Change scope',
    keybind: 'o',
    run: () => openScopeSelector(),
  },
  {
    id: 'back',
    name: 'Back',
    keybind: 'b',
    run: async () => {
      const leaf = findLeaf(view.root, focused())
      if (!leaf) return
      const decl = mut.backMutation(leaf)
      if (decl) await applyMutation(decl)
    },
  },
]
