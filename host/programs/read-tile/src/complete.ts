// The completion half of the scope editor — deliberately shaped as the
// *program* it will become (author direction, the lens thread): take a
// string, return the scopes whose name carries it. Today it runs inside the
// read-tile and renders in-tile, because a surface raising an overlay above
// its own tile is a recorded open (host.md §What Is Open, *overlay anchor
// escalation*); when that settles, this file is the peer program's body and
// the box becomes its overlay, matched from the registry like any other
// surface whose argument fits.
//
// The match itself is the field's own reach: one whole-field FTS read (R10),
// names only, no bodies crossing the wire. This file is the pure half — the
// query built and the offer read; the one `scope` call lives with the tile
// (`search`, tile.tsx), so nothing here touches a transport.
import type { ChunkId, ScopeResult } from '@openlight/sdk'

export type Option = { id: ChunkId; name: string }

/** What the box offers: named matches, the standing dimensions dropped. */
export function options(result: ScopeResult, roots: ChunkId[], limit = 8): Option[] {
  return result.chunks
    .filter((chunk) => typeof chunk.name === 'string' && chunk.name.length > 0)
    .filter((chunk) => !roots.includes(chunk.id))
    .slice(0, limit)
    .map((chunk) => ({ id: chunk.id, name: chunk.name as string }))
}

/** Each typed term as a token prefix — `tim` finds `timing-first-paint`. */
export function ftsQuery(typed: string): string {
  return typed
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => `${term}*`)
    .join(' ')
}

/** How wide the one whole-field read casts before [`options`] narrows it. */
export const SEARCH_LIMIT = 24
