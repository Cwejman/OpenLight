// surface.ts — the surface: one page that reads knowledge written under the code.
//
// # 1. What it is and how it is run
//
// One file serves two moments of a repository. Run against a path in a working
// tree it serves the page live and tells it when a file changes; run once with
// a flag it writes the page with the body inside, and that is all a pipeline
// does on each commit. The file is laid by the gradient, as a brief is: what it
// is and how it runs, then how the body is assembled, then how it is drawn,
// with the details beneath each. Its sections carry numbered headings in
// comments, so it is read by depth like anything else under the code.
//
//   bun surface.ts <path>                  serve live, http://localhost:4141
//   bun surface.ts <path> --port 8080      serve on another port
//   bun surface.ts <path> --build [out]    write the page, default ./surface.html
//   bun surface.ts <path> --check          trace only, print the warnings
//
// <path> is a stamped README.md, a folder holding one, or a single stamped file.
// The surface never reads above it: the root is the body.
//
// Two parts of this file are handed to the browser as well: the substrate the
// two sides share (2.1) and the drawing (3). The server slices them out of this
// very file and strips the types, so nothing is declared twice.
//
// For taste, the code follows the sister project's principles: simple and
// coherent, declarative over imperative, data over logic, pure functions with
// their side effects kept apart, flat data with one source of truth.

import { readFileSync, existsSync, statSync, writeFileSync, watch } from "node:fs";
import { resolve, dirname, relative, join, sep } from "node:path";
import { marked } from "marked";

const PORT = 4141;

// ## 1.1 The run

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (f: string) => args.indexOf(f);
  const root = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--port" && args[i - 1] !== "--build");
  if (!root) {
    console.error("usage: bun surface.ts <path> [--port N | --build [out.html] | --check]");
    process.exit(2);
  }
  if (flag("--check") >= 0) {
    const body = trace(root);
    console.log(`${body.briefs.length} briefs traced from ${body.root}`);
    body.warnings.forEach((w) => console.log("  " + w));
    return;
  }
  if (flag("--build") >= 0) {
    const next = args[flag("--build") + 1];
    return build(root, next && !next.startsWith("--") && next !== root ? next : "surface.html");
  }
  const p = flag("--port") >= 0 ? Number(args[flag("--port") + 1]) : PORT;
  return serve(root, p);
}

// ## 1.2 The page
//
// The page is one HTML document: the style, the body when published, and the
// script. The script is this file's own sections 2.1 and 3, transpiled.

async function clientScript(): Promise<string> {
  const src = await Bun.file(import.meta.path).text();
  const between = (from: string, to: string) => {
    const a = src.search(new RegExp(`^// ${from} `, "m"));
    const b = src.search(new RegExp(`^// ${to} `, "m"));
    if (a < 0 || b < 0 || b < a) throw new Error(`cannot slice ${from} to ${to} out of this file`);
    return src.slice(a, b);
  };
  const ts = `${between("## 2\\.1", "## 2\\.2")}\n${between("# 3\\.", "## 3\\.15")}`;
  const js = new Bun.Transpiler({ loader: "ts", target: "browser" }).transformSync(ts);
  if (js.includes("</script")) throw new Error("the client script would close its own tag");
  return js;
}

/** The page, with the body inside it when one is given. */
function page(body: Body | null, script: string): string {
  const title = body?.title || "The surface";
  const data = body ? `<script type="application/json" id="substrate">${JSON.stringify(body).replace(/</g, "\\u003c")}</script>\n` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="icon" href="data:,">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Source+Sans+3:ital,wght@0,300..700;1,300..700&family=Source+Code+Pro:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
${data}<script>${script}</script>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ## 1.3 Live
//
// One process answers three requests: the page, the body as JSON, and a stream
// that says when a file under the root changed. The body is assembled again
// whole on any change, which a body this size allows.

async function serve(rootArg: string, port: number): Promise<void> {
  const rootDir = dirname(rootFileOf(rootArg));
  const script = await clientScript();
  const listeners = new Set<(s: string) => void>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(rootDir, { recursive: true }, (_event, name) => {
    if (name && !String(name).endsWith(".md")) return;
    clearTimeout(timer);
    timer = setTimeout(() => listeners.forEach((send) => send("change")), 120);
  });

  const changes = () => {
    let send: (s: string) => void;
    const stream = new ReadableStream({
      start(controller) {
        send = (s) => controller.enqueue(`data: ${s}\n\n`);
        listeners.add(send);
        controller.enqueue(": open\n\n");
      },
      cancel() {
        listeners.delete(send);
      },
    });
    return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
  };

  const body = () => {
    const b = trace(rootArg);
    b.warnings.forEach((w) => console.warn("  " + w));
    return Response.json(b);
  };

  const routes: Record<string, () => Response> = { "/body": body, "/changes": changes };
  Bun.serve({
    port,
    idleTimeout: 0, // the change stream stays open as long as the page does
    fetch: (req) => (routes[new URL(req.url).pathname] ?? (() => new Response(page(null, script), { headers: { "content-type": "text/html; charset=utf-8" } })))(),
  });
  console.log(`the surface reads ${rootDir}\n  http://localhost:${port}/`);
}

// ## 1.4 Published
//
// The same process runs once and writes the page with the body inside it, in a
// script tag that holds data rather than code. Every `<` in the JSON is written
// as \u003c, so a brief containing the closing tag cannot end it early.

async function build(rootArg: string, out: string): Promise<void> {
  const body = trace(rootArg);
  body.warnings.forEach((w) => console.warn("  " + w));
  writeFileSync(out, page(body, await clientScript()));
  console.log(`${body.briefs.length} briefs from ${body.root} → ${out}`);
}

// # 2. How the body is assembled
//
// A program should receive structure, never recover it. This section reads the
// stamped files once, traces the body from the root by its mounts, gives every
// brief its address, and rewrites every link to the address it reaches. The
// page is handed the result and never sees markdown.

// ## 2.1 The substrate both sides stand on
//
// The body is a flat list of briefs in reading order, each carrying its
// address, its title, the file it came from and its prose as parsed tokens.
// Everything else follows from those, so these are the only types there are,
// and the few functions beneath them follow from the types alone. This part
// imports nothing and touches no file, since the browser receives it verbatim.

/** A parsed markdown token, structurally: what marked produces, and what the trace adds to a link. */
type Tok = {
  type: string;
  text?: string;
  tokens?: Tok[];
  items?: Tok[];
  header?: Tok[];
  rows?: Tok[][];
  align?: (string | null)[];
  ordered?: boolean;
  start?: number | string;
  loose?: boolean;
  depth?: number;
  href?: string;
  title?: string | null;
  lang?: string;
  /** set by the trace on a link that stays in the body: the address it reaches */
  to?: string;
  /** set by the trace on a link that leaves it: the web, a file outside the body, or a brief not yet written */
  out?: "web" | "outside" | "owed";
};

/** One brief: its place, its face and its own prose. */
type Brief = {
  /** the titles on the way down from the root, slugged and joined by slashes; the root's is "" */
  address: string;
  /** the heading without its number */
  title: string;
  /** the number derived from its place, "3.2"; "" for the root */
  number: string;
  /** the number the heading carries as written, "" if none */
  written: string;
  /** the file it came from, relative to the root's directory */
  file: string;
  /** the file's stamp: brief, record, directive */
  kind: string;
  /** its own prose, links rewritten; the mount paragraph removed */
  body: Tok[];
  /** whether a level stands beneath it, by subsections or by a mount */
  door: boolean;
};

/** The body: every brief in reading order, and what the trace had to say. */
type Body = {
  title: string;
  root: string;
  briefs: Brief[];
  warnings: string[];
  traced: string;
};

/** GitHub's anchor for a heading, which is also how an address segment is written. */
const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-");

/** The text a reader sees in a run of tokens: no syntax, no link targets. */
const textOf = (toks: Tok[] = []): string =>
  toks
    .map((t) =>
      t.type === "space" || t.type === "hr"
        ? ""
        : t.type === "table"
          ? textOf(t.header) + (t.rows ?? []).map((r) => textOf(r)).join("")
          : t.tokens
            ? textOf(t.tokens)
            : t.items
              ? textOf(t.items)
              : (t.text ?? ""),
    )
    .join("");

/** The heading's number as written and its title without it. */
const splitHeading = (text: string): { written: string; title: string } => {
  const m = /^(\d+(?:\.\d+)*)\.?\s+(.*)$/.exec(text.trim());
  return m ? { written: m[1], title: m[2].trim() } : { written: "", title: text.trim() };
};

/** The address one level up; the root's parent is the root. */
const parentOf = (address: string): string => address.slice(0, Math.max(0, address.lastIndexOf("/")));

/** The depth of an address: the root is 0. */
const depthOf = (address: string): number => (address === "" ? 0 : address.split("/").length);

/** The addresses on the way to an address, the root first. */
const prefixesOf = (address: string): string[] =>
  address === "" ? [""] : ["", ...address.split("/").map((_, i, parts) => parts.slice(0, i + 1).join("/"))];

/** The blocks of a brief's prose: every token that is not spacing. */
const blocksOf = (b: Brief): Tok[] => b.body.filter((t) => t.type !== "space");

/** Every link token in a run, however deep. */
const linksIn = (toks: Tok[] = []): Tok[] =>
  toks.flatMap((t) => [
    ...(t.type === "link" ? [t] : []),
    ...linksIn(t.tokens),
    ...linksIn(t.items),
    ...linksIn(Array.isArray(t.header) ? t.header : []),
    ...(t.rows ?? []).flatMap((r) => linksIn(r)),
  ]);

/** Whether a link's target is a web address: only the schemes a page may safely follow. */
const isWeb = (href: string): boolean => /^(https?:|mailto:)/i.test(href);

// ## 2.2 A file says it is under the code

/** Frontmatter as key: value lines between two rules, and the markdown after it. */
function stamped(src: string): { front: Record<string, string>; rest: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return null;
  const front = Object.fromEntries(
    m[1].split(/\r?\n/).flatMap((line) => {
      const kv = /^([\w-]+):\s*(.*)$/.exec(line);
      return kv ? [[kv[1], kv[2].trim()]] : [];
    }),
  );
  return front["under"] === "the code" ? { front, rest: src.slice(m[0].length) } : null;
}

/** A path as handed: a folder means its entry file. */
const entryOf = (abs: string): string => (existsSync(abs) && statSync(abs).isDirectory() ? join(abs, "README.md") : abs);
const rootFileOf = (arg: string): string => entryOf(resolve(arg));

/** The tokens without their raw source, which the page never reads and which doubles the body. */
const lean = (toks: Tok[]): Tok[] => JSON.parse(JSON.stringify(toks, (k, v) => (k === "raw" ? undefined : v)));

// ## 2.3 A file is cut by its headings
//
// Before anything is traced, a file is cut into what the practice says it
// holds: a title, the prose before the first section, and the sections nested
// by heading depth. The cut is pure: it reads tokens and returns structure.

type Section = { depth: number; heading: string; body: Tok[]; children: Section[] };
type Cut = { title: string | null; lead: Tok[]; sections: Section[]; strays: string[] };

function cut(toks: Tok[]): Cut {
  const out: Cut = { title: null, lead: [], sections: [], strays: [] };
  const open: Section[] = []; // the chain of sections a token falls under, shallowest first
  toks.forEach((t) => {
    const isHeading = t.type === "heading";
    if (isHeading && t.depth === 1 && out.title === null) return void (out.title = textOf(t.tokens));
    if (isHeading && t.depth! >= 2) {
      const s: Section = { depth: t.depth!, heading: textOf(t.tokens), body: [], children: [] };
      open.length = open.findLastIndex((o) => o.depth < s.depth) + 1;
      (open.length ? open[open.length - 1].children : out.sections).push(s);
      return void open.push(s);
    }
    if (isHeading) out.strays.push(textOf(t.tokens));
    (open.length ? open[open.length - 1].body : out.lead).push(t);
  });
  return out;
}

/** A mount: a paragraph that is nothing but one link, standing last in a brief. */
function mountOf(body: Tok[]): Tok | null {
  const last = body.findLast((t) => t.type !== "space");
  const inline = (last?.tokens ?? []).filter((t) => !(t.type === "text" && (t.text ?? "").trim() === ""));
  const link = last?.type === "paragraph" && inline.length === 1 && inline[0].type === "link" ? inline[0] : null;
  return link && link.href && !/^[a-z]+:/i.test(link.href) ? link : null;
}

/** A body with its mount paragraph taken off. */
const withoutMount = (body: Tok[]): Tok[] => body.slice(0, body.findLastIndex((t) => t.type !== "space"));

// ## 2.4 It is traced from a root, by its mounts
//
// From the root the trace follows the mounts: every brief that ends with a
// lone link names a file or a folder's entry, and a stamped file named that
// way is read, cut and traced in turn, until nothing new is reached. So the
// body is whatever the root connects, and nothing is scanned. What the trace
// gathers on the way, the briefs, the warnings and the table of addresses,
// lives in this one function; everything it calls is pure.

function trace(rootArg: string): Body {
  const rootFile = rootFileOf(rootArg);
  const rootDir = dirname(rootFile);
  const briefs: Brief[] = [];
  const warnings: string[] = [];
  const table = new Map<string, string>(); // "abs" or "abs#anchor" → address
  const seen = new Set<string>();
  const addresses = new Set<string>();
  const links: { tok: Tok; file: string }[] = [];
  const rel = (abs: string) => relative(rootDir, abs) || "README.md";
  const within = (abs: string) => abs === rootDir || abs.startsWith(rootDir + sep);
  const warn = (s: string) => void warnings.push(s);

  /** Reads and cuts a stamped file, or says why it cannot. */
  const read = (abs: string): { kind: string; cut: Cut } | { fault: string } => {
    if (seen.has(abs)) return { fault: "mounted twice; the second mount is skipped" };
    seen.add(abs);
    if (!existsSync(abs) || statSync(abs).isDirectory()) return { fault: "missing; the mount is skipped" };
    const st = stamped(readFileSync(abs, "utf8"));
    return st ? { kind: st.front["kind"] ?? "brief", cut: cut(lean(marked.lexer(st.rest) as unknown as Tok[])) } : { fault: "not under the code; the mount is skipped" };
  };

  /** A free address for a title under a parent: the slug, suffixed when a sibling already took it. */
  const addressFor = (parent: string, title: string): string => {
    const base = parent ? `${parent}/${slug(title)}` : slug(title);
    const free = [base, ...Array.from({ length: 99 }, (_, k) => `${base}-${k + 2}`)].find((a) => !addresses.has(a))!;
    addresses.add(free);
    return free;
  };

  /** Traces one file's sections under `owner`, in reading order, following each mount as it is met. */
  const traceLevel = (sections: Section[], owner: Brief, abs: string, file: string, kind: string): void =>
    sections.forEach((s, i) => {
      const { written, title } = splitHeading(s.heading);
      // Numbers restart in every file, as the practice writes them: a mounted level counts from one.
      const number = owner.number && owner.file === file ? `${owner.number}.${i + 1}` : `${i + 1}`;
      const address = addressFor(owner.address, title);
      if (!address.endsWith(slug(title))) warn(`${file}: another brief titled "${title}" in the same level; this one is addressed ${address}`);
      if (written && written !== number) warn(`${file}: "${title}" is numbered ${written} and stands at ${number}`);
      const brief: Brief = { address, title, number, written, file, kind, body: s.body, door: s.children.length > 0 };
      briefs.push(brief);
      table.set(`${abs}#${slug(s.heading)}`, address);
      links.push(...linksIn(s.body).map((tok) => ({ tok, file: abs })));
      traceLevel(s.children, brief, abs, file, kind);
      traceMount(brief, s.children.length > 0, abs, file);
    });

  /** Follows a brief's mount, if it has one and may: the paragraph leaves the body and the file becomes the level. */
  const traceMount = (brief: Brief, hasSubsections: boolean, abs: string, file: string): void => {
    const m = mountOf(brief.body);
    if (!m) return;
    if (hasSubsections) return warn(`${file}: "${brief.title}" mounts ${m.href} and has subsections of its own; the mount is skipped`);
    const target = entryOf(resolve(dirname(abs), m.href!));
    if (!within(target)) return warn(`${file}: "${brief.title}" mounts ${m.href}, which lies above the root; the mount is skipped`);
    brief.body = withoutMount(brief.body);
    const r = read(target);
    if ("fault" in r) return warn(`${rel(target)}: ${r.fault}`);
    const tfile = rel(target);
    if (r.cut.title === null) warn(`${tfile}: no title`);
    else if (r.cut.title !== brief.title) warn(`${tfile}: titled "${r.cut.title}", mounted by "${brief.title}"`);
    if (r.cut.lead.some((t) => t.type !== "space")) warn(`${tfile}: prose before its first section; a mounted file holds only its parts, so it is dropped`);
    r.cut.strays.forEach((s) => warn(`${tfile}: a second title "${s}"; read as prose`));
    if (r.cut.sections.length === 0) return warn(`${tfile}: mounted by "${brief.title}" and has no section; a level with nothing in it`);
    table.set(target, brief.address);
    if (r.cut.title !== null) table.set(`${target}#${slug(r.cut.title)}`, brief.address);
    brief.door = true;
    traceLevel(r.cut.sections, brief, target, tfile, r.kind);
  };

  // The root: its title and opening are its own brief, and its sections are the first level.
  const r = read(rootFile);
  if ("fault" in r || r.cut.title === null) {
    const why = "fault" in r ? r.fault : "no title";
    return { title: "", root: rel(rootFile), briefs: [], warnings: [`${rel(rootFile)}: ${why}; nothing traced`], traced: new Date().toISOString() };
  }
  const root: Brief = { address: "", title: r.cut.title, number: "", written: "", file: rel(rootFile), kind: r.kind, body: r.cut.lead, door: r.cut.sections.length > 0 };
  briefs.push(root);
  addresses.add("");
  table.set(rootFile, "");
  table.set(`${rootFile}#${slug(root.title)}`, "");
  r.cut.strays.forEach((s) => warn(`${root.file}: a second title "${s}"; read as prose`));
  links.push(...linksIn(root.body).map((tok) => ({ tok, file: rootFile })));
  traceLevel(r.cut.sections, root, rootFile, root.file, r.kind);
  traceMount(root, r.cut.sections.length > 0, rootFile, root.file);

  // ## 2.5 Links are rewritten to addresses
  //
  // The table maps each file, and each heading in it, to the address it holds:
  // a file alone is the brief that mounts it, since the file is that brief's
  // level. Every link is now rewritten through that table. A web address is
  // left as it is, and a link to a file the trace never reached is marked as
  // leaving the body.
  const resolveLink = (href: string, file: string): Partial<Tok> => {
    if (href === "") return { out: "owed" };
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
      if (!isWeb(href)) warn(`${rel(file)}: a link with the scheme ${href.split(":")[0]}: is not followed`);
      return { out: isWeb(href) ? "web" : "outside" };
    }
    const hash = href.indexOf("#");
    const p = hash < 0 ? href : href.slice(0, hash);
    const anchor = hash < 0 ? "" : href.slice(hash + 1);
    const abs = entryOf(p ? resolve(dirname(file), p) : file);
    const exact = table.get(anchor ? `${abs}#${anchor}` : abs);
    if (exact !== undefined) return { to: exact, href: `#/${exact}` };
    if (anchor && table.has(abs)) {
      warn(`${rel(file)}: a link to ${p || "this file"}#${anchor} names no heading there; it lands on the file`);
      return { to: table.get(abs), href: `#/${table.get(abs)}` };
    }
    return { out: "outside", href: (within(abs) ? relative(rootDir, abs) : "above the root") + (anchor ? `#${anchor}` : "") };
  };
  links.forEach(({ tok, file }) => Object.assign(tok, resolveLink(tok.href ?? "", file)));

  return { title: root.title, root: root.file, briefs, warnings, traced: new Date().toISOString() };
}

// # 3. How it is drawn
//
// The page draws from a small shared state and nothing else: the body and its
// index, the address in focus, the address the pointer rests on, the grade of
// every brief in the lane, and the settings. Five areas stand in a row, a wing,
// a gutter, the lane, a gutter, a wing. The lane is prose; the rest is widgets,
// plain functions in one table, chosen per area from a strip of icons at its
// foot, and a closed area takes no room, leaving its icons where it would open. Everything drawn that
// names a brief carries its address, which is what keeps every widget in step.
// The pure functions come first, the ones that touch the document after them.

// ## 3.1 What the page holds

type Index = {
  by: Map<string, Brief>;
  children: Map<string, Brief[]>;
  own: Map<string, number>;
  branch: Map<string, number>;
  backlinks: Map<string, Set<string>>;
  depth: number;
};

/** A brief in the lane stands at its face or whole; a brief not in the lane has no grade. */
type Grade = "face" | "whole";

type AreaName = "wingL" | "gutterL" | "gutterR" | "wingR";
type Theme = "light" | "dark" | "system";
const THEMES: Theme[] = ["light", "dark", "system"];
/** The three faces a heading or the prose can be set in. */
type Face = "serif" | "sans" | "mono";
const FACES: Face[] = ["serif", "sans", "mono"];
/**
 * Each face by the family it names, its x-height as measured in the browser, and a lift. A face is sized to the
 * serif's x-height, so all three read at one size; the sans is lifted a step past that, since its letters are
 * narrower and lighter than the serif's and read smaller at the same x-height.
 */
const FACE: Record<Face, { family: string; x: number; lift: number }> = {
  serif: { family: "var(--serif)", x: 0.452, lift: 1 },
  sans: { family: "var(--sans)", x: 0.486, lift: 1.04 },
  mono: { family: "var(--mono)", x: 0.486, lift: 1 },
};
/** How much a face is scaled against the serif. */
const sizeOf = (f: Face): number => (FACE.serif.x / FACE[f].x) * FACE[f].lift;
type Settings = {
  zoom: number;
  ratio: number;
  measure: number;
  gap: number;
  /** the step every brief but the highlighted one is dimmed by */
  dim: number;
  /** the run of the fade at the top and the bottom of the lane, in hundredths of its height */
  fade: number;
  /** the spacing of the prose's lines, as a multiple of the serif's size */
  leading: number;
  /** where the reading line stands: always at the middle, or easing onto the opening and the last brief at the ends */
  line: "middle" | "ends";
  flick: number;
  /** light, dark, or whichever the system is set to */
  theme: Theme;
  /** the face of the headings, and of the prose */
  headings: Face;
  prose: Face;
  /** the widgets each area holds, in order: a wing up to two, top then bottom; a gutter one; none is closed */
  areas: Record<AreaName, string[]>;
};

const DEFAULTS: Settings = {
  zoom: 1,
  ratio: 1.25,
  measure: 600,
  gap: 24,
  dim: 0.4,
  fade: 8,
  leading: 1.6,
  line: "ends",
  flick: 1,
  theme: "system",
  headings: "serif",
  prose: "serif",
  areas: { wingL: ["shape"], gutterL: [], gutterR: ["links"], wingR: ["ahead"] },
};

const state = {
  body: null as Body | null,
  index: null as Index | null,
  /** the brief under the reading line; its address is the page's address */
  focus: "",
  pointed: null as string | null,
  /** every brief in the lane and its grade; a brief absent here is not drawn */
  grades: new Map<string, Grade>(),
  settings: { ...DEFAULTS, areas: { ...DEFAULTS.areas } } as Settings,
  /** set while a drag is in progress, so pointing does not fight it */
  scrubbing: false,
  /** the focus a keyed move is scrolling to; held until the scroll settles, so the marks do not follow every brief passed */
  holding: null as string | null,
  /** the brief whose holon the lane shows: "" for the whole body */
  scope: "",
  /** the scopes left behind, so a reader who scoped in several times can step back out along the same way */
  scopes: [] as string[],
};

/** Everything derived from the body, computed once per body. */
function indexBody(body: Body): Index {
  const by = new Map(body.briefs.map((b) => [b.address, b]));
  const own = new Map(body.briefs.map((b) => [b.address, textOf(b.body).length]));
  const children = Map.groupBy(
    body.briefs.filter((b) => b.address !== ""),
    (b) => parentOf(b.address),
  );
  const branch = new Map<string, number>();
  const branchOf = (a: string): number => {
    if (!branch.has(a)) branch.set(a, own.get(a)! + (children.get(a) ?? []).reduce((s, k) => s + branchOf(k.address), 0));
    return branch.get(a)!;
  };
  body.briefs.forEach((b) => branchOf(b.address));
  const pointers = body.briefs.flatMap((b) => linksIn(b.body).flatMap((l) => (l.to !== undefined && l.to !== b.address ? [{ to: l.to, from: b.address }] : [])));
  const backlinks = new Map(Array.from(Map.groupBy(pointers, (p) => p.to), ([to, ps]) => [to, new Set(ps.map((p) => p.from))]));
  const depth = Math.max(0, ...body.briefs.map((b) => depthOf(b.address)));
  return { by, children, own, branch, backlinks, depth };
}

const level = (a: string): Brief[] => state.index?.children.get(a) ?? [];
const brief = (a: string): Brief | undefined => state.index?.by.get(a);
const gradeOf = (a: string): Grade | null => state.grades.get(a) ?? null;
const inLane = (a: string): boolean => state.grades.has(a);

/** The briefs in the lane, in reading order: a brief, then its level, then the next. */
const laneOrder = (parent = ""): Brief[] => level(parent).flatMap((b) => (inLane(b.address) ? [b, ...(gradeOf(b.address) === "whole" ? laneOrder(b.address) : [])] : []));

/** The nearest address that resolves, for a link or a hash that no longer does. */
const nearest = (a: string): string => prefixesOf(a).findLast((p) => brief(p)) ?? "";

/** The nearest ancestor of an address that stands in the lane. */
const nearestInLane = (a: string): string => prefixesOf(a).findLast((p) => inLane(p)) ?? "";

/** How many briefs stand beneath an address, at any depth. */
const beneathCount = (a: string): number => level(a).reduce((s, k) => s + 1 + beneathCount(k.address), 0);

const fmt = (n: number) => n.toLocaleString("en-US");
const shownNumber = (b: Brief) => (b.number.includes(".") ? b.number : `${b.number}.`);
const trim = (s: string, n: number): string => (n <= 0 ? "" : s.length <= n ? s : n < 4 ? "" : s.slice(0, n - 1).trimEnd() + "…");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Where each of a row of widths starts, laid end to end with a gap between. */
const offsets = (widths: number[], gap: number): number[] => widths.map((_, i) => widths.slice(0, i).reduce((x, w) => x + w + gap, 0));

/** Shares of a span by weight, with the small ones lifted to a floor and the large ones yielding the difference. */
function spread(weights: number[], span: number, floor: number): number[] {
  const total = weights.reduce((x, y) => x + y, 0);
  const raw = weights.map((w) => (w / total) * span);
  const owed = raw.reduce((s, x) => s + (x < floor ? floor - x : 0), 0);
  const large = raw.reduce((s, x) => s + (x < floor ? 0 : x), 0);
  return raw.map((x) => (x < floor ? floor : large > 0 ? x - (owed * x) / large : x));
}

/**
 * The hue of a branch: every brief carries the hue of the root-level brief it stands under, so colour says
 * where in the body a thing sits and nothing else. Hues step by the golden angle, so neighbours differ.
 */
const hueOf = (address: string): number => {
  const i = level("").findIndex((b) => b.address === address.split("/")[0]);
  return i < 0 ? 0 : Math.round((30 + i * 137.508) % 360);
};
const hued = (address: string): string => `style="--h:${hueOf(address)}"`;

// ## 3.2 Prose is drawn from tokens
//
// Each kind of token has one renderer, and the two tables are the whole of the
// markdown the page knows: the block kinds and the inline kinds.

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const inline = (toks: Tok[] = []): string => toks.map((t) => (INLINE[t.type] ?? INLINE.text)(t)).join("");
const blocks = (toks: Tok[] = []): string => toks.map((t) => (BLOCK[t.type] ?? BLOCK.other)(t)).join("");

const INLINE: Record<string, (t: Tok) => string> = {
  text: (t) => (t.tokens ? inline(t.tokens) : esc(t.text ?? "")),
  escape: (t) => esc(t.text ?? ""),
  em: (t) => `<em>${inline(t.tokens)}</em>`,
  strong: (t) => `<strong>${inline(t.tokens)}</strong>`,
  del: (t) => `<del>${inline(t.tokens)}</del>`,
  codespan: (t) => `<code>${esc(t.text ?? "")}</code>`,
  br: () => "<br>",
  image: (t) => `<span class="image">${esc(t.text ?? "")}</span>`,
  html: (t) => esc(t.text ?? ""),
  link: (t) =>
    t.to !== undefined
      ? `<a href="#/${esc(t.to)}" data-a="${esc(t.to)}" data-link="${esc(t.to)}">${inline(t.tokens)}</a>`
      : t.out === "web" && isWeb(t.href ?? "")
        ? `<a href="${esc(t.href!)}" class="web" data-link="web" target="_blank" rel="noopener">${inline(t.tokens)}</a>`
        : t.out === "owed"
          ? `<a class="owed" data-link="owed">${inline(t.tokens)}</a>`
          : `<a class="outside" data-link="outside" data-href="${esc(t.href ?? "")}">${inline(t.tokens)}</a>`,
};

const BLOCK: Record<string, (t: Tok) => string> = {
  space: () => "",
  paragraph: (t) => `<p>${inline(t.tokens)}</p>`,
  text: (t) => inline(t.tokens ?? [t]),
  heading: (t) => `<p class="stray">${inline(t.tokens)}</p>`,
  list: (t) => {
    const tag = t.ordered ? "ol" : "ul";
    const start = t.ordered && t.start && t.start !== 1 ? ` start="${t.start}"` : "";
    return `<${tag}${start}>${(t.items ?? []).map((i) => `<li>${blocks(i.tokens)}</li>`).join("")}</${tag}>`;
  },
  code: (t) => `<pre><code>${esc(t.text ?? "")}</code></pre>`,
  blockquote: (t) => `<blockquote>${blocks(t.tokens)}</blockquote>`,
  hr: () => "<hr>",
  html: (t) => `<p>${esc(t.text ?? "")}</p>`,
  table: (t) => {
    const cell = (c: Tok, tag: string, i: number) => `<${tag}${t.align?.[i] ? ` style="text-align:${t.align[i]}"` : ""}>${inline(c.tokens)}</${tag}>`;
    const head = `<tr>${(t.header ?? []).map((c, i) => cell(c, "th", i)).join("")}</tr>`;
    const rows = (t.rows ?? []).map((r) => `<tr>${r.map((c, i) => cell(c, "td", i)).join("")}</tr>`).join("");
    return `<div class="table"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
  },
  other: (t) => `<p>${esc(textOf([t]))}</p>`,
};

// ## 3.3 The lane
//
// The lane holds the body depth first, each brief at its grade. Arriving lays
// the grades afresh; folding changes one brief or one level; scrolling changes
// nothing but the focus.

/** Lays the lane for an address: ancestors whole, their siblings at faces, its level whole, the level beneath at faces. */
function lay(address: string): void {
  const g = state.grades;
  g.clear();
  const S = state.scope;
  if (!within(address, S)) address = S;
  const path = prefixesOf(address).filter((p) => within(p, S));
  g.set(S, "whole");
  path.forEach((p) => level(p).forEach((c) => g.set(c.address, path.includes(c.address) || p === parentOf(address) ? "whole" : "face")));
  closeLay();
}

/** Whether an address stands in the holon of another: the root itself, or beneath it. */
const within = (a: string, root: string): boolean => root === "" || a === root || a.startsWith(root + "/");

/** Depth counted from the scope root, which is what the lane's registers and gaps follow. */
const depthIn = (a: string): number => depthOf(a) - depthOf(state.scope);

/** Every whole brief shows its level: children with no grade yet take a face. */
function closeLay(): void {
  const g = state.grades;
  state.body!.briefs.forEach((b) => {
    if (g.get(b.address) === "whole") level(b.address).forEach((c) => g.has(c.address) || g.set(c.address, "face"));
  });
}

/** Sets one brief's grade; past its face its level leaves the lane, and whole lays its level at faces. */
function setGrade(a: string, grade: Grade): void {
  const g = state.grades;
  g.set(a, grade);
  if (grade !== "whole") state.body!.briefs.forEach((b) => b.address.startsWith(a + "/") && g.delete(b.address));
  else closeLay();
}

const nextGrade = (grade: Grade | null): Grade => (grade === "whole" ? "face" : "whole");

const CHEVRON = `<svg viewBox="0 0 10 10"><path d="M3.2 1.8 6.6 5 3.2 8.2"/></svg>`;

/** The fold mark beside a brief: a chevron that turns down when whole and points right at a face. */
const foldMark = (b: Brief): string =>
  `<button class="mark ${gradeOf(b.address) ?? "none"}${b.door ? "" : " leaf"}" data-fold="${esc(b.address)}" title="fold or open">${CHEVRON}</button>`;

/** The gap after a brief, by the depth of the level the next brief begins: tighter the deeper, so what lies beneath a brief sits together and its siblings stand apart. */
const gapAfter = (nextDepth: number): number => [56, 56, 40, 28, 20][Math.min(4, nextDepth)] ?? 16;

/** One brief in the lane at its grade: its face, the heading and the first block, then the rest when whole; `after` is the gap beneath it. */
function articleHtml(b: Brief, g: Grade, after: number): string {
  const d = Math.min(4, depthIn(b.address));
  const [first, ...rest] = blocksOf(b);
  const on = prefixesOf(state.focus).includes(b.address);
  const beneath = beneathCount(b.address);
  // a folded brief says beneath its face that it opens: a bar per paragraph it hides, and how many briefs lie beneath
  const more =
    g === "face" && (rest.length > 0 || beneath > 0)
      ? `<div class="act more chrome" data-fold="${esc(b.address)}">${CHEVRON}<span>open</span>` +
        (rest.length ? `<span class="bars">${rest.slice(0, 12).map(() => `<i></i>`).join("")}${rest.length > 12 ? `<b>+${rest.length - 12}</b>` : ""}</span>` : "") +
        (beneath ? `<span class="beneath">${beneath} beneath</span>` : "") +
        `</div>`
      : "";
  // a whole brief folds from a line at its foot
  const less = g === "whole" && (rest.length > 0 || beneath > 0) ? `<div class="act less chrome" data-fold="${esc(b.address)}">${CHEVRON}<span>fold</span></div>` : "";
  return (
    `<article class="brief ${g}${on ? " on" : ""}${b.address === state.focus ? " here" : ""}" data-a="${esc(b.address)}" style="--h:${hueOf(b.address)};--after:${after}px">` +
    `<div class="surface">` +
    `<h2 class="head d${d}"><span class="num">${esc(shownNumber(b))}</span><span class="title">${esc(b.title)}</span></h2>` +
    (first ? blocks([first]) : "") +
    more +
    `</div>` +
    (g === "whole" ? blocks(rest) + less : "") +
    `</article>`
  );
}

/** The lane as a whole: the root's opening, then every brief in reading order at its grade. */
function laneHtml(): string {
  const S = state.scope;
  const root = brief(S)!;
  const opening = `<header class="opening brief${state.focus === S ? " here" : ""}" data-a="${esc(S)}" ${hued(S)}><h1>${esc(root.title)}</h1>${blocks(root.body)}</header>`;
  const recordNote = (parent: string) => (level(parent)[0]?.kind === "record" ? `<p class="chrome record">A record: its order is when each entry happened, and nothing ranks them.</p>` : "");
  const order = laneOrder(S);
  const opensRecord = (b: Brief) => level(parentOf(b.address))[0] === b && b.kind === "record";
  return (
    opening +
    order
      .map((b, i) => (opensRecord(b) ? recordNote(parentOf(b.address)) : "") + articleHtml(b, gradeOf(b.address)!, gapAfter(order[i + 1] ? depthIn(order[i + 1].address) : 1)))
      .join("")
  );
}

// ## 3.4 The areas, the widgets, and the strip
//
// Five areas in a row. A widget is one entry in one table: an adjunct stands in
// a gutter and returns what belongs beside a brief; a figure stands in a wing
// and returns a drawing of the body. The strip at an area's foot chooses, and
// choosing nothing closes the area, which then takes no room and leaves its icons.

type Adjunct = { kind: "adjunct"; name: string; icon: string; of: (b: Brief, article: HTMLElement) => { at: HTMLElement | null; html: string }[] };
/**
 * A figure draws into the room its wing gives it. It declares the width it stands in, which never changes with what it
 * draws, so nothing beside it moves as it redraws; and whether it grows into the wing's height or takes only what it needs.
 */
type Figure = { kind: "figure"; name: string; icon: string; draw: (w: number, h: number) => string; width: () => number; grow: boolean; onFocus?: boolean; onPoint?: boolean };
type Widget = Adjunct | Figure;

const ICON: Record<string, string> = {
  none: `<path d="M5 5l6 6M11 5l-6 6"/>`,
  shape: `<path d="M3 3h7M3 6h9M6 9h6M6 12h4"/>`,
  tree: `<path d="M3 3h4M6 8h6M8 13h5M4.5 3v5M6.5 8v5"/>`,
  ahead: `<path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>`,
  plate: `<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/>`,
  settings: `<path d="M4 11.5a5.5 5.5 0 1 1 8 0"/><path d="M8 8v-3"/>`,
  links: `<path d="M6 10 10 6M4.5 8.5 3 10a2.1 2.1 0 0 0 3 3l1.5-1.5M11.5 7.5 13 6a2.1 2.1 0 0 0-3-3L8.5 4.5"/>`,
};
const icon = (name: string): string => `<svg class="icon" viewBox="0 0 16 16">${ICON[name] ?? ICON.none}</svg>`;

const WIDGETS: Record<string, Widget> = {
  none: { kind: "figure", name: "close", icon: "none", draw: () => "", width: () => 0, grow: false },
  shape: { kind: "figure", name: "the shape: the lane as laid", icon: "shape", draw: (w, h) => shapeSvg(w, h), width: () => shapeWidth(), grow: true },
  tree: { kind: "figure", name: "the tree", icon: "tree", draw: () => treeHtml(), width: () => 240, grow: true, onFocus: true },
  ahead: { kind: "figure", name: "the ahead: what lies beneath and is not in the lane", icon: "ahead", draw: (w, h) => aheadSvg(w, h), width: () => aheadWidth(), grow: true, onFocus: true, onPoint: true },
  plate: { kind: "figure", name: "the plate: the body whole", icon: "plate", draw: (w, h) => plateSvg(w, h), width: () => plateWidth(), grow: false },
  settings: { kind: "figure", name: "settings", icon: "settings", draw: () => settingsHtml(), width: () => 216, grow: false },
  links: { kind: "adjunct", name: "links: what a brief points at, and what points at it", icon: "links", of: (b, el) => linkAdjuncts(b, el) },
};

const AREAS: { name: AreaName; kind: Widget["kind"] }[] = [
  { name: "wingL", kind: "figure" },
  { name: "gutterL", kind: "adjunct" },
  { name: "gutterR", kind: "adjunct" },
  { name: "wingR", kind: "figure" },
];
/** The widgets an area holds, in order. */
const widgetsOf = (area: AreaName): Widget[] => state.settings.areas[area].map((k) => WIDGETS[k]).filter((w): w is Widget => !!w);
/** The first widget an area holds, which is all a gutter holds. */
const widgetOf = (area: AreaName): Widget => widgetsOf(area)[0] ?? WIDGETS.none;
const isOpen = (area: AreaName): boolean => widgetsOf(area).length > 0;
const choicesFor = (kind: Widget["kind"]): string[] => Object.keys(WIDGETS).filter((k) => k === "none" || WIDGETS[k].kind === kind);
/** A strip's width: its icons laid in a row. */
const stripWidth = (kind: Widget["kind"]): number => choicesFor(kind).length * 30 - 4;

/** What an area holds once an icon on its strip is pressed: close empties it, a widget held is let go, a wing holds two, a third taking the place at the foot. */
function pressed(area: AreaName, k: string): string[] {
  const held = state.settings.areas[area];
  const wing = area.startsWith("wing");
  return k === "none" ? [] : held.includes(k) ? held.filter((x) => x !== k) : !wing ? [k] : held.length < 2 ? [...held, k] : [held[0], k];
}

/**
 * The strip of an area: a light icon per widget, the ones in use a little darker. It offers only what can stand: a
 * widget whose pressing would leave the area without room is not shown, and a closed area with nothing it could open
 * shows no strip at all, so no press ever makes a strip vanish from under the pointer.
 */
function stripHtml(area: AreaName, kind: Widget["kind"]): string {
  const held = state.settings.areas[area];
  const offered = choicesFor(kind).filter((k) => k === "none" || held.includes(k) || fitsWith({ ...state.settings.areas, [area]: pressed(area, k) })[area]);
  if (!isOpen(area) && offered.length <= 1) return "";
  return `<div class="strip" data-strip="${area}">${offered
    .map((k) => `<button class="pick${(k === "none" ? !isOpen(area) : held.includes(k)) ? " on" : ""}" data-area="${area}" data-widget="${k}" title="${esc(WIDGETS[k].name)}">${icon(WIDGETS[k].icon)}</button>`)
    .join("")}</div>`;
}

// ## 3.5 The tree: the lane as an outline
//
// The lane's briefs as a file tree: a row per brief in the lane, nested under
// its parent, open where the brief is whole. Opening in the tree is opening in
// the lane, one state. The name goes; a line lies across the row of the focus.

function treeHtml(): string {
  const node = (b: Brief, d: number): string => {
    if (!inLane(b.address)) return "";
    const open = gradeOf(b.address) === "whole";
    const on = prefixesOf(state.focus).includes(b.address);
    return (
      `<div class="node"><div class="row${on ? " on" : ""}${b.address === state.focus ? " here" : ""}" data-a="${esc(b.address)}" style="--h:${hueOf(b.address)};--d:${d}">` +
      foldMark(b) +
      `<span class="name" data-go="${esc(b.address)}">${esc(b.title)}</span></div>` +
      (open ? level(b.address).map((k) => node(k, d + 1)).join("") : "") +
      `</div>`
    );
  };
  const S = state.scope;
  const above = prefixesOf(S)
    .slice(0, -1)
    .map((a) => `<div class="row above" data-a="${esc(a)}" style="--h:${hueOf(a)};--d:${depthOf(a)}"><span class="mark leaf"></span><span class="name" data-go="${esc(a)}">${esc(brief(a)!.title)}</span></div>`)
    .join("");
  const root = `<div class="row root${state.focus === S ? " here" : ""}" data-a="${esc(S)}" style="--h:${hueOf(S)};--d:${depthOf(S)}"><span class="mark leaf"></span><span class="name" data-go="${esc(S)}">${esc(brief(S)!.title)}</span></div>`;
  return `<div class="tree">${above}${root}${level(S)
    .map((b) => node(b, depthOf(S) + 1))
    .join("")}<div class="laser"></div></div>`;
}

// ## 3.6 The ahead: what lies beneath, and is not in the lane
//
// For the highlighted brief, when its level is out of view: the whole subtree
// beneath it drawn as the shape draws the lane, heading bars and paragraph
// blocks shifted right by nesting, everything expanded, sized from the text
// since none of it is drawn in the lane. Drawn only where the level beneath is
// not in the lane, and only as large as the subtree needs.

let aheadRoot: string | null = null;

/** What a brief hides at its grade: paragraphs beyond its face, and its level beneath, when either is out of the lane. */
const hides = (a: string): boolean => {
  const b = brief(a);
  return b !== undefined && gradeOf(a) !== "whole" && (blocksOf(b).length > 1 || (level(a).length > 0 && !level(a).some((k) => inLane(k.address))));
};

/** The brief the ahead answers for: the pointed brief when it hides something, otherwise the focus; a cell inside the figure never re-roots it. */
function aheadTarget(): string | null {
  const base = hides(state.focus) ? state.focus : null;
  const p = state.pointed;
  const within = (root: string | null) => root !== null && p !== null && p.startsWith(root + "/");
  // the figure keeps its root while the pointer moves within it, so pointing at a cell never redraws the figure from under the pointer
  aheadRoot = p !== null && hides(p) && !within(base) ? p : within(aheadRoot) ? aheadRoot : base;
  return aheadRoot;
}

/** A block's height in lines of the lane, from its text: a heading, or a paragraph of `n` characters. */
const linesOf = (n: number): number => (n < 0 ? 1.5 : 0.6 + n / 72);

type ARow = { a: string; depth: number; blocks: number[]; hidden: number };

function aheadSvg(W: number, H: number): string {
  const target = aheadTarget();
  if (target === null) return "";
  const ix = state.index!;
  const t = brief(target)!;
  // the rows: the brief itself with the paragraphs its face hides, then everything beneath it, in reading order
  const own = blocksOf(t).slice(1).map((tok) => textOf([tok]).length);
  const rows: ARow[] = [{ a: target, depth: 0, blocks: [-1, ...own], hidden: 0 }];
  const walk = (parent: string, d: number): void =>
    level(parent).forEach((k) => {
      rows.push({ a: k.address, depth: d, blocks: [-1, ...blocksOf(k).map((tok) => textOf([tok]).length)], hidden: 0 });
      walk(k.address, d + 1);
    });
  walk(target, 1);
  const GAP = { block: 0.35, brief: 1.2 };
  const totalOf = (rs: ARow[]) => rs.reduce((sum, r) => sum + r.blocks.reduce((x, n) => x + linesOf(n) + GAP.block, 0) + GAP.brief, 0);
  // a line of the lane is a couple of pixels here, as in the shape, and the whole must fit the wing
  const scale = (rs: ARow[]) => Math.min(2.4, (H - 8) / Math.max(1, totalOf(rs)));
  // the ladder keeps the structure: paragraphs while legible, else one block per brief, else the deepest level dropped
  // and its weight shown as a tail on the brief that holds it, until what is left fits
  const asBrief = (r: ARow): ARow => ({ ...r, blocks: [-1, r.blocks.slice(1).reduce((x, n) => x + n, 0)] });
  const deepest = Math.max(0, ...rows.map((r) => r.depth));
  const toDepth = (d: number): ARow[] =>
    rows
      .filter((r) => r.depth <= d)
      .map((r) => ({ ...asBrief(r), hidden: r.depth === d && level(r.a).length > 0 ? ix.branch.get(r.a)! - ix.own.get(r.a)! : 0 }));
  let grain = "";
  let drawn: ARow[] = rows;
  if (scale(rows) < 1.8) {
    grain = "by brief";
    drawn = rows.map(asBrief);
    for (let d = deepest; scale(drawn) < 1.2 && d > 0; d--) {
      drawn = toDepth(d - 1);
      grain = `by brief, ${d - 1 === 0 ? "the first level" : `to depth ${d - 1}`}`;
    }
  }
  const k = scale(drawn);
  const total = totalOf(drawn);
  const w = Math.min(W, SHAPE.pad * 2 + Math.max(0, ...drawn.map((r) => r.depth)) * SHAPE.indent + SHAPE.bar + 4 + SHAPE.tail);
  const h = Math.ceil(total * k + 8);
  let y = 4;
  const cells = drawn.map((r) => {
    const x = SHAPE.pad + r.depth * SHAPE.indent;
    const top = y;
    let lastY = y;
    let lastH = 1;
    const bars = r.blocks
      .map((n) => {
        const bh = Math.max(1.2, linesOf(n) * k - 0.6);
        const rect = `<rect class="${n < 0 ? "head" : "para"}" x="${x}" y="${y.toFixed(1)}" width="${n < 0 ? Math.round(SHAPE.bar * 0.6) : SHAPE.bar}" height="${bh.toFixed(1)}" rx="1"/>`;
        lastY = y;
        lastH = bh;
        y += linesOf(n) * k + GAP.block * k;
        return rect;
      })
      .join("");
    const tail = r.hidden > 0 ? `<rect class="hidden" x="${x + SHAPE.bar + 4}" y="${lastY.toFixed(1)}" width="${clamp(3 + Math.sqrt(r.hidden) / 4, 3, SHAPE.tail).toFixed(1)}" height="${Math.max(1.2, lastH).toFixed(1)}" rx="1"/>` : "";
    y += GAP.brief * k;
    return `<g class="cell" data-a="${esc(r.a)}" ${hued(r.a)}><rect class="hit" x="0" y="${top.toFixed(1)}" width="${w}" height="${(y - top).toFixed(1)}"/>${bars}${tail}</g>`;
  });
  // the cells carry no names; the one under the pointer is named beneath the figure
  const named = state.pointed !== null && state.pointed !== target && state.pointed.startsWith(target + "/") ? brief(state.pointed) : null;
  return `<div class="ahead-box"><div class="chrome dim">hidden in ${esc(t.address === "" ? state.body!.title : t.title)}${grain ? ` · ${grain}` : ""}</div><svg class="fig ahead" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cells.join("")}</svg><div class="chrome ahead-name">${named ? esc(named.title) : "&nbsp;"}</div></div>`;
}

// ## 3.7 Links: beside each link, its target; at the foot, what points here

function linkAdjuncts(b: Brief, article: HTMLElement): { at: HTMLElement | null; html: string }[] {
  const ix = state.index!;
  const beside = all<HTMLElement>("a[data-link]", article).map((a) => {
    const to = a.dataset.link!;
    const target = brief(to);
    const html = target
      ? `<div class="adj" data-a="${esc(to)}" ${hued(to)}><span class="name" data-go="${esc(to)}">${esc(target.title)}</span><span class="gloss">${esc(trim(textOf([blocksOf(target).find((t) => t.type === "paragraph") ?? { type: "space" }]), 110))}</span></div>`
      : to === "web"
        ? `<div class="adj dim"><span class="gloss">${esc(trim((a as HTMLAnchorElement).hostname || "the web", 40))}</span></div>`
        : to === "owed"
          ? `<div class="adj dim"><span class="gloss">a brief not yet written</span></div>`
          : `<div class="adj dim"><span class="gloss">outside the body: ${esc(trim(a.dataset.href ?? "", 40))}</span></div>`;
    return { at: a, html };
  });
  const refs = Array.from(ix.backlinks.get(b.address) ?? [], (r) => brief(r)).filter((x): x is Brief => !!x);
  const foot = refs.length
    ? [{ at: null, html: `<div class="adj foot"><span class="gloss">pointed at by</span>${refs.map((r) => `<span class="name" data-a="${esc(r.address)}" data-go="${esc(r.address)}" ${hued(r.address)}>${esc(r.title)}</span>`).join("")}</div>` }]
    : [];
  return [...beside, ...foot];
}

// ## 3.8 Settings: a row of meters

type Knob = { key: "zoom" | "ratio" | "leading" | "measure" | "gap" | "dim" | "fade"; row: "type" | "page"; name: string; min: number; max: number; step: number; glyph: string };
const KNOBS: Knob[] = [
  { key: "zoom", row: "type", name: "zoom", min: 0.75, max: 1.6, step: 0.05, glyph: `<path d="M8 4v8M4 8h8"/>` },
  { key: "ratio", row: "type", name: "heading ratio", min: 1, max: 1.6, step: 0.02, glyph: `<path d="M3 12h10M4.5 8.5h7M6 5h4"/>` },
  { key: "leading", row: "type", name: "line height", min: 1.2, max: 2.2, step: 0.05, glyph: `<path d="M6 4h7M6 8h7M6 12h7M3 4v8"/>` },
  { key: "measure", row: "type", name: "measure", min: 440, max: 900, step: 10, glyph: `<path d="M3 8h10M5 6v4M11 6v4"/>` },
  { key: "gap", row: "page", name: "gap between areas", min: 8, max: 64, step: 2, glyph: `<path d="M3 4v8M13 4v8M6 8h4"/>` },
  { key: "dim", row: "page", name: "dim the rest", min: 0, max: 0.8, step: 0.05, glyph: `<circle cx="8" cy="8" r="5"/><path d="M8 3a5 5 0 0 1 0 10z" fill="currentColor"/>` },
  { key: "fade", row: "page", name: "fade at the edges", min: 0, max: 20, step: 1, glyph: `<path d="M8 3v10M4.5 6a4.5 4.5 0 0 0 0 4M11.5 6a4.5 4.5 0 0 1 0 4"/>` },
];

/** An arc of a meter: 270 degrees from the lower left, clockwise, a fraction `t` of the way. */
function meterArc(t: number, r: number): string {
  const a0 = (135 * Math.PI) / 180;
  const a1 = a0 + t * 1.5 * Math.PI;
  const P = (a: number) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  return `M ${P(a0)} A ${r} ${r} 0 ${t * 270 > 180 ? 1 : 0} 1 ${P(a1)}`;
}

function settingsHtml(): string {
  const s = state.settings;
  const knob = (k: Knob) => {
    const t = clamp((s[k.key] - k.min) / (k.max - k.min), 0, 1);
    const shown = k.key === "measure" || k.key === "gap" ? `${Math.round(s[k.key])}px` : k.key === "fade" ? `${Math.round(s[k.key])}%` : s[k.key].toFixed(2);
    return (
      `<div class="knob" data-knob="${k.key}" title="${k.name}: ${shown}">` +
      `<svg viewBox="0 0 40 40"><path class="track" d="${meterArc(1, 15)}"/><path class="value" d="${meterArc(Math.max(t, 0.002), 15)}"/><g class="glyph" transform="translate(12 12)">${k.glyph}</g></svg>` +
      `<span class="hint chrome dim">${k.name} ${shown}</span></div>`
    );
  };
  const row = (w: Switch) =>
    `<span class="name">${w.name}</span><span class="values">${w.values
      .map((v, i) => `<button class="pick${s[w.key] === v ? " on" : ""}" data-set="${w.key}" data-value="${v}">${w.labels?.[i] ?? v}</button>`)
      .join("")}</span>`;
  return `<div class="settings">${(["type", "page"] as const).map((r) => `<div class="knobs">${KNOBS.filter((k) => k.row === r).map(knob).join("")}</div>`).join("")}<div class="switches chrome">${SWITCHES.map(row).join("")}</div></div>`;
}

/** The switches beneath the meters: a setting with a few named values, a row apiece. */
type Switch = { key: "flick" | "theme" | "headings" | "prose" | "line"; name: string; values: (string | number)[]; labels?: string[] };
const SWITCHES: Switch[] = [
  { key: "theme", name: "theme", values: THEMES },
  { key: "headings", name: "headings", values: FACES },
  { key: "prose", name: "prose", values: FACES },
  { key: "line", name: "reading line", values: ["middle", "ends"] },
  { key: "flick", name: "flick", values: [1, 0], labels: ["on", "off"] },
];

/** Turns one meter to its setting's value in place, so a drag never redraws the wing under the pointer. */
function drawMeter(el: HTMLElement): void {
  const k = KNOBS.find((k) => k.key === el.dataset.knob)!;
  const v = state.settings[k.key];
  const t = clamp((v - k.min) / (k.max - k.min), 0, 1);
  const shown = k.key === "measure" || k.key === "gap" ? `${Math.round(v)}px` : k.key === "fade" ? `${Math.round(v)}%` : v.toFixed(2);
  el.querySelector(".value")?.setAttribute("d", meterArc(Math.max(t, 0.002), 15));
  el.title = `${k.name}: ${shown}`;
  const hint = el.querySelector(".hint");
  if (hint) hint.textContent = `${k.name} ${shown}`;
}

const SETTINGS_KEY = "surface.settings";
function loadSettings(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
    if (saved) state.settings = { ...DEFAULTS, ...saved, areas: { ...DEFAULTS.areas, ...(saved.areas ?? {}) } };
    if (saved && typeof saved.fade === "number" && saved.fade <= 1 && saved.dim === undefined) (state.settings.dim = saved.fade), (state.settings.fade = DEFAULTS.fade);
  } catch {}
  // an area once held one name, "none" when closed; it now holds a list, and anything it cannot hold is dropped
  AREAS.forEach(({ name, kind }) => {
    const held = state.settings.areas[name] as unknown;
    const list = Array.isArray(held) ? held : typeof held === "string" && held !== "none" ? [held] : [];
    state.settings.areas[name] = list.filter((k) => WIDGETS[k]?.kind === kind && k !== "none").slice(0, kind === "figure" ? 2 : 1);
  });
  if (!THEMES.includes(state.settings.theme)) state.settings.theme = DEFAULTS.theme;
  if (!FACES.includes(state.settings.headings)) state.settings.headings = DEFAULTS.headings;
  if (!FACES.includes(state.settings.prose)) state.settings.prose = DEFAULTS.prose;
  if (state.settings.line !== "middle" && state.settings.line !== "ends") state.settings.line = DEFAULTS.line;
}
const saveSettings = (): void => void localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));

// ## 3.9 The shape: the lane as laid
//
// Each brief in the lane as its blocks, a paragraph a block as tall as it is
// drawn, shifted right by the brief's depth, with the viewport drawn over it.
// Dragging scrubs; pressing goes.

const SHAPE = { indent: 9, bar: 46, pad: 6, tail: 30, inset: 4 };

/** The width the shape stands in: its deepest possible row, whatever the lane is scoped to, with the marks beside it. */
const shapeWidth = (): number => SHAPE.pad * 2 + 4 + (state.index?.depth ?? 0) * SHAPE.indent + SHAPE.bar + 4 + 26 + SHAPE.tail;
/** The width the ahead stands in: its deepest possible row with its tail. */
const aheadWidth = (): number => SHAPE.pad * 2 + (state.index?.depth ?? 0) * SHAPE.indent + SHAPE.bar + 4 + SHAPE.tail;

/** The lane's briefs and their blocks as laid, in the scroll box's own coordinates. */
function laidBlocks(): { a: string; top: number; height: number; blocks: { top: number; height: number; head: boolean }[] }[] {
  const c = ui.content.getBoundingClientRect().top;
  return all<HTMLElement>(".brief", ui.lane).map((el) => {
    const r = el.getBoundingClientRect();
    const blocks = all<HTMLElement>(":scope > *:not(.surface):not(.act), :scope > .surface > *:not(.act)", el).map((b) => {
      const br = b.getBoundingClientRect();
      return { top: br.top - c, height: br.height, head: b.tagName === "H1" || b.tagName === "H2" };
    });
    return { a: el.dataset.a!, top: r.top - c, height: r.height, blocks };
  });
}

function shapeSvg(W: number, H: number): string {
  const box = ui.scroll;
  const laid = laidBlocks();
  const total = Math.max(1, box.scrollHeight);
  const k = (H - 8) / total;
  const ix = state.index!;
  // the levels above the scope stand to the left of the opening's row, a tick per ancestor, outermost leftmost
  const anc = prefixesOf(state.scope).slice(0, -1);
  const L = anc.length ? anc.length * 8 + 4 : 0;
  // the shape stands in its own width, never a wider figure's beside it in the same wing
  const w = Math.min(W, shapeWidth());
  const cells = laid.map((l) => {
    const x = SHAPE.pad + L + depthIn(l.a) * SHAPE.indent;
    const bars = l.blocks
      .map((b) => `<rect class="${b.head ? "head" : "para"}" x="${x}" y="${(4 + b.top * k).toFixed(1)}" width="${b.head ? Math.round(SHAPE.bar * 0.6) : SHAPE.bar}" height="${Math.max(1.2, b.height * k - 1).toFixed(1)}" rx="1"/>`)
      .join("");
    // beside the face a brief tells what it hides, or would hide: a tick per paragraph, then a grey tail as long as the
    // levels beneath are heavy; drawn when folded, and as a ghost that shows under the pointer when open
    const b = brief(l.a);
    const folded = b !== undefined && gradeOf(l.a) === "face";
    const ghost = folded ? "" : " ghost";
    const paras = b ? Math.max(0, blocksOf(b).length - 1) : 0;
    const hidden = b && level(l.a).length > 0 ? ix.branch.get(l.a)! - ix.own.get(l.a)! : 0;
    const face = l.blocks[1] ?? l.blocks[0];
    const y = face ? (4 + face.top * k).toFixed(1) : "0";
    const h = face ? Math.max(1.2, face.height * k - 1).toFixed(1) : "1";
    const ticks = face && b ? Array.from({ length: Math.min(paras, 8) }, (_, i) => `<rect class="tick${ghost}" x="${x + SHAPE.bar + 4 + i * 3}" y="${y}" width="1.6" height="${h}"/>`).join("") : "";
    const tx = x + SHAPE.bar + 4 + Math.min(paras, 8) * 3 + (paras ? 2 : 0);
    const tailW = hidden > 0 ? clamp(3 + Math.sqrt(hidden) / 4, 3, SHAPE.tail) : 0;
    const tail = hidden > 0 && face ? `<rect class="hidden${ghost}" x="${tx}" y="${y}" width="${tailW.toFixed(1)}" height="${h}" rx="1"/>` : "";
    const marksEnd = tx + tailW + (paras || hidden ? 8 : 0);
    // the opening's row carries the levels above to its left, each a press that scopes out to it
    const first = l.blocks[0];
    const above =
      l.a === state.scope && first
        ? anc.map((a, i) => `<g class="cell above" data-a="${esc(a)}" data-scope="${esc(a)}" ${hued(a)}><rect class="hit" x="${SHAPE.pad + i * 8 - 1}" y="${(4 + first.top * k - 4).toFixed(1)}" width="8" height="${(Math.max(10, first.height * k) + 8).toFixed(1)}"/><rect class="head" x="${SHAPE.pad + i * 8}" y="${(4 + first.top * k).toFixed(1)}" width="6" height="${Math.max(10, first.height * k - 1).toFixed(1)}" rx="1.5"/></g>`).join("")
        : "";
    // two presses: the blocks go to the brief; the room to their right, where what is hidden stands, folds or opens it,
    // the levels above are drawn last, so they take the press
    const top = (4 + l.top * k).toFixed(1);
    const height = Math.max(1, l.height * k).toFixed(1);
    // rows touch, so the room keeps to its own row; only a row thinner than a pointer can find is given height, to six pixels
    const grow = Math.max(0, (6 - l.height * k) / 2);
    const fy = Math.max(0, 4 + l.top * k - grow).toFixed(1);
    const fh = (Math.max(1, l.height * k) + 2 * grow).toFixed(1);
    return (
      `<g class="cell${l.a === state.focus ? " here" : ""}" data-a="${esc(l.a)}" ${hued(l.a)}>` +
      `<rect class="hit" data-press="go" x="${x - 3}" y="${top}" width="${SHAPE.bar + 5}" height="${height}"/>` +
      (paras || hidden ? `<rect class="hit" data-press="fold" x="${x + SHAPE.bar + 2}" y="${fy}" width="${Math.max(6, marksEnd - x - SHAPE.bar - 2)}" height="${fh}"/>` : "") +
      `${bars}${ticks}${tail}</g>` +
      above
    );
  });
  return `<svg class="fig shape" data-k="${k}" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}">${cells.join("")}<rect class="cursor" x="0" y="${(4 + box.scrollTop * k).toFixed(1)}" width="${w}" height="${(box.clientHeight * k).toFixed(1)}" rx="4"/></svg>`;
}

function drawShapeCursor(): void {
  all<SVGSVGElement>("svg.shape", ui.areas).forEach((svg) => {
    const k = Number(svg.dataset.k);
    svg.querySelector<SVGRectElement>(".cursor")!.setAttribute("y", (4 + ui.scroll.scrollTop * k).toFixed(1));
  });
}

// ## 3.10 The plate: the body, as droplets

const PLATE = { gap: 2.6, floor: 7, round: 9 };

/** The room between siblings at a depth, along the arc: wide between the root's branches, narrowing outward. */
const sideGap = (d: number): number => [0, 14, 6, 3][d] ?? 2;

type Drop = { a: string; r0: number; r1: number; a0: number; a1: number; more: boolean; label: string | null };

/** Lays the body out radially inside a square of side `S`: sector by branch weight, ring by depth, every level to the rim. */
function layoutPlate(S: number): { drops: Drop[]; rc: number } {
  const ix = state.index!;
  const D = Math.max(1, ix.depth);
  const R = (S / 2) * 0.97;
  const t = R / (D + 1);
  const rc = t;
  const ring = (d: number) => ({ r0: rc + (d - 1) * t + PLATE.gap / 2, r1: rc + d * t - PLATE.gap / 2 });
  const full = (span: number) => span >= 2 * Math.PI - 1e-6;
  // the plate shows the whole topology: no level is left undrawn, so the room between siblings and the floor a cell keeps
  // both yield when a level is crowded, and cells go to slivers rather than away
  const lay = (parent: string, a0: number, span: number, d: number): Drop[] => {
    const kids = level(parent);
    if (kids.length === 0 || d > D) return [];
    const { r0, r1 } = ring(d);
    const n = kids.length;
    const gap = Math.min(sideGap(d) / r0, span / (3 * n));
    const usable = span - (full(span) ? n : n - 1) * gap;
    const floor = Math.min(Math.max(PLATE.floor, (r1 - r0) * 0.2) / r0, usable / n);
    const angles = spread(
      kids.map((k) => Math.max(1, ix.branch.get(k.address)!)),
      usable,
      floor,
    );
    const starts = offsets(angles, gap).map((x) => x + (full(span) ? gap / 2 : 0));
    return kids.flatMap((k, i) => {
      const chord = 2 * r0 * Math.sin(Math.min(Math.PI, angles[i]) / 2);
      const drop: Drop = { a: k.address, r0, r1, a0: a0 + starts[i], a1: a0 + starts[i] + angles[i], more: false, label: chord > 40 && r1 - r0 > 15 ? k.title : null };
      return [drop, ...lay(k.address, drop.a0, angles[i], d + 1)];
    });
  };
  return { drops: lay("", -Math.PI / 2, 2 * Math.PI, 1), rc };
}

/** A droplet: an annular sector with rounded corners, or a full ring when the sector is whole. */
function dropletPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, round: number): string {
  const P = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const span = a1 - a0;
  if (span >= 2 * Math.PI - 1e-6) {
    const o = (r: number) => `M ${P(r, 0)} A ${r} ${r} 0 1 1 ${P(r, Math.PI)} A ${r} ${r} 0 1 1 ${P(r, 0)} Z`;
    return `${o(r1)} ${o(r0)}`;
  }
  const rho = Math.max(0.5, Math.min(round, (r1 - r0) / 2, (r0 * span) / 2));
  const d0 = rho / r0;
  const d1 = rho / r1;
  const large = (s: number) => (s > Math.PI ? 1 : 0);
  return [
    `M ${P(r0, a0 + d0)}`,
    `A ${r0} ${r0} 0 ${large(span - 2 * d0)} 1 ${P(r0, a1 - d0)}`,
    `Q ${P(r0, a1)} ${P(r0 + rho, a1)}`,
    `L ${P(r1 - rho, a1)}`,
    `Q ${P(r1, a1)} ${P(r1, a1 - d1)}`,
    `A ${r1} ${r1} 0 ${large(span - 2 * d1)} 0 ${P(r1, a0 + d1)}`,
    `Q ${P(r1, a0)} ${P(r1 - rho, a0)}`,
    `L ${P(r0 + rho, a0)}`,
    `Q ${P(r0, a0)} ${P(r0, a0 + d0)}`,
    "Z",
  ].join(" ");
}

/** The largest extent the plate is drawn at, across or down. */
const PLATE_SIDE = 260;

/**
 * The extent of the plate's ink in a square of side `S`: the centre and every droplet, sampled along its arcs. A plate
 * is round only where the body is; a level that fills one side leaves the other empty, so the figure is cut to its ink.
 */
function plateInk(S: number): { x: number; y: number; w: number; h: number } {
  const { drops, rc } = layoutPlate(S);
  const c = S / 2;
  const xs = [c - rc, c + rc];
  const ys = [c - rc, c + rc];
  drops.forEach((d) => {
    for (let i = 0; i <= 8; i++) {
      const a = d.a0 + ((d.a1 - d.a0) * i) / 8;
      [d.r0, d.r1].forEach((r) => (xs.push(c + r * Math.cos(a)), ys.push(c + r * Math.sin(a))));
    }
  });
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * The side of the square a plate is laid in for a room: its ink as large as the room and the plate's side allow. The
 * gaps between droplets keep their size as the plate scales, so the ink does not scale evenly, and it is settled in a
 * few steps at the size itself.
 */
const plateScale = (W: number, H: number): number => {
  let S = 1000;
  for (let i = 0; i < 5; i++) {
    const ink = plateInk(S);
    S *= Math.min(W / ink.w, H / ink.h, PLATE_SIDE / Math.max(ink.w, ink.h));
  }
  return Math.floor(S);
};

/** The width the plate stands in: its ink, drawn at the plate's side. */
const plateWidth = (): number => (state.index ? Math.ceil(plateInk(plateScale(Infinity, Infinity)).w) : PLATE_SIDE);

function plateSvg(W: number, H: number): string {
  const S = plateScale(W, H);
  if (S < 80) return "";
  const { drops, rc } = layoutPlate(S);
  const c = S / 2;
  const onPath = new Set(prefixesOf(state.focus));
  const cls = (d: Drop) => `${onPath.has(d.a) ? " on" : ""}${d.a === state.focus ? " here" : ""}${inLane(d.a) ? "" : " away"}`;
  const cells = drops.map((d) => `<g class="cell${cls(d)}" data-a="${esc(d.a)}" ${hued(d.a)}><path d="${dropletPath(c, c, d.r0, d.r1, d.a0, d.a1, PLATE.round)}"/></g>`);
  const labels = drops
    .filter((d) => d.label)
    .map((d) => {
      const mid = (d.a0 + d.a1) / 2;
      const rm = (d.r0 + d.r1) / 2;
      const chord = 2 * d.r0 * Math.sin(Math.min(Math.PI, d.a1 - d.a0) / 2);
      return `<text class="label${onPath.has(d.a) ? " on" : ""}${d.a === state.focus ? " here" : ""}" data-a="${esc(d.a)}" x="${(c + rm * Math.cos(mid)).toFixed(1)}" y="${(c + rm * Math.sin(mid)).toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${esc(trim(d.label!, Math.floor((chord - 8) / 5.6)))}</text>`;
    });
  const centre = `<g class="cell centre${state.focus === "" ? " on" : ""}" data-a=""><circle cx="${c}" cy="${c}" r="${(rc - PLATE.gap / 2).toFixed(1)}"/><text class="label" x="${c}" y="${c}" text-anchor="middle" dominant-baseline="middle">${esc(trim(state.body!.title, Math.floor(rc / 3.4)))}</text></g>`;
  const ink = plateInk(S);
  return `<svg class="fig plate" width="${Math.ceil(ink.w)}" height="${Math.ceil(ink.h)}" viewBox="${ink.x.toFixed(1)} ${ink.y.toFixed(1)} ${ink.w.toFixed(1)} ${ink.h.toFixed(1)}">${cells.join("")}${centre}${labels.join("")}</svg>`;
}

// ## 3.11 Drawing, and drawing again
//
// From here on the functions touch the document. Each draws one thing from the
// state, and drawAll draws them all in order.

type UI = { header: HTMLElement; areas: HTMLElement; scroll: HTMLElement; content: HTMLElement; lane: HTMLElement; notice: HTMLElement; parts: Record<AreaName, HTMLElement>; strips: HTMLElement };
let ui: UI;

const all = <T extends Element>(sel: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll<T>(sel));
const cssEsc = (s: string): string => s.replace(/["\\]/g, "\\$&");

const GUTTER = 210;
/** The room beneath a wing's figures that its strip stands in, above the space every area keeps. */
const STRIP = 34;
/** Where the prose's fade lies at each edge of the lane: clear from the edge to here, then fading in over the fade setting. */
const RIM = { top: 3, foot: 6 };

/**
 * The band a wing's figures stand in, as tall as the prose reads: from the middle of the fade at the top to the middle
 * of the fade at the foot, where the prose stands half seen, so no figure reaches further up or down than the prose
 * does. It keeps at least one gap at the top, and the strip's room and a gap at the foot.
 */
function band(h: number): { top: number; height: number } {
  const s = state.settings;
  const top = Math.max(s.gap, (h * (RIM.top + s.fade / 2)) / 100);
  const foot = Math.max(s.gap + STRIP, (h * (RIM.foot + s.fade / 2)) / 100);
  return { top: Math.round(top), height: Math.max(0, Math.round(h - top - foot)) };
}

/** What each area holds, as the settings keep it or as a press would leave it. */
type Held = Record<AreaName, string[]>;

/** How wide an area stands with what it holds: closed, nothing; a gutter its column; a wing its widest figure, its strip free to reach a little past it. */
const widthIn = (held: Held, area: AreaName): number =>
  held[area].length === 0 ? 0 : area.startsWith("gutter") ? GUTTER : Math.max(...held[area].map((k) => (WIDGETS[k]?.kind === "figure" ? (WIDGETS[k] as Figure).width() : 0)));
const widthOf = (area: AreaName): number => widthIn(state.settings.areas, area);
/** A closed area takes no room at all; its strip stands at the foot of where it would open. */
const takesRoom = (area: AreaName): boolean => isOpen(area);

/**
 * Which areas the width allows, taken in the order they give way last: after the lane, the left wing, then the right
 * wing, then the gutters as a pair. So as the viewport narrows the gutters go first, then the right wing, then the
 * left, and the lane stands alone. An open area costs its own width and one space; a closed one costs nothing and is
 * always allowed, since all it shows is its strip.
 */
function fitsWith(held: Held): Record<AreaName, boolean> {
  const s = state.settings;
  const on: Record<AreaName, boolean> = { wingL: false, gutterL: false, gutterR: false, wingR: false };
  AREAS.forEach(({ name }) => (on[name] = held[name].length === 0));
  let used = s.measure + 2 * s.gap;
  for (const group of [["wingL"], ["wingR"], ["gutterL", "gutterR"]] as AreaName[][]) {
    const need = group.reduce((x, a) => x + (held[a].length ? widthIn(held, a) + s.gap : 0), 0);
    if (used + need > ui.areas.clientWidth) break;
    used += need;
    group.forEach((a) => (on[a] = true));
  }
  return on;
}
const fits = (): Record<AreaName, boolean> => fitsWith(state.settings.areas);

/** Applies the settings: type registers from zoom and ratio, and the row of areas from measure, gap and what is open. */
function drawLayout(): void {
  const s = state.settings;
  const root = document.documentElement.style;
  const base = 17 * s.zoom;
  // each face is sized to the serif's x-height, so changing the face never changes how large the text reads
  const body = base * sizeOf(s.prose);
  const head = base * sizeOf(s.headings);
  // the lines are spaced from the serif's size, so changing the face never changes the spacing of the lines
  root.setProperty("--leading", `${(base * s.leading).toFixed(2)}px`);
  root.setProperty("--body", `${body.toFixed(2)}px`);
  root.setProperty("--t", `${(head * s.ratio ** 3).toFixed(2)}px`);
  root.setProperty("--h1", `${(head * s.ratio ** 2).toFixed(2)}px`);
  root.setProperty("--h2", `${(head * s.ratio).toFixed(2)}px`);
  root.setProperty("--h3", `${(head * Math.sqrt(s.ratio)).toFixed(2)}px`);
  root.setProperty("--h4", `${head.toFixed(2)}px`);
  root.setProperty("--prose-face", FACE[s.prose].family);
  root.setProperty("--head-face", FACE[s.headings].family);
  // a monospace face is spaced by its grid, so the tightening a proportional heading takes is left out
  root.setProperty("--head-tight", s.headings === "mono" ? "0" : "1");
  root.setProperty("--gap", `${s.gap}px`);
  root.setProperty("--dim", `${s.dim}`);
  root.setProperty("--edge", `${s.fade}%`);
  root.setProperty("--rim-top", `${RIM.top}%`);
  root.setProperty("--rim-foot", `${RIM.foot}%`);
  // the theme picks a side of every colour; the system setting leaves it to the browser, so nothing flashes
  if (s.theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = s.theme;
  const on = fits();
  // a viewport narrower than the measure gives the lane what there is
  const measure = Math.min(s.measure, ui.areas.clientWidth - 2 * s.gap);
  root.setProperty("--measure", `${measure}px`);
  // the gutters hug the lane at the gap, since what stands in them is aligned to its lines; only what the width allows
  // takes a column, since an absent element leaves the grid and would pull the lane into the empty track it left
  const inner = (["gutterL", "lane", "gutterR"] as const).flatMap((a) => (a === "lane" ? [measure] : on[a] && takesRoom(a) ? [widthOf(a)] : []));
  const mid = inner.reduce((x, y) => x + y, 0) + s.gap * (inner.length - 1);
  // every area is as wide as what it holds, and the spaces beside them are one: at the two edges of the viewport as
  // between the wings and the lane. The gap is the least a space is given, and what the width leaves over is shared
  // among the spaces evenly, so no area carries room it does not use
  const space = `minmax(${s.gap}px, 1fr)`;
  const tracks = [space];
  const place = (el: HTMLElement, width: number) => {
    tracks.push(`${width}px`, space);
    el.style.gridColumn = `${tracks.length - 1}`;
  };
  if (on.wingL && takesRoom("wingL")) place(ui.parts.wingL, widthOf("wingL"));
  place(ui.scroll, mid);
  if (on.wingR && takesRoom("wingR")) place(ui.parts.wingR, widthOf("wingR"));
  ui.areas.style.gridTemplateColumns = tracks.join(" ");
  ui.areas.style.columnGap = "0px";
  ui.content.style.gridTemplateColumns = inner.map((x) => `${x}px`).join(" ");
  ui.content.style.columnGap = `${s.gap}px`;
  AREAS.forEach(({ name }) => (ui.parts[name].hidden = !on[name] || !takesRoom(name)));
  (["gutterL", "gutterR"] as const).forEach((a) => ui.parts[a].classList.toggle("closed", !isOpen(a)));
  (["wingL", "wingR"] as const).forEach((a) => ui.parts[a].classList.toggle("closed", !isOpen(a)));
}

/** Draws the lane whole and lays the adjuncts beside it; the header says where the lane is scoped. */
function drawLane(): void {
  const crumb = ui.header.querySelector<HTMLElement>(".scope")!;
  crumb.innerHTML = state.scope ? `in ${prefixesOf(state.scope).map((a) => `<span data-a="${esc(a)}" data-scope="${esc(a)}">${esc(brief(a)!.title)}</span>`).join(" › ")}` : "";
  ui.lane.innerHTML = laneHtml();
  alignEnds();
  drawAdjuncts();
}

/** How far the lane scrolls, as a share of its height, while the reading line eases between an end and the middle. */
const EASE_RUN = 0.35;

/** What the reading line rests on at the ends of the lane, measured each time the lane is laid: heights in the scroll box. */
const ends = { top: 0, bottom: 0 };

/**
 * The room above and below the lane. With the line at the middle, half a screen at either end, so the first brief and
 * the last can both reach it. With the line easing to the ends, just enough that, scrolled to the top, the opening's
 * heading stands level with the first cell of the shape, and scrolled to the bottom, the last block stands level with
 * its last cell, so the shape stands balanced. The shape draws the room at its own scale, and the scale depends on the
 * room, so it is settled in a few steps.
 */
function alignEnds(): void {
  const h = ui.scroll.clientHeight;
  const c0 = ui.content.getBoundingClientRect().top;
  const P0 = parseFloat(ui.content.style.paddingTop) || 0;
  const articles = all<HTMLElement>(".brief", ui.lane);
  const opening = articles[0];
  const last = articles.at(-1);
  const blocks = last ? all<HTMLElement>(":scope > *:not(.surface):not(.act), :scope > .surface > *:not(.act)", last) : [];
  const off = opening ? opening.getBoundingClientRect().top - c0 - P0 : 0; // the heading's margin collapses through the opening
  const lastTop = last ? last.getBoundingClientRect().top - c0 - P0 : 0;
  const lane = (blocks.at(-1) ?? last)?.getBoundingClientRect().bottom ?? c0;
  const laneH = lane - c0 - P0;
  const tail = ui.lane.getBoundingClientRect().bottom - lane;
  let P = h / 2;
  let B = h / 2;
  if (state.settings.line === "ends") {
    // the shape's own room, wherever in a wing it stands; with no shape drawn, the room a lone figure would have
    const slot = slots.get("wingL:shape") ?? slots.get("wingR:shape") ?? band(h);
    const first = slot.top + SHAPE.inset;
    for (let i = 0; i < 6; i++) {
      const k = (slot.height - 8) / (P + laneH + tail + B);
      P = Math.max(0, first / (1 - k) - off);
      B = Math.max(0, h - tail - first - (P + laneH) * k);
    }
  }
  // the browser anchors the scroll against a change of room above; a lane at its top stays at its top
  const atTop = ui.scroll.scrollTop === 0;
  ui.content.style.paddingTop = `${Math.round(P)}px`;
  ui.content.style.paddingBottom = `${Math.round(B)}px`;
  if (atTop) ui.scroll.scrollTop = 0;
  const sMax = Math.max(0, ui.scroll.scrollHeight - h);
  ends.top = Math.round(P) + off + 24;
  ends.bottom = Math.max(h / 2, Math.round(P) + lastTop + 24 - sMax);
  drawFade();
}

/** How far the reading line stands from an end: 0 at it, 1 once a stretch of scrolling away. */
const eased = (d: number): number => {
  const t = clamp(d / (ui.scroll.clientHeight * EASE_RUN), 0, 1);
  return t * t * (3 - 2 * t);
};
const fromTop = (s: number): number => (state.settings.line === "ends" ? eased(s) : 1);
const fromBottom = (s: number): number => (state.settings.line === "ends" ? eased(ui.scroll.scrollHeight - ui.scroll.clientHeight - s) : 1);

/** The reading line's height in the scroll box at a scroll: the middle, or, easing to the ends, on the opening at the top and the last brief at the bottom. */
const lineAt = (s: number): number => {
  const mid = ui.scroll.clientHeight * 0.5;
  return mid + (ends.top - mid) * (1 - fromTop(s)) + (ends.bottom - mid) * (1 - fromBottom(s));
};

/** The fades at the edges come in with the line, so nothing is faded at an end before anything stands beyond it. */
const drawFade = (): void => {
  const s = ui.scroll.scrollTop;
  ui.scroll.style.setProperty("--lift", fromTop(s).toFixed(3));
  ui.scroll.style.setProperty("--drop", fromBottom(s).toFixed(3));
};

/** The scroll that brings a height in the lane to its reading line; the line moves with the scroll, so it is found by halving. */
function scrollFor(y: number): number {
  let lo = 0;
  let hi = Math.max(0, ui.scroll.scrollHeight - ui.scroll.clientHeight);
  if (lo + lineAt(lo) >= y) return lo;
  if (hi + lineAt(hi) <= y) return hi;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (m + lineAt(m) < y) lo = m;
    else hi = m;
  }
  return hi;
}

/** Adjuncts stand in the gutter columns at the height of the line they belong to, pushed down where two would meet. */
function drawAdjuncts(): void {
  const on = fits();
  (["gutterL", "gutterR"] as const).forEach((area) => {
    const col = ui.parts[area];
    const widget = widgetOf(area);
    col.innerHTML = "";
    if (!on[area] || widget.kind !== "adjunct") return;
    const top0 = ui.content.getBoundingClientRect().top;
    let floor = 0;
    all<HTMLElement>("article.brief", ui.lane).forEach((article) => {
      const b = brief(article.dataset.a!);
      if (!b) return;
      widget.of(b, article).forEach(({ at, html }) => {
        const el = document.createElement("div");
        el.className = "adjunct";
        el.innerHTML = html;
        const r = (at ?? article).getBoundingClientRect();
        const top = Math.max(floor, (at ? r.top : r.bottom - 8) - top0);
        el.style.top = `${Math.round(top)}px`;
        col.appendChild(el);
        floor = top + el.offsetHeight + 6;
      });
    });
  });
}

/** The reading line, where it stands on the screen now. */
const readingLine = (): number => ui.scroll.getBoundingClientRect().top + lineAt(ui.scroll.scrollTop);

/** The brief under the reading line, or the nearest above it. */
function focusUnderLine(): string {
  const y = readingLine();
  const arts = all<HTMLElement>(".brief", ui.lane);
  const under = arts.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= y && r.bottom > y;
  });
  const above = arts.filter((el) => el.getBoundingClientRect().top <= y).at(-1);
  return (under ?? above)?.dataset.a ?? "";
}

/** Marks the path and the focus wherever rows and articles stand, and moves the tree's line, without drawing again. */
function drawFocusMarks(): void {
  const onPath = new Set(prefixesOf(state.focus));
  all<HTMLElement>(".brief, .row", ui.areas).forEach((el) => {
    el.classList.toggle("on", onPath.has(el.dataset.a!));
    el.classList.toggle("here", el.dataset.a === state.focus);
  });
  all<HTMLElement>("svg.fig [data-a]", ui.areas).forEach((el) => {
    el.classList.toggle("on", onPath.has(el.dataset.a!));
    el.classList.toggle("here", el.dataset.a === state.focus);
  });
  drawLaser();
}

/** The tree's line lies under the highlighted row: the pointed brief while pointing, the focus otherwise. */
function drawLaser(): void {
  const tree = ui.areas.querySelector<HTMLElement>(".tree");
  const laser = tree?.querySelector<HTMLElement>(".laser");
  if (!tree || !laser) return;
  const a = state.pointed !== null && tree.querySelector(`.row[data-a="${cssEsc(state.pointed)}"]`) ? state.pointed : state.focus;
  const row = tree.querySelector<HTMLElement>(`.row[data-a="${cssEsc(a)}"]`);
  laser.hidden = !row;
  if (!row) return;
  laser.style.top = `${row.offsetTop + row.offsetHeight - 1}px`;
  laser.style.left = `${row.offsetLeft}px`;
  laser.style.width = `${row.offsetWidth}px`;
  if (a !== state.focus) return;
  const wing = tree.closest<HTMLElement>(".slot")!;
  const rr = row.getBoundingClientRect();
  const wr = wing.getBoundingClientRect();
  if (rr.top < wr.top + 24 || rr.bottom > wr.bottom - 48) wing.scrollTo({ top: row.offsetTop - wing.clientHeight / 2, behavior: "smooth" });
}

/** Where each figure stands in its wing, keyed by the wing and the widget, measured as the wing is laid. */
const slots = new Map<string, { top: number; height: number }>();

/**
 * Lays one wing whole. One figure has the wing's height; two stand at its top and its foot, with one space between. A
 * figure that takes only what it needs is drawn first and measured, and a figure that grows takes what is left, shared
 * evenly when both grow. The figures stand in the band the prose reads in, between the middles of its fades.
 */
function drawWing(area: "wingL" | "wingR"): void {
  const el = ui.parts[area];
  const s = state.settings;
  const figures = fits()[area] ? widgetsOf(area).filter((w): w is Figure => w.kind === "figure") : [];
  el.innerHTML = "";
  Array.from(slots.keys())
    .filter((k) => k.startsWith(area + ":"))
    .forEach((k) => slots.delete(k));
  if (figures.length === 0) return;
  const W = el.clientWidth;
  const { top, height: room } = band(el.clientHeight);
  const slotted = figures.map((f) => {
    const div = document.createElement("div");
    div.className = "slot";
    div.dataset.slot = state.settings.areas[area][figures.indexOf(f)];
    el.appendChild(div);
    if (!f.grow) div.innerHTML = f.draw(W, figures.length === 1 ? room : (room - s.gap) / 2);
    return { f, div, height: f.grow ? 0 : Math.min(room, div.scrollHeight) };
  });
  const growing = slotted.filter((x) => x.f.grow);
  const fixed = slotted.reduce((x, y) => x + y.height, 0);
  const share = growing.length ? (room - fixed - s.gap * (slotted.length - 1)) / growing.length : 0;
  growing.forEach((x) => (x.height = Math.max(0, share)));
  slotted.forEach((x, i) => {
    // one figure stands in the whole room, centred; of two, the first stands at the top and the second at the foot
    const height = slotted.length === 1 ? room : x.height;
    const y = i === 0 ? top : top + room - height;
    x.div.style.top = `${Math.round(y)}px`;
    x.div.style.height = `${Math.round(height)}px`;
    slots.set(`${area}:${x.div.dataset.slot}`, { top: Math.round(y), height: Math.round(height) });
    if (x.f.grow) x.div.innerHTML = x.f.draw(W, Math.round(height));
  });
}

/** Draws one figure again in the slot it already has, for what changes with the focus or the pointer. */
function drawSlot(area: "wingL" | "wingR", name: string): void {
  const div = ui.parts[area].querySelector<HTMLElement>(`.slot[data-slot="${name}"]`);
  const at = slots.get(`${area}:${name}`);
  const f = WIDGETS[name];
  if (div && at && f?.kind === "figure") div.innerHTML = f.draw(ui.parts[area].clientWidth, at.height);
}

function drawWings(only?: "focus" | "point"): void {
  (["wingL", "wingR"] as const).forEach((area) => {
    if (!only) return drawWing(area);
    state.settings.areas[area].forEach((name) => {
      const f = WIDGETS[name];
      if (f?.kind === "figure" && (only === "focus" ? f.onFocus : f.onPoint)) drawSlot(area, name);
    });
  });
  drawFocusMarks();
}

/** Lays the wings, then settles the lane's ends against where the shape now stands, and draws again if they moved. */
function drawWingsAligned(): void {
  drawWings();
  const before = `${ui.content.style.paddingTop} ${ui.content.style.paddingBottom}`;
  alignEnds();
  if (`${ui.content.style.paddingTop} ${ui.content.style.paddingBottom}` !== before) drawWings();
}

/**
 * The strips stand at the foot of their areas, laid over the row by the areas' own geometry. Each side of the lane has a
 * wing's row and a gutter's row. They stand apart when both fit where they belong without touching; where they would
 * touch, the gutter's icons join the wing's row, nearest the lane, past a thin divider, so one row offers both.
 */
function drawStrips(): void {
  const on = fits();
  const a0 = ui.areas.getBoundingClientRect();
  const gap = state.settings.gap;
  const apart = 8;
  ui.strips.innerHTML = AREAS.filter(({ name }) => on[name])
    .map(({ name, kind }) => stripHtml(name, kind))
    .join("");
  const stripOf = (name: AreaName) => ui.strips.querySelector<HTMLElement>(`[data-strip="${name}"]`);
  /** Where a row of a given width would stand on its own: its left edge on the screen. */
  const anchor = (name: AreaName, width: number): number => {
    // an open area's row is centred under it
    if (takesRoom(name)) {
      const r = ui.parts[name].getBoundingClientRect();
      return r.left + r.width / 2 - width / 2;
    }
    // a closed gutter's row stands at the foot of the lane, at the edge the gutter would open on
    const lane = ui.lane.getBoundingClientRect();
    if (name === "gutterL") return lane.left;
    if (name === "gutterR") return lane.right - width;
    // a closed wing's row stands centred in the space beside the lane where the wing would open
    const block = ui.scroll.getBoundingClientRect();
    const [from, to] = name === "wingL" ? [a0.left, block.left] : [block.right, a0.right];
    return clamp((from + to) / 2 - width / 2, a0.left + gap, a0.right - gap - width);
  };
  // a row keeps a gap from the edges of the screen
  const place = (el: HTMLElement, left: number) => void (el.style.left = `${Math.round(clamp(left, a0.left + gap, a0.right - gap - el.offsetWidth) - a0.left)}px`);
  (["L", "R"] as const).forEach((side) => {
    const wingName = `wing${side}` as AreaName;
    const gutterName = `gutter${side}` as AreaName;
    const wing = stripOf(wingName);
    const gutter = stripOf(gutterName);
    const wingAt = wing ? anchor(wingName, wing.offsetWidth) : 0;
    const gutterAt = gutter ? anchor(gutterName, gutter.offsetWidth) : 0;
    const touch = !!wing && !!gutter && (side === "L" ? wingAt + wing.offsetWidth + apart > gutterAt : gutterAt + gutter.offsetWidth + apart > wingAt);
    if (wing && gutter && touch) {
      const divider = document.createElement("span");
      divider.className = "divider";
      const icons = Array.from(gutter.children);
      if (side === "L") wing.append(divider, ...icons);
      else wing.prepend(...icons, divider);
      gutter.remove();
      return place(wing, anchor(wingName, wing.offsetWidth));
    }
    if (wing) place(wing, wingAt);
    if (gutter) place(gutter, gutterAt);
  });
}

function drawAll(): void {
  if (!state.body) return;
  drawLayout();
  drawLane();
  drawStrips();
  drawWingsAligned();
  light();
}

// ## 3.12 One brief lit, wherever it is drawn

function light(): void {
  const a = state.pointed;
  document.body.classList.toggle("pointing", a !== null);
  all<HTMLElement>(".lit").forEach((el) => el.classList.remove("lit"));
  drawLaser();
  if (a === null) return;
  const exact = all<HTMLElement>(`[data-a="${cssEsc(a)}"]`);
  exact.forEach((el) => el.classList.add("lit"));
  const litFigures = new Set(exact.map((el) => el.closest(".fig")));
  all<HTMLElement>(".fig")
    .filter((f) => !litFigures.has(f))
    .forEach((f) => {
      const holding = all<HTMLElement>("[data-a]", f)
        .map((cell) => cell.dataset.a!)
        .filter((ca) => ca !== "" && a.startsWith(ca + "/"))
        .sort((x, y) => y.length - x.length)[0];
      if (holding !== undefined) all<HTMLElement>(`[data-a="${cssEsc(holding)}"]`, f).forEach((el) => el.classList.add("lit"));
    });
}

function point(a: string | null): void {
  if (state.scrubbing || a === state.pointed) return;
  state.pointed = a;
  light();
  drawWings("point");
}

/** A line in the header for what the reader is owed a word about: an address that did not resolve. */
const notice = (text: string): void => void (ui.notice.textContent = text);

// ## 3.13 Moving: pressing goes, the mark folds, dragging scrubs, and the address follows the focus

/** The address after the hash: the focus, and after `?in=` the scope, when the lane is scoped. */
const readHash = (): string => decodeURIComponent(location.hash.replace(/^#\/?/, "").split("?")[0]).replace(/\/+$/, "");
const readScope = (): string => decodeURIComponent((location.hash.split("?in=")[1] ?? "")).replace(/\/+$/, "");
const hashFor = (focus: string, scope = state.scope): string => `#/${focus}${scope ? `?in=${scope}` : ""}`;
let arriving = false;
let going = false;

/** Goes to an address from the tree or a figure: enters the history, then settles there, keeping what the reader folded. */
function goTo(a: string): void {
  going = true;
  // a target outside the scope widens the scope to the whole body first, laid afresh, and the step is on the way back
  if (!within(a, state.scope)) scopeTo("");
  if (readHash() === a && readScope() === state.scope) return settle(a);
  location.hash = hashFor(a);
}

/** Settles on an address without laying the lane afresh: opens the way to it where it is folded, then scrolls. */
function settle(a: string): void {
  going = false;
  const target = brief(a) ? a : nearest(a);
  if (!inLane(target)) {
    if (!within(target, state.scope)) return arrive(target);
    prefixesOf(target).filter((p) => within(p, state.scope)).forEach((p) => p !== target && gradeOf(p) !== "whole" && setGrade(p, "whole"));
    drawLane();
  }
  state.focus = target;
  drawWings();
  light();
  scrollToFocus(true);
}

/** Arrives at an address: lays the lane afresh and scrolls the brief under the reading line. */
function arrive(a: string): void {
  arriving = true;
  const target = brief(a) ? a : nearest(a);
  if (!within(target, state.scope)) state.scope = "";
  notice(target === a ? "" : `No brief at ${a}; showing ${target || "the root"} instead.`);
  lay(target);
  state.focus = target;
  drawAll();
  scrollToFocus(false);
  arriving = false;
}

let holdTimer: ReturnType<typeof setTimeout> | undefined;
function scrollToFocus(smooth: boolean): void {
  const art = ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.focus)}"]`);
  if (!art) return;
  const top = art.getBoundingClientRect().top - ui.content.getBoundingClientRect().top;
  const target = scrollFor(top + 24);
  if (smooth) {
    state.holding = state.focus;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => (state.holding = null), 1200);
  }
  ui.scroll.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
}

/** Scrolling moves the focus and nothing else; the address follows without entering the history. */
/** Where the pointer last moved, and whether a scroll has come under it since. */
const pointer = { x: -1, y: -1, still: false };

function onScroll(): void {
  drawShapeCursor();
  drawFade();
  pointer.still = true;
  // scrolling swings the highlight back to the centre: what the pointer rested on is let go
  if (state.pointed !== null) {
    state.pointed = null;
    light();
    drawWings("point");
  }
  // a keyed move holds its target until the scroll has brought it to the line
  if (state.holding !== null) {
    const held = ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.holding)}"]`);
    const at = held ? held.getBoundingClientRect().top - (ui.scroll.getBoundingClientRect().top + lineAt(ui.scroll.scrollTop) - 24) : 0;
    if (Math.abs(at) > 2) return;
    state.holding = null;
    clearTimeout(holdTimer);
  }
  const f = focusUnderLine();
  if (f === state.focus) return;
  state.focus = f;
  if (!arriving) history.replaceState(null, "", hashFor(f));
  drawWings("focus");
}

/** Changes grades under a function, keeping the acted-on brief's heading where it stood on the screen. */
function refold(change: () => void, anchor: string = state.focus, jump = false): void {
  const at = (a: string) => ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(a)}"]`)?.getBoundingClientRect().top;
  const before = at(anchor) ?? at(state.focus);
  const held = at(anchor) !== undefined ? anchor : state.focus;
  change();
  if (!inLane(state.focus)) state.focus = nearestInLane(state.focus);
  drawLane();
  const after = at(held);
  if (before !== undefined && after !== undefined) ui.scroll.scrollTop += after - before;
  // a brief folded from inside it takes the reader up with it: its heading returns to the reading line;
  // the jump is instant, since a smooth scroll is cancelled by any scroll that follows the press, as trackpad inertia does
  const top = at(held);
  const box = ui.scroll.getBoundingClientRect();
  if (jump && top !== undefined && (top < box.top + 8 || top > box.bottom - 40)) {
    state.focus = held;
    scrollToFocus(false);
  }
  history.replaceState(null, "", hashFor(state.focus));
  drawWings();
  light();
}

/** The fold mark toggles one brief between its face and whole. Opening a brief not in the lane opens what leads to it. */
function cycle(a: string): void {
  const b = brief(a);
  if (a === "" || !b || (blocksOf(b).length <= 1 && level(a).length === 0)) return;
  // only a fold that takes away what stood under the reader moves them; opening, or folding elsewhere, never scrolls
  const jump = gradeOf(a) === "whole" && within(state.focus, a);
  refold(
    () => {
      if (!inLane(a)) prefixesOf(a).forEach((p) => p !== a && gradeOf(p) !== "whole" && setGrade(p, "whole"));
      setGrade(a, inLane(a) ? nextGrade(gradeOf(a)) : "whole");
    },
    a,
    jump,
  );
}

/** Moves the focus to an address that is in the lane, without changing any grade. */
function moveTo(a: string): void {
  if (a === state.focus || !(a === "" || inLane(a))) return;
  state.focus = a;
  history.replaceState(null, "", hashFor(a));
  scrollToFocus(true);
  drawWings("focus");
}

/** Up: the parent of the focus becomes the focus, without folding anything. */
const up = (): void => moveTo(parentOf(state.focus));

/** Down into the level beneath: its first brief, when it stands in the lane. */
const down = (): void => moveTo(level(state.focus)[0]?.address ?? state.focus);

/** Scopes the lane to a brief: its holon becomes the whole, its heading the opening, and the registers count from it. */
function scopeTo(S: string, remember = true): void {
  if (S === state.scope || !brief(S)) return;
  if (remember) state.scopes.push(state.scope);
  state.scope = S;
  if (!within(state.focus, S)) state.focus = S;
  lay(state.focus);
  drawAll();
  scrollToFocus(false);
  history.replaceState(null, "", hashFor(state.focus));
}

/** Enter: the brief in focus becomes the scope, when it has a level beneath it. */
const enter = (): void => void (level(state.focus).length > 0 && scopeTo(state.focus));

/** Shift and enter: the scope widens by one level, to the parent of the scope root. */
const popUp = (): void => void (state.scope !== "" && scopeTo(parentOf(state.scope)));

/** Escape: back along the way the reader scoped, one step at a time. */
const back = (): void => void (state.scopes.length > 0 && scopeTo(state.scopes.pop()!, false));

/** The previous or the next brief in the lane's order. */
function step(delta: number): void {
  const order = [brief(state.scope)!, ...laneOrder(state.scope)];
  const i = order.findIndex((b) => b.address === state.focus);
  const j = clamp(i + delta, 0, order.length - 1);
  moveTo(i < 0 ? order[0]?.address ?? "" : order[j].address);
}

/** Wires the gestures: pointing lights, pressing goes, the mark folds, dragging scrubs, and keys do the same. */
function wire(): void {
  const named = (e: Event) => (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-a]") ?? null;

  document.addEventListener("pointermove", (e) => {
    // after a scroll, a pointer lights a brief only once it has travelled a little: a scroll that comes to rest under a
    // still pointer makes the browser send a move of its own, which would light whatever the scroll left beneath it.
    // Otherwise every move counts, so the highlight never lags behind the region the pointer is in
    if (pointer.still && Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) < 4) return;
    pointer.still = false;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // the room right of a brief's blocks in the shape points at the brief like its blocks do, so the ahead shows what a fold there would open
    const el = named(e);
    all<HTMLElement>(".keep").forEach((k) => k.classList.remove("keep"));
    if (el?.tagName === "A" && el.closest("#lane")) el.closest("article.brief")?.classList.add("keep");
    point(el ? el.dataset.a! : null);
  });
  document.documentElement.addEventListener("pointerleave", () => point(null));

  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("a[href]") || window.getSelection()?.toString()) return;
    const fold = t.closest<HTMLElement>("[data-fold]");
    if (fold) return void cycle(fold.dataset.fold!);
    const pick = t.closest<HTMLElement>(".strip [data-widget]");
    if (pick) {
      const area = pick.dataset.area as AreaName;
      state.settings.areas[area] = pressed(area, pick.dataset.widget!);
      saveSettings();
      return void drawAll();
    }
    const set = t.closest<HTMLElement>("[data-set]");
    if (set) {
      const v = set.dataset.value!;
      const key = set.dataset.set as keyof Settings;
      (state.settings as unknown as Record<string, unknown>)[key] = typeof DEFAULTS[key] === "number" ? Number(v) : v;
      saveSettings();
      return void drawAll();
    }
    // a level above, in the shape or the crumb, scopes out to itself
    const scope = t.closest<HTMLElement>("[data-scope]");
    if (scope) return void scopeTo(scope.dataset.scope!);
    const go = t.closest<HTMLElement>("[data-go]");
    if (go) return void goTo(go.dataset.go!);
    const cell = t.closest<HTMLElement>("svg.fig [data-a]");
    if (!cell || state.scrubbing) return;
    // in the shape the blocks go and the room to their right folds or opens; in the other figures a press goes and the modifier folds
    const press = t.closest<HTMLElement>("[data-press]")?.dataset.press;
    const folds = press ? press === "fold" : e.metaKey || e.ctrlKey;
    return void (folds ? cycle(cell.dataset.a!) : goTo(cell.dataset.a!));
  });

  // dragging: a knob turns, the shape scrubs
  let drag: { kind: "knob" | "shape"; el: HTMLElement; x: number; y: number; start: number; moved: boolean } | null = null;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const knob = (e.target as HTMLElement).closest<HTMLElement>("[data-knob]");
    const map = (e.target as HTMLElement).closest<HTMLElement>("svg.shape");
    if (knob) drag = { kind: "knob", el: knob, x: e.clientX, y: e.clientY, start: state.settings[knob.dataset.knob as Knob["key"]], moved: false };
    else if (map) drag = { kind: "shape", el: map, x: e.clientX, y: e.clientY, start: ui.scroll.scrollTop, moved: false };
    if (drag) (e.target as Element).setPointerCapture?.(e.pointerId);
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    // up or right turns a meter up; the shape scrubs by height alone
    const dy = drag.kind === "knob" ? e.clientY - drag.y - (e.clientX - drag.x) : e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) < 3) return;
    drag.moved = true;
    state.scrubbing = true;
    if (drag.kind === "knob") {
      const k = KNOBS.find((k) => k.key === drag!.el.dataset.knob)!;
      const v = clamp(drag.start - (dy / 150) * (k.max - k.min), k.min, k.max);
      state.settings[k.key] = Math.round(v / k.step) * k.step;
      drawLayout();
      drawAdjuncts();
      drawMeter(drag.el);
    } else {
      const k = Number(drag.el.dataset.k);
      ui.scroll.scrollTop = drag.start + dy / k;
    }
  });
  const release = () => {
    if (drag?.kind === "knob" && drag.moved) (saveSettings(), drawStrips(), drawWingsAligned());
    drag = null;
    setTimeout(() => (state.scrubbing = false), 0);
  };
  document.addEventListener("pointerup", release);
  document.addEventListener("pointercancel", release);
  document.addEventListener(
    "wheel",
    (e) => {
      const knob = (e.target as HTMLElement).closest<HTMLElement>("[data-knob]");
      if (!knob) return;
      e.preventDefault();
      const k = KNOBS.find((k) => k.key === knob.dataset.knob)!;
      state.settings[k.key] = clamp(Math.round((state.settings[k.key] - Math.sign(e.deltaY) * k.step) / k.step) * k.step, k.min, k.max);
      saveSettings();
      drawAll();
    },
    { passive: false },
  );

  // the wheel scrolls the lane wherever the pointer rests, except over a meter, which turns instead
  document.addEventListener(
    "wheel",
    (e) => {
      state.holding = null;
      const t = e.target as HTMLElement;
      if (t.closest("#scroll") || t.closest("[data-knob]")) return;
      e.preventDefault();
      ui.scroll.scrollTop += e.deltaY;
      flick(e);
    },
    { passive: false },
  );

  // the flick: a small reversal of the scroll, down then up then down within a moment, cycles the brief in focus
  const legs: { t: number; d: number }[] = [];
  let flicked = 0;
  const flick = (e: WheelEvent): void => {
      if (!state.settings.flick || Math.abs(e.deltaY) < 2) return;
      const now = performance.now();
      const last = legs.at(-1);
      if (last && Math.sign(last.d) === Math.sign(e.deltaY)) last.d += e.deltaY;
      else legs.push({ t: now, d: e.deltaY });
      while (legs.length && now - legs[0].t > 260) legs.shift();
      const atEnd = ui.scroll.scrollTop <= 0 || ui.scroll.scrollTop >= ui.scroll.scrollHeight - ui.scroll.clientHeight - 1;
      if (legs.length >= 3 && now - flicked > 600 && !atEnd) {
        const [a, b, c] = legs.slice(-3);
        if (Math.abs(a.d) > 6 && Math.abs(b.d) > 6 && Math.abs(c.d) > 6 && Math.abs(a.d + b.d + c.d) < 80) {
          flicked = now;
          legs.length = 0;
          cycle(state.focus);
        }
      }
  };
  ui.scroll.addEventListener("wheel", flick, { passive: true });

  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    // the space bar folds or opens the brief in focus, so a reader who only scrolls never reaches for the pointer
    if (e.key === " " && !e.shiftKey) (e.preventDefault(), cycle(state.focus));
    // with shift held the parent folds, which takes the reader up to it
    else if (e.key === " " && e.shiftKey) (e.preventDefault(), cycle(parentOf(state.focus)));
    // the arrows move the focus and fold nothing: up and down along the lane, left to the parent, right into the level beneath
    else if (e.key === "ArrowUp") (e.preventDefault(), step(-1));
    else if (e.key === "ArrowDown") (e.preventDefault(), step(1));
    else if (e.key === "ArrowLeft") (e.preventDefault(), up());
    else if (e.key === "ArrowRight") (e.preventDefault(), down());
    // scoping: enter makes the focus the root of the lane, shift and enter widens by a level, escape steps back the way in
    else if (e.key === "Enter" && e.shiftKey) (e.preventDefault(), popUp());
    else if (e.key === "Enter") (e.preventDefault(), enter());
    else if (e.key === "Escape") back();
  });

  ui.scroll.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  window.addEventListener("hashchange", () => {
    if (!going) state.scope = brief(readScope()) ? readScope() : "";
    going ? settle(readHash()) : arrive(readHash());
  });
  window.addEventListener("resize", () => {
    drawLayout();
    alignEnds();
    drawAdjuncts();
    drawStrips();
    drawWingsAligned();
  });
}

// ## 3.14 Where the body comes from
//
// Published, the body is inside the page and is read before the page is drawn
// over. Live, it is asked of the process, and asked again whenever the change
// stream says a file moved.

const inlined: string | null = typeof document === "undefined" ? null : (document.getElementById("substrate")?.textContent ?? null);

const load = async (): Promise<Body> => (inlined !== null ? JSON.parse(inlined) : (await fetch("/body")).json());

function setBody(body: Body): void {
  const first = state.body === null;
  state.body = body;
  state.index = indexBody(body);
  document.title = body.title || "The surface";
  const w = ui.header.querySelector<HTMLElement>(".warnings")!;
  w.textContent = body.warnings.length ? `${body.warnings.length} warning${body.warnings.length > 1 ? "s" : ""}` : "";
  w.title = body.warnings.join("\n");
  body.warnings.forEach((x) => console.warn(x));
  if (first) {
    state.scope = brief(readScope()) ? readScope() : "";
    return arrive(readHash());
  }
  // the lane is drawn again from the new body, keeping the grades that still resolve and the scroll
  const kept = new Map(Array.from(state.grades).filter(([a]) => state.index!.by.has(a)));
  const top = ui.scroll.scrollTop;
  state.grades = kept;
  closeLay();
  if (!inLane(state.focus)) state.focus = nearestInLane(state.focus);
  drawAll();
  ui.scroll.scrollTop = top;
}

async function start(): Promise<void> {
  loadSettings();
  document.body.innerHTML = `
    <header id="header"><span class="scope chrome"></span><span class="warnings chrome dim"></span><span class="notice chrome"></span></header>
    <main id="areas">
      <section class="wing" data-area="wingL"></section>
      <section id="scroll"><div id="content"><div class="gutter" data-area="gutterL"></div><div id="lane"></div><div class="gutter" data-area="gutterR"></div></div></section>
      <section class="wing" data-area="wingR"></section>
      <div id="strips"></div>
    </main>`;
  const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!;
  ui = {
    header: $("#header"),
    areas: $("#areas"),
    scroll: $("#scroll"),
    content: $("#content"),
    lane: $("#lane"),
    notice: $("#header .notice"),
    strips: $("#strips"),
    parts: { wingL: $('[data-area="wingL"]'), gutterL: $('[data-area="gutterL"]'), gutterR: $('[data-area="gutterR"]'), wingR: $('[data-area="wingR"]') },
  };
  wire();
  setBody(await load());
  // the web fonts land after the first draw and reflow the prose, so what stands beside it is laid again
  document.fonts?.ready.then(() => {
    alignEnds();
    drawAdjuncts();
    drawWings();
  });
  if (inlined === null) new EventSource("/changes").onmessage = async () => setBody(await load());
}

if (typeof document !== "undefined") start();

// ## 3.15 The page's style
//
// Flat, as the design language asks: no boxes, hierarchy from type and rhythm,
// ink only for a live fact. A serif for the prose and a sans for the chrome; the
// heading registers grow over the body by the ratio a reader sets. The brief in
// focus stands whole and the rest a step dimmer; the prose fades at the top and
// the bottom edges. The page is white, or a warm near-black when the theme is
// dark, one palette with both sides. This part stays with the server, which
// writes it into the page's head.

const CSS = `
/*
 * Two themes, one palette: every colour is a light and a dark value side by side, and the theme picks the side.
 * Neither side is the other inverted. The light side is laid on a white ground; the dark side matches each role's
 * contrast against its own ground, and bends where perception does:
 *   the ground is a warm near-black and the ink a soft white, since pure black under pure white glares and a dead
 *   neutral grey reads cold; light text on dark reads heavier, so the type thins a step (--thin);
 *   fills near the ground step further from it in dark, since small differences in the dark are harder to see;
 *   chroma follows what a hue can hold at a lightness, which peaks in the middle and falls towards both ends, so
 *   every role's chroma sits under the weakest hue at its lightness and no branch shouts over another;
 *   accents drop chroma on dark, where a saturated colour looks brighter than it is and vibrates.
 */
:root {
  color-scheme: light dark;
  --ground: light-dark(#ffffff, oklch(18.5% 0.005 60));
  --ink: light-dark(#141414, oklch(92% 0.005 60));
  --muted: light-dark(#6b6b6b, oklch(74% 0.005 60));
  --faint: light-dark(#a8a8a8, oklch(55% 0.005 60));
  --wash: light-dark(rgb(0 0 0 / .035), rgb(255 255 255 / .05));
  --veil: light-dark(rgb(0 0 0 / .05), rgb(255 255 255 / .07));
  --track: light-dark(rgb(0 0 0 / .08), rgb(255 255 255 / .13));
  --meter: light-dark(oklch(62% 0.19 28), oklch(70% 0.14 28));
  --serif: "Source Serif 4", "Iowan Old Style", "Charter", Georgia, serif;
  --sans: "Source Sans 3", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --mono: "Source Code Pro", ui-monospace, "SF Mono", Menlo, monospace;
  --body: 17px; --t: 33px; --h1: 26.5px; --h2: 21px; --h3: 19px; --h4: 17px;
  --prose-face: var(--serif); --head-face: var(--serif); --head-tight: 1; --small: 13px;
  --leading: 27.2px;
  --gap: 24px; --rim-top: 3%; --rim-foot: 6%; --measure: 600px; --dim: .4; --edge: 8%;
  --thin: 0;
  --h: 60;
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; --thin: 30; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --thin: 30; } }
*, ::before, ::after {
  --rest: light-dark(oklch(88% 0.045 var(--h)), oklch(35% 0.04 var(--h)));
  --door: light-dark(oklch(74% 0.085 var(--h)), oklch(54% 0.07 var(--h)));
  --on: light-dark(oklch(42% 0.072 var(--h)), oklch(84% 0.055 var(--h)));
  --lit: light-dark(oklch(60% 0.12 var(--h)), oklch(74% 0.1 var(--h)));
  --glow: light-dark(oklch(80% 0.08 var(--h)), oklch(47% 0.06 var(--h)));
  --grey: light-dark(oklch(90% 0 0), oklch(32% 0 0));
  --hub: light-dark(oklch(92% 0.01 60), oklch(27% 0.01 60));
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { display: flex; flex-direction: column; background: var(--ground); color: var(--ink); font-family: var(--prose-face); font-size: var(--body); font-weight: calc(400 - var(--thin)); line-height: 1.6; overflow: hidden; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: underline; text-decoration-color: var(--door); text-decoration-thickness: 1px; text-underline-offset: .18em; }
a:hover, a.lit { text-decoration-color: var(--lit); }
a.web { text-decoration-style: dotted; }
a.owed { text-decoration-style: dashed; color: var(--muted); cursor: help; }
a.outside { text-decoration-style: dotted; color: var(--muted); cursor: help; }
.chrome { font-family: var(--sans); font-size: var(--small); color: var(--muted); letter-spacing: .01em; line-height: 1.4; }
.dim { color: var(--faint); }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }

#header { position: absolute; top: 8px; left: 0; right: 0; z-index: 4; display: flex; justify-content: center; gap: 16px; pointer-events: none; }
#header > * { pointer-events: auto; }
#header .warnings { cursor: help; }
#header .scope span { cursor: pointer; }
#header .scope span:hover, #header .scope span.lit { color: var(--on); }
#header .notice { color: var(--lit); }

#areas { position: relative; flex: 1 1 auto; min-height: 0; display: grid; justify-content: center; }
#areas > [hidden] { display: none; }
/* a wing is as wide as what it holds and has no padding of its own; its figures stand in slots the layout places */
.wing { position: relative; overflow: hidden; }
.slot { position: absolute; left: 0; right: 0; display: flex; align-items: safe center; justify-content: center; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; }
.slot::-webkit-scrollbar { display: none; }
.slot > * { max-width: 100%; }
#scroll { overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent calc(var(--rim-top) * var(--lift, 1)), black calc((var(--rim-top) + var(--edge)) * var(--lift, 1)), black calc(100% - (var(--rim-foot) + var(--edge)) * var(--drop, 1)), transparent calc(100% - var(--rim-foot) * var(--drop, 1))); mask-image: linear-gradient(to bottom, transparent calc(var(--rim-top) * var(--lift, 1)), black calc((var(--rim-top) + var(--edge)) * var(--lift, 1)), black calc(100% - (var(--rim-foot) + var(--edge)) * var(--drop, 1)), transparent calc(100% - var(--rim-foot) * var(--drop, 1))); }
#scroll::-webkit-scrollbar { display: none; }
/* the room above and below the lane is set by the reading line's setting, each time the lane is laid */
#content { position: relative; display: grid; margin: 0 auto; padding: 50vh 0; }
.gutter { position: relative; }
.gutter.closed { visibility: hidden; }
#lane { min-width: 0; line-height: var(--leading); }

#strips { position: absolute; left: 0; right: 0; bottom: 0; height: 0; z-index: 5; pointer-events: none; }
.strip { position: absolute; bottom: 10px; display: flex; gap: 4px; justify-content: center; pointer-events: auto; }
.strip .pick { width: 26px; height: 24px; display: grid; place-items: center; border-radius: 6px; color: var(--ink); opacity: .22; transition: opacity .15s, color .15s; }
.strip .pick:hover { opacity: .7; }
.strip .divider { width: 1px; height: 12px; align-self: center; margin: 0 4px; background: var(--track); }
.strip .pick.on { opacity: 1; color: var(--muted); }
.icon { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }

.opening { margin-bottom: 40px; }
.opening h1 { font-family: var(--head-face); font-size: var(--t); font-weight: calc(600 - var(--thin)); line-height: 1.12; letter-spacing: calc(-.014em * var(--head-tight)); margin: 6px 0 .56em; }
.record { margin: 4px 0 24px; }

.brief { position: relative; margin: 0; padding-bottom: var(--after, 36px); opacity: calc(1 - var(--dim)); transition: opacity .3s; }
.brief.here { opacity: 1; }
.surface p { margin-bottom: 12px; }
.act { display: flex; align-items: center; gap: 10px; color: var(--ink); cursor: pointer; margin: -4px -8px 0; padding: 4px 8px; border-radius: 6px; transition: color .15s; }
.act:hover { color: var(--on); }
.act svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.act.more svg { transform: rotate(90deg); }
.act.less svg { transform: rotate(-90deg); }
.act .bars { display: inline-flex; gap: 3px; align-items: center; }
.act .bars i { display: block; width: 9px; height: 3px; border-radius: 1.5px; background: var(--rest); }
.act .bars b { font-weight: calc(500 - var(--thin)); margin-left: 2px; }
.act.less { margin-top: -6px; }
.pointing .brief.here:not(.lit):not(.keep) { opacity: calc(1 - var(--dim)); }
.brief.lit, .brief.keep { opacity: 1; }
.head { position: relative; font-family: var(--head-face); display: flex; align-items: baseline; font-weight: calc(600 - var(--thin)); line-height: 1.2; letter-spacing: calc(-.012em * var(--head-tight)); margin: 0 0 .56em; transition: color .12s; }
.head.d1 { font-size: var(--h1); }
.head.d2 { font-size: var(--h2); }
.head.d3 { font-size: var(--h3); }
.head.d4 { font-size: var(--h4); }
.head .num { flex: 0 0 auto; margin-right: .5rem; font-family: var(--sans); font-size: var(--small); font-weight: calc(500 - var(--thin)); letter-spacing: 0; color: var(--faint); }
.head .title { flex: 1 1 auto; }
.brief.lit .title { color: var(--on); }
.brief.on .num { color: var(--on); font-weight: calc(600 - var(--thin)); }
.brief.here .num { color: var(--lit); }
.mark { position: absolute; width: 16px; height: 16px; display: grid; place-items: center; color: var(--door); opacity: .7; transition: opacity .15s; }
.mark:hover { opacity: 1; color: var(--lit); }
.mark svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s; }
.mark.whole svg { transform: rotate(90deg); }
.mark.leaf { visibility: hidden; }
.brief p, .brief li { margin: 0 0 12px; }
.brief li { margin-bottom: 8px; }
.brief ul, .brief ol { padding-left: 1.4rem; margin: 0 0 12px; }
.brief blockquote { margin: 0 0 12px; padding-left: 16px; border-left: 2px solid var(--rest); color: var(--muted); }
.brief pre { font-family: var(--mono); font-size: var(--small); line-height: 1.5; background: var(--wash); border-radius: 10px; padding: 12px 16px; overflow-x: auto; margin: 0 0 12px; }
.brief code { font-family: var(--mono); font-size: .92em; }
.brief .table { overflow-x: auto; margin: 0 0 12px; }
.brief table { border-collapse: collapse; font-family: var(--sans); font-size: var(--small); line-height: 1.4; }
.brief th { text-align: left; font-weight: calc(600 - var(--thin)); padding: 4px 12px 4px 0; border-bottom: 1px solid var(--rest); }
.brief td { padding: 4px 12px 4px 0; vertical-align: top; }
.brief em { font-style: italic; }
.brief hr { border: 0; border-top: 1px solid var(--rest); margin: 16px 0; }
.stray { color: var(--muted); }

.adjunct { position: absolute; left: 0; right: 0; padding: 0 12px 0 0; font-family: var(--sans); font-size: var(--small); line-height: 1.35; color: var(--muted); }
.gutter[data-area="gutterL"] .adjunct { padding: 0 0 0 12px; text-align: right; }
.adj { padding-left: 8px; border-left: 2px solid var(--rest); }
.gutter[data-area="gutterL"] .adj { border-left: 0; border-right: 2px solid var(--rest); padding: 0 8px 0 0; }
.adj.lit { border-color: var(--lit); }
.adj .name { display: block; color: var(--ink); cursor: pointer; }
.adj .name:hover, .adj .name.lit { color: var(--on); }
.adj .gloss { display: block; color: var(--muted); }
.adj.dim .gloss { color: var(--faint); }
.adj.foot { border-left-color: transparent; border-right-color: transparent; }
.adj.foot .name { display: inline; margin-right: 8px; }
.adj.foot .gloss { margin-bottom: 2px; }

.tree { position: relative; font-family: var(--sans); font-size: var(--small); line-height: 1.35; color: var(--muted); width: 100%; max-width: 320px; }
.tree .row { position: relative; display: flex; align-items: center; gap: 6px; padding: 2px 8px 2px calc(20px + var(--d) * 14px); border-radius: 6px; }
.tree .row .mark { position: absolute; left: calc(2px + var(--d) * 14px); top: 3px; }
.tree .row.root { color: var(--ink); font-weight: calc(600 - var(--thin)); margin-bottom: 4px; }
.tree .row.above .name { color: var(--faint); }
.tree .row:hover, .tree .row.lit { background: var(--wash); }
.tree .name { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tree .row.on .name { color: var(--ink); }
.tree .row.here .name, .tree .row.lit .name { color: var(--on); font-weight: calc(600 - var(--thin)); }
.pointing .tree .row.here:not(.lit) .name { color: var(--ink); font-weight: calc(500 - var(--thin)); }
.tree .laser { position: absolute; height: 1.5px; background: var(--on); border-radius: 1px; transition: top .28s cubic-bezier(.2,.7,.2,1), left .28s, width .28s; pointer-events: none; }

svg.fig { display: block; overflow: visible; touch-action: none; user-select: none; }
svg.fig .cell { cursor: pointer; }
.ahead-box { max-width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
svg.ahead .hit { fill: transparent; }
svg.ahead .para { fill: var(--rest); }
svg.ahead .head { fill: var(--door); }
svg.ahead .hidden { fill: var(--grey); }
svg.ahead .cell.lit .para, svg.ahead .cell.lit .head { fill: var(--lit); }
.ahead-name { min-height: 1.2em; text-align: center; color: var(--ink); }

svg.shape .hit { fill: transparent; }
svg.shape .para { fill: var(--rest); }
svg.shape .head { fill: var(--door); }
svg.shape .cell.here .para { fill: var(--door); }
svg.shape .cell.here .head { fill: var(--on); }
svg.shape .cell.lit .para, svg.shape .cell.lit .head { fill: var(--lit); }
svg.shape .above .head { fill: var(--grey); }
svg.shape .above.lit .head, svg.shape .above:hover .head { fill: var(--lit); }
/* only the two regions take the pointer; the marks drawn over them never do */
svg.shape .head, svg.shape .para, svg.shape .tick, svg.shape .hidden { pointer-events: none; }
svg.shape .ghost { opacity: 0; transition: opacity .12s; }
svg.shape .cell:has(.hit[data-press="fold"]:hover) .ghost { opacity: 1; }
svg.shape .cell:has(.hit[data-press="fold"]:hover) .tick:not(.ghost), svg.shape .cell:has(.hit[data-press="fold"]:hover) .hidden:not(.ghost) { fill: var(--lit); }
/* resting on the room to the right points at the brief, so the ahead previews it, but the brief's blocks keep their
   colour there: only its marks light, so resting on the room reads apart from resting on the blocks */
svg.shape .cell:has(.hit[data-press="fold"]:hover) .para { fill: var(--rest); }
svg.shape .cell:has(.hit[data-press="fold"]:hover) .head { fill: var(--door); }
svg.shape .cell.here:has(.hit[data-press="fold"]:hover) .para { fill: var(--door); }
svg.shape .cell.here:has(.hit[data-press="fold"]:hover) .head { fill: var(--on); }
svg.shape .hit[data-press="fold"] { cursor: pointer; }
svg.shape .tick { fill: var(--grey); }
svg.shape .hidden { fill: var(--grey); }
svg.shape .cell.lit .hidden { fill: var(--glow); }
svg.shape .cursor { fill: var(--veil); pointer-events: none; }
svg.shape { cursor: grab; }

svg.plate .cell path, svg.plate .cell circle { fill: var(--rest); }
svg.plate .cell.centre circle { fill: var(--hub); }
svg.plate .cell.on path { fill: var(--door); }
svg.plate .cell.here path { fill: var(--on); }
/* grey for anything not in the lane wins over the marks above, at every depth */
svg.plate .cell.away path { fill: var(--grey); }
svg.plate .cell.lit path, svg.plate .cell.lit circle { fill: var(--lit); }
svg.plate .label { font-family: var(--sans); font-size: 11px; fill: var(--ink); pointer-events: none; }
svg.plate .label.lit, svg.plate .cell.lit .label, svg.plate .label.here { fill: var(--ground); }

.settings { width: 216px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.knobs { display: flex; gap: 12px; justify-content: center; }
.knob { position: relative; width: 40px; height: 40px; cursor: ns-resize; touch-action: none; user-select: none; color: var(--faint); }
.knob svg { width: 40px; height: 40px; display: block; }
.knob .track { fill: none; stroke: var(--track); stroke-width: 3; stroke-linecap: round; }
.knob .value { fill: none; stroke: var(--meter); stroke-width: 3; stroke-linecap: round; }
.knob .glyph { fill: none; stroke: var(--muted); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.knob .hint { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 2px; white-space: nowrap; opacity: 0; transition: opacity .15s; pointer-events: none; }
.knob:hover .hint { opacity: 1; }
.switches { display: grid; grid-template-columns: auto auto; gap: 2px 8px; align-items: center; }
.switches .name { justify-self: end; color: var(--faint); }
.switches .values { display: flex; gap: 2px; }
.switches .pick { padding: 2px 5px; border-radius: 6px; color: var(--muted); }
.switches .pick.on { color: var(--ink); }
.switches .pick:hover { background: var(--wash); }
`;

// The run, last, so that everything it calls stands above it.
if (import.meta.main) run();
