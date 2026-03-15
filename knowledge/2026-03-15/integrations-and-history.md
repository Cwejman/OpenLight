# Integrations and Atomic History

## Atomic History — The Commit Model (Settled)

- Every change is a commit. You can always browse HEAD.
- HEAD is built from the chain of commits that produced it.
- Any historical state is reconstructable.
- **Branching is a hard requirement.** Run agents on branches, review, merge to main. Exact mechanics open.
- Time navigation in the browser/CLI — open for later.

## Integrations — Built From Existing Primitives

### The Realization

Integrations do not need new primitives. The existing model — chunks with key/value pairs, instance/relates weights, dimensions, peer connection — composes to handle external references naturally.

### How It Works

**A reference is just a chunk.** It has key/value fields that make it recognizable — e.g., `{ref_service: "git", ref_path: "src/storage/index.ts"}`. The browser can recognize this as a reference from the fields. No special chunk type needed. Start open, restrict later if needed.

**Multiple chunks per reference — the reference becomes a dimension.** When a git file accumulates knowledge (API description, implementation notes, test strategy, bugs), the file reference becomes a dimension. Just like any entity that accumulates enough knowledge:
- The reference chunk has `instance` weight (1.0) on that dimension — it IS the reference.
- Other chunks describing aspects of the file have `relates` weight on that dimension.
- The reference chunk's key/value body contains whatever an agent needs to resolve it.

**Collections handle integration types.** A git file reference is an `instance` of a "git-integration" dimension. This groups all git references. The "git-integration" dimension has describing chunks — including one that is an `instance` of an "integration-contract" dimension, containing the body an agent needs to execute the resolution (the tool call pattern, the parameters, the expected response).

**Tree-like structures emerge from instance/relates.** The two weight types build hierarchy without imposing it:
```
integration-contract (dimension)
  └── git-contract (instance) — describes how to resolve git references
  └── image-contract (instance) — describes how to resolve image references

git-integration (dimension)
  └── src/storage/index.ts (instance) — the reference chunk with key/value fields
  └── src/scope/index.ts (instance) — another reference
  └── "how git integration works" (relates) — describing chunk

src-storage-index (dimension, created when knowledge accumulates)
  └── the reference chunk (instance, 1.0)
  └── "storage module API" (relates, 0.8)
  └── "performance bug in filterByScope" (relates, 0.6)
```

**Peer connection handles decoupling.** The integration aspect (git driver, media service, contracts) can be a separate peer knowledge system. The consuming system reads from it but doesn't mutate it. This is the peer model already established as a requirement.

### What The DB Stores vs What The Agent Manages

**The DB stores:**
- Chunks with key/value pairs (including reference fields)
- Weights on dimensions (with instance/relates)
- Commits (atomic history)

**The agent manages:**
- Resolving references (using the contract from the integration peer)
- Caching for lossy mediums (agent tooling, not DB concern)
- Detecting staleness (comparing external state to the commit when weights were last set)
- Re-ingesting and re-weighting when external content changes

**The DB doesn't need to know what "git" means.** It just stores chunks with fields. The meaning of those fields is in the integration contract chunks — readable by agents and humans.

### Integration Contract Pattern

An integration contract is itself knowledge in the system:
- A dimension "integration-contract" groups all contracts
- Each contract is a chunk that is an `instance` of this dimension
- The chunk's body describes: what service, how to resolve, what parameters, what to cache
- An agent reads the contract, understands how to resolve references of that type
- Standard contracts can be shared as peer knowledge systems

### What's Still Open

- **The browser recognizing references** — is it enough for the browser to look for specific key/value patterns (e.g., any chunk with `ref_service` field)? Or does it need more guidance? Probably convention is sufficient.
- **Staleness signaling** — how does the agent know a reference is ahead? Polling? Git hooks? Manual trigger? Agent-side concern, but the pattern matters.
- **Large series** (audio, video, streams) — these are a different scale. The commit chain mixing text mutations with media frames needs thought. Further out.
- **Branching mechanics** — how branches work with references. If a branch re-weights chunks against new file state, merging brings those weights to main. Straightforward conceptually, mechanics TBD.
