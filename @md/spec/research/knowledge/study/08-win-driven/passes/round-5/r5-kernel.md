# R5 — Does the medium need a kernel?

*Ground read: `ontology.md` (Kernel, Engine, Substrate, Field, Boundary, Commit, Contract, Program, Citizen), `substrate.md`, `engine.md`. Nothing else in the repository was opened. Prior art was verified on the web; each source is cited where it is quoted.*

The question, in the ontology's words: "The web has no kernel: a law, and many engines that read it. If the field's law is data in the field, every engine that reads the law can judge its own acts by it, and what the pilot builds as one judging process is one engine among the many, not the centre." And the aim behind it, from the Engine entry: "none is the platform: the core is unbound, so that more people can bring their own engines, goals and ideas to the same medium."

---

## 1. What one process does today

From `engine.md`. The heading of the file sets the posture: "Nothing runs without going through the engine, and no program touches the database directly." Every duty below is performed by that one process, `ol engine`.

1. **Opens the home store and attaches others** — boots by opening `--home`, attaching every `[[attach]]` entry, then the dynamic attachments the field records; refuses to serve if any placement's `on` is unresolved ("the engine refuses to run half-loaded").
2. **Holds the attach registry** — "routes writes to owning stores, enforces declared write modes, and projects `[engine/attached]`"; rejects `READ_ONLY_ATTACH` "at commit entry, before validation".
3. **Is the one evaluator over attached stores** — "Reads, boundary evaluation and the planner run over the union of attached stores as a single evaluation; programs see one field."
4. **Serves sources** — "`ol://` resolves through the engine": the file of store *s* at path *p*, so no client knows disk paths.
5. **Creates processes** — "Starting a program writes a `process` chunk in one atomic `db.commit()`"; from then the record is "engine-domain: a running program cannot rewrite its own record".
6. **Runs the match at start** — bind, offers, count, no orphans; "Failure is `VALIDATION_ERROR`, with nothing written."
7. **Constructs the boundary** — the five sources (frame, argument, ceiling, additions, parent cap), snapshotted into `read` / `write` / `run` on the process body.
8. **Enforces the boundary on every act** — "Every read, write, subscription, and nested start passes it; filtering is uniform"; counts describe only what the boundary admits.
9. **Derives the call context** — from field data, the chain of conforming chunks up to the machine context; judges `read`, `commit` and starts under `{ anchor }`.
10. **Supplies boundaries to the db for write governance** — placement and link rules are "checked at db, inside the write transaction, against boundaries the engine supplies".
11. **Validates cross-store refs** — "the db validates locally resolvable targets only, the engine resolves the rest at commit entry".
12. **Protects records** — "rejects any program write that modifies the process chunk itself — status, result, the boundary keys — or the frozen `argument` field".
13. **Is the planner** — "Core verbs are program chunks with `runtime: native`; a chain in the single-request class lowers to one db query; programs never interpret expressions and no author writes SQL."
14. **Decides what lowers** — "Whether a verb lowers is the planner's own knowledge"; boundary admissibility is asked of the planner.
15. **Derives purity** — `write: {}` and no capabilities at definition; refuses write additions and pure-starts-impure at start.
16. **Materialises composition** — every inline expression or payload literal entering an argument "becomes a chunk at that moment".
17. **Memoises pure chains** — on `(normalized expression, boundary, commit)`; invalidation rides the reactivity dispatcher.
18. **Mediates the wire protocol** — one JSON-lines protocol; ops `read`, `read_batch`, `commit`, `run`, `await`, `cancel`, `subscribe`, `unsubscribe`; one `EngineError` vocabulary.
19. **Escalates run-to-draft** — a start beyond the caller's walls "lands as a draft" and an approver's reach becomes the cap.
20. **Owns the reactivity chain** — subscribes to each writable store's `broadcast` after `tx.commit()`, computes the touched set, fans out `place_changed`, coalesces, forwards `lagged`.
21. **Invalidates subscriptions** — re-evaluates disturbed boundaries on every commit; fires `subscription_invalid`; needs a db-level index from named dimensions to the boundaries naming them.
22. **Holds process slots** — `HashMap<ProcessId, ProcessSlot>` in memory: status watch, spawn handle, timeout, resolved config; "Slots exist only for started processes."
23. **Spawns through runtime providers** — "asks the registered runtime provider to spawn each program"; v0.1 loads `runtime-vm` and registers `native` (itself); "a HashMap of trait objects, registered at boot".
24. **Delegates containment and capability enforcement** to the provider "at spawn" (not enforced before the VM lands).
25. **Tracks lifecycle** — `running → done | failed`, timeouts (clock paused while awaiting children), cancel (idempotent), the mirror result check at completion.
26. **Cleans up on terminal** — writes status/result/error, kills the executable, drops subscriptions, "Cascade to children … kill cascades ownership", resolves awaiters, removes the slot.
27. **Reconciles at startup** — "marks every `running` process in writable attached stores `failed` with `error: 'engine restart'`"; subscriptions "vanish with the engine".
28. **Stamps traceability** — "Every commit carries a `process_id`"; projects `db/commits` as a virtual place.
29. **Holds the buffer seam** (open) — driver registry or dissolution into live integrations.
30. **Ships the SDK** — "the protocol expressed as a client library".

Two facts in the same file already strain the single-process picture: "Single host per db. Each `Db` owns its own in-process broadcast; two engine processes on one db file are not connected. Cross-engine reactivity is horizon." And under *Settled choices*, the runtime registry is closed at boot. An outside engine today is either a provider crate compiled into `ol engine`, or a client on the wire.

---

## 2. What an engine could do for itself

The test for each duty: could an engine that reads the field's law as data perform it for its own acts, with the substrate's record as the only trust? **Yes** means nothing shared beyond the store's format is needed. **Shared** means it works only if every engine links one library or the store enforces one rule. **No** means a single thing per store must do it.

| # | Duty | Verdict | Why |
|---|---|---|---|
| 1 | Open home, attach | Yes | The attach record "is one shape everywhere — the toml, the engine API, the field"; any engine can read it and open the same directories. |
| 2 | Attach registry, write routing, `READ_ONLY_ATTACH` | Shared | Routing is a function of the record; but the write mode "declared at attach, by the person, enforced by the engine" must be enforced by whatever writes, so it is a store-level rule in the write library, not a private decision. |
| 3 | One evaluator over the union | Yes | Evaluation is a read; every engine holding the same attachments evaluates the same union. Cost is duplicated, correctness is not. |
| 4 | `ol://` serving | Yes | A read of store files at a commit; any engine can serve its own clients. |
| 5 | Process creation | Yes | It is one declaration; the engine that runs the program writes it. |
| 6 | The match | Yes | `accepts` is data on the program body; the four steps read only field data. |
| 7 | Boundary construction | Yes | The five sources are field data plus the starter's additions; the formula is law. |
| 8 | Boundary enforcement on reads | Shared | An engine can filter its own reads honestly, but nothing then stops a dishonest engine reading the whole store — the file is on disk. Read walls between engines hold only if the store is opened through a library that filters, or a process that serves. |
| 9 | Call context | Yes | "The engine derives the chain from field data — cacheable". |
| 10 | Write governance at commit | Shared | Placement and link rules are substrate law; the substrate already says "Governance rides alongside" the transaction. Whoever writes must run them; a library every engine links. |
| 11 | Cross-store ref validation | Shared | Same as 10; the resolver must see the union. |
| 12 | Protected records | Shared | "A running program cannot rewrite its own record" holds because the program is not the engine. Between engines it holds only if the writer library refuses writes to another host's process chunk, or a judge does. |
| 13 | The planner | Yes | Lowering is an implementation of the language; a DSP engine need not carry it if it never evaluates expressions — but any engine that reads places needs one, so in practice this is the library. |
| 14 | What lowers | Shared | Two planners that disagree on what is single-request disagree on what may be a wall; the set must be one. |
| 15 | Purity | Yes | Derived from the body at definition and from additions at start. |
| 16 | Materialisation | Yes | Composition is the composer's commit. |
| 17 | Memoisation | Yes | Private cache keyed on a commit; invalidation needs the commit stream (see 20). |
| 18 | Wire protocol | Shared | Each engine speaks to its own clients; that they all speak one protocol is a law, not a process — like HTTP. |
| 19 | Run-to-draft | Yes | A draft is "ordinary field data"; approval is a start by someone with reach. |
| 20 | Reactivity fan-out | No | "Each `Db` owns its own in-process broadcast." An engine sees its own commits; another engine's commits reach it only through the store — a shared log tail or a notifier. |
| 21 | Subscription invalidation | No | Depends on every commit, not only one's own; needs 20. |
| 22 | Process slots | Yes | Purely in-memory per host; the substrate chunk is the durable half. |
| 23 | Runtime providers | Yes | This is what an engine *is*: its "own mechanics". The registry dissolves into the set of engines. |
| 24 | Containment | Yes | Already "the runtime provider's concern". |
| 25 | Lifecycle, timeouts, cancel | Shared | Own processes: yes. Cancelling another engine's process needs a field-carried request that the hosting engine honours; `cancel` today is "engine state rather than a reach claim". |
| 26 | Terminal cleanup, cascade | Shared | Cascade "over the engine's own process tree" cannot kill a child hosted elsewhere; it must become a status the other host watches. |
| 27 | Startup reconciliation | No, as written | Marking "every `running` process" failed is wrong under many hosts: engine A restarting must not fail engine B's live runs. The process body needs a `host`, and each engine reconciles only its own. |
| 28 | Traceability | Yes | `process_id` on the commit is the writer's own stamp; the record holds it. |
| 29 | Buffers | Yes | Already leaning to "the runtime-provider shape"; a buffer is the engine that produces it. |
| 30 | SDK | Shared | A client library of the protocol, one per protocol. |

Count: 17 yes, 10 shared, 3 no. The three *no*s are one thing seen three times: **someone must see every commit to one store, in order** — for reactivity, for invalidation, for knowing which runs are alive. The ten *shared* are also one thing: **the law must be enforced on the write path by whatever writes**, and the reach walls hold between engines only as far as that enforcement cannot be bypassed.

What the ontology's phrase "the substrate's record as the only trust" cannot supply on its own: the record says *what* was committed and *by which process id*; it does not by itself prove the writer held the boundary it claims. `engine.md` states the same dependency from the other side: "The engine requires only that `Context` arrives correct on every request; commits attribute to the context's identity." Under one process, the process vouches for `Context`. Under many, either the store's writer library vouches (and a patched library lies), or one process per store vouches, or the commit carries a signature. This is the whole of the trust question.

---

## 3. What cannot be distributed

Four things need one shared thing per store. For each: the smallest shared thing that serves, and what prior art did.

### Ordering of commits to one store

Two engines committing to one branch must agree on which commit stands on which. The substrate already gives the shape: a commit "stands on the commit before it" and "A branch is a movable pointer to a commit."

*Smallest shared thing:* **a store-level rule the format enforces** — one writer at a time on the file, and a compare-and-swap on the branch head. No process.

*Prior art.* SQLite: "With SQLite, the process that wants to access the database reads and writes directly from the database files on disk. There is no intermediary server process." Ordering comes from the file system: "An EXCLUSIVE lock is needed in order to write to the database file. Only one EXCLUSIVE lock is allowed on the file and no other locks of any kind are allowed to coexist with an EXCLUSIVE lock", and "SQLite uses POSIX advisory locks to implement locking on Unix." ([sqlite.org/serverless](https://www.sqlite.org/serverless.html), [sqlite.org/lockingv3](https://www.sqlite.org/lockingv3.html)). Git: "Git is fundamentally a content-addressable filesystem with a VCS user interface written on top of it"; objects are immutable and may be written by anyone, and only `refs` — "pointers into commit objects" — are serialised, by lock files ([Pro Git, Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)). The pilot's db is SQLite, so the substrate already has this rule beneath it; what is missing is only the engine's admission that another writer exists.

*Where a process was chosen instead:* Datomic. "The transactor queues transactions and processes them serially" ([docs.datomic.com, Transaction Processing](https://docs.datomic.com/transactions/transaction-processing.html)); "Using a Sequential CaS operation ensures a global order of transactions, and limits Datomic's write throughput to the speed of a single transactor", while "Peers connect directly to storage, and also to transactors" ([Jepsen, Datomic Pro 1.0.7075](https://jepsen.io/analyses/datomic-pro-1.0.7075)). Datomic's reason is a distributed storage layer without file locks. On a local directory, the lock is enough.

### Atomicity

"Mutations are atomic. A declaration — one or many chunks, with their placements — succeeds entirely or fails entirely … This atomicity is a property of the field itself, not of any storage layer beneath it."

*Smallest shared thing:* **a library every engine links** — the write transaction, validation inside it. SQLite gives per-store transactions to any process holding the lock; the substrate's validation ("everything declared together is recorded before any contract is checked") is code in the write path and must be the same code in every writer, or the store's contracts mean different things to different engines. Cross-store atomicity is already given up: "Commits are per-store [R]; a cross-store act is a sequence of per-store commits."

*Prior art.* SQLite again, as the library that carries atomicity without a server; and the cost it names for itself: "because a server is a single persistent process, it is able to control database access with more precision, allowing for finer-grained locking and better concurrency" ([sqlite.org/serverless](https://www.sqlite.org/serverless.html)). That cost is exactly the pilot's *Single host per db* line.

### Reactivity across engines

"Each `Db` owns its own in-process broadcast; two engine processes on one db file are not connected."

*Smallest shared thing:* **the commit log the store already keeps, tailed by every engine, plus a cheap wake-up** (a file-system watch, a socket on the store directory, or nothing but polling). The touched-set computation is a pure function of a commit and the current placements, so each engine can compute its own fan-out; what it cannot do is learn that a commit happened without either a shared channel or a poll. The pilot already accepts a weaker form of this: "The contract remains: re-fetch on event", and `lagged` says "Re-fetch to recover." Polling the log is a permanent `lagged`.

*Prior art.* Git has no reactivity at all — you `fetch`; the format is the protocol, the human is the clock. Local-first software puts the log itself at the centre: "In local-first applications we swap these roles: we treat the copy of the data on your local device — your laptop, tablet, or phone — as the primary copy. Servers still exist, but they hold secondary copies of your data in order to assist with access from multiple devices", and "CRDTs have the potential to be a foundational technology for realizing local-first software" ([Kleppmann, Wiggins, van Hardenberg, McGranaghan 2019](https://martin.kleppmann.com/papers/local-first.pdf), §2 and abstract). Distributed Erlang has no centre but does have a per-host mapper: "A distributed Erlang system consists of a number of Erlang runtime systems communicating with each other" and "The Erlang Port Mapper Daemon epmd is automatically started at every host where an Erlang node is started. It is responsible for mapping the symbolic node names to machine addresses" ([erlang.org, Distributed Erlang](https://www.erlang.org/doc/system/distributed.html)) — a tiny shared process whose only duty is that nodes can find one another; delivery is between nodes. That is the smallest process-shaped answer: not a kernel, a mapper.

### A single protocol

Every client "speaks one JSON-lines protocol", and the ops are the same regardless of who serves them.

*Smallest shared thing:* **a law, written as data** — the wire shapes and the error codes, which the ontology's Contract entry already makes field data ("whatever holds contracts holds its own law as data"). No process is the protocol.

*Prior art.* The web: "The World Wide Web (WWW, or simply Web) is an information space in which the items of interest, referred to as resources, are identified by global identifiers called Uniform Resource Identifiers (URI)", and its agents are plural by design: "Software agents include servers, proxies, spiders, browsers, and multimedia players" ([W3C, Architecture of the World Wide Web, §1](https://www.w3.org/TR/webarch/)). Plan 9 made one protocol carry everything: "First, resources are named and accessed like files in a hierarchical file system. Second, there is a standard protocol, called 9P, for accessing these resources. Third, the disjoint hierarchies provided by different services are joined together into a single private hierarchical file name space" ([Pike et al., Plan 9 from Bell Labs](https://9p.io/sys/doc/9.html)). The JVM shows a format can be the whole contract: "The Java Virtual Machine knows nothing of the Java programming language, only of a particular binary format, the `class` file format", and "any language with functionality that can be expressed in terms of a valid `class` file can be hosted by the Java Virtual Machine" ([JVMS 21, §1.2](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-1.html)). The JVM is the counter-example in the other direction, though: it *is* one process, and every language runs inside it — the shape the author is trying to avoid.

### Where the kernel word came from, and what it kept

Unix: "the system kernel occupies 90K bytes", and "The most important role of the system is to provide a file system." But the same paper draws the line that matters here: "the structure of files is controlled by the programs that use them, not by the system" ([Ritchie and Thompson, The UNIX Time-Sharing System](https://sipb.mit.edu/iap/6.828/readings/ritchie78unix.pdf)). The kernel kept the store and the ordering of access to it; meaning was the programs'. Brinch Hansen's nucleus, which the ontology already cites, is "a multi-programming system that can be extended with a hierarchy of operating systems to suit diverse requirements" ([Brinch Hansen 1970, abstract](https://dl.acm.org/doi/10.1145/362258.362278)) — the nucleus is small precisely so that the systems above it may be many. The exokernel took this to its end: an architecture that "securely multiplexes machine resources while permitting an unprecedented degree of application-specific customization of traditional operating system abstractions" ([Engler, Kaashoek, O'Toole 1995, abstract](https://pdos.csail.mit.edu/6.828/2008/readings/engler95exokernel.pdf)) — the kernel only multiplexes; every abstraction lives in a library the application chooses. That is shape (c) below, stated in 1995.

One correction to the ontology's line. "The web has no kernel" is true and incomplete: the web has no kernel *across origins*, but every origin has a server, and that server judges every write to its resources. Browsers are the many engines; the origin's server is the one judge of the origin's store. Git is the same: a local repository has no judge because it has one writer; a shared remote has `receive-pack` and its hooks, and that is the judge. The pattern in both is not "no judge" but "one judge per store, no judge above the stores." That is already the ontology's federation line: "Federation is stores attached, never kernels joined."

---

## 4. Three shapes

### (a) One kernel process — the pilot

*Gives.* One evaluator, so the union of attached stores is seen once and consistently. In-process reactivity, invalidation and memoisation off one commit stream. Trivial ordering and protected records: there is one writer and it is the judge. A single `Context` chain vouched for by the process that holds every connection. Cascade and cancel over a process tree the kernel owns. One binary to install.

*Costs.* Every substrate act of every engine crosses the wire — a DSP engine's every commit is a JSON line to another process. An engine that wants the planner, the boundary formula, or the match must ask the kernel; it cannot link them. Runtimes are "registered at boot" — another person's engine is a provider crate compiled into `ol engine`, or a client program under a runtime the kernel already has. "Two engine processes on one db file are not connected."

*Breaks.* Nothing today, because the pilot is "one author per db". It breaks at the first second engine that is not a provider crate: a music engine written in C against the store directory is invisible to the kernel's reactivity and outside its walls, and the kernel's startup reconciliation will mark that engine's live runs `failed`.

*The aim.* Binds the core. The Engine entry says "none is the platform"; under (a) the kernel is the platform and engines are its runtimes. The Kernel entry's own words: "Knowers, programs and engines reach the field only through it."

### (b) No kernel — a substrate library every engine links, and a store-level law

*Gives.* Every engine is a peer of every other; the store directory is the meeting place. Ordering by the file lock and a CAS on the branch head; atomicity by the library's transaction; validation and write governance in the library's write path, so "shape is system-enforced" stays true as long as the library is the only door. The planner, the match, the boundary formula and purity are library code, so a new engine gets the law by linking, in any language with a binding. Reactivity by tailing `db/commits` with a file watch. Duties 5–7, 9, 13–17, 19, 22–24, 28–29 become the engine's own with no change of meaning. Git-shaped: "copying this single directory elsewhere gives you nearly everything you need."

*Costs.* The read wall between engines is honour: the file is on disk, and a library that filters can be replaced by one that does not. `Boundary`'s claim "Trust is native, because the rule is the field's and not the writer's" weakens to "the rule is the field's and the writer's library keeps it." Protected records likewise. Reactivity is polling or OS-level watching, with the touched-set computed per engine. Cross-engine cancel, cascade and timeout become field conventions: a `cancel` written into the process's frame, honoured by its host. Reconciliation needs a `host` on the process body. Cache and one-evaluator work is duplicated per engine.

*Breaks.* Any store shared by parties who do not trust one another's binaries — the moment "strangers gain the probe", which `engine.md` already defers to peering. Also every duty that assumed one live view of "active": "The slot's existence is ground truth for 'active'" is false when another host holds the slot.

*The aim.* Fully unbinds. The music engine links `libsubstrate`, reads the law, commits under it. The pilot's engine is "one engine among the many". What is lost is the wall between engines that do not share a maintainer.

### (c) A thin shared judge — one small process per store that orders and records commits; all execution in engines

*Gives.* One writer per store, so ordering, atomicity, protected records and the `Context` vouch are one process again — but a small one, whose whole duty is: take a declaration, judge it under the law (validation, governance, the boundary the committer claims), append it, and tell everyone. Reads go straight to the store through the library, as Datomic's peers "connect directly to storage". Reactivity is native again: the judge has the commit stream and fans it out; invalidation and coalescing live there. Every engine links the same library as in (b) for reads, the planner, the match and boundary construction; only the write path passes through the judge. This is the exokernel's line — multiplex securely, customise everything else — and Unix's: the system keeps the file system, the programs keep the structure.

*Costs.* A process per store, to start and to keep alive; a store with no judge running is read-only, the "docker-cli-without-engine posture" the pilot already accepts for daemons. The judge is not as thin as its name: to judge a commit under a boundary it must evaluate the boundary, so it carries the single-request lowering — the planner's read-native half. It does not carry compute verbs, spawn, slots, providers, containment, serving, or the SDK's client side. Two judges on one store are two kernels on one store, so the file lock is still needed beneath the judge to make the second one refuse.

*Breaks.* Cross-store acts are still per-store commits, now to several judges. A judge that dies mid-declaration leaves the same half-state the lock already handles. Latency on the write path for an engine that would otherwise commit in-process (the DSP engine's high-cycle case — but `engine.md` already sends that to buffers, "commit-free").

*The aim.* Unbinds execution completely and binds enforcement in the one place enforcement was always going to be: at the store. The judge is replaceable by anyone who keeps the format and the law — which is what "a kernel can be replaced" in the Kernel entry already promises. "The core is unbound" holds for engines; the judge is not core, it is the store's steward.

### The three in one line

(a) is (c) with the program engine, the runtime registry, serving, slots and the SDK fused into the judge and the library door closed. (b) is (c) with the judge dissolved into the writer's library and the file lock. The pilot can build (a) as a single binary and still be (c) if the seam between judge and engine is drawn in the code — `boundary.rs`, `validate.rs`, `expressions.rs` and `stores.rs` on the judge's side; `process.rs`, `runtime.rs`, `reactivity.rs`'s consumers and the providers on the engine's.

---

## 5. The dynamic underneath

For many engines to share one medium safely, the law must be in the field, so every engine reads the same law from the same address; and every act must become a commit, so nothing an engine does is outside the trail. Then the field is the only meeting place, and no engine needs to know another exists. What is left is one dynamic: at a store, commits must stand in one order, and each must be judged under a boundary before it stands. Engines execute; the law judges; the substrate records. Whether the judging is done by every engine's own library, or by one process the store keeps, the dynamic is the same — the law governs, the engines execute under it, the trail shows what stood. So "kernel" does not name a thing the medium needs. It names a role the substrate's law plays at each store: the one point where order is given and the boundary is kept. In the pilot one process plays it, fused with an engine. The role stays; the monolith need not.

---

## 6. Recommendation

Build (c), and let the pilot's single binary be (c) with the program engine fused in, on the condition that the seam is drawn now: what judges a commit (boundary evaluation, governance, validation, the append, the fan-out) on one side, and what executes (the match at start, spawn, slots, providers, cleanup, the compute half of the planner) on the other, so the second engine can link the library and commit through the judge without the kernel being rebuilt. The Kernel entry should say: *kernel names a role, not a process — the one writer at a store that orders commits and judges each under the law; the pilot plays it in one process fused with the program engine, and any process that keeps the format and the law may play it instead; there is one per store and none above the stores, which is what "federation is stores attached, never kernels joined" already says.* The Engine entry should say: *an engine executes and hosts its own processes, reads the law by linking the substrate's library, and commits through the store's judge; its live state is its own, so it reconciles only the runs it hosts, and cross-engine cancel is a commit the host honours.* The line "the web has no kernel" should become "the web has no kernel above its origins; each origin has one judge," since that is the shape being recommended. The Boundary entry's "Trust is native, because the rule is the field's and not the writer's" holds under (c) and must be marked as resting on the judge, not on the record alone.
