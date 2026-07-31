// `read` — the default lens on anything (programs.md §3.5). The component half:
// it reads its own call frame for the one required argument (the scope ids to
// view), then renders that scope by its shape. `index.tsx` mounts it.
//
// It writes nothing. The view-state chunk §3.5 grants it stays unwritten in
// v0.1: nothing here is switchable yet.
//
// Presentation is Tailwind over the tokens `@openlight/react/ol.css` maps — the
// host compiles that sheet against this program's own sources and the shell
// links it, so nothing here carries CSS. Two markers survive the classes, and
// they are what the tests and the probe read: `data-ui` for a shared
// component's meaning, `data-part` for one of this surface's own regions.
import { get, type ChunkId, type ChunkItem, type ScopeResult } from '@openlight/sdk'
import { Card, Pill, Status, useScope } from '@openlight/react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  argumentTarget,
  bodyEntries,
  displayName,
  infer,
  leadingText,
  meta,
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
  const title = subject ? displayName(subject) : { text: shortId(roots[0] ?? '', 24), isId: true }

  return (
    <Frame>
      {/* Context first: the ids the scope was opened by are the breadcrumb the
          subject hangs under, so they lead — then the subject, then its prose. */}
      <header data-part="head" className="border-b border-line px-9 pt-7 pb-5">
        <div data-part="chips" className="flex flex-wrap gap-2">
          {roots.map((id) => (
            <Pill key={id}>{shortId(id, 24)}</Pill>
          ))}
        </div>
        <h1
          data-part="title"
          data-id={title.isId}
          className={
            title.isId
              ? 'mt-3 truncate font-mono text-sub font-semibold'
              : 'mt-3 truncate text-title font-semibold tracking-[-0.01em]'
          }
        >
          {title.text}
        </h1>
        {subject && typeof subject.body?.text === 'string' ? (
          <p data-part="prose" className="mt-2 text-ink-soft">
            {subject.body.text}
          </p>
        ) : null}
      </header>

      <div data-part="content" data-scroll data-mode={view.mode} className="flex-1 px-5 py-3">
        {view.mode === 'unresolved' ? (
          <Note title="Unresolved reference">
            {view.roots.map((id) => (
              <code key={id} className="font-mono">
                {id}
              </code>
            ))}
          </Note>
        ) : null}
        {view.mode === 'invitation' ? (
          <Note title="Empty scope">
            {view.accepts.length > 0 ? (
              <span>
                accepts <em className="text-ink not-italic">{view.accepts.join(', ')}</em>
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

      <footer
        data-part="foot"
        className="flex items-baseline justify-between gap-5 border-t border-line px-9 py-4 text-small text-ink-faint"
      >
        <span>
          {result.in_scope} {result.in_scope === 1 ? 'member' : 'members'}
        </span>
        <span className="font-mono">{shortId(result.head, 10)}</span>
      </footer>
    </Frame>
  )
}

/**
 * Cards and Sequence share a row, and the row is a hierarchy: the name carries
 * it, the id sits beside it at half the weight, and the state follows them
 * inline — it belongs to the member, not to the far edge of a wide tile. Only
 * the time holds that edge, and whatever prose the member has runs underneath.
 */
function Rows({ members, numbered = false }: { members: Member[]; numbered?: boolean }) {
  return (
    <ul data-part="rows" className="divide-y divide-line">
      {members.map((member) => {
        const name = displayName(member.chunk)
        const text = leadingText(member.chunk)
        const { status, time } = meta(member.chunk)
        return (
          <li
            data-part="row"
            className="flex items-baseline gap-4 rounded-soft px-4 py-3 hover:bg-hover"
            key={member.chunk.id}
          >
            {numbered ? (
              <span
                data-part="seq"
                className="w-6 shrink-0 text-right font-mono text-small tabular-nums text-ink-ghost"
              >
                {member.seq ?? '—'}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <span
                  data-part="name"
                  data-id={name.isId}
                  className={
                    name.isId
                      ? 'min-w-0 truncate font-mono font-medium'
                      : 'min-w-0 truncate font-medium'
                  }
                >
                  {name.text}
                </span>
                {name.isId ? null : (
                  <span data-part="id" className="truncate font-mono text-small text-ink-ghost">
                    {shortId(member.chunk.id, 10)}
                  </span>
                )}
                {/* Quietly: the word in the same grey as the rest of the meta,
                    and one small mark of the single accent when it is a
                    failure. A dozen failed runs should read as a list, not as
                    an alarm. */}
                {status ? (
                  <Status
                    part="status"
                    status={status}
                    dot={status === 'failed' ? 'error' : undefined}
                  />
                ) : null}
                {time ? (
                  <span
                    data-part="time"
                    className="ml-auto shrink-0 pl-4 font-mono text-small tabular-nums text-ink-ghost"
                  >
                    {time}
                  </span>
                ) : null}
              </div>
              {text ? (
                <div data-part="text" className="mt-1 truncate text-meta text-ink-soft">
                  {text}
                </div>
              ) : null}
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
    <article data-part="document" className="px-4 py-3">
      <h2
        data-part="title"
        data-id={name.isId}
        className={name.isId ? 'font-mono text-sub font-semibold' : 'text-sub font-semibold'}
      >
        {name.text}
      </h2>
      {prose ? (
        <p data-part="prose" className="mt-2 text-ink-soft">
          {prose}
        </p>
      ) : null}
      <dl data-part="fields" className="mt-5 grid gap-2">
        {bodyEntries(member.chunk).map(([key, value]) => (
          <div
            data-part="field"
            className="grid grid-cols-[104px_1fr] items-baseline gap-4"
            key={key}
          >
            <dt className="truncate text-ink-faint">{key}</dt>
            <dd className="font-mono break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <div data-part="chips" className="mt-6 flex flex-wrap gap-2">
        {(member.chunk.placements ?? []).map((placement) => (
          <Pill key={`${placement.type_}:${placement.scope_id}`}>
            {placement.type_ === 'instance' ? 'instance of' : 'placed on'}{' '}
            <span className="ml-1 font-mono">{shortId(placement.scope_id, 24)}</span>
          </Pill>
        ))}
      </div>
    </article>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-part="note" className="rounded-soft bg-hover/60 px-6 py-5 text-ink-soft">
      <strong className="block font-semibold text-ink">{title}</strong>
      <div data-part="note-body" className="mt-2 flex flex-wrap gap-3">
        {children}
      </div>
    </div>
  )
}

/**
 * The card the tile lives in, plus the quiet states that replace its content.
 * It fills the webview and never moves: the page itself does not scroll
 * (@openlight/react's base layer), so the card cannot be dragged out of its own
 * frame — only the member list inside it scrolls.
 *
 * Depth is not drawn here: a tile floats, and its aura is hung by the host on
 * this webview's own layer, because a webview clips a shadow its own card would
 * draw (author ruling, *the depth language*).
 */
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
    <Card className="absolute inset-0 flex flex-col overflow-hidden">
      {children ?? (
        <div data-part="quiet" className="grid flex-1 place-items-center text-ink-ghost">
          {error ? (
            <span data-part="error" className="text-error">
              {error}
            </span>
          ) : (
            <span>{status}</span>
          )}
        </div>
      )}
    </Card>
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
