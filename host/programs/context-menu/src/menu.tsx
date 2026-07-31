// `context-menu` — the system's first overlay program (host.md §Overlays). Its
// program body declares `surface: 'overlay'`, so the host mounts it as one
// transparent webview spanning the whole window, above every tile and the strip,
// and unmounts it when the process reaches its terminal state — which this
// program reaches itself, by calling `exit`.
//
// Two things are on that pane: an invisible backdrop taking every click, and the
// panel at the anchor. Both come from `@openlight/react`'s `Menu` — the markup
// is shared, the *behaviour* is this program's and nobody else's.
import { Menu, useScope } from '@openlight/react'
import { exit, type ChunkId } from '@openlight/sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actions, move, perform, request, type Entry } from './entries.ts'

export function ContextMenu({ process }: { process: ChunkId }) {
  const frame = useScope([process])
  const asked = useMemo(() => (frame ? request(frame) : null), [frame])
  const [active, setActive] = useState(-1)
  // One pick per menu. A second click while the first op is in flight would
  // spend the grant twice; the process is already on its way out.
  const settled = useRef(false)

  const leave = useCallback(async (entry?: Entry): Promise<void> => {
    if (settled.current) return
    settled.current = true
    try {
      if (entry) await perform(entry.op)
    } catch (error) {
      // The op refused — a boundary the caller did not grant, a process already
      // gone. It is said once, where a program's failures are said (the
      // webview's console), and the menu still leaves: an overlay that stayed
      // would hold the whole window hostage. **Recorded gap**: nothing specs
      // where a surface reports a refused op to the *person*.
      console.error('context-menu: the picked op did not go through', error)
    }
    await exit()
  }, [])

  // A run that was handed no readable request has nothing to show, and an
  // overlay showing nothing still eats every click — so it leaves at once.
  useEffect(() => {
    if (frame && !asked) void leave()
  }, [frame, asked, leave])

  // Arrows move, enter picks, escape dismisses — on the window, because the
  // pane is the window and the panel holds no focus of its own.
  useEffect(() => {
    if (!asked) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        void leave()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((current) => move(asked.entries, current, event.key === 'ArrowDown' ? 1 : -1))
      } else if (event.key === 'Enter') {
        const entry = asked.entries[active]
        if (!entry || entry.disabled || entry.op.kind === 'none') return
        event.preventDefault()
        void leave(entry)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [asked, active, leave])

  if (!asked) return null
  return (
    <Menu
      x={asked.anchor.x}
      y={asked.anchor.y}
      {...(asked.head === undefined ? {} : { head: asked.head })}
      actions={actions(asked.entries)}
      active={active}
      onPick={(action) => void leave(asked.entries[Number(action.id)])}
      onDismiss={() => void leave()}
    />
  )
}
