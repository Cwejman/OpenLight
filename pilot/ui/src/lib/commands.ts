import { view, setRoot } from './state.svelte'
import * as ops from './tile-ops'

export type Command = {
  id: string
  name: string
  hint?: string
  keybind?: string
  run: () => void
}

function focused() {
  return view.focusedId
}

export const commands: Command[] = [
  {
    id: 'split-h',
    name: 'Split horizontal',
    keybind: 'sh',
    run: () => {
      const next = ops.split(view.root, focused(), 'horizontal')
      setRoot(next.root, next.focusId)
    },
  },
  {
    id: 'split-v',
    name: 'Split vertical',
    keybind: 'sv',
    run: () => {
      const next = ops.split(view.root, focused(), 'vertical')
      setRoot(next.root, next.focusId)
    },
  },
  {
    id: 'close',
    name: 'Close tile',
    keybind: 'w',
    run: () => {
      const next = ops.close(view.root, focused())
      if (next) setRoot(next.root, next.focusId)
    },
  },
  {
    id: 'nav-left',
    name: 'Navigate left',
    keybind: 'h',
    run: () => {
      view.focusedId = ops.navigate(view.root, focused(), 'left')
    },
  },
  {
    id: 'nav-down',
    name: 'Navigate down',
    keybind: 'j',
    run: () => {
      view.focusedId = ops.navigate(view.root, focused(), 'down')
    },
  },
  {
    id: 'nav-up',
    name: 'Navigate up',
    keybind: 'k',
    run: () => {
      view.focusedId = ops.navigate(view.root, focused(), 'up')
    },
  },
  {
    id: 'nav-right',
    name: 'Navigate right',
    keybind: 'l',
    run: () => {
      view.focusedId = ops.navigate(view.root, focused(), 'right')
    },
  },
  {
    id: 'resize-left',
    name: 'Resize left',
    keybind: 'H',
    run: () => setRoot(ops.resize(view.root, focused(), 'left')),
  },
  {
    id: 'resize-down',
    name: 'Resize down',
    keybind: 'J',
    run: () => setRoot(ops.resize(view.root, focused(), 'down')),
  },
  {
    id: 'resize-up',
    name: 'Resize up',
    keybind: 'K',
    run: () => setRoot(ops.resize(view.root, focused(), 'up')),
  },
  {
    id: 'resize-right',
    name: 'Resize right',
    keybind: 'L',
    run: () => setRoot(ops.resize(view.root, focused(), 'right')),
  },
  {
    id: 'swap',
    name: 'Swap tiles',
    keybind: 'x',
    run: () => setRoot(ops.swap(view.root, focused())),
  },
  {
    id: 'rotate',
    name: 'Rotate split',
    keybind: 'r',
    run: () => setRoot(ops.rotate(view.root, focused())),
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
    run: () => setRoot(ops.equalize(view.root)),
  },
]
