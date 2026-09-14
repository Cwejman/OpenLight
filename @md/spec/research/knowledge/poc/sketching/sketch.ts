// sketch.ts — the thin code beneath the sketching skill: what prose cannot give a session drawing an SVG.
//
// # 1. What it is and how it is run
//
// A model composes a sketch well from a design language held clearly, and badly
// where it has to measure: a label that overflows its room, two that collide, a
// colour written as a value that no theme can reach. This file does only that
// part. It writes a sketch's style from the surface's own palette, tells how much
// room a label needs, checks a sketch against the language, and renders one for
// the session's own eye. What is drawn, and how, stays in the skill.
//
//   bun sketch.ts new <file.svg> [--width 600] [--height 240]   a skeleton, stamped
//   bun sketch.ts stamp <file.svg>...                            write the roles into each sketch's style
//   bun sketch.ts measure "<label>" [--size 13] [--strong]       the room a label needs, in pixels
//   bun sketch.ts check <file.svg>...                            where a sketch breaks the language
//   bun sketch.ts look <file.svg> [out.png]                      a PNG for the session to look at, never committed
//
// A sketch colours by role and never by value. Each role reads the surface's
// variable, with the light side of the surface's palette as its fallback. Set
// into the surface's page, the page's variables win, so the theme, the palette
// and the branch hue all reach it. Shown as an image anywhere else, nothing
// reaches inside, and the fallbacks draw it light on a ground of its own.

import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { PALETTE, SKETCH_ELEMENTS } from "../surface/surface.ts";

// ## 1.1 The run

async function run(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  const option = (name: string, fallback: number) => (args.includes(name) ? Number(args[args.indexOf(name) + 1]) : fallback);
  const files = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (command === "new" && files[0]) return void writeFileSync(files[0], stamp(skeleton(option("--width", MEASURE), option("--height", 240))));
  if (command === "stamp") return files.forEach((f) => writeFileSync(f, stamp(readFileSync(f, "utf8"))));
  if (command === "measure" && files[0]) return void console.log(Math.ceil(roomFor(files[0], option("--size", SIZE.label), args.includes("--strong"))));
  if (command === "check") {
    const faults = files.flatMap((f) => check(readFileSync(f, "utf8")).map((w) => `${f}: ${w}`));
    faults.forEach((w) => console.log("  " + w));
    console.log(`${files.length} sketch${files.length === 1 ? "" : "es"} checked, ${faults.length} fault${faults.length === 1 ? "" : "s"}`);
    if (faults.length) process.exitCode = 1;
    return;
  }
  if (command === "look" && files[0]) return look(files[0], files[1] ?? join(tmpdir(), `sketch-${basename(files[0], ".svg")}.png`));
  console.error("usage: bun sketch.ts new <file.svg> | stamp <file.svg>... | measure <label> | check <file.svg>... | look <file.svg> [out.png]");
  process.exitCode = 2;
}

// # 2. The style
//
// Every role of the surface's palette becomes two classes, one to fill and one
// to stroke, and text takes the chrome's two sizes. The style is written between
// markers in the sketch's own <style>, so stamping again replaces it whole.

/** The lane's measure: a sketch wider than this is scaled down in the lane, and its text with it. */
const MEASURE = 600;

/** The two sizes of a sketch's text: a label, and a note beneath or beside one, the chrome's small size and the least a reader is asked to read. */
const SIZE = { label: 13, note: 11 };

/** The hue a hued role takes where no page gives the branch's own. */
const HUE = 60;

const FACE = `"Source Sans 3", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`;

/** A role as a sketch reads it: the page's variable, or the light side of the palette. */
const role = (name: string): string => `var(--${name}, ${PALETTE[name][0].replace("var(--h)", `var(--h, ${HUE})`)})`;

/** The sketch's style: the face and sizes, then a stroke class and a fill class per role, fills last so a shape may carry both. */
const style = (): string =>
  [
    `svg.sketch { font-family: var(--sans, ${FACE}); font-size: ${SIZE.label}px; }`,
    `svg.sketch text { fill: ${role("ink")}; font-weight: calc(400 - var(--thin, 0)); }`,
    `svg.sketch .note { font-size: ${SIZE.note}px; }`,
    `svg.sketch .strong { font-weight: calc(600 - var(--thin, 0)); }`,
    `svg.sketch .ground { fill: ${role("ground")}; }`,
    // each stroke class says all it needs, since a renderer may not read an attribute selector
    ...Object.keys(PALETTE).map((r) => `svg.sketch .stroke-${r} { stroke: ${role(r)}; fill: none; stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; }`),
    ...Object.keys(PALETTE).map((r) => `svg.sketch .fill-${r} { fill: ${role(r)}; }`),
  ].join("\n");

/** A sketch's skeleton: the root at a width and a height, and a ground that is a light card wherever no page stands behind it. */
const skeleton = (w: number, h: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" class="sketch" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n<rect class="ground" width="${w}" height="${h}" rx="10"/>\n</svg>\n`;

const STYLE = /<style id="sketch">[\s\S]*?<\/style>\n?/;

/** A sketch with its style written again from the palette as it stands, and its root marked as a sketch. */
function stamp(src: string): string {
  const tag = /<svg\b[^>]*>/i.exec(src);
  if (!tag) throw new Error("no <svg> root to stamp");
  const marked = /\sclass\s*=\s*["'][^"']*\bsketch\b/i.test(tag[0])
    ? tag[0]
    : /\sclass\s*=\s*["']/i.test(tag[0])
      ? tag[0].replace(/(\sclass\s*=\s*["'])/i, "$1sketch ")
      : tag[0].replace(/^<svg\b/i, '<svg class="sketch"');
  const rest = src.slice(tag.index + tag[0].length).replace(STYLE, "").replace(/^\n/, "");
  return `${src.slice(0, tag.index)}${marked}\n<style id="sketch">\n${style()}\n</style>\n${rest}`;
}

// # 3. The room a label needs
//
// A label is set in Source Sans in the surface and in whatever sans the system
// has elsewhere, so its room is measured for the widest of them. The widths are
// each printable character's advance, in thousandths of the size, taken as the
// widest of Source Sans 3, Helvetica, Arial and the system face, measured in the
// browser on 2026-09-14. Slack covers a face wider still.

const WIDTHS: Record<"400" | "600", number[]> = {
  "400": [278, 333, 426, 556, 556, 889, 778, 249, 333, 333, 500, 584, 278, 333, 278, 350, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 722, 667, 722, 722, 667, 611, 778, 722, 333, 500, 722, 611, 889, 722, 778, 667, 778, 722, 667, 611, 722, 722, 944, 722, 722, 611, 333, 350, 333, 497, 556, 542, 556, 556, 500, 556, 556, 333, 556, 556, 278, 278, 500, 278, 833, 556, 556, 556, 556, 347, 500, 338, 556, 500, 722, 500, 500, 500, 480, 260, 480, 584],
  "600": [278, 333, 555, 556, 556, 1000, 833, 278, 333, 333, 500, 584, 278, 333, 278, 344, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 778, 389, 556, 778, 667, 944, 722, 778, 667, 778, 722, 667, 667, 722, 722, 1000, 722, 722, 667, 333, 344, 333, 584, 556, 549, 556, 611, 556, 611, 556, 333, 611, 611, 278, 333, 556, 278, 889, 611, 611, 611, 611, 444, 556, 361, 611, 556, 778, 556, 556, 500, 394, 280, 394, 584],
};
const SLACK = 1.08;

/** The width a label needs at a size, in pixels, for the widest face it may be set in. */
const roomFor = (text: string, size: number, strong: boolean): number =>
  (Array.from(text).reduce((w, ch) => w + (WIDTHS[strong ? "600" : "400"][ch.charCodeAt(0) - 32] ?? 600), 0) / 1000) * size * SLACK;

// # 4. The check
//
// A sketch is read for what breaks the language: a colour written as a value, a
// label too small to read, a label out of the sketch or on top of another, a
// sketch wider than the lane, an id two sketches in one page could share, and
// anything the surface would drop when it sets the sketch into the page. Only
// translations are followed; a label under any other transform is not measured,
// and the check says so.

type Label = { text: string; x: number; y: number; size: number; strong: boolean; anchor: string; lost: boolean };
type Frame = { dx: number; dy: number; lost: boolean; size: number; strong: boolean; anchor: string };

const COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i;
const entities = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

function check(src: string): string[] {
  const faults: string[] = [];
  const labels: Label[] = [];
  const frames: Frame[] = [{ dx: 0, dy: 0, lost: false, size: SIZE.label, strong: false, anchor: "start" }];
  let box: number[] = [];
  let root = true;
  let label: Label | null = null;
  let inStyle: "sketch" | "other" | null = null;

  const frameOf = (el: HTMLRewriterTypes.Element, parent: Frame): Frame => {
    const t = el.getAttribute("transform") ?? "";
    const m = /^\s*translate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?\s*\)\s*$/.exec(t);
    const classes = ` ${el.getAttribute("class") ?? ""} `;
    const fontSize = Number(el.getAttribute("font-size"));
    return {
      dx: parent.dx + (m ? Number(m[1]) : 0),
      dy: parent.dy + (m ? Number(m[2] ?? 0) : 0),
      lost: parent.lost || (t.trim() !== "" && !m),
      size: fontSize > 0 ? fontSize : classes.includes(" note ") ? SIZE.note : parent.size,
      strong: parent.strong || classes.includes(" strong ") || /^(bold|[6-9]00)$/.test(el.getAttribute("font-weight") ?? ""),
      anchor: el.getAttribute("text-anchor") ?? parent.anchor,
    };
  };
  const finish = () => {
    if (label && label.text.trim()) labels.push({ ...label, text: label.text.trim() });
  };

  new HTMLRewriter()
    .on("*", {
      element(el) {
        const tag = el.tagName;
        if (!SKETCH_ELEMENTS.has(tag)) faults.push(`<${tag}> is dropped when the surface sets the sketch into its page`);
        for (const attr of ["fill", "stroke", "stop-color", "color"]) {
          const v = el.getAttribute(attr);
          if (v && COLOUR.test(v)) faults.push(`<${tag} ${attr}="${v}"> is a colour by value; use a role class`);
        }
        const inline = el.getAttribute("style");
        if (inline && COLOUR.test(inline.replace(/var\([^)]*\)/g, ""))) faults.push(`<${tag} style="${inline}"> writes a colour by value; use a role class`);
        const id = el.getAttribute("id");
        if (id && tag !== "style") faults.push(`id "${id}" is shared by every sketch in one page; name it after the file, or draw without it`);
        if (tag === "style") inStyle = id === "sketch" ? "sketch" : "other";
        if (root && tag === "svg") {
          root = false;
          if (!/\bsketch\b/.test(el.getAttribute("class") ?? "")) faults.push("the root is not marked as a sketch; stamp it");
          box = (el.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
          if (box.length !== 4 || box.some(Number.isNaN)) faults.push("the root has no viewBox");
          const w = Number(el.getAttribute("width"));
          if (!(w > 0) || !(Number(el.getAttribute("height")) > 0)) faults.push("the root has no width and height, so a page cannot lay it before it loads");
          else if (w > MEASURE) faults.push(`the sketch is ${w} wide, wider than the lane's ${MEASURE}, and its text is read smaller than it is set`);
        }
        const parent = frames[frames.length - 1];
        const frame = frameOf(el, parent);
        if (tag === "text" || (tag === "tspan" && (el.hasAttribute("x") || el.hasAttribute("y")))) {
          if (tag === "tspan") finish();
          const x = Number(el.getAttribute("x") ?? (label?.x ?? 0) - frame.dx);
          const y = Number(el.getAttribute("y") ?? (label?.y ?? 0) - frame.dy);
          label = { text: "", x: x + frame.dx, y: y + frame.dy, size: frame.size, strong: frame.strong, anchor: frame.anchor, lost: frame.lost };
        }
        if (el.selfClosing) return;
        frames.push(frame);
        el.onEndTag(() => {
          frames.pop();
          if (tag === "text") (finish(), (label = null));
          if (tag === "style") inStyle = null;
        });
      },
    })
    .onDocument({
      text(t) {
        if (inStyle === "other" && COLOUR.test(t.text)) faults.push("a style of its own writes colours by value; colour by the stamped roles");
        if (label && !inStyle) label.text += entities(t.text);
      },
    })
    .transform(src);

  if (!STYLE.test(src)) faults.push("no stamped style; run stamp");
  const [bx, by, bw, bh] = box.length === 4 ? box : [0, 0, Infinity, Infinity];
  const rects = labels
    .filter((l) => !l.lost)
    .map((l) => {
      const w = roomFor(l.text, l.size, l.strong);
      const x0 = l.anchor === "middle" ? l.x - w / 2 : l.anchor === "end" ? l.x - w : l.x;
      return { l, x0, x1: x0 + w, y0: l.y - l.size * 0.78, y1: l.y + l.size * 0.24 };
    });
  labels.filter((l) => l.size < SIZE.note).forEach((l) => faults.push(`"${l.text}" is set at ${l.size}px, under the ${SIZE.note}px a reader is asked to read`));
  if (labels.some((l) => l.lost)) faults.push("a label stands under a transform other than a translation, and is not measured");
  rects.forEach((r) => {
    if (r.x0 < bx || r.x1 > bx + bw || r.y0 < by || r.y1 > by + bh) faults.push(`"${r.l.text}" needs room from ${Math.floor(r.x0)} to ${Math.ceil(r.x1)} and runs out of the sketch`);
  });
  rects.forEach((a, i) =>
    rects.slice(i + 1).forEach((b) => {
      if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) faults.push(`"${a.l.text}" and "${b.l.text}" need the same room`);
    }),
  );
  return faults.filter((f, i) => faults.indexOf(f) === i);
}

// # 5. The look
//
// A session cannot see what it drew, so the sketch is rendered to a PNG in a
// scratch place for it to look at. No page supplies the roles there, so every
// variable is read at its fallback, as an image anywhere reads it, and the
// colours are written in the forms the renderer knows.

/** A colour in OKLCH as sRGB, for a renderer that knows only the older forms. */
function oklchToRgb(l: number, c: number, h: number): string {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_, -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_, -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_];
  const srgb = lin.map((v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))));
  return `rgb(${srgb.join(",")})`;
}

async function look(file: string, out: string): Promise<void> {
  const { Resvg } = await import("@resvg/resvg-js");
  let svg = readFileSync(file, "utf8");
  // innermost first: a variable whose fallback holds no parentheses of its own, then the ones around it
  for (let i = 0; i < 4; i++) svg = svg.replace(/var\(--[\w-]+,\s*((?:[^()]|\([^()]*\))*)\)/g, "$1");
  svg = svg
    .replace(/calc\((\d+) - 0\)/g, "$1")
    .replace(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/g, (_, l, c, h) => oklchToRgb(Number(l) / 100, Number(c), Number(h)))
    .replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g, "rgba($1,$2,$3,$4)");
  const png = new Resvg(svg, { fitTo: { mode: "zoom", value: 2 }, font: { loadSystemFonts: true, defaultFontFamily: "Helvetica" }, background: "#ffffff" }).render().asPng();
  writeFileSync(out, png);
  console.log(out);
}

// The run, last, so that everything it calls stands above it.
if (import.meta.main) await run();
