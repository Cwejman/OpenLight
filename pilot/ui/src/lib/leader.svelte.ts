import { view, openPalette, closePalette } from './state.svelte'
import { commands } from './commands'

const CHORD_TIMEOUT_MS = 250

export const chord = $state({ active: false, buffer: '' })
let timeoutHandle: ReturnType<typeof setTimeout> | null = null

function inTextInput(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

function clearChordTimeout() {
  if (timeoutHandle !== null) {
    clearTimeout(timeoutHandle)
    timeoutHandle = null
  }
}

function resetChord() {
  chord.active = false
  chord.buffer = ''
  clearChordTimeout()
}

function scheduleReveal() {
  clearChordTimeout()
  timeoutHandle = setTimeout(() => {
    openPalette(chord.buffer, true)
    resetChord()
  }, CHORD_TIMEOUT_MS)
}

function enterChord() {
  chord.active = true
  chord.buffer = ''
  scheduleReveal()
}

export function handleKey(e: KeyboardEvent) {
  // Cmd/Ctrl+K — instant palette toggle.
  if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    if (view.paletteOpen) {
      closePalette()
    } else {
      openPalette()
    }
    resetChord()
    return
  }

  // Escape — close palette or cancel chord.
  if (e.key === 'Escape') {
    if (view.paletteOpen) closePalette()
    if (chord.active) resetChord()
    return
  }

  if (view.paletteOpen) return

  // Space — enter chord mode (unless user is typing).
  if (!chord.active && e.key === ' ' && !inTextInput()) {
    e.preventDefault()
    enterChord()
    return
  }

  if (!chord.active) return

  // Inside chord mode. Ignore pure modifier presses.
  if (e.key === 'Shift' || e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt') return

  e.preventDefault()

  // Explicit search: second Space opens the palette.
  if (e.key === ' ') {
    resetChord()
    openPalette()
    return
  }

  chord.buffer += e.key

  const exact = commands.find((c) => c.keybind === chord.buffer)
  if (exact) {
    resetChord()
    exact.run()
    return
  }

  const hasPrefix = commands.some((c) => c.keybind?.startsWith(chord.buffer))
  if (hasPrefix) {
    scheduleReveal()
    return
  }

  // Unknown chord — cancel.
  resetChord()
}
