import { error, json } from '@sveltejs/kit'
import { getDb } from '$lib/server/substrate'
import { scope } from '../../../../../ol/src/index.ts'

export function GET({ url }) {
  const raw = url.searchParams.get('ids')
  const ids = raw?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  if (ids.length === 0) error(400, 'ids required')

  const result = scope(getDb(), ids)
  if (result.scope.length === 0) error(404, `scope not found: ${ids.join(',')}`)

  return json({
    scope: result.scope.map((c) => ({ id: c.id, name: c.name, spec: c.spec, body: c.body })),
    items: result.chunks.items.map((c) => ({
      id: c.id,
      name: c.name,
      spec: c.spec,
      body: c.body,
      placements: c.placements,
    })),
  })
}
