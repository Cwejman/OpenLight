// `sidebar` — the session rendered as itself (host.md §Sidebar, programs.md
// §3.2). A naked surface: the host positions it as a strip directly on the
// background, outside tile geometry, so nothing here draws a panel. Life rises
// as a card, rest falls flat (host.md §Visual Language). `index.tsx` mounts it.
//
// A click raises the real context menu: `context-menu` is its own overlay
// program, run as a child of this strip with the entries and the anchor as its
// argument, and it executes the pick itself under the boundary granted here
// (board, *Next unit ruled: context menu*). The strip composes the list and
// then knows nothing more about it.
//
// Presentation is Tailwind over the tokens `@openlight/react/ol.css` maps; the
// shell links the compiled sheet, so nothing here carries CSS. The strip's own
// geometry (the bleed the host leaves it, the column's width) and its edge
// fades are the two things the rim depends on, and they are written out as
// exact lengths for that reason.
import { run, scope, type ChunkId, type ChunkItem } from '@openlight/sdk'
import { Status, StripItem, useScope, windowPoint } from '@openlight/react'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  CONTEXT_MENU,
  ENGINE_PROGRAM,
  HOST_TILE,
  analyzeTree,
  entries,
  hiddenId,
  isTile,
  items,
  mintTileIds,
  programNamed,
  sessionArgument,
  stamp,
  tabOf,
  type Item,
  type TreeInfo,
} from './items.ts'

export function Sidebar({ process }: { process: ChunkId }) {
  const frame = useScope([process])
  if (!frame) return <Strip status="reading the frame…" />
  const session = sessionArgument(frame)
  if (!session) return <Strip status="this run carries no session argument" />
  return <Session session={session} />
}

function Session({ session }: { session: ChunkId }) {
  // Session minus hidden (programs.md §3.2): the hidden marker is an exclude
  // root, derived from the session so it excludes before it exists. Hidden
  // items vanish from this read; their chunks persist — un-shown, not gone.
  const members = useScope([session], { exclude: [hiddenId(session)] })
  // The programs are read for their names alone, and land on their own clock —
  // an item shows its program's id until they do, never a blank. The menu
  // program is found in the same read, by name.
  const programs = useScope([ENGINE_PROGRAM])
  const [notice, setNotice] = useState<string | null>(null)

  // The menu is not raised *in* the strip: it is its own program on its own
  // webview spanning the window, above every surface. Two reasons it must be —
  // the strip's edge fade is a mask, and a mask paints its whole subtree, so a
  // panel within it would fade and clip at the strip's box; and the strip is
  // 216px wide, which no menu fits inside.
  //
  // The tree is walked fresh at raise time — the entries the person sees act
  // on the tab as it stands at the click, not as it stood at the last render.
  const raise = async (item: Item, event: MouseEvent<HTMLLIElement>): Promise<void> => {
    setNotice(null)
    const anchor = windowPoint(event)
    const menu = programNamed(programs?.chunks ?? [], CONTEXT_MENU)
    if (!menu) {
      setNotice('no context-menu program in this field')
      return
    }
    const hidden = hiddenId(session)
    try {
      const tree = await fetchTree(session)
      const list = entries(item, { session, tree, ids: mintTileIds() })
      await run(menu, {
        chunks: [
          {
            name: 'request',
            // The anchor is in *window* space: the overlay spans the window and
            // knows nothing of where this strip sits in it.
            body: { head: item.program, anchor, entries: list },
          },
        ],
        // A child: the menu is this strip's, and goes when the strip goes.
        mode: 'child',
        // Its whole grant, intersected with this strip's own (boot step 10
        // plus the two recorded widenings — boot.rs `spawn_strip`). Reading
        // the session is how it could show what it acts on; writing it is the
        // cancel authority *terminate* spends (engine.md, R3); `host/tile`
        // is what lets a commit *type* new tiles; the hidden marker is the
        // hide verb's target.
        readBoundary: [session, hidden],
        writeBoundary: [session, HOST_TILE, hidden],
      })
    } catch (error) {
      setNotice(`the menu did not open: ${(error as Error).message}`)
    }
  }

  if (!members) return <Strip status="reading the session…" />
  const list = items(members, programs?.chunks ?? [], session)

  return (
    <Strip>
      <ul data-part="items" className="flex flex-col gap-3">
        {list.map((item) => (
          <StripItem
            key={item.process}
            live={item.live}
            status={item.status}
            className="flex cursor-default flex-col gap-px px-[11px] py-4"
            onClick={(event) => void raise(item, event)}
          >
            {/* Two lines, one shape for every state: what a run *is* with how
                it stands, then which run it was and when it began. The state
                rides the name line so the id below it — the one thing that
                truncates — never meets the mark's dot. A live card says as
                much about itself as a dead row does. */}
            <span className="flex items-baseline gap-2 leading-tight">
              <span data-part="program" className="min-w-0 truncate font-medium">
                {item.program}
              </span>
              <Status
                part="mark"
                status={item.status}
                dot={item.failed ? 'error' : 'quiet'}
                className="ml-auto"
              />
            </span>
            <span
              data-part="process"
              className="flex items-baseline gap-2 text-small leading-tight text-ink-ghost"
            >
              <span
                data-part="name"
                data-id={item.nameIsId}
                className={item.nameIsId ? 'min-w-0 truncate font-mono' : 'min-w-0 truncate'}
              >
                {item.name}
              </span>
              {item.started === undefined ? null : (
                <span data-part="time" className="ml-auto shrink-0 font-mono tabular-nums">
                  {stamp(item.started)}
                </span>
              )}
            </span>
          </StripItem>
        ))}
      </ul>

      {list.length === 0 ? (
        <div data-part="quiet" className="px-[11px] py-5 text-ink-ghost">
          this session holds no processes
        </div>
      ) : null}

      {notice ? (
        <div data-part="notice" className="mt-5 px-[11px] text-small text-ink-faint">
          {notice}
        </div>
      ) : null}
    </Strip>
  )
}

/**
 * Walk the current tab's tile tree through scope reads: the tab is the
 * session's `host/tab`-typed member; each read of a tile's scope surfaces its
 * children with their placements. The strip's boundary reaches every tile
 * through the tab's instance chain — the archetype itself it cannot open, so
 * the walk descends rather than sweeping `host/tile`. Trees are a handful of
 * nodes; the rounds are few. Null when the session holds no tab.
 */
export async function fetchTree(session: ChunkId): Promise<TreeInfo | null> {
  const members = await scope([session])
  const tab = tabOf(members.chunks)
  if (!tab) return null
  const tiles = new Map<ChunkId, ChunkItem>()
  let frontier: ChunkId[] = [tab]
  while (frontier.length > 0) {
    const reads = await Promise.all(frontier.map((id) => scope([id])))
    const found = reads
      .flatMap((read) => read.chunks)
      .filter((chunk) => isTile(chunk) && !tiles.has(chunk.id))
    for (const chunk of found) tiles.set(chunk.id, chunk)
    frontier = found.map((chunk) => chunk.id)
  }
  return analyzeTree(tab, [...tiles.values()])
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
 * scrolls (@openlight/react's base layer), and the platform's overlay scrollbar
 * takes the affordance from there — on the webview's own right edge, in the
 * lane the host's bleed leaves for it.
 *
 * The visible column is inset from the webview by that bleed (`STRIP` in the
 * rim) — 14 left, 10 top and bottom — which is the room the items' shadow and
 * that scrollbar need and the column does not. The inset is written as padding,
 * not as a bottom margin: a scroll container's scrollable overflow ends at the
 * column's border box.
 *
 * It has no edge to clip at, so content that runs past one dissolves instead —
 * but only at an edge it actually runs past, and only while it does. That is a
 * fact about the live box, not about the markup, so it is read from the box;
 * the mask itself is the semantic layer's (`data-fade-*` in `ol.css`).
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
      data-part="strip"
      data-scroll
      data-fade-top={fade.top}
      data-fade-bottom={fade.bottom}
      className="h-full"
      ref={region}
    >
      <div data-part="column" className="ml-[14px] w-[216px] py-5">
        {children ?? (
          <div data-part="quiet" className="px-[11px] py-5 text-ink-ghost">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
