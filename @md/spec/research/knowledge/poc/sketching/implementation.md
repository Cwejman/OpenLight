---
under: the code
kind: brief
status: in force
---

# The tool

## 1. One file, run with Bun

[`sketch.ts`](sketch.ts) is one file in this folder, run with Bun from the proof of concept's folder, so a session needs nothing installed beyond what the arc's package file names. It has five commands:

```
bun sketching/sketch.ts new <file.svg> [--width 600] [--height 240]
bun sketching/sketch.ts stamp <file.svg>...
bun sketching/sketch.ts measure "<label>" [--size 13] [--strong]
bun sketching/sketch.ts check <file.svg>...
bun sketching/sketch.ts look <file.svg> [out.png]
```

It imports the palette from [the surface's file](../surface/implementation.md#7-one-file-laid-by-the-gradient), so the roles a sketch reads have one home, and it is laid by depth as that file is, with numbered headings in its comments.

*In force, 2026-09-14.*

## 2. A skeleton is written, and its style stamped from the surface's palette

[The surface's palette](../surface/implementation.md#64-one-palette-two-sides) is data, every role once with its light and its dark value, and a sketch's style is written from the same data, [as the entry says](README.md#3-a-sketch-reads-the-surfaces-palette). The roles that carry the branch hue, rest, door, on and lit, fall back on a hue of their own where no page gives one.

`new` writes a skeleton at a width and a height, with a view box, the root marked as a sketch, and the style already stamped. `stamp` writes that style between markers in the sketch's own `<style>` and marks the root as a sketch, so stamping again replaces the style whole and nothing else in the file moves.

*In force, 2026-09-14.*

## 3. A label's room is measured for the widest face

A label is set in the surface's sans, Source Sans, in the page and in the system's sans elsewhere, so `measure` gives the room for the widest of them.

It holds each printable character's advance as the widest of Source Sans 3, Helvetica, Arial and the system face, at the two weights a sketch uses, and adds eight hundredths for a face wider still. A character outside the table is taken as six tenths of the size.

*Measured, in Chromium on 2026-09-14, by a canvas over each face at a thousand pixels; Helvetica and Arial ran about six percent wider than Source Sans 3 over a sentence.*

## 4. The check reads a sketch for what breaks the language

`check` reads the markup with Bun's HTML rewriter and says, per sketch, what breaks [the language](skill.md#3-the-design-language), so a fault is found before a look is spent on it.

It lists a colour written as a value, in an attribute, a style attribute or a style of its own. A label set under the note size the language gives. A label whose measured room runs out of the view box or onto another label's. A sketch wider than the language allows. A root without a view box, a width and a height, or not marked as a sketch, and a sketch never stamped. An id, which two sketches in one page would share. And any element the surface drops when it sets a sketch into its page.

It follows translations only, and says where a label stands under any other transform and was not measured.

*In force, 2026-09-14; each fault was made on purpose in a sketch built to break them, and each was found.*

## 5. The look is for the session's eye

`look` renders a sketch to a PNG with resvg, at twice its size, to a scratch place unless another is named, and prints where. No page supplies the roles there, so each variable is read at its fallback.

resvg reads fewer colour forms and fewer selectors than a browser. So before rendering, every OKLCH colour is written as sRGB and every space-separated colour as the comma form, and the style is written so it needs none of the selectors resvg lacks: each stroke class carries its own `fill: none`, after the first look drew a frame solid black.

*In force, 2026-09-14. resvg is the arc's second dependency, in the package file it now carries of its own.*

## 6. The surface sets a sketch into its page

What the surface does with a sketch is written where the surface is: [a sketch is set into the page](../surface/implementation.md#363-a-sketch-is-set-into-the-page), its markup cleaned, with the alt text as its label, on the page's own ground. This tool only marks the root so the surface knows a sketch when it reaches one.

*In force, 2026-09-14.*

## 7. What is not settled yet

Whether a sketch's text should follow the reader's choice of face in the surface, as the prose does, or keep the sans the chrome and the figures keep. Whether ids should be allowed under a prefix, for markers and gradients a drawing needs. And whether the table of widths wants the faces of Windows and Linux measured too.

*Open, 2026-09-14.*
