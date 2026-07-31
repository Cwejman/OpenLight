// The ambient names the *host* installs that are this library's concern
// (`host/src/page.rs`). The SDK declares its own (`@openlight/sdk`'s
// `globals.d.ts`); nothing is re-declared here. Types only — nothing at runtime.

interface Window {
  /**
   * Where this webview's own top-left sits in the window, in logical pixels.
   *
   * A page's client coordinates start at its webview's origin, and nothing in
   * the page can learn that origin. A surface raising an overlay must name its
   * anchor in *window* space, because the overlay spans the window — so the host
   * stamps this and `windowPoint` does the addition.
   *
   * **Recorded gap.** host.md §Overlays rules on an overlay's anchor *scope*,
   * not on the coordinate space it is positioned in.
   */
  __openlight_origin?: { x: number; y: number }
}
