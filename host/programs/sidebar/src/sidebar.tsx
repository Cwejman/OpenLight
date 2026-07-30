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
import { useEffect, useRef, useState, type ReactNode } from 'react'
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

/** Which edges the strip's content runs past — the only reason to fade one. */
export type Fade = { top: boolean; bottom: boolean }

/** What a scrolling box's edges say about themselves. Pure; the DOM is data. */
export function edges(box: {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}): Fade {
  return {
    top: box.scrollTop > 0,
    // A sub-pixel remainder is not content below — the same slack the probe's
    // `scrollable` uses.
    bottom: box.scrollTop + box.clientHeight < box.scrollHeight - 1,
  }
}

/**
 * The strip itself: text on the canvas — no panel, no border (§Visual
 * Language). It is also the scrolling region, and it says so: the page never
 * scrolls (@openlight/react base), and the platform's overlay scrollbar takes
 * the affordance from there — on the webview's own right edge, in the lane the
 * host's bleed leaves for it.
 *
 * It has no edge to clip at, so content that runs past one dissolves instead —
 * but only at an edge it actually runs past, and only while it does. That is a
 * fact about the live box, not about the markup, so it is read from the box.
 * The fades are the webview's edges, which is where the bleed put them.
 */
export function Strip({ children, status }: { children?: ReactNode; status?: string }) {
  const region = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState<Fade>({ top: false, bottom: false })

  // No dependency list: the list's own length moves the bottom edge, so every
  // render re-reads it. The bailout is what keeps that from looping — React
  // stops when the state object comes back identical.
  useEffect(() => {
    const node = region.current
    if (!node) return
    const read = () =>
      setFade((previous) => {
        const next = edges(node)
        return previous.top === next.top && previous.bottom === next.bottom ? previous : next
      })
    read()
    node.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      node.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  })

  return (
    <div
      className="strip"
      data-scroll
      data-fade-top={fade.top}
      data-fade-bottom={fade.bottom}
      ref={region}
    >
      <style>{styles + CSS}</style>
      <div className="column">{children ?? <div className="quiet">{status}</div>}</div>
    </div>
  )
}

// Layout only — surfaces, shadows, greys, and the card-vs-flat rule are tokens
// and components in @openlight/react.
const CSS = `
  /* The strip is the whole webview: it scrolls, it fades at its own edges, and
     the platform's overlay scrollbar rides its right edge. The visible column
     is inset from it by the host's bleed (\`STRIP\` in the rim) — 14 left, 10
     top and bottom — which is the room the items' shadow and that scrollbar
     need and the column does not. Written as padding, not a bottom margin: a
     scroll container's scrollable overflow ends at the column's border box. */
  .strip { height: 100%; padding: 0 }
  .column { margin-left: 14px; width: 216px; padding: 10px 0 }

  /* The fade, per edge, and only while that edge has something past it. The
     depth is a registered property so it can be transitioned — a raw custom
     property is a string to the animation machinery, and \`mask-image\` itself
     never interpolates. At rest at the top with nothing below, no rule matches
     and the mask is absent entirely: full opacity, nothing dimmed. */
  @property --ol-fade-top { syntax: '<length>'; inherits: false; initial-value: 0px }
  @property --ol-fade-bottom { syntax: '<length>'; inherits: false; initial-value: 0px }
  .strip {
    --ol-fade-top: 0px; --ol-fade-bottom: 0px;
    transition: --ol-fade-top 150ms ease, --ol-fade-bottom 150ms ease;
  }
  .strip[data-fade-top="true"] { --ol-fade-top: var(--ol-fade) }
  .strip[data-fade-bottom="true"] { --ol-fade-bottom: var(--ol-fade) }
  .strip[data-fade-top="true"], .strip[data-fade-bottom="true"] {
    mask-image: linear-gradient(
      to bottom, transparent 0, #000 var(--ol-fade-top),
      #000 calc(100% - var(--ol-fade-bottom)), transparent 100%
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
