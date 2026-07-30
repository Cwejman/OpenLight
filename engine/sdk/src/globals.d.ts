// The ambient names a program's runtime installs, declared once (sdk.md,
// *Transports*; host.md, *Transport*). Types only — nothing here exists at
// runtime. `src/index.ts` references this file, so every package that imports
// @openlight/sdk inherits the declarations; no package re-declares them.

/**
 * A pre-set transport wins transport selection — how a runtime that fits
 * neither built-in pattern, and every test, reaches the surface.
 */
declare var __openlight_transport: import('./transport.ts').Transport | undefined

interface Window {
  /** wry's IPC channel under the specced name; installed by the host. */
  __wry_ipc?: { postMessage: (message: string) => void }

  /** Where the host delivers responses and events (host.md, *Transport*). */
  __sdk?: {
    resolve: (id: number, payload: unknown) => void
    event: (payload: unknown) => void
  }

  /**
   * The running process's id, stamped by the host before any page script.
   *
   * **Recorded gap.** No spec names how a webview program learns its own
   * process id — a VM program reads `process.env.PROCESS_ID` (host.md
   * §Authoring Programs), its webview counterpart has neither an op nor a
   * specced global. The host stamps it (`host/src/page.rs`); this is the name.
   */
  __openlight_process?: import('./types.ts').ChunkId
}
