import { resolve } from 'path'
import { bootstrap } from '../../../../engine/src/index.ts'

const DB_PATH = resolve(process.cwd(), '../project/.ol/db')

let engine: ReturnType<typeof bootstrap>

export function getDb() {
  if (!engine) {
    engine = bootstrap(DB_PATH)
  }
  return engine.db
}
