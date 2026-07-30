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
import { useScope } from '@openlight/ui'
import { useState, type ReactNode } from 'react'
import { ENGINE_PROGRAM, actions, items, sessionArgument, type Item } from './items.ts'

export function Sidebar({ process }: { process: ChunkId }) {
  const frame = useScope([process])
  if (!frame) return <Strip status="reading the frame…" />
  const session = sessionArgument(frame)
  if (!session) return <Strip status="this run carries no session argument" />
  return <Session session={session} />
}

type Menu = { item: Item; x: number; y: number }

function Session({ session }: { session: ChunkId }) {
  const members = useScope([session])
  // The programs are read for their names alone, and land on their own clock —
  // an item shows its program's id until they do, never a blank.
  const programs = useScope([ENGINE_PROGRAM])
  const [menu, setMenu] = useState<Menu | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!members) return <Strip status="reading the session…" />
  const list = items(members, programs?.chunks ?? [], session)

  return (
    <Strip>
      <ul className="items">
        {list.map((item) => (
          <li
            className={`item ${item.live ? 'card' : 'flat'}`}
            key={item.process}
            data-status={item.status}
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
          </li>
        ))}
      </ul>

      {list.length === 0 ? <div className="quiet">this session holds no processes</div> : null}

      {menu ? (
        <>
          {/* Dismissal is always available (programs.md §3.5, *with respect*). */}
          <div className="backdrop" onClick={() => setMenu(null)} />
          <div className="menu" style={{ left: menu.x, top: menu.y }}>
            <div className="menu-head">{menu.item.program}</div>
            {actions(menu.item).map((action) => (
              <button
                className="action"
                key={action.id}
                disabled={!action.enabled}
                onClick={() => {
                  setMenu(null)
                  setNotice(`${action.label} — not built yet`)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {notice ? <div className="notice">{notice}</div> : null}
    </Strip>
  )
}

/** The strip itself: text on the canvas — no panel, no border (§Visual Language). */
export function Strip({ children, status }: { children?: ReactNode; status?: string }) {
  return (
    <div className="strip">
      <style>{CSS}</style>
      {children ?? <div className="quiet">{status}</div>}
    </div>
  )
}

// host.md §Visual Language: the sidebar lives directly on the background; a
// running process is a card with the same rounding and shadow as a tile. Token
// values are an open there — these are defaults, settled by eye.
const CSS = `
  /* No \`color-scheme\` here: declaring one makes WebKit paint its own base
     colour *below* the DOM, which is opaque even when the webview is
     transparent — and the strip must be naked on the window's canvas
     (§Visual Language). The host forces the frame's light appearance. */
  html, body { margin: 0; height: 100%; background: transparent }
  * { box-sizing: border-box }
  .strip {
    position: relative; height: 100%; overflow: auto; padding: 4px 2px 12px;
    background: transparent;
    font: 13px/1.5 -apple-system, system-ui, sans-serif; color: #1d1d1f;
  }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .92em }
  .items { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px }
  .item { display: flex; flex-direction: column; gap: 1px; padding: 9px 11px; cursor: default }
  .item.card {
    background: #fff; border: 1px solid #e6e6ea; border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
  }
  .item.flat { background: transparent; color: #6e6e73; padding: 6px 11px }
  .program { font-weight: 550 }
  .name { color: #8e8e93; font-size: 11px }
  .mark { color: #9a3b3b; margin-right: 6px }
  .backdrop { position: fixed; inset: 0; z-index: 1 }
  .menu {
    position: fixed; z-index: 2; min-width: 168px; padding: 4px;
    background: #fff; border: 1px solid #e0e0e4; border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14);
  }
  .menu-head { padding: 5px 9px 6px; color: #8e8e93; font-size: 11px }
  .action {
    display: block; width: 100%; padding: 5px 9px; border: 0; border-radius: 6px;
    background: transparent; text-align: left; font: inherit; color: inherit; cursor: default;
  }
  .action:hover:enabled { background: #f4f4f7 }
  .action:disabled { color: #c4c4c8 }
  .notice { margin-top: 10px; padding: 0 11px; color: #8e8e93; font-size: 11px }
  .quiet { padding: 10px 11px; color: #a1a1a6 }
`
