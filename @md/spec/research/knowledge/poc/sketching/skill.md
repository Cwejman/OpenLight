---
under: the code
kind: brief
status: in force
---

# The skill

## 1. A sketch draws only what the text says

Once a sketch [has earned its place](README.md#1-when-a-sketch-earns-its-place), it draws only what the text says, and says it again in the text beneath it. It is never decoration, never a second argument, and never a mood; an image for breathing space is [the artful kind](../practice.md#82-the-artful-image), found rather than drawn.

*Reasoned, the author's, 2026-09-14.*

## 2. The forms

Most sketches are one of a few forms, and the form follows the shape the prose states. A form drawn in its most general version, a flow where a row would do, costs the reader the difference.

A row is parts side by side, each with its extent and its name beneath it, for areas, layers read across, or the stages of a process that do not branch.

A tree is nesting drawn as [the surface's shape](../surface/widgets.md#3-the-shape) draws the lane: each part a short bar with its blocks beneath, shifted right by its depth, for a holarchy and anything that holds parts of its own.

A flow is causes in the order they happen, left to right, each step a name and the step between them a short line with a small open chevron, for a chain of causes and a pipeline.

A matrix is two questions asked of the same things, the things down one side and the questions across, for a comparison and a set of refusals with their reasons.

*Reasoned, the author's direction, 2026-09-14; the forms are the ones the first sketches asked for.*

## 3. The design language

A sketch is drawn in the surface's language, carried from [what every widget keeps](../surface/widgets.md#1-what-every-widget-keeps), so a reader meets one family in the page and in the pictures. This is the language's home for sketches, and the tool checks a sketch against it.

*Reasoned, the author's direction, 2026-09-14.*

### 3.1 Flat

Nothing is boxed for the sake of it, no border stands around a label, and no shadow, gradient or rounded panel holds a part; a part is its shape and its name. Where an extent has to be shown, a thin rule beneath it shows it, as the areas of the surface are named.

*Reasoned, the author's direction, 2026-09-14.*

### 3.2 Ink is spent where the fact is live

Text is ink, what supports it muted, a name that only orients faint. A part that stands is rest, the mark that leads on or names a part is door, the one thing the sketch is about is on, and what is out of the way is grey. Lit is for the one highlight a sketch may have, and most have none.

The hue is the only colour a sketch has, and it says where in the body a thing stands, by the branch it stands under, and never anything else. The roles that carry a hue, rest, door, on and lit, take the branch's, and two hues in one sketch mean two branches.

*Reasoned, the author's direction, 2026-09-14.*

### 3.3 Two sizes of text, measured for room

Text comes in two sizes and no smaller: a label at 13 pixels and a note at 11, strong only where a label names the thing the sketch is about. Room is measured before it is given, with [the tool's `measure`](implementation.md#3-a-labels-room-is-measured-for-the-widest-face), so a label fits in the widest face it may be set in.

*Reasoned, the author's direction, 2026-09-14.*

### 3.4 Space, grid and stroke

Space is even and steps down with depth: what belongs together stands close, and parts of one level stand further apart the higher the level.

A sketch is laid on a grid of four pixels, drawn at 600 wide or narrower, the lane's default measure, so its text is read at the size it is set, and as tall as it needs. Strokes are a pixel and a quarter, with round ends; corners that must be rounded take four pixels, and the ground ten.

*Reasoned, the author's direction, 2026-09-14.*

## 4. The loop

A sketch is made in the steps a brief is, [the code's rounds](../../code.md#53-the-rounds) turned on a drawing, with [the tool](implementation.md) at each step.

First an outline in a few lines, not in SVG: what the sketch shows, which form, its parts, and the sentence that will stand beneath it. If the sentence cannot be written, the sketch has nothing to say.

Then `new`, which writes the skeleton at a width and a height with the style stamped, and the drawing by hand inside it, every part coloured by a role class, `fill-rest` or `stroke-door`, and every label measured. Groups are placed with a translation and nothing else, so the check can follow them.

Then `check`, until it finds nothing, and `look`, which renders the sketch where the session can see it. The look is read as a fresh head reads a draft: what does not line up, what crowds, what reads first, and whether the eye lands where the sentence beneath says it should. The drawing is fixed and looked at again; a look that changes only a pixel ends it.

Last the sketch is shown, [as the practice shows an image](../practice.md#84-the-text-beneath-an-image): the file in the `.img` folder beside the brief, the image opening its paragraph, and the sentence beneath after a backslash. A sketch changed later is stamped again, which rewrites its style from the palette as it stands.

*Reasoned, the author's direction, 2026-09-14. The first sketch, the surface's areas, was drawn under it the same day.*
