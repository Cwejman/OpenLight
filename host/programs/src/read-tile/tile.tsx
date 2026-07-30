// `read` — the default lens on anything (programs.md §3.5). The component half:
// it reads its own call frame for the one required argument (the scope ids to
// view), then renders that scope by its shape. `index.tsx` mounts it.
//
// It writes nothing. The view-state chunk §3.5 grants it stays unwritten in
// v0.1: nothing here is switchable yet.
import { get, type ChunkId, type ChunkItem, type ScopeResult } from '@openlight/sdk'
import { useScope } from '@openlight/ui'
import { useEffect, useState, type ReactNode } from 'react'
import {
  argumentTarget,
  bodyEntries,
  displayName,
  infer,
  leadingText,
  shortId,
  type Member,
} from './view.ts'

type Read =
  | { status: 'pending' }
  | { status: 'ok'; chunks: (ChunkItem | null)[] }
  | { status: 'error'; message: string }

export function ReadTile({ process }: { process: ChunkId }) {
  const frame = useScope([process])
  if (!frame) return <Frame status="reading the frame…" />
  const target = argumentTarget(frame)
  if (target.length === 0) return <Frame status="this run carries no target argument" />
  return <Scope roots={target} />
}

function Scope({ roots }: { roots: ChunkId[] }) {
  const result = useScope(roots)
  const rootRead = useChunks(roots, result?.head)

  // Pin: a refused read renders quietly where the content would be — and it
  // outranks the pending state, or a boundary violation would read as loading.
  if (rootRead.status === 'error') return <Frame error={rootRead.message} />
  if (!result || rootRead.status === 'pending') return <Frame status="reading the field…" />

  const present = rootRead.chunks.filter((chunk): chunk is ChunkItem => chunk !== null)
  const dead = roots.filter((_, index) => rootRead.chunks[index] === null)
  // The engine's wire does not carry `unresolved` yet, so a root whose own read
  // came back empty counts as dead too — deduplicated when both fire.
  const seen: ScopeResult = {
    ...result,
    unresolved: [...new Set([...(result.unresolved ?? []), ...dead])],
  }
  const view = infer(roots, present, seen)
  const subject = present[0]

  return (
    <Frame>
      <header className="head">
        <div className="chips">
          {roots.map((id) => (
            <span className="chip" key={id}>
              {shortId(id, 24)}
            </span>
          ))}
        </div>
        <h1 className={subject && !subject.name ? 'mono' : undefined}>
          {subject ? displayName(subject).text : shortId(roots[0] ?? '', 24)}
        </h1>
        {subject && typeof subject.body?.text === 'string' ? (
          <p className="prose">{subject.body.text}</p>
        ) : null}
      </header>

      <div className="content" data-mode={view.mode}>
        {view.mode === 'unresolved' ? (
          <Note title="Unresolved reference">
            {view.roots.map((id) => (
              <code key={id}>{id}</code>
            ))}
          </Note>
        ) : null}
        {view.mode === 'invitation' ? (
          <Note title="Empty scope">
            {view.accepts.length > 0 ? (
              <span>
                accepts <em>{view.accepts.join(', ')}</em>
              </span>
            ) : (
              <span>accepts anything</span>
            )}
          </Note>
        ) : null}
        {view.mode === 'document' ? <Document member={view.member} /> : null}
        {view.mode === 'sequence' ? <Rows members={view.members} numbered /> : null}
        {view.mode === 'cards' ? <Rows members={view.members} /> : null}
      </div>

      <footer className="foot">
        <span>
          {result.in_scope} {result.in_scope === 1 ? 'member' : 'members'}
        </span>
        <span className="mono">{shortId(result.head, 10)}</span>
      </footer>
    </Frame>
  )
}

/** Cards and Sequence share a row: name, leading text, seq when it orders. */
function Rows({ members, numbered = false }: { members: Member[]; numbered?: boolean }) {
  return (
    <ul className="rows">
      {members.map((member) => {
        const name = displayName(member.chunk)
        const text = leadingText(member.chunk)
        return (
          <li className="row" key={member.chunk.id}>
            {numbered ? <span className="seq mono">{member.seq ?? '—'}</span> : null}
            <div className="row-body">
              <span className={name.isId ? 'name mono' : 'name'}>{name.text}</span>
              {text ? <span className="text">{text}</span> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** The one mode that distinguishes instance from relates (v0.1 pin). */
function Document({ member }: { member: Member }) {
  const name = displayName(member.chunk)
  const prose = typeof member.chunk.body?.text === 'string' ? member.chunk.body.text : null
  return (
    <article className="document">
      <h2 className={name.isId ? 'mono' : undefined}>{name.text}</h2>
      {prose ? <p className="prose">{prose}</p> : null}
      <dl className="fields">
        {bodyEntries(member.chunk).map(([key, value]) => (
          <div className="field" key={key}>
            <dt>{key}</dt>
            <dd className="mono">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="chips">
        {(member.chunk.placements ?? []).map((placement) => (
          <span className="chip" key={`${placement.type_}:${placement.scope_id}`}>
            {placement.type_ === 'instance' ? 'instance of' : 'placed on'}{' '}
            <span className="mono">{shortId(placement.scope_id, 24)}</span>
          </span>
        ))}
      </div>
    </article>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="note">
      <strong>{title}</strong>
      <div className="note-body">{children}</div>
    </div>
  )
}

/** The card the tile lives in, plus the quiet states that replace its content. */
export function Frame({
  children,
  status,
  error,
}: {
  children?: ReactNode
  status?: string
  error?: string
}) {
  return (
    <div className="tile">
      <style>{CSS}</style>
      {children ?? (
        <div className="quiet">
          {error ? <span className="error">{error}</span> : <span>{status}</span>}
        </div>
      )}
    </div>
  )
}

/**
 * A batch of single-chunk reads, re-run whenever the scope's head moves — the
 * scope op returns a root's members, never the root chunk itself. `null` is a
 * root that resolves to nothing; a rejection is a refused read.
 */
function useChunks(ids: ChunkId[], head: string | undefined): Read {
  const [state, setState] = useState<Read>({ status: 'pending' })
  const request = JSON.stringify([ids, head ?? null])

  useEffect(() => {
    const [list] = JSON.parse(request) as [ChunkId[], string | null]
    let live = true
    Promise.all(list.map((id) => get(id))).then(
      (chunks) => {
        if (live) setState({ status: 'ok', chunks })
      },
      (error: Error) => {
        if (live) setState({ status: 'error', message: error.message })
      },
    )
    return () => {
      live = false
    }
  }, [request])

  return state
}

// host.md §Visual Language: white-first, quiet, iOS-flavored rounding. The
// tokens themselves are an open there — these are defaults, settled by eye.
const CSS = `
  :root { color-scheme: light }
  html, body { margin: 0; height: 100%; background: transparent }
  * { box-sizing: border-box }
  .tile {
    height: 100%; display: flex; flex-direction: column;
    background: #fff; border: 1px solid #e6e6ea; border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden;
    font: 13px/1.55 -apple-system, system-ui, sans-serif; color: #1d1d1f;
  }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .92em }
  .head { padding: 16px 18px 12px; border-bottom: 1px solid #f0f0f3 }
  .head h1 { margin: 6px 0 0; font-size: 17px; font-weight: 600; letter-spacing: -.01em }
  .prose { margin: 4px 0 0; color: #4b4b50 }
  .chips { display: flex; flex-wrap: wrap; gap: 6px }
  .chip {
    padding: 2px 8px; border-radius: 999px; background: #f4f4f7;
    color: #6e6e73; font-size: 11px; white-space: nowrap;
  }
  .content { flex: 1; overflow: auto; padding: 8px 10px }
  .rows { margin: 0; padding: 0; list-style: none }
  .row { display: flex; gap: 10px; padding: 9px 8px; border-radius: 8px }
  .row + .row { border-top: 1px solid #f4f4f7 }
  .row:hover { background: #fafafc }
  .seq { min-width: 20px; color: #a1a1a6; text-align: right }
  .row-body { display: flex; flex-direction: column; gap: 2px; min-width: 0 }
  .name { font-weight: 550 }
  .text { color: #6e6e73; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
  .document { padding: 6px 8px }
  .document h2 { margin: 0; font-size: 14px; font-weight: 600 }
  .fields { margin: 10px 0 0; display: grid; gap: 4px }
  .field { display: grid; grid-template-columns: 120px 1fr; gap: 10px }
  .field dt { color: #8e8e93 }
  .field dd { margin: 0; overflow-wrap: anywhere }
  .document .chips { margin-top: 12px }
  .note { padding: 12px; border-radius: 8px; background: #fafafc; color: #6e6e73 }
  .note strong { display: block; color: #1d1d1f; font-weight: 600 }
  .note-body { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px }
  .note code { font-family: ui-monospace, Menlo, monospace }
  .foot {
    display: flex; justify-content: space-between; gap: 10px;
    padding: 9px 18px; border-top: 1px solid #f0f0f3; color: #8e8e93; font-size: 11px;
  }
  .quiet { flex: 1; display: grid; place-items: center; color: #a1a1a6 }
  .error { color: #9a3b3b }
`
