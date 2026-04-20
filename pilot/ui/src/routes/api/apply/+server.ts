import { error, json } from '@sveltejs/kit'
import { getDb } from '$lib/server/substrate'
import { apply } from '../../../../../ol/src/index.ts'
import type { Declaration } from '../../../../../ol/src/index.ts'

export async function POST({ request }) {
  let decl: Declaration
  try {
    decl = await request.json()
  } catch {
    error(400, 'invalid JSON body')
  }
  try {
    const result = apply(getDb(), decl)
    return json({ commit: result.commit.id, chunks: result.chunks })
  } catch (e) {
    error(400, (e as Error).message)
  }
}
