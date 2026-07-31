// @openlight/react — the host's React helpers for webview programs (sdk.md,
// *React helpers*) and the semantic components its surfaces share (board,
// *Author review rulings (window v0)*). Richer vocabulary lands here as real
// programs demand it, not before.
//
// The styling layer is `./ol.css`, not an export: the host compiles it per
// surface and the shell links it (`ol://app/<process>/styles.css`), so no
// program inlines CSS any more.
export { useScope } from './useScope.ts'
export { origin, windowPoint, type Point } from './anchor.ts'
export { Card, Menu, Pill, Status, StripItem, type MenuAction } from './components.tsx'
