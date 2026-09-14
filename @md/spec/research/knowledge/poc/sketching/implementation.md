---
under: the code
kind: brief
status: in force
---

# The code

## 1. One file, run with Bun

`sketch.ts` stands beside the brief that mounts this level and is run from the proof of concept's folder:

```
bun sketching/sketch.ts new <file.svg> [--width 600] [--height 240]
bun sketching/sketch.ts stamp <file.svg>...
bun sketching/sketch.ts measure "<label>" [--size 13] [--strong]
bun sketching/sketch.ts check <file.svg>...
bun sketching/sketch.ts look <file.svg> [out.png]
```

It imports the palette from the surface's own file, so the roles a sketch reads have one home. It is laid by depth as the surface's file is, with numbered headings in its comments.

*In force, 2026-09-14.*

## 2. The palette has one home, in the surface

The surface's palette is data: every role once, its light value and its dark value, exported from `surface.ts`, and the page's style is written from it. A sketch's style is written from the same data, each role as the page's variable with the light value as its fallback, and a role that takes the branch hue falls back on a hue of its own where no page gives one.

`stamp` writes that style between markers in the sketch's own `<style>` and marks the root as a sketch, so stamping again replaces the style whole and nothing else in the file moves.

*In force, 2026-09-14.*

## 3. A label's room is measured for the widest face

A label is set in Source Sans in the surface and in the system's sans elsewhere, so `measure` gives the room for the widest of them. It holds each printable character's advance as the widest of Source Sans 3, Helvetica, Arial and the system face, at the two weights a sketch uses, and adds eight hundredths for a face wider still. A character outside the table is taken as six tenths of the size.

*Measured, in Chromium on 2026-09-14, by a canvas over each face at a thousand pixels. Helvetica and Arial ran about six percent wider than Source Sans 3 over a sentence, and Verdana, which no sketch names, about twenty-two.*

## 4. The check reads a sketch for what breaks the language

`check` reads the markup with Bun's HTML rewriter and says, per sketch: a colour written as a value, in an attribute, a style attribute or a style of its own; a label set under 11 pixels; a label whose measured room runs out of the view box or onto another label's; a sketch wider than the lane's measure; a root without a view box, a width and a height, or not marked as a sketch; a sketch never stamped; an id, which two sketches in one page would share; and any element the surface drops when it sets a sketch into its page. It follows translations only, and says where a label stands under any other transform and was not measured.

*In force, 2026-09-14; each fault was made on purpose in a sketch built to break them, and each was found.*

## 5. The look is for the session's eye

`look` renders a sketch to a PNG with resvg, at twice its size, to a scratch place unless another is named, and prints where. No page supplies the roles there, so each variable is read at its fallback, and the colours are written again in the forms the renderer reads, OKLCH as sRGB and the space-separated form with commas. The PNG is never kept.

resvg reads fewer selectors than a browser, and the style is written so it needs none of the ones it lacks: each stroke class carries its own `fill: none`, after the first look drew a frame solid black.

*In force, 2026-09-14. resvg is the arc's second dependency, in the package file it now carries of its own.*

## 6. The surface sets a sketch into its page

When the surface's trace reaches a local SVG whose root is marked as a sketch, it reads the whole file and hands the page its markup, cleaned: only the elements a drawing needs, no event attributes, no reference that leaves the file, and no style that fetches. The page sets that markup into the figure where an image would stand, with the alt text as its label, and draws it on the page's own ground, rounded and rimmed as an image is, so a sketch and an image read as one kind of thing. A remote SVG, or one not marked, is an image as before.

That is written where the surface is: [how an image is measured](../surface/implementation.md#36-an-image-is-measured).

*In force, 2026-09-14; the cleaning was tried against a sketch holding scripts, event attributes, self-closing foreign elements, external references and imports, and kept none of them.*

## 7. What is not settled yet

Whether a sketch's text should follow the reader's choice of face in the surface, as the prose does, or keep the sans the chrome and the figures keep. Whether ids should be allowed under a prefix, for markers and gradients a drawing needs. And whether the table of widths wants the faces of Windows and Linux measured too.

*Open, 2026-09-14.*
