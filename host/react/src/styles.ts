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
  /* No card is outlined; a line only ever divides regions *inside* one. */
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
  /* Mirrors CARD_RADIUS in the rim: the host cuts a tile's aura to this same
     corner, and the two must be one number. */
  --ol-radius: 12px;
  --ol-radius-small: 8px;
  --ol-radius-round: 999px;

  /* Depth, and where each register is drawn — a webview is clipped to its own
     rect, so a shadow only belongs to CSS when the room it needs is inside one.

     1. An *in-flow* card — a strip item, anything laid out inside a surface —
        takes the soft shadow: centred, no light source, the same aura a tile
        has at the scale of a row. The surface it lies in owes it room.
     2. A *floating* surface — a tile — takes no shadow here at all. Its aura is
        the host's, hung on the tile webview's own CoreAnimation layer, which
        answers to no clipping rect (cast_aura in the rim). */
  --ol-shadow-soft: 0 0 10px rgba(0, 0, 0, .05);
  /* Only a surface floating *over* another one lifts further. */
  --ol-shadow-over: 0 1px 1px rgba(0, 0, 0, .08), 0 8px 24px rgba(0, 0, 0, .16);
  /* How far a surface that sits *naked* on the canvas fades its scrolled
     content at an edge. A card clips at its own rounded edge; a bare region has
     no edge to clip at, so it dissolves instead — but only at an edge content
     actually runs past, and only while it does. */
  --ol-fade: 24px;

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

/* A scrolling region says so, and says nothing else: the platform's overlay
   scrollbar owns the affordance — invisible at rest, a thumb while scrolling.
   Visual-language pin: a program never styles a scrollbar — neither the
   pseudo-elements WebKit exposes nor the standard properties. */
[data-scroll] { overflow-y: auto; overflow-x: hidden; min-height: 0 }

/* A card: white on the canvas, rounded, and nothing else. Depth is not the
   card's to draw — the host casts a tile's aura on its layer. */
[data-ui="card"] {
  background: var(--ol-surface); border-radius: var(--ol-radius);
}
/* The one in-flow card: a running process in the strip. It lies *inside* a
   surface, so its aura is CSS — the same white fill as a tile, the same corner,
   and the soft shadow at row scale. Rest falls flat — no surface, no border,
   no shadow. */
[data-ui="item"][data-live="true"] {
  background: var(--ol-surface);
  border-radius: var(--ol-radius); box-shadow: var(--ol-shadow-soft);
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
  background: var(--ol-surface);
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
