# The Agent

The claude program is the pilot's concrete agent. It runs as a program like any other — with an executable that the engine spawns, a protocol it speaks to reach the substrate, and a boundary the engine enforces. The agent is not architecturally special; it is one program among many whose work happens to be calling a large language model.

Claude calls the Anthropic API directly via the TypeScript SDK. The model is a run-time argument (or `.env` configuration), not hardcoded on the program chunk. There is no framework between the engine protocol and the API.

---

## Session Types

A session is an ordered scope that holds the trace of an interaction. The agent reads it to reconstruct context for each API call, and writes to it as things happen.

```
session
  spec: { propagate: true, ordered: true,
          accepts: ["prompt", "answer", "tool-call", "tool-result", "context"] }
  body (convention, not required): { started: ISO string }

prompt    (placed on agent, instance; placed on session, relates)
  spec: { required: ["text"] }

answer    (placed on agent, instance; placed on session, relates)

tool-call (placed on agent, instance; placed on session, relates)
  spec: { required: ["program"] }
  body also carries: tool_use_id (Anthropic API mapping), input (JSON)

tool-result (placed on agent, instance; placed on session, relates)
  spec: { required: ["program"] }

context   (placed on agent, instance; placed on session, relates)
  spec: { ordered: true }
```

Type definitions use `relates`. Content chunks on a session use dual placement — `instance` on the session (with a `seq` for ordering) and `instance` on the type archetype (for `accepts` resolution).

A `context` chunk's children are scope references placed by identity — `context` is `ordered: true` with no `accepts`, so any chunk placed on it IS a scope reference. Writing a `context` event captures exactly what the agent was reading at that turn.

---

## Context, Pinning, Scope Change

The run's `context` argument is the **pinned set** — the user (or parent agent) assembled it when invoking the claude program, and it is immutable for the life of the run. Culture first (seq 0), knowledge scopes after. The agent's process chunk cannot modify this context; it was committed before the program was spawned.

When the agent expands its reading scope mid-run — to look at a scope it wasn't initially given — it writes a new `context` event onto the session. The host assembles the knowledge layer each cycle by reading the pinned context first, then the agent's added contexts. The agent can grow its view but never remove what was pinned. Every addition is checked against the read boundary the engine enforces.

The session's `context` events are the trace — what the agent was looking at at every turn.

---

## The Agent Cycle

1. Receives its process id and engine endpoint. Calls `scope` via protocol to read its own process chunk (session, context, prompt, read-boundary, write-boundary).
2. Writes the incoming `prompt` and initial `context` onto the session via `apply` (dual placement — session membership plus type membership).
3. Each cycle: assembles the knowledge layer (pinned context plus any additions) and the session layer (the dispatch's own tool chain so far). Calls the Anthropic API.
4. On `tool_use` from the model: calls `run` via protocol with the target program and arguments. The engine creates the tool-call process, spawns it, returns the process id. The agent writes `tool-call` and `tool-result` chunks onto the session referencing the process chunk id.
5. On scope expansion: writes a `context` event to the session. The engine validates that referenced scopes are reachable from the read boundary.
6. On `end_turn`: writes an `answer` onto the session. Exits.

Every step leaves a chunk on the session. The session is the full record.

---

## Context Assembly

Two layers per API call:

- **Knowledge layer.** The agent's current scope serialized into the model's context window. Re-built from the substrate each cycle. Culture first (anchors interpretation), then project knowledge, then active scopes.
- **Session layer.** The current run's tool chain only. This grows within a run because the Anthropic API requires the tool-use/tool-result pairs to appear as message history. Previous sessions are visible only through scope in the knowledge layer; they are not replayed as message history.

Whether the knowledge layer goes into the system prompt (cacheable) or is manufactured as a synthetic message history (more natural continuity) needs empirical testing. The pilot can try both.

### Session chunk → API message mapping

| Chunk type | Becomes |
|---|---|
| `prompt` | `{ role: "user", content: body.text }` |
| `answer` | `{ role: "assistant", content: [{ type: "text", text: body.text }] }` |
| `tool-call` | `{ type: "tool_use", id: body.tool_use_id, name: body.program, input: body.input }` — grouped into an assistant message |
| `tool-result` | `{ type: "tool_result", tool_use_id: body.tool_use_id, content: body.text }` — grouped into a user message |
| `context` | Not sent — traceability metadata |

---

## Tool Specs — Substrate to Anthropic API

Tool definitions sent to the Anthropic API are derived from the substrate. No manual sync.

The agent reads the programs reachable within its read boundary and generates a tool definition for each program that declares `surface: 'none'` (tool-shaped, not view-shaped):

1. Program `name` → tool `name`
2. Program `body.text` → tool `description`
3. For each type in the program's `accepts`: read the type chunk's `spec.required` → `input_schema.required`. Read the type chunk's body for property schemas → `input_schema.properties`.

### Example

```
filesystem (instance of program)
  spec: { propagate: true, accepts: ["fs-command"] }
  body: { text: "Read and write files", executable: "./invocables/filesystem", surface: "none" }

fs-command (relates to filesystem)
  spec: { required: ["operation", "path"] }
  body: {
    text: "A filesystem operation",
    schema: {
      operation: { type: "string", enum: ["read", "write", "edit", "glob", "grep"] },
      path: { type: "string", description: "File or directory path" }
    }
  }
```

generates:

```json
{
  "name": "filesystem",
  "description": "Read and write files",
  "input_schema": {
    "type": "object",
    "properties": {
      "operation": { "type": "string", "enum": ["read", "write", "edit", "glob", "grep"] },
      "path": { "type": "string", "description": "File or directory path" }
    },
    "required": ["operation", "path"]
  }
}
```

### Translating model responses to runs

When the model returns a `tool_use`:

1. Model produces `{ id: "toolu_abc", name: "filesystem", input: { operation: "read", path: "/foo" } }`.
2. Agent looks up the `filesystem` program chunk, reads its `accepts`.
3. Agent calls `run("filesystem", { chunks: [...], readBoundary: [...], writeBoundary: [...] })` via protocol. The argument chunks are built from the model's `input` object against the program's accepted types.
4. Engine creates the tool-call process, spawns the program, computes the effective boundary as the intersection of the agent's current boundary and the target program's intrinsic boundary.
5. Agent `await`s the process id. When it completes, the agent writes `tool-call` and `tool-result` chunks on the session. Each references the process chunk id in `body.program`; the process IS the authoritative trace of what happened. `tool_use_id` is stored on the session chunks only for API message reconstruction.

---

## Sub-agents

A sub-agent is a run of the claude program from within another run of the claude program — a tool-call that happens to target `claude`. Its process is its own working scope (`ordered: true` via the program's spec). The parent's session records `tool-call` (spawn) and `tool-result` (final answer). Scoping into the child process shows its own internal session and trace. Depth limit: 3 for the pilot.

---

## Culture

Not a special type. A chunk the user creates with values, instructions, identity. Placed first in the run's `context` ordering so the model reads it first. Culture is a convention — "this is the scope I anchor my interpretation in" — not a mechanism.

---

## Knowledge Serialization

The agent (or a helper program it uses) assembles the knowledge layer by reading scopes and rendering them as markdown. Starting format:

```
# [scope-name]

[body.text of scope chunk]

## [child-name] (instance)

[body.text or structured fields]

## [child-name] (relates)

[body.text or structured fields]
```

Scope headers are section breaks. Culture scope first. Instances before relates within each scope. Chunks without `body.text` render as key-value summaries. Nested scopes indent or use deeper headings.

The exact format will refine through testing — this is the starting point, not the final form.
