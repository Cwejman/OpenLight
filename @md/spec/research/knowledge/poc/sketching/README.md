---
under: the code
kind: brief
status: in force
---

# Sketching

## 1. A sketch draws what the text already says

The practice keeps [two uses of visuals](../practice.md#6-visuals). The artful image is found or made, and hosted or linked under its rules. A sketch is the other use: a drawing of a structure or a flow that a brief states in prose, a holarchy, the areas of a page, a chain of causes, made by a session at the moment the text needs it.

A sketch is an image like any other. It is an SVG in the `.img` folder beside the file that shows it, it opens a paragraph of its own, and the text beneath it says what it shows. It earns its place only where a reader would otherwise have to build a shape in their head from sentences, and the prose around it still reads whole without it.

*Reasoned, the author's, 2026-09-14; the practice's hypothesis of drawing from the text, taken up.*

## 2. The surface's variables win

A sketch colours by role and never by value: ink, muted and faint for text, rest and door for what stands and what leads on, on and lit for what is in focus, grey for what is out of the way, and the rest of the surface's palette beside them. Each role is written as the surface's own variable with a fallback taken from the palette's light side, `var(--ink, #141414)`.

The surface sets a sketch's markup into its page rather than showing it as an image, so the page's variables are the ones the sketch reads. The theme a reader chooses, a change to the palette, and the hue of the branch the sketch stands under all reach it, and its fallbacks are never read. Anywhere else, GitHub among them, a sketch is shown as an image, which no page can reach inside, so the fallbacks draw it light on a ground of its own, a light card on a dark page.

So nothing is kept in step. A fallback left behind by a changed palette only draws a sketch in an older light palette where the surface is not reading it. The type follows the same rule: the surface's sans in the page, the system's sans elsewhere, and every label is given room for the wider of them.

*Reasoned, the author's direction, 2026-09-14. That an SVG shown as an image sees none of its page's CSS, and that one set into the page takes the page's fonts, were seen in Chromium that day and not checked in other browsers.*

## 3. Prose decides what is drawn, and a little code keeps it exact

What a sketch shows, in which form, and in what language is prose, in the skill beneath. A model composes well from a design language held clearly, and components written before the forms are known would fix a style too early.

What prose cannot give is geometry a model cannot measure, and a sight of what it drew. A label that overflows its room, two labels on one spot, a colour written as a value that no theme can reach: these are what make a generated drawing look cheap, and none of them is a matter of taste. So the code is thin. It writes a sketch's style from the surface's palette, says how much room a label needs, checks a sketch against the language, and renders it for the session to look at.

*Reasoned, the author's, 2026-09-14. Whether prose and this much code hold a sketch at the quality the surface sets is open, and the first sketches are what measure it.*

## 4. The skill

What a session does to make a sketch: when one earns its place, the forms a sketch takes, the design language it is drawn in, and the loop from an outline to a sketch in `.img` with its text beneath.

[the level beneath](skill.md)

## 5. The code

One TypeScript file run with Bun, beside this brief, that stamps, measures, checks and looks, and what the surface does with a sketch when it reads one.

[the level beneath](implementation.md)

## 6. What this does not answer

Whether components are needed. The practice's hypothesis of a few reusable pieces in one file stays open, and is taken up only when the same composition is drawn by hand for the third time.

Whether a sketch set into the page takes the page's type and palette the same way in Safari and Firefox as in Chromium, and whether GitHub's dark theme shows the light card as intended.

What keeps a sketch true when the text it draws changes. A sketch is a second statement of what its brief says, and nothing yet notices when the two part.

*Open, 2026-09-14.*

## 7. What was tried and refused

Mermaid, which the practice refused before this: its syntax is nodes and edges, and what it draws is neither broad enough nor fine enough to stand beside the prose.

Text drawn as outlines, which would look the same everywhere. It fixes the type against the theme and the reader's choice of face, and leaves no text in the drawing, so the author refused it; a label is given enough room instead.

Dark colours carried in the sketch. There is no reader for them: a sketch is either an image, which draws light on its own ground, or set into the surface, which supplies its own.

Overriding a sketch's colours from the page with `!important`. No CSS reaches inside an image at any weight, which is why the surface sets a sketch into its page instead.

A sketch committed as a PNG. A sketch is an SVG in `.img`; a PNG is only what the session renders to look at, written somewhere scratch and never kept.

*Seen, in the author's reading of each proposal on 2026-09-14, and in the browser for the two that turn on CSS.*
