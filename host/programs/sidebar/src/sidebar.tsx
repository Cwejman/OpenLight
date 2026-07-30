// `sidebar` — the session rendered as itself (host.md §Sidebar, programs.md
// §3.2). A naked surface: the host positions it as a strip directly on the
// background, outside tile geometry, so nothing here draws a panel. Life rises
// as a card, rest falls flat (host.md §Visual Language). `index.tsx` mounts it.
//
// v0 is the first rung, like the read-tile's: it renders and it answers a click
// with the context menu the spec names — positioned and listed. No action runs.
// Its write root (`[session]`, boot step 10) stays unused: *hide* is the first
// write, and it is not built.
import type { ChunkId } from '@openlight/sdk'
import { Menu, StripItem, styles, useScope, type MenuAction } from '@openlight/react'
import { useState, type ReactNode } from 'react'
import { ENGINE_PROGRAM, actions, items, sessionArgument, type Item } from './items.ts'

export function Sidebar({ process }: { process: ChunkId }) {
  const frame = useScope([process])
  if (!frame) return <Strip status="reading the frame…" />
  const session = sessionArgument(frame)
  if (!session) return <Strip status="this run carries no session argument" />
  return <Session session={session} />
}

type Raised = { item: Item; x: number; y: number }

function Session({ session }: { session: ChunkId }) {
  const members = useScope([session])
  // The programs are read for their names alone, and land on their own clock —
  // an item shows its program's id until they do, never a blank.
  const programs = useScope([ENGINE_PROGRAM])
  const [menu, setMenu] = useState<Raised | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!members) return <Strip status="reading the session…" />
  const list = items(members, programs?.chunks ?? [], session)

  // The menu is raised beside the strip, not inside it: the strip's edge fade is
  // a mask, and a mask paints its whole subtree — a menu within it would fade
  // and clip at the strip's box. It is `position: fixed`, so it needs no parent.
  return (
    <>
      <Strip>
        <ul className="items">
          {list.map((item) => (
            <StripItem
              key={item.process}
              live={item.live}
              status={item.status}
              onClick={(event) => {
                setNotice(null)
                setMenu({ item, x: event.clientX, y: event.clientY })
              }}
            >
              <span className="program">{item.program}</span>
              <span className={item.nameIsId ? 'name mono' : 'name'}>
                {item.failed ? <span className="mark">failed</span> : null}
                {item.name}
              </span>
            </StripItem>
          ))}
        </ul>

        {list.length === 0 ? <div className="quiet">this session holds no processes</div> : null}

        {notice ? <div className="notice">{notice}</div> : null}
      </Strip>

      {menu ? (
        <Menu
          x={menu.x}
          y={menu.y}
          head={menu.item.program}
          actions={actions(menu.item)}
          onDismiss={() => setMenu(null)}
          onPick={(action: MenuAction) => {
            setMenu(null)
            setNotice(`${action.label} — not built yet`)
          }}
        />
      ) : null}
    </>
  )
}

/**
 * The strip itself: text on the canvas — no panel, no border (§Visual
 * Language). It is also the scrolling region, and it says so: the page never
 * scrolls (@openlight/react base), and a long session gets a real scrollbar
 * instead of clipping its content at an invisible edge.
 */
export function Strip({ children, status }: { children?: ReactNode; status?: string }) {
  return (
    <div className="strip" data-scroll>
      <style>{styles + CSS}</style>
      {children ?? <div className="quiet">{status}</div>}
    </div>
  )
}

// Layout only — surfaces, shadows, greys, and the card-vs-flat rule are tokens
// and components in @openlight/react.
const CSS = `
  /* The right edge belongs to the scrollbar; items keep their own inset.

     The strip is flat on the canvas, so it must not clip: scrolled content
     dissolves at the top and bottom instead of being cut at a box edge that
     §Visual Language says is not there. The fade is a fixed mask over the
     viewport, and the vertical padding matches it — at rest the content starts
     below the fade and nothing is dimmed; only what scrolls into it goes. */
  .strip {
    height: 100%; padding: var(--ol-fade) 0 var(--ol-fade) var(--ol-lift);
    mask-image: linear-gradient(
      to bottom, transparent 0, #000 var(--ol-fade),
      #000 calc(100% - var(--ol-fade)), transparent 100%
    );
  }
  .mono { font-family: var(--ol-mono); font-size: .92em }
  .items {
    margin: 0; padding: 0; list-style: none;
    display: flex; flex-direction: column; gap: var(--ol-gap);
  }
  .program { font-weight: 550 }
  .name { color: var(--ol-ink-faint); font-size: 11px }
  .mark { color: var(--ol-ink-error); margin-right: var(--ol-gap) }
  .notice { margin-top: var(--ol-pad); padding: 0 11px; color: var(--ol-ink-faint); font-size: 11px }
  .quiet { padding: var(--ol-pad) 11px; color: var(--ol-ink-ghost) }
`
