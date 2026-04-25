// echo — minimal test program.
//
// Reads the `message` argument from its process scope, writes a chunk
// carrying the echoed text back into the process scope, exits. The chunk
// is placed `relates` on the process because echo's intrinsic boundary is
// 'process' — it cannot write outside its own process scope, and
// `instance` placements on the process are filtered by the composed
// `accepts` spec. Output is untyped; the reader sees body.text.
import { processId, readScope, writeApply } from '../../engine/client.ts'
import { generateId } from '../../db/src/id.ts'

const proc = await readScope([processId])
const message = proc.chunks.items.find((c) =>
  c.placements.some((p) => p.scope_id === 'message' && p.type === 'instance'),
)

const inputText = message
  ? ((message.body as Record<string, unknown>).text as string) ?? ''
  : '(no message)'

await writeApply([
  {
    id: generateId(),
    body: { text: `echo: ${inputText}` },
    placements: [{ scope_id: processId, type: 'relates' }],
  },
])

process.exit(0)
