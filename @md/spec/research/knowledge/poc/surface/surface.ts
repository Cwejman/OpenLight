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
  const ts = `${between("## 2\\.1", "## 2\\.2")}\n${between("# 3\\.", "## 3\\.11")}`;
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
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Source+Sans+3:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
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
// The page draws from three things and nothing else: the address a reader
// opened, which lives in the URL; the address the pointer rests on, which
// lives nowhere; and whether the plate is shown. Every change to one of them
// draws again. Everything here is plain functions returning HTML and SVG
// strings, written to one style so the figures read as a family. The pure
// functions come first, the ones that touch the document after them.

// ## 3.1 What the page holds

type Index = {
  by: Map<string, Brief>;
  children: Map<string, Brief[]>;
  own: Map<string, number>;
  branch: Map<string, number>;
  backlinks: Map<string, Set<string>>;
  depth: number;
};

const state = {
  body: null as Body | null,
  index: null as Index | null,
  opened: "",
  pointed: null as string | null,
  plate: false,
  /** the index of the leftmost pane in view; -1 means "the deepest that fit" */
  shift: -1,
  /** set while a scrub is in progress, so pointing does not fight it */
  scrubbing: false,
  /** whether the pointer rests in the brief's own pane, where it lights the figures but not the brief itself */
  fromPane: false,
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

/** The nearest address that resolves, for a link or a hash that no longer does. */
const nearest = (a: string): string => prefixesOf(a).findLast((p) => brief(p)) ?? "";

/** The levels the panes show: every prefix of the opened address that has a level. */
const panesOf = (opened: string): string[] => prefixesOf(opened).filter((p) => level(p).length > 0);

const fmt = (n: number) => n.toLocaleString("en-US");
const shownNumber = (b: Brief) => (b.number.includes(".") ? b.number : `${b.number}.`);
const trim = (s: string, n: number): string => (n <= 0 ? "" : s.length <= n ? s : n < 4 ? "" : s.slice(0, n - 1).trimEnd() + "…");

/** Where each of a row of widths starts, laid end to end with a gap between. */
const offsets = (widths: number[], gap: number): number[] => widths.map((_, i) => widths.slice(0, i).reduce((x, w) => x + w + gap, 0));

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
      ? `<a href="#/${esc(t.to)}" data-a="${esc(t.to)}">${inline(t.tokens)}</a>`
      : t.out === "web" && isWeb(t.href ?? "")
        ? `<a href="${esc(t.href!)}" class="web" target="_blank" rel="noopener">${inline(t.tokens)}</a>`
        : t.out === "owed"
          ? `<a class="owed" title="a brief not yet written">${inline(t.tokens)}</a>`
          : `<a class="outside" title="outside the body: ${esc(t.href ?? "")}">${inline(t.tokens)}</a>`,
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

// ## 3.3 The figures: one form at three sizes
//
// A level is a band: its briefs in order, left to right, each as wide as its
// prose, and inside each its paragraphs as segments sized as they are. A door
// carries a mark beneath. The band is drawn above a pane at full width, beside a
// heading small, and in the path compressed, and it steps down a ladder rather
// than shrink through its floor.

const BAND = { floorPara: 2, floorBrief: 3 };

/** The gaps of a band: between briefs four times what lies between paragraphs, so the groups read; smaller in a small band. */
const gapsOf = (w: number) => (w >= 300 ? { brief: 8, para: 2 } : { brief: 4, para: 1 });

type Cell = { a: string; x: number; w: number; door: boolean; paras: { x: number; w: number }[] | null; more: boolean; on: boolean };

/** Lays a level out along `w` pixels: cells per brief, paragraphs within when the room allows. */
function layoutBand(levelAddress: string, w: number, on: string | null): Cell[] {
  const briefs = level(levelAddress);
  const ix = state.index!;
  const gap = gapsOf(w);
  if (briefs.length === 0) return [];
  const sizes = briefs.map((b) => Math.max(1, ix.own.get(b.address)!));
  const scale = Math.max(0, w - gap.brief * (briefs.length - 1)) / sizes.reduce((a, b) => a + b, 0);
  if (Math.min(...sizes) * scale < BAND.floorBrief) {
    // The level as one cell, marked that it holds more than the room can show.
    return [{ a: levelAddress, x: 0, w, door: true, paras: null, more: true, on: on !== null }];
  }
  const widths = sizes.map((s) => s * scale);
  const xs = offsets(widths, gap.brief);
  const paraSizes = briefs.map((b) => blocksOf(b).map((t) => Math.max(1, textOf([t]).length)));
  const parasFit = paraSizes.every((ps) => ps.every((p) => p * scale >= BAND.floorPara));
  const parasOf = (i: number) => {
    const ps = paraSizes[i];
    const s = (widths[i] - gap.para * (ps.length - 1)) / ps.reduce((a, c) => a + c, 0);
    const pw = ps.map((p) => p * s);
    return offsets(pw, gap.para).map((x, k) => ({ x: xs[i] + x, w: pw[k] }));
  };
  return briefs.map((b, i) => ({
    a: b.address,
    x: xs[i],
    w: widths[i],
    door: b.door,
    paras: parasFit ? parasOf(i) : null,
    more: false,
    on: on === b.address || (on !== null && on.startsWith(b.address + "/")),
  }));
}

/** The cells of a band as SVG elements, every segment a pill; `h` is the full height, the ink sits in its middle. */
function bandCells(levelAddress: string, w: number, h: number, on: string | null): string {
  const inkH = Math.max(3, Math.round(h * 0.3));
  const y = Math.round((h - inkH) / 2) - 1;
  const gap = gapsOf(w);
  const rect = (cls: string, x: number, yy: number, ww: number, hh: number) => `<rect class="${cls}" x="${x.toFixed(1)}" y="${yy}" width="${Math.max(1, ww).toFixed(1)}" height="${hh}" rx="${hh / 2}"/>`;
  return layoutBand(levelAddress, w, on)
    .map(
      (c) =>
        `<g class="cell${c.on ? " on" : ""}" data-a="${esc(c.a)}" ${hued(c.a)}>` +
        rect("hit", c.x - gap.brief / 2, 0, c.w + gap.brief, h) +
        (c.paras ? c.paras.map((p) => rect("seg", p.x, y, p.w, inkH)).join("") : rect("seg", c.x, y, c.w, inkH)) +
        (c.door ? rect(`door${c.more ? " more" : ""}`, c.x, y + inkH + 3, c.w, 2) : "") +
        `</g>`,
    )
    .join("");
}

/** A pane's briefs as laid on the page: where each starts and how tall it is, in the scroll box. */
type Laid = { a: string; top: number; height: number }[];

/** A scroll position mapped onto the band: the brief it falls in, at the same fraction of that brief's cell. */
function bandX(levelAddress: string, w: number, y: number, briefs: Laid): number {
  const cells = layoutBand(levelAddress, w, null);
  const i = briefs.findIndex((b) => y < b.top + b.height);
  const cell = i < 0 ? null : cells.find((c) => c.a === briefs[i].a);
  return i < 0 ? w : !cell ? 0 : cell.x + cell.w * Math.max(0, Math.min(1, (y - briefs[i].top) / Math.max(1, briefs[i].height)));
}

/** The inverse: a place on the band mapped back to a scroll position, so a drag of the cursor is exact. */
function scrollY(levelAddress: string, w: number, x: number, briefs: Laid): number {
  const cells = layoutBand(levelAddress, w, null);
  const cell = cells.find((c) => x >= c.x && x <= c.x + c.w) ?? cells.findLast((c) => c.x <= x) ?? cells[0];
  const b = cell && briefs.find((l) => l.a === cell.a);
  return !cell || !b ? 0 : b.top + b.height * Math.max(0, Math.min(1, (x - cell.x) / Math.max(1, cell.w)));
}

/** The reading cursor: the scroll window mapped onto the band. */
function cursorOf(levelAddress: string, w: number, top: number, bottom: number, briefs: Laid): { x: number; w: number } | null {
  const cells = layoutBand(levelAddress, w, null);
  if (cells.length === 0 || cells[0].more) return null;
  const x0 = bandX(levelAddress, w, top, briefs);
  return { x: x0, w: Math.max(8, bandX(levelAddress, w, bottom, briefs) - x0) };
}

const bandSvg = (levelAddress: string, w: number, h: number, on: string | null, cls: string): string =>
  `<svg class="fig ${cls}" data-level="${esc(levelAddress)}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bandCells(levelAddress, w, h, on)}</svg>`;

// ## 3.4 The path, drawn whole

const PATH = { gap: 24 };

/** The path: one step per level, parted by room, with a cursor over the panes in view drawn beneath the steps. */
function pathSvg(w: number, h: number): string {
  const panes = panesOf(state.opened);
  const cw = Math.max(8, Math.floor((w - PATH.gap * (panes.length - 1)) / panes.length));
  const steps = panes.map((p, i) => {
    const next = panes[i + 1] ?? (state.opened !== p ? state.opened : null);
    const on = next !== null && next.startsWith(p === "" ? "" : p + "/") ? next : null;
    return `<g class="step" data-pane="${i}" transform="translate(${i * (cw + PATH.gap)},0)">${bandCells(p, cw, h, on)}</g>`;
  });
  return `<svg class="fig path" data-step="${cw + PATH.gap}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect class="cursor" x="0" y="0" width="0" height="${h}" rx="7"/>${steps.join("")}</svg>`;
}

// ## 3.5 The body, as droplets on a plate

const PLATE = { gap: 2.6, floor: 7, round: 9 };

/** The room between siblings at a depth, along the arc: wide between the root's branches, narrowing outward. */
const sideGap = (d: number): number => [0, 14, 6, 3][d] ?? 2;

type Drop = { a: string; r0: number; r1: number; a0: number; a1: number; more: boolean; label: string | null };

/** Lays the body out radially inside a square of side `S`: sector by branch weight, ring by depth. */
function layoutPlate(S: number): { drops: Drop[]; smallest: number; rc: number } {
  // Rings are sized from the depth that actually draws, so the figure fills its square: the body's depth is
  // tried first, and when the outer rings stay empty the layout is run again with the depth that was reached.
  const deepest = (drops: Drop[]) => Math.max(1, ...drops.map((d) => depthOf(d.a)));
  const first = layoutRings(S, Math.max(1, state.index!.depth));
  const again = deepest(first.drops) < first.D ? layoutRings(S, deepest(first.drops)) : first;
  const drops = again.drops;
  const smallest = Math.min(Infinity, ...drops.map((d) => Math.min((d.a1 - d.a0) * d.r0, d.r1 - d.r0)));
  return { drops, smallest: smallest === Infinity ? 0 : smallest, rc: again.rc };
}

/** The plate with `D` rings outside a centre one ring thick. */
function layoutRings(S: number, D: number): { drops: Drop[]; rc: number; D: number } {
  const ix = state.index!;
  const R = (S / 2) * 0.97;
  const t = R / (D + 1);
  const rc = t;
  const ring = (d: number) => ({ r0: rc + (d - 1) * t + PLATE.gap / 2, r1: rc + d * t - PLATE.gap / 2 });
  // A cell keeps at least the floor along its inner arc, and the floor grows with the ring's thickness so a
  // small cell stays a droplet rather than a sliver. A level fits when every cell keeps it, with the room
  // between siblings taken out first; otherwise it is not drawn.
  const floorAt = (d: number) => Math.max(PLATE.floor, (ring(d).r1 - ring(d).r0) * 0.2);
  // A full circle has as many gaps as cells, so the first and the last are parted at the top as well.
  const full = (span: number) => span >= 2 * Math.PI - 1e-6;
  const gapsIn = (n: number, span: number) => (full(span) ? n : n - 1);
  const usable = (n: number, d: number, span: number) => span - (gapsIn(n, span) * sideGap(d)) / ring(d).r0;
  const fits = (kids: Brief[], d: number, span: number) => {
    const { r0, r1 } = ring(d);
    return kids.length > 0 && d <= D && r1 - r0 >= PLATE.floor && (kids.length * floorAt(d)) / r0 <= usable(kids.length, d, span);
  };
  /** Angles by weight, with the small ones lifted to the floor and the large ones yielding the difference. */
  const anglesFor = (kids: Brief[], d: number, span: number) => {
    const { r0 } = ring(d);
    const weights = kids.map((k) => Math.max(1, ix.branch.get(k.address)!));
    const total = weights.reduce((x, y) => x + y, 0);
    const floor = floorAt(d) / r0;
    const raw = weights.map((w) => (w / total) * span);
    const owed = raw.reduce((s, x) => s + (x < floor ? floor - x : 0), 0);
    const large = raw.reduce((s, x) => s + (x < floor ? 0 : x), 0);
    return raw.map((x) => (x < floor ? floor : x - (owed * x) / large));
  };
  const lay = (parent: string, a0: number, span: number, d: number): Drop[] => {
    const kids = level(parent);
    if (!fits(kids, d, span)) return [];
    const { r0, r1 } = ring(d);
    const angles = anglesFor(kids, d, usable(kids.length, d, span));
    const gap = sideGap(d) / r0;
    const starts = offsets(angles, gap).map((x) => x + (full(span) ? gap / 2 : 0));
    return kids.flatMap((k, i) => {
      const chord = 2 * r0 * Math.sin(Math.min(Math.PI, angles[i]) / 2);
      const drop: Drop = {
        a: k.address,
        r0,
        r1,
        a0: a0 + starts[i],
        a1: a0 + starts[i] + angles[i],
        more: level(k.address).length > 0 && !fits(level(k.address), d + 1, angles[i]),
        label: chord > 40 && r1 - r0 > 15 ? k.title : null,
      };
      return [drop, ...lay(k.address, drop.a0, angles[i], d + 1)];
    });
  };
  return { drops: lay("", -Math.PI / 2, 2 * Math.PI, 1), rc, D };
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

function plateSvg(S: number): string {
  const { drops, smallest, rc } = layoutPlate(S);
  const c = S / 2;
  const onPath = new Set(prefixesOf(state.opened));
  const cls = (d: Drop) => `${d.more ? " more" : ""}${onPath.has(d.a) ? " on" : ""}`;
  const cells = drops.map((d) => `<g class="cell${cls(d)}" data-a="${esc(d.a)}" ${hued(d.a)}><path d="${dropletPath(c, c, d.r0, d.r1, d.a0, d.a1, PLATE.round)}"/></g>`);
  // Labels are drawn after every cell, so no later droplet covers an earlier name; each carries its
  // brief's address so it lights with the cell it names.
  const labels = drops
    .filter((d) => d.label)
    .map((d) => {
      const mid = (d.a0 + d.a1) / 2;
      const rm = (d.r0 + d.r1) / 2;
      const chord = 2 * d.r0 * Math.sin(Math.min(Math.PI, d.a1 - d.a0) / 2);
      return `<text class="label${onPath.has(d.a) ? " on" : ""}" data-a="${esc(d.a)}" x="${(c + rm * Math.cos(mid)).toFixed(1)}" y="${(c + rm * Math.sin(mid)).toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${esc(trim(d.label!, Math.floor((chord - 8) / 5.6)))}</text>`;
    });
  const centre = `<g class="cell centre${state.opened === "" ? " on" : ""}" data-a=""><circle cx="${c}" cy="${c}" r="${(rc - PLATE.gap / 2).toFixed(1)}"/><text class="label" x="${c}" y="${c}" text-anchor="middle" dominant-baseline="middle">${esc(trim(state.body!.title, Math.floor(rc / 3.4)))}</text></g>`;
  console.debug(`plate: ${drops.length} droplets, smallest ${smallest.toFixed(1)}px`);
  return `<svg class="fig plate" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${cells.join("")}${centre}${labels.join("")}</svg>`;
}

// ## 3.6 A level to a pane

function paneHtml(levelAddress: string): string {
  const briefs = level(levelAddress);
  const ix = state.index!;
  const root = brief("")!;
  const onPath = new Set(prefixesOf(state.opened));
  const opening = levelAddress === "" ? `<header class="opening"><h1>${esc(root.title)}</h1>${blocks(root.body)}</header>` : "";
  const record = briefs[0]?.kind === "record" ? `<p class="chrome record">A record: its order is when each entry happened, and nothing ranks them.</p>` : "";
  const refsOf = (b: Brief) => Array.from(ix.backlinks.get(b.address) ?? [], (a) => brief(a)).filter((x): x is Brief => !!x);
  const foot = (refs: Brief[]) => (refs.length ? `<footer class="foot">Pointed at by ${refs.map((r) => `<a href="#/${esc(r.address)}" data-a="${esc(r.address)}">${esc(r.title)}</a>`).join(", ")}.</footer>` : "");
  const cls = (b: Brief) => `brief${b.door ? " door" : ""}${onPath.has(b.address) ? " on" : ""}${b.address === state.opened ? " here" : ""}`;
  const articles = briefs.map(
    (b) =>
      `<article class="${cls(b)}" data-a="${esc(b.address)}" ${hued(b.address)}>` +
      `<h2 class="face"><span class="num">${esc(shownNumber(b))}</span><span class="title">${esc(b.title)}</span>${b.door ? bandSvg(b.address, 96, 12, null, "beside") : ""}</h2>` +
      blocks(b.body) +
      foot(refsOf(b)) +
      `</article>`,
  );
  // The band stands above the scroll box and never scrolls with it.
  return `<div class="strip"></div><div class="scroll"><div class="prose">${opening}${record}${articles.join("")}</div></div>`;
}

/** The rest of a brief, as the overlay tells it. */
function tellHtml(a: string): string {
  const b = brief(a)!;
  const ix = state.index!;
  const face = blocksOf(b).find((t) => t.type === "paragraph");
  const own = ix.own.get(a)!;
  const branch = ix.branch.get(a)!;
  const refs = Array.from(ix.backlinks.get(a) ?? [], (r) => brief(r)?.title).filter((x): x is string => !!x);
  const kids = level(a);
  return [
    `<div class="tell-face"><span class="num">${b.number ? esc(shownNumber(b)) : ""}</span><span class="title">${esc(b.title)}</span></div>`,
    face ? `<p>${esc(trim(textOf([face]), 260))}</p>` : "",
    `<div class="chrome">${fmt(own)} characters here, ≈${fmt(Math.round(own / 4))} tokens</div>`,
    kids.length ? `<div class="tell-level">${bandSvg(a, 240, 16, null, "in-tell")}<span class="chrome">${kids.length} beneath · ${fmt(branch - own)} characters</span></div>` : `<div class="chrome">nothing beneath</div>`,
    refs.length ? `<div class="chrome">Pointed at by ${refs.map(esc).join(", ")}</div>` : "",
    `<div class="chrome dim">${esc(b.file)}</div>`,
  ].join("");
}

// ## 3.7 Drawing, and drawing again
//
// From here on the functions touch the document. Each draws one thing from the
// state, and drawAll draws them all in order.

type UI = { header: HTMLElement; pathBox: HTMLElement; row: HTMLElement; viewport: HTMLElement; tell: HTMLElement; plateBox: HTMLElement; notice: HTMLElement };
let ui: UI;

const all = <T extends Element>(sel: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll<T>(sel));
const cssEsc = (s: string): string => s.replace(/["\\]/g, "\\$&");
/** Panes always fill the width: it is cut into the number of slots nearest an ideal pane, and a pane is one slot,
 * so no pane is ever seen cut. The text keeps its measure, and a slot wider than that gives the rest to its gutters. */
const PANE = { ideal: 640 };
const estate = (): number => ui.viewport.getBoundingClientRect().width;
const fit = (): number => Math.max(1, Math.round(estate() / PANE.ideal));
const paneWidth = (): number => estate() / fit();
const drawWidth = (): void => ui.row.style.setProperty("--pane", `${paneWidth()}px`);

/** A pane's scroll box, and the room above a brief scrolled to, so its heading breathes. */
const scrollBox = (pane: HTMLElement): HTMLElement => pane.querySelector<HTMLElement>(".scroll")!;
const ABOVE = 24;

/** Panes are kept by address: those on the path stay, with their scroll, and the rest go. */
function drawPanes(): void {
  const wanted = panesOf(state.opened);
  const have = new Set(all<HTMLElement>(".pane", ui.row).map((el) => el.dataset.level!));
  all<HTMLElement>(".pane", ui.row)
    .filter((el) => !wanted.includes(el.dataset.level!))
    .forEach((el) => el.remove());
  wanted
    .filter((a) => !have.has(a))
    .forEach((a) => {
      const el = document.createElement("section");
      el.className = "pane";
      el.dataset.level = a;
      el.innerHTML = paneHtml(a);
      const box = scrollBox(el);
      box.addEventListener(
        "scroll",
        () => {
          el.classList.toggle("scrolled", box.scrollTop > 2);
          drawCursor(el);
        },
        { passive: true },
      );
      ui.row.appendChild(el);
    });
  // The path marks move with the opened address, so every pane's marks are refreshed.
  const onPath = new Set(prefixesOf(state.opened));
  all<HTMLElement>(".brief", ui.row).forEach((art) => {
    art.classList.toggle("on", onPath.has(art.dataset.a!));
    art.classList.toggle("here", art.dataset.a === state.opened);
  });
  drawStrips();
}

/** The band above every pane, as wide as the prose beneath it, with the reading cursor on it. */
function drawStrips(): void {
  const panes = panesOf(state.opened);
  all<HTMLElement>(".pane", ui.row).forEach((el) => {
    const a = el.dataset.level!;
    const deeper = state.opened !== a && state.opened.startsWith(a === "" ? "" : a + "/") ? state.opened : null;
    const next = panes[panes.indexOf(a) + 1] ?? deeper;
    const w = Math.max(40, Math.floor(el.querySelector<HTMLElement>(".prose")!.getBoundingClientRect().width));
    el.querySelector<HTMLElement>(".strip")!.innerHTML = bandSvg(a, w, 28, next, "above").replace(/^(<svg[^>]*>)/, `$1<rect class="cursor" x="0" y="0" width="0" height="28" rx="7"/>`);
    drawCursor(el);
  });
}

/** Moves a pane's reading cursor to where its scroll box stands. */
function drawCursor(pane: HTMLElement): void {
  const svg = pane.querySelector<SVGSVGElement>("svg.above");
  const cursor = svg?.querySelector<SVGRectElement>(".cursor");
  if (!svg || !cursor) return;
  const box = scrollBox(pane);
  const c = cursorOf(pane.dataset.level!, Number(svg.getAttribute("width")), box.scrollTop, box.scrollTop + box.clientHeight, laidOf(box));
  cursor.setAttribute("x", c ? c.x.toFixed(1) : "0");
  cursor.setAttribute("width", c ? c.w.toFixed(1) : "0");
}

function drawPath(): void {
  ui.pathBox.innerHTML = pathSvg(Math.max(80, Math.floor(ui.pathBox.getBoundingClientRect().width)), 30);
}

/** Shifts the row by whole panes so the leftmost in view is `state.shift`, or the deepest that fit. */
function drawShift(): void {
  const n = panesOf(state.opened).length;
  const f = fit();
  const max = Math.max(0, n - f);
  const s = state.shift < 0 ? max : Math.min(max, state.shift);
  ui.row.style.transform = `translateX(${-s * paneWidth()}px)`;
  // The path's cursor spans the panes in view.
  const svg = ui.pathBox.querySelector<SVGSVGElement>("svg.path");
  const cursor = svg?.querySelector<SVGRectElement>(".cursor");
  const step = Number(svg?.dataset.step ?? 0);
  cursor?.setAttribute("x", `${s * step - 6}`);
  cursor?.setAttribute("width", `${Math.min(n, f) * step - PATH.gap + 12}`);
}

/** The plate takes a free slot when the panes leave one, and otherwise the bottom-left of the pane already read. */
function drawPlate(): void {
  ui.plateBox.hidden = !state.plate;
  ui.header.querySelector(".plate-toggle")?.classList.toggle("on", state.plate);
  const n = panesOf(state.opened).length;
  const free = n < fit();
  const left = free ? n * paneWidth() : 0;
  const S = Math.floor(Math.min(free ? estate() - left : paneWidth(), ui.viewport.getBoundingClientRect().height));
  ui.plateBox.style.left = `${Math.round(left)}px`;
  ui.plateBox.style.width = `${S}px`;
  ui.plateBox.style.height = `${S}px`;
  ui.plateBox.innerHTML = state.plate && state.body ? plateSvg(S) : "";
}

function drawAll(): void {
  if (!state.body) return;
  drawWidth();
  drawPanes();
  drawPath();
  drawShift();
  drawPlate();
  light();
}

// ## 3.8 One brief lit, and one overlay

/** Lights the pointed brief wherever it is drawn; where a figure stepped down past it, the cell holding it. */
function light(): void {
  const a = state.pointed;
  all<HTMLElement>(".lit").forEach((el) => el.classList.remove("lit"));
  if (a === null) return;
  const exact = all<HTMLElement>(`[data-a="${cssEsc(a)}"]`).filter((el) => !(state.fromPane && el.classList.contains("brief")));
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

/** Tells the rest of a brief beside whatever raised it, outside the bounds of that figure. */
function tell(a: string, raiser: HTMLElement, px: number, py: number): void {
  if (!brief(a)) return hideTell();
  ui.tell.innerHTML = tellHtml(a);
  ui.tell.hidden = false;
  // The figure that raised it: the plate's box, a pane, or one of the small figures.
  const fig = raiser.closest<HTMLElement>(".plate-box") ?? raiser.closest<HTMLElement>(".fig, .pane") ?? raiser;
  const beside = fig.classList.contains("pane") || fig.classList.contains("plate-box");
  const r = fig.getBoundingClientRect();
  const { offsetWidth: tw, offsetHeight: th } = ui.tell;
  const { innerWidth: vw, innerHeight: vh } = window;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  // beside a region: to its right or its left; beneath a figure, or above it when there is no room
  const x = beside ? (r.right + 10 + tw <= vw ? r.right + 10 : r.left - tw - 10 >= 4 ? r.left - tw - 10 : clamp(px + 16, 4, vw - tw - 4)) : clamp(px - 40, 8, vw - tw - 8);
  const y = beside ? clamp(py - 24, 8, vh - th - 8) : clamp(r.bottom + 8 + th <= vh ? r.bottom + 8 : r.top - th - 8, 8, vh - th - 8);
  ui.tell.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

const hideTell = (): void => void (ui.tell.hidden = true);

function point(a: string | null, raiser?: HTMLElement, px = 0, py = 0): void {
  if (state.scrubbing) return;
  state.pointed = a;
  light();
  if (a === null || !raiser) hideTell();
  else tell(a, raiser, px, py);
}

/** A line in the header for what the reader is owed a word about: an address that did not resolve. */
const notice = (text: string): void => void (ui.notice.textContent = text);

// ## 3.9 Moving: pressing goes, dragging scrubs, and the address sits after a hash

const readHash = (): string => decodeURIComponent(location.hash.replace(/^#\/?/, "")).replace(/\/+$/, "");

function goTo(a: string): void {
  const same = readHash() === a;
  location.hash = `#/${a}`;
  if (same) opened(a); // the same hash: the browser fires nothing
}

/** Opens an address: the panes follow its path, and a brief reached by link is brought into view. */
function opened(a: string): void {
  state.shift = -1;
  state.opened = brief(a) ? a : nearest(a);
  notice(state.opened === a ? "" : `No brief at ${a}; showing ${state.opened || "the root"} instead.`);
  drawAll();
  const art = ui.row.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.opened)}"]`);
  const box = art?.closest<HTMLElement>(".scroll");
  if (!art || !box) return;
  const br = box.getBoundingClientRect();
  const ar = art.getBoundingClientRect();
  if (ar.top < br.top || ar.top > br.bottom - 80) box.scrollTo({ top: art.offsetTop - ABOVE, behavior: "smooth" });
}

/** Scrubbing a level's band moves the reading beneath it to the brief under the pointer, and lights it. */
const laidOf = (box: HTMLElement): Laid => all<HTMLElement>(".brief", box).map((b) => ({ a: b.dataset.a!, top: b.offsetTop, height: b.offsetHeight }));

/** Scrubbing a level's band drags its cursor: the pointer keeps its hold on the cursor, and the reading follows. */
function scrubBand(svg: SVGSVGElement, clientX: number, grab: number): void {
  const pane = svg.closest<HTMLElement>(".pane");
  if (!pane) return;
  const box = scrollBox(pane);
  const r = svg.getBoundingClientRect();
  const w = Number(svg.getAttribute("width"));
  const x = ((clientX - r.left) / r.width) * w - grab;
  box.scrollTop = scrollY(svg.dataset.level!, w, Math.max(0, Math.min(w, x)), laidOf(box));
  drawCursor(pane);
}

/** Scrubbing the path drags its cursor, and the row follows by whole panes. */
function scrubPath(svg: SVGSVGElement, clientX: number, grab: number): void {
  const max = Math.max(0, panesOf(state.opened).length - fit());
  const r = svg.getBoundingClientRect();
  const x = ((clientX - r.left) / r.width) * Number(svg.getAttribute("width")) - grab;
  state.shift = Math.max(0, Math.min(max, Math.round(x / Number(svg.dataset.step))));
  drawShift();
}

/** Wires the gestures: pointing tells, dragging scrubs, pressing goes; one meaning each. */
function wire(): void {
  const named = (e: Event) => (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-a]") ?? null;

  document.addEventListener("pointermove", (e) => {
    const t = e.target as HTMLElement;
    const el = named(e);
    // A brief in a pane is already in front of the reader: pointing anywhere in it keeps the figures in step
    // with the reading and tells nothing. Cells and links tell.
    const isBrief = (el?.classList.contains("brief") ?? false) && !t.closest(".fig");
    state.fromPane = isBrief;
    point(el ? el.dataset.a! : null, isBrief ? undefined : (el ?? undefined), e.clientX, e.clientY);
  });
  document.documentElement.addEventListener("pointerleave", () => point(null));

  // press and drag on figures: a press goes, a drag scrubs
  let down: { x: number; y: number; svg: SVGSVGElement; moved: boolean; a: string | null; grab: number } | null = null;
  const release = () => {
    down = null;
    state.scrubbing = false;
  };
  document.addEventListener("pointerdown", (e) => {
    const svg = (e.target as HTMLElement).closest<SVGSVGElement>("svg.fig");
    if (!svg || e.button !== 0) return;
    // Taking hold of the cursor keeps the offset under the pointer; taking hold elsewhere centres it there.
    const cursor = svg.querySelector<SVGRectElement>(".cursor");
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * Number(svg.getAttribute("width"));
    const cx = Number(cursor?.getAttribute("x") ?? 0);
    const cw = Number(cursor?.getAttribute("width") ?? 0);
    const onCursor = (e.target as Element).classList.contains("cursor");
    down = { x: e.clientX, y: e.clientY, svg, moved: false, a: named(e)?.dataset.a ?? null, grab: onCursor ? x - cx : cw / 2 };
    if (e.isPrimary) svg.setPointerCapture(e.pointerId);
  });
  document.addEventListener("pointermove", (e) => {
    if (!down || (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4)) return;
    down.moved = true;
    state.scrubbing = true;
    hideTell();
    if (down.svg.classList.contains("path")) scrubPath(down.svg, e.clientX, down.grab);
    else if (down.svg.classList.contains("above")) scrubBand(down.svg, e.clientX, down.grab);
  });
  document.addEventListener("pointerup", (e) => {
    if (!down) return;
    const d = down;
    release();
    if (d.moved) return;
    const step = (e.target as HTMLElement).closest<SVGGElement>(".step");
    const onPath = d.a !== null && (state.opened === d.a || state.opened.startsWith(d.a + "/"));
    if (d.a !== null && !(onPath && d.svg.classList.contains("path"))) return void goTo(d.a);
    // On the path, a press on what is already open moves the row to its pane rather than opening it again.
    const panes = panesOf(state.opened);
    const i = d.a !== null ? panes.indexOf(level(d.a).length ? d.a : parentOf(d.a)) : step ? Number(step.dataset.pane) : -1;
    if (i < 0) return;
    state.shift = i;
    drawShift();
  });

  // A sideways swipe over the panes steps the row, one pane at a time.
  let swept = 0;
  ui.viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 24) return;
      e.preventDefault();
      if (performance.now() - swept < 450) return;
      swept = performance.now();
      const max = Math.max(0, panesOf(state.opened).length - fit());
      const now = state.shift < 0 ? max : state.shift;
      state.shift = Math.max(0, Math.min(max, now + Math.sign(e.deltaX)));
      drawShift();
    },
    { passive: false },
  );
  document.addEventListener("pointercancel", release);
  document.addEventListener("lostpointercapture", () => (down?.moved ? release() : undefined));

  // pressing a door opens the level beneath it; a link or a figure inside it, and a selection, are not a press
  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const door = t.closest<HTMLElement>(".brief.door");
    if (!door || t.closest("a, svg.fig") || window.getSelection()?.toString()) return;
    goTo(door.dataset.a!);
  });

  ui.header.querySelector(".plate-toggle")!.addEventListener("click", () => {
    state.plate = !state.plate;
    drawPlate();
  });
  window.addEventListener("hashchange", () => opened(readHash()));
  window.addEventListener("resize", () => {
    drawWidth();
    drawStrips();
    drawPath();
    drawShift();
    drawPlate();
  });
}

// ## 3.10 Where the body comes from
//
// Published, the body is inside the page and is read before the page is drawn
// over. Live, it is asked of the process, and asked again whenever the change
// stream says a file moved.

const inlined: string | null = typeof document === "undefined" ? null : (document.getElementById("substrate")?.textContent ?? null);

const load = async (): Promise<Body> => (inlined !== null ? JSON.parse(inlined) : (await fetch("/body")).json());

function setBody(body: Body): void {
  state.body = body;
  state.index = indexBody(body);
  document.title = body.title || "The surface";
  ui.header.querySelector(".root-title")!.textContent = body.title;
  const w = ui.header.querySelector<HTMLElement>(".warnings")!;
  w.textContent = body.warnings.length ? `${body.warnings.length} warning${body.warnings.length > 1 ? "s" : ""}` : "";
  w.title = body.warnings.join("\n");
  body.warnings.forEach((x) => console.warn(x));
  // every pane is drawn again from the new body, keeping its scroll
  const scrolls = new Map(all<HTMLElement>(".pane", ui.row).map((el) => [el.dataset.level!, scrollBox(el).scrollTop]));
  ui.row.innerHTML = "";
  opened(readHash());
  all<HTMLElement>(".pane", ui.row).forEach((el) => (scrollBox(el).scrollTop = scrolls.get(el.dataset.level!) ?? 0));
}

async function start(): Promise<void> {
  document.body.innerHTML = `
    <header id="header">
      <div class="bar"><span class="root-title chrome"></span><span class="warnings chrome dim"></span><span class="notice chrome"></span><button class="plate-toggle chrome" type="button">plate</button></div>
      <div id="path"></div>
    </header>
    <main id="viewport"><div id="row"></div><div id="plate-box" class="plate-box" hidden></div></main>
    <div id="tell" hidden></div>`;
  const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!;
  ui = { header: $("#header"), pathBox: $("#path"), row: $("#row"), viewport: $("#viewport"), tell: $("#tell"), plateBox: $("#plate-box"), notice: $("#header .notice") };
  wire();
  setBody(await load());
  if (inlined === null) new EventSource("/changes").onmessage = async () => setBody(await load());
}

if (typeof document !== "undefined") start();

// ## 3.11 The page's style
//
// Flat, as the design language asks: no boxes, hierarchy from type and rhythm,
// ink only for a live fact. Six type registers on two faces, a serif for the
// prose and a sans for the chrome. The page is white. This part stays with the
// server, which writes it into the page's head.

const CSS = `
:root {
  --ink: #141414; --muted: #6b6b6b; --dim: #a3a3a3; --ground: #ffffff;
  --serif: "Source Serif 4", "Iowan Old Style", "Charter", Georgia, serif;
  --sans: "Source Sans 3", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --s1: 1.75rem; --s2: 1.375rem; --s3: 1.0625rem; --s4: .9375rem; --s5: .8125rem; --s6: .6875rem;
  /* One rhythm: the gap stands between the header and the path, the path and the bands, a band and its text, and
     a pane and its edge, so two panes stand two gaps apart. */
  --gap: 24px; --gutter: var(--gap); --measure: 592px;
  --h: 60;
}
/* Colour follows the branch: every element that names a brief carries its hue, and these derive from it. */
*, ::before, ::after {
  --rest: oklch(88% 0.045 var(--h)); --door: oklch(74% 0.085 var(--h)); --on: oklch(42% 0.09 var(--h));
  --lit: oklch(58% 0.17 var(--h)); --tint: oklch(96.5% 0.02 var(--h));
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { display: flex; flex-direction: column; background: var(--ground); color: var(--ink); font-family: var(--serif); font-size: var(--s3); line-height: 1.6; overflow: hidden; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: underline; text-decoration-color: var(--door); text-decoration-thickness: 1px; text-underline-offset: .18em; }
a:hover, a.lit { text-decoration-color: var(--lit); }
a.web { text-decoration-style: dotted; }
a.owed { text-decoration-style: dashed; color: var(--muted); cursor: help; }
a.outside { text-decoration-style: dotted; color: var(--muted); cursor: help; }
.chrome { font-family: var(--sans); font-size: var(--s5); color: var(--muted); letter-spacing: .01em; }
.dim { color: var(--dim); }

#header { flex: 0 0 auto; padding: var(--gap) var(--gutter) 0; }
#header .bar { display: flex; align-items: baseline; gap: 16px; min-height: 1.4rem; }
#header .root-title { color: var(--ink); font-weight: 600; }
#header .warnings { cursor: help; }
#header .notice { color: var(--lit); }
.plate-toggle { margin-left: auto; background: none; border: 0; padding: 2px 8px; border-radius: 6px; cursor: pointer; color: var(--muted); font: inherit; }
.plate-toggle:hover { background: rgba(0,0,0,.05); }
.plate-toggle.on { color: var(--ink); }
#path { margin-top: var(--gap); }

#viewport { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; }
#row { display: flex; height: 100%; transition: transform .28s cubic-bezier(.2,.7,.2,1); will-change: transform; }
.pane { --gutter: max(var(--gap), (var(--pane) - var(--measure)) / 2); position: relative; flex: 0 0 var(--pane); width: var(--pane); height: 100%; display: flex; flex-direction: column; padding: 0 var(--gutter); }
.pane .strip { flex: 0 0 auto; padding: var(--gap) 0 0; }
.pane .scroll { position: relative; flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; margin: 0 calc(-1 * var(--gutter)); padding: var(--gap) var(--gutter) 6rem; scrollbar-width: none; }
.pane .scroll::-webkit-scrollbar { display: none; }
/* The seam is summoned only while text has passed beneath the band. It fills the gap between the band and the
   text with the ground fading out under a faint tint, so the text dissolves as it enters the gap; it spills a
   little past the measure on either side and fades out there. */
.pane .scroll::before { content: ""; position: sticky; top: 0; z-index: 1; display: block; height: var(--gap); margin: 0 0 calc(-1 * var(--gap)) calc(-1 * var(--gap)); width: calc(100% + 2 * var(--gap));
  background: linear-gradient(rgba(0,0,0,.06), rgba(0,0,0,0)), linear-gradient(var(--ground) 0%, var(--ground) 20%, rgba(255,255,255,0) 100%);
  -webkit-mask-image: linear-gradient(to right, transparent, black var(--gap), black calc(100% - var(--gap)), transparent); mask-image: linear-gradient(to right, transparent, black var(--gap), black calc(100% - var(--gap)), transparent);
  opacity: 0; transition: opacity .2s; pointer-events: none; }
.pane.scrolled .scroll::before { opacity: 1; }
.prose { width: 100%; }
.opening { margin-bottom: 40px; }
.opening h1 { font-size: var(--s1); font-weight: 600; line-height: 1.15; letter-spacing: -.012em; margin: 8px 0 16px; }
.record { margin: 4px 0 24px; }

.brief { position: relative; margin: 0 0 40px; }
.brief.door { cursor: pointer; }
.brief.door a, .brief.door pre { cursor: auto; }
/* A door under the pointer, or lit from a figure, shows it in its heading and never over the prose. */
.brief.door:hover .num, .brief.door:hover .title, .brief.lit .num, .brief.lit .title { color: var(--on); }
.brief.on .num { color: var(--on); font-weight: 600; }
.brief.here .num { color: var(--lit); }
.face { display: flex; align-items: baseline; font-size: var(--s2); font-weight: 600; line-height: 1.2; letter-spacing: -.012em; margin: 0 0 12px; transition: color .12s; }
.face .num { flex: 0 0 auto; margin-right: .5rem; font-family: var(--sans); font-size: var(--s5); font-weight: 500; letter-spacing: 0; color: var(--dim); }
.face .title { flex: 1 1 auto; }
.face svg.beside { flex: 0 0 auto; align-self: center; margin-left: 16px; }
.brief p, .brief li { margin: 0 0 12px; }
.brief li { margin-bottom: 8px; }
.brief ul, .brief ol { padding-left: 1.4rem; margin: 0 0 12px; }
.brief blockquote { margin: 0 0 12px; padding-left: 16px; border-left: 2px solid var(--rest); color: var(--muted); }
.brief pre { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: var(--s5); line-height: 1.5; background: rgba(0,0,0,.035); border-radius: 10px; padding: 12px 16px; overflow-x: auto; margin: 0 0 12px; }
.brief code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: .92em; }
.brief .table { overflow-x: auto; margin: 0 0 12px; }
.brief table { border-collapse: collapse; font-family: var(--sans); font-size: var(--s5); line-height: 1.4; }
.brief th { text-align: left; font-weight: 600; padding: 4px 12px 4px 0; border-bottom: 1px solid var(--rest); }
.brief td { padding: 4px 12px 4px 0; vertical-align: top; }
.brief em { font-style: italic; }
.brief hr { border: 0; border-top: 1px solid var(--rest); margin: 16px 0; }
.stray { color: var(--muted); }
.foot { font-family: var(--sans); font-size: var(--s5); color: var(--muted); margin-top: -4px; }

svg.fig { display: block; overflow: visible; touch-action: none; user-select: none; }
svg.fig .hit { fill: transparent; }
svg.fig .seg { fill: var(--rest); }
svg.fig .door { fill: var(--door); }
svg.fig .door.more { opacity: .55; }
svg.fig .cell.on .seg, svg.fig .cell.on .door { fill: var(--on); }
svg.fig .cell.lit .seg, svg.fig .cell.lit .door { fill: var(--lit); }
svg.fig .cell { cursor: pointer; }
svg.fig .cursor { fill: rgba(0,0,0,.055); cursor: grab; }

.plate-box { position: absolute; left: 0; bottom: 0; background: var(--ground); z-index: 3; }
svg.plate .cell path, svg.plate .cell circle { fill: var(--rest); }
svg.plate .cell.centre circle { --h: 60; fill: oklch(92% 0.01 var(--h)); }
svg.plate .cell.more path { fill: oklch(83% 0.06 var(--h)); }
svg.plate .cell.on path { fill: var(--door); }
svg.plate .cell.lit path, svg.plate .cell.lit circle { fill: var(--lit); }
svg.plate .label { font-family: var(--sans); font-size: 11px; fill: var(--ink); pointer-events: none; }
svg.plate .label.lit, svg.plate .cell.lit .label { fill: var(--ground); }

#tell { position: fixed; left: 0; top: 0; z-index: 10; pointer-events: none; width: 20rem; max-width: calc(100vw - 16px);
  background: rgba(255,255,255,.86); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,.07); border-radius: 12px; padding: 12px 16px 10px; font-size: var(--s4); line-height: 1.45; }
#tell .tell-face { display: flex; gap: 8px; align-items: baseline; font-weight: 600; font-size: var(--s3); margin-bottom: 4px; }
#tell .tell-face .num { font-family: var(--sans); font-size: var(--s5); font-weight: 500; color: var(--dim); }
#tell p { margin: 0 0 8px; }
#tell .chrome { margin-top: 4px; }
#tell .tell-level { margin: 8px 0 2px; }
#tell .tell-level svg { margin-bottom: 2px; }

@media (max-width: 720px) {
  :root { --gap: 16px; }
  #tell { width: calc(100vw - 16px); }
}
`;

// The run, last, so that everything it calls stands above it.
if (import.meta.main) run();
