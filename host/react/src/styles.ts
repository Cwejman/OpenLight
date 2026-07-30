// The shared styling layer (board, *Author review rulings (window v0)*): no
// Tailwind — CSS custom properties for the tokens, and rules keyed on the
// semantic `data-ui` markers the components in `components.tsx` stamp. A
// program inlines this string once, then writes its own layout CSS beside it.
//
// Values are settled by eye; host.md §Visual Language rules on the *shapes*
// (rounded cards, shadow under a card, naked text on the canvas) and leaves the
// numbers open.

/** The tokens, the page base, and the semantic component rules — one string. */
export const styles = `
:root {
  --ol-canvas: transparent;
  --ol-surface: #fff;
  --ol-line: #e6e6ea;
  --ol-line-soft: #f0f0f3;
  --ol-hover: #f4f4f7;

  --ol-ink: #1d1d1f;
  --ol-ink-soft: #6e6e73;
  --ol-ink-faint: #8e8e93;
  --ol-ink-ghost: #a1a1a6;
  --ol-ink-off: #c4c4c8;
  --ol-ink-error: #9a3b3b;

  --ol-pad: 10px;
  --ol-pad-tight: 6px;
  --ol-gap: 6px;
  --ol-radius: 12px;
  --ol-radius-small: 8px;
  --ol-radius-round: 999px;

  /* One shadow under a card, wherever a card appears — a tile and a running
     process in the strip are the same shape (host.md §Visual Language). */
  --ol-shadow: 0 1px 4px rgba(0, 0, 0, .06);
  /* Only a surface floating *over* another one lifts further. */
  --ol-shadow-over: 0 6px 20px rgba(0, 0, 0, .14);
  /* The room a shadow needs to be seen. A webview is clipped to its own rect,
     so a card drawn edge-to-edge inside one casts into nothing — every card
     keeps this much canvas around it. */
  --ol-lift: 4px;

  --ol-scroll: #d2d2d7;
  --ol-scroll-live: #b9b9c0;

  --ol-font: 13px/1.55 -apple-system, system-ui, sans-serif;
  --ol-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* The page is the webview's viewport and nothing more: it never scrolls, so a
   surface can never be dragged out of its own frame. Scrolling belongs to the
   region that owns it, marked \`data-scroll\` below.

   No \`color-scheme\` anywhere: declaring one makes WebKit paint its own base
   colour *below* the DOM, which is opaque even when the webview is transparent
   — and a surface must meet the window's canvas (§Visual Language). The host
   forces the frame's light appearance. */
html, body {
  margin: 0; height: 100%; overflow: hidden; overscroll-behavior: none;
  background: var(--ol-canvas);
  font: var(--ol-font); color: var(--ol-ink);
}
/* The program mounts the body itself — the host's shell is empty. Positioned so
   a surface can pin itself to the viewport with \`inset\`; a margin would
   collapse out of the body and push the page taller than itself. */
body { position: relative }
* { box-sizing: border-box }

/* A scrolling region says so: macOS's overlay scrollbar reserves no width and
   shows nothing at rest, so content would just vanish at an invisible edge.
   The standard \`scrollbar-width\` is deliberately absent — setting it puts
   WebKit back on the overlay path (measured through the probe). */
[data-scroll] { overflow-y: auto; overflow-x: hidden; min-height: 0 }
[data-scroll]::-webkit-scrollbar { width: 9px }
[data-scroll]::-webkit-scrollbar-track { background: transparent }
[data-scroll]::-webkit-scrollbar-thumb {
  background: var(--ol-scroll); border-radius: var(--ol-radius-round);
  border: 3px solid transparent; background-clip: content-box;
}
[data-scroll]:hover::-webkit-scrollbar-thumb {
  background: var(--ol-scroll-live); background-clip: content-box;
}

/* A card, and the one form that shares its shape: a running process in the
   strip. Rest falls flat — no surface, no border, no shadow. */
[data-ui="card"],
[data-ui="item"][data-live="true"] {
  background: var(--ol-surface); border: 1px solid var(--ol-line);
  border-radius: var(--ol-radius); box-shadow: var(--ol-shadow);
}
[data-ui="item"] {
  display: flex; flex-direction: column; gap: 1px;
  padding: var(--ol-pad-tight) 11px; cursor: default;
}
[data-ui="item"][data-live="true"] { padding: 9px 11px }
[data-ui="item"][data-live="false"] { color: var(--ol-ink-soft) }

[data-ui="pill"] {
  padding: 2px 8px; border-radius: var(--ol-radius-round);
  background: var(--ol-hover); color: var(--ol-ink-soft);
  font-size: 11px; white-space: nowrap;
}

/* The menu floats over the surface that raised it; its backdrop takes the next
   click, because dismissal is always available (programs.md §3.5). */
[data-ui="backdrop"] { position: fixed; inset: 0; z-index: 1 }
[data-ui="menu"] {
  position: fixed; z-index: 2; min-width: 168px; padding: 4px;
  background: var(--ol-surface); border: 1px solid var(--ol-line);
  border-radius: var(--ol-radius-small); box-shadow: var(--ol-shadow-over);
}
[data-ui="menu-head"] { padding: 5px 9px 6px; color: var(--ol-ink-faint); font-size: 11px }
[data-ui="action"] {
  display: block; width: 100%; padding: 5px 9px; border: 0;
  border-radius: var(--ol-radius-small); background: transparent;
  text-align: left; font: inherit; color: inherit; cursor: default;
}
[data-ui="action"]:hover:enabled { background: var(--ol-hover) }
[data-ui="action"]:disabled { color: var(--ol-ink-off) }
`
