import { mkdirSync } from 'fs'
import { open, apply, scope } from './db/src/index'
import type { Declaration } from './db/src/index'

mkdirSync('project/.ol', { recursive: true })

const db = open('project/.ol/db')

// ═══ Commit 1: Engine — runtime contracts ═══
// Program archetype, process archetype, and the boundary types. In a peered
// system these come from the engine's own database, mounted into the project.

const engine: Declaration = {
  chunks: [
    { id: 'engine', name: 'engine', body: { text: 'Runtime contracts and primitives' } },

    {
      id: 'program',
      name: 'program',
      spec: { required: ['executable'] },
      body: { text: 'A chunk with an executable; instances are runnable programs' },
      placements: [{ scope_id: 'engine', type: 'instance' }],
    },

    {
      id: 'process',
      name: 'process',
      spec: { propagate: true },
      body: { text: 'The artifact of a program run' },
      placements: [{ scope_id: 'engine', type: 'instance' }],
    },

    {
      id: 'read-boundary',
      name: 'read-boundary',
      body: { text: 'Scopes a process is permitted to read' },
      placements: [
        { scope_id: 'engine', type: 'instance' },
        { scope_id: 'process', type: 'relates' },
      ],
    },
    {
      id: 'write-boundary',
      name: 'write-boundary',
      body: { text: 'Scopes a process is permitted to write to' },
      placements: [
        { scope_id: 'engine', type: 'instance' },
        { scope_id: 'process', type: 'relates' },
      ],
    },
  ],
}

// ═══ Commit 2: UI — composition primitives ═══
// Session, tab, tile, overlay, recipe. In a peered system these come from
// the host module's own database, mounted into the project.

const ui: Declaration = {
  chunks: [
    { id: 'ui', name: 'ui', body: { text: 'Interface composition primitives' } },

    // The UI session shares the human-readable name 'session' with the
    // agent's session archetype; chunk IDs must be globally unique, so the
    // UI session takes a prefixed ID. `accepts` resolves names within the
    // parent scope, so the duplicate name doesn't conflict at lookup time.
    {
      id: 'ui-session',
      name: 'session',
      spec: { propagate: true, accepts: ['tab', 'process'] },
      body: { text: 'The outer container of a host UI session' },
      placements: [{ scope_id: 'ui', type: 'instance' }],
    },
    {
      id: 'tab',
      name: 'tab',
      spec: { propagate: true, accepts: ['tile'] },
      body: { text: 'Root of a tile tree (workspaces are tabs)' },
      placements: [
        { scope_id: 'ui', type: 'instance' },
        { scope_id: 'ui-session', type: 'relates' },
      ],
    },
    {
      id: 'tile',
      name: 'tile',
      spec: { ordered: true },
      body: { text: 'Split-tree node; leaves point at a process via relates' },
      placements: [
        { scope_id: 'ui', type: 'instance' },
        { scope_id: 'tab', type: 'relates' },
      ],
    },
    {
      id: 'overlay',
      name: 'overlay',
      body: { text: 'A program rendered above its anchor (session, tab, or tile)' },
      placements: [{ scope_id: 'ui', type: 'instance' }],
    },
    {
      id: 'recipe',
      name: 'recipe',
      spec: { propagate: true, accepts: ['tile'] },
      body: { text: 'A preserved tile subtree that can be spawned at any root' },
      placements: [{ scope_id: 'ui', type: 'instance' }],
    },
  ],
}

// ═══ Commit 3: Agent — the project's own work ═══
// Session types and concrete programs. References engine contracts across
// the peer boundary by placing instances on `program`.

const agent: Declaration = {
  chunks: [
    { id: 'agent', name: 'agent', body: { text: 'Project tools and abstractions' } },

    // Session types
    {
      id: 'session',
      name: 'session',
      spec: {
        propagate: true,
        ordered: true,
        accepts: ['prompt', 'answer', 'tool-call', 'tool-result', 'context'],
      },
      body: { text: 'A sequence of agent interaction events' },
      placements: [{ scope_id: 'agent', type: 'instance' }],
    },
    {
      id: 'prompt',
      name: 'prompt',
      spec: { required: ['text'] },
      body: { text: 'A user message to an agent' },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'session', type: 'relates' },
      ],
    },
    {
      id: 'answer',
      name: 'answer',
      body: { text: 'An agent response' },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'session', type: 'relates' },
      ],
    },
    {
      id: 'tool-call',
      name: 'tool-call',
      spec: { required: ['program'] },
      body: { text: 'An agent invoking a tool' },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'session', type: 'relates' },
      ],
    },
    {
      id: 'tool-result',
      name: 'tool-result',
      spec: { required: ['program'] },
      body: { text: 'The result of a tool invocation' },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'session', type: 'relates' },
      ],
    },
    {
      id: 'context',
      name: 'context',
      spec: { ordered: true },
      body: { text: 'The knowledge context for a turn' },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'session', type: 'relates' },
      ],
    },

    // Programs — instances of the engine's `program` archetype.
    // Tool programs: surface 'none' (headless), narrow intrinsic boundary.
    {
      id: 'filesystem',
      name: 'filesystem',
      spec: { propagate: true, accepts: ['fs-command'] },
      body: {
        text: 'Read and write files',
        executable: './programs/filesystem',
        surface: 'none',
        boundary: 'process',
        timeout_ms: 30000,
      },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'program', type: 'instance' },
      ],
    },
    {
      id: 'fs-command',
      name: 'fs-command',
      spec: { required: ['operation', 'path'] },
      body: {
        text: 'A filesystem operation',
        schema: {
          operation: { type: 'string', enum: ['read', 'write', 'edit', 'glob', 'grep'] },
          path: { type: 'string', description: 'File or directory path' },
        },
      },
      placements: [{ scope_id: 'filesystem', type: 'relates' }],
    },

    {
      id: 'shell',
      name: 'shell',
      spec: { propagate: true, accepts: ['shell-command'] },
      body: {
        text: 'Execute shell commands',
        executable: './programs/shell',
        surface: 'none',
        boundary: 'process',
        timeout_ms: 30000,
      },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'program', type: 'instance' },
      ],
    },
    {
      id: 'shell-command',
      name: 'shell-command',
      spec: { required: ['command'] },
      body: {
        text: 'A shell command',
        schema: {
          command: { type: 'string', description: 'Shell command to execute' },
        },
      },
      placements: [{ scope_id: 'shell', type: 'relates' }],
    },

    {
      id: 'web',
      name: 'web',
      spec: { propagate: true, accepts: ['web-request'] },
      body: {
        text: 'Make HTTP requests',
        executable: './programs/web',
        surface: 'none',
        boundary: 'process',
        timeout_ms: 30000,
      },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'program', type: 'instance' },
      ],
    },
    {
      id: 'web-request',
      name: 'web-request',
      spec: { required: ['url'] },
      body: {
        text: 'An HTTP request',
        schema: {
          url: { type: 'string', description: 'URL to fetch' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        },
      },
      placements: [{ scope_id: 'web', type: 'relates' }],
    },

    // Agent program — wide intrinsic boundary (defers to the run).
    {
      id: 'claude',
      name: 'claude',
      spec: { propagate: true, accepts: ['session', 'context', 'prompt'] },
      body: {
        text: 'Claude agent',
        executable: './programs/claude',
        surface: 'none',
        boundary: 'open',
        timeout_ms: 300000,
      },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'program', type: 'instance' },
      ],
    },
    // Claude's accepted type refs — placed `relates` on claude so they
    // resolve in `accepts` name lookups within claude's scope.
    { id: 'session', placements: [{ scope_id: 'claude', type: 'relates' }] },
    { id: 'context', placements: [{ scope_id: 'claude', type: 'relates' }] },
    { id: 'prompt', placements: [{ scope_id: 'claude', type: 'relates' }] },

    // echo — minimal test program; echoes its input back as an answer.
    {
      id: 'echo',
      name: 'echo',
      spec: { propagate: true, accepts: ['message'] },
      body: {
        text: 'Echoes the input message back as an answer',
        executable: './programs/echo.ts',
        surface: 'none',
        boundary: 'process',
        timeout_ms: 30000,
      },
      placements: [
        { scope_id: 'agent', type: 'instance' },
        { scope_id: 'program', type: 'instance' },
      ],
    },
    {
      id: 'message',
      name: 'message',
      spec: { required: ['text'] },
      body: { text: 'A text message' },
      placements: [{ scope_id: 'echo', type: 'relates' }],
    },
  ],
}

// Three commits — simulating three peers
const r1 = apply(db, engine)
console.log(`engine:  ${r1.chunks.filter((c) => c.created).length} chunks, commit ${r1.commit.id}`)

const r2 = apply(db, ui)
console.log(`ui:      ${r2.chunks.filter((c) => c.created).length} chunks, commit ${r2.commit.id}`)

const r3 = apply(db, agent)
console.log(`agent:   ${r3.chunks.filter((c) => c.created).length} chunks, commit ${r3.commit.id}`)

// Verify
console.log()
for (const root of ['engine', 'agent', 'ui']) {
  const s = scope(db, [root])
  console.log(`${root}: ${s.chunks.instance} instance, ${s.chunks.relates} relates`)
  s.chunks.items.forEach((c) => {
    const other = c.placements
      .filter((p) => p.scope_id !== root)
      .map((p) => `${p.type} on ${p.scope_id}`)
    const info = other.length ? `  (${other.join(', ')})` : ''
    console.log(`  ${c.name ?? c.id}${info}`)
  })
  console.log()
}
