---
under: the code
kind: brief
status: in force
---

# Sketching

## 1. When a sketch earns its place

A sketch is drawn where a brief states a shape and a reader has to hold it in their head to go on: parts standing in a row, a holarchy, what flows into what, two things measured against each other. The test is the code's own, turned on a picture: if the understanding comes as easily from the prose alone, the sketch is wrong, and it is not drawn.

A sketch is [an image like any other](../practice.md#8-visuals) in where it stands and how it is captioned. What sets it apart is that it is drawn from the text, and drawn in [the surface's language](skill.md#3-the-design-language), so a reader meets one family in the page and in the pictures.

*Reasoned, the author's, 2026-09-14; the practice's hypothesis of drawing from the text, taken up.*

## 2. Prose decides what is drawn, and a little code keeps it exact

What a sketch shows, in which form, and in what language is prose, in the skill beneath. A model composes well from a design language held clearly, and components written before the forms are known would fix a style too early, which is why [components stay open](#6-what-this-does-not-answer).

What prose cannot give is geometry a model cannot measure, and a sight of what it drew. A label that overflows its room, two labels on one spot, a colour written as a value that no theme can reach: these are what make a generated drawing look cheap, and none of them is a matter of taste. So the code is thin, and it does only what prose cannot: it keeps the geometry exact and lets the session look.

*Reasoned, the author's, 2026-09-14. Whether prose and this much code hold a sketch at the quality the surface sets is open, and the first sketches are what measure it.*

## 3. A sketch reads the surface's palette

A sketch colours by role and never by value, so that [the branch hue](../surface/widgets.md#15-ink-is-spent-only-where-a-reader-has-asked) and the theme reach it. Each role is written as [the surface's own variable](../surface/implementation.md#64-one-palette-two-sides) with a fallback taken from the palette's light side, `var(--ink, #141414)`.

The surface [sets a sketch's markup into its page](../surface/implementation.md#363-a-sketch-is-set-into-the-page) rather than showing it as an image, so the page's variables are the ones the sketch reads: the theme a reader chooses, a change to the palette, and the hue of the branch the sketch stands under all reach it, and its fallbacks are never read.

Anywhere else, GitHub among them, a sketch is shown as an image, which no page can reach inside, so the fallbacks draw it light on a ground of its own, a light card on a dark page. Nothing has to be kept in step: a fallback left behind by a changed palette only draws a sketch in an older light palette where the surface is not reading it.

*Reasoned, the author's direction, 2026-09-14. That an SVG shown as an image sees none of its page's CSS, and that one set into the page takes the page's fonts, were seen in Chromium that day.*

### 3.1 The type follows by inheritance

A sketch names no face. Set into the page it takes the surface's sans, and shown as an image it takes the system's, so every label is given room for the wider of them.

*Reasoned, the author's direction, 2026-09-14.*

## 4. The skill

What a session does to make a sketch: when one earns its place, the forms a sketch takes, the design language it is drawn in, and the loop from an outline to a sketch in `.img` with its text beneath.

*In force, 2026-09-14.*

[the level beneath](skill.md)

## 5. The tool

One TypeScript file run with Bun, beside this brief, that writes a sketch's skeleton and stamps its style from the palette, measures a label's room, checks a sketch against the language, and renders it for the session to look at.

*In force, 2026-09-14.*

[the level beneath](implementation.md)

## 6. What this does not answer

Whether components are needed. The practice's hypothesis of a few reusable pieces in one file [gave way to this level](../practice.md#81-the-sketch), and is taken up only when the same composition is drawn by hand for the third time.

Whether a sketch set into the page takes the page's type and palette the same way in Safari and Firefox as in Chromium, and whether GitHub's dark theme shows the light card as intended.

What keeps a sketch true when the text it draws changes. A sketch is a second statement of what its brief says, and nothing yet notices when the two part.

*Open, 2026-09-14.*

## 7. What was tried and refused

A flat run, looked up when one of these is proposed again.

Mermaid, [which the practice refused](../practice.md#81-the-sketch) before this level.

Text drawn as outlines, which would look the same everywhere. It fixes the type against the theme and the reader's choice of face, and leaves no text in the drawing, so the author refused it; a label is given enough room instead.

Dark colours carried in the sketch. There is no reader for them: a sketch is either an image, which draws light on its own ground, or set into the surface, which supplies its own.

Overriding a sketch's colours from the page with `!important`. No CSS reaches inside an image at any weight, which is why the surface sets a sketch into its page instead.

A sketch committed as a PNG. A sketch is an SVG in `.img`; a PNG is only what the session renders to look at, written somewhere scratch and never kept.

*Seen, in the author's reading of each proposal on 2026-09-14, and in the browser for the two that turn on CSS.*
