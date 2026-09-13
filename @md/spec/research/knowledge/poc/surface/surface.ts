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
// The page draws from a small shared state and nothing else: the body and its
// index, the address in focus, the address the pointer rests on, the grade of
// every brief in the lane, and the settings. Five areas stand in a row, a wing,
// a gutter, the lane, a gutter, a wing. The lane is prose; the rest is widgets,
// plain functions in one table, chosen per area from a strip of icons at its
// foot, and an area closes to a rail of those icons. Everything drawn that
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

/** A brief in the lane stands at one of three grades; a brief not in the lane has none. */
type Grade = "heading" | "face" | "whole";
const GRADES: Grade[] = ["heading", "face", "whole"];

type AreaName = "wingL" | "gutterL" | "gutterR" | "wingR";
type Settings = {
  zoom: number;
  ratio: number;
  measure: number;
  gap: number;
  fade: number;
  flick: number;
  areas: Record<AreaName, string>;
};

const DEFAULTS: Settings = {
  zoom: 1,
  ratio: 1.25,
  measure: 600,
  gap: 24,
  fade: 0.4,
  flick: 1,
  areas: { wingL: "shape", gutterL: "none", gutterR: "links", wingR: "ahead" },
};

const state = {
  body: null as Body | null,
  index: null as Index | null,
  /** the brief under the reading line; its address is the page's address */
  focus: "",
  pointed: null as string | null,
  /** every brief in the lane and its grade; a brief absent here is not drawn */
  grades: new Map<string, Grade>(),
  /** the briefs opened in the tree, which is the tree's own state and not the lane's */
  treeOpen: new Set<string>(),
  settings: { ...DEFAULTS, areas: { ...DEFAULTS.areas } } as Settings,
  /** set while a drag is in progress, so pointing does not fight it */
  scrubbing: false,
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
  const path = prefixesOf(address);
  g.set("", "whole");
  path.forEach((p) => level(p).forEach((c) => g.set(c.address, path.includes(c.address) || p === parentOf(address) ? "whole" : "face")));
  closeLay();
  path.forEach((p) => state.treeOpen.add(p));
}

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

const nextGrade = (grade: Grade | null): Grade => GRADES[(GRADES.indexOf(grade ?? "heading") + 1) % GRADES.length];

/** The grade a level stands at: that of its first brief in the lane, or none. */
const levelGrade = (parent: string): Grade | null => level(parent).map((b) => gradeOf(b.address)).find((x) => x !== null) ?? null;

const CHEVRON = `<svg viewBox="0 0 10 10"><path d="M3.2 1.8 6.6 5 3.2 8.2"/></svg>`;

/** The fold mark beside a brief in the lane: a chevron that turns down when whole, points right at a face, and stands hollow at a heading. */
const foldMark = (b: Brief): string =>
  `<button class="mark ${gradeOf(b.address) ?? "none"}${b.door ? "" : " leaf"}" data-fold="${esc(b.address)}" title="fold or open">${CHEVRON}</button>`;

/** One brief in the lane at its grade. */
function articleHtml(b: Brief, g: Grade): string {
  const d = Math.min(4, depthOf(b.address));
  const face = g === "face" ? blocksOf(b).find((t) => t.type === "paragraph") : undefined;
  const on = prefixesOf(state.focus).includes(b.address);
  return (
    `<article class="brief ${g}${on ? " on" : ""}${b.address === state.focus ? " here" : ""}" data-a="${esc(b.address)}" ${hued(b.address)}>` +
    `<h2 class="head d${d}">${foldMark(b)}<span class="num">${esc(shownNumber(b))}</span><span class="title" data-go="${esc(b.address)}">${esc(b.title)}</span></h2>` +
    (g === "whole" ? blocks(b.body) : face ? `<p class="first">${inline(face.tokens)}</p>` : "") +
    `</article>`
  );
}

/** The lane as a whole: the root's opening, then every brief in reading order at its grade. */
function laneHtml(): string {
  const root = brief("")!;
  const opening = `<header class="opening brief${state.focus === "" ? " here" : ""}" data-a=""><h1>${esc(root.title)}</h1>${blocks(root.body)}</header>`;
  const recordNote = (parent: string) => (level(parent)[0]?.kind === "record" ? `<p class="chrome record">A record: its order is when each entry happened, and nothing ranks them.</p>` : "");
  const drawLevel = (parent: string): string =>
    recordNote(parent) +
    level(parent)
      .map((b) => {
        const g = gradeOf(b.address);
        return g === null ? "" : articleHtml(b, g) + (g === "whole" ? drawLevel(b.address) : "");
      })
      .join("");
  return opening + drawLevel("");
}

// ## 3.4 The areas, the widgets, and the strip
//
// Five areas in a row. A widget is one entry in one table: an adjunct stands in
// a gutter and returns what belongs beside a brief; a figure stands in a wing
// and returns a drawing of the body. The strip at an area's foot chooses, and
// choosing nothing closes the area to a rail of the same icons.

type Adjunct = { kind: "adjunct"; name: string; icon: string; of: (b: Brief, article: HTMLElement) => { at: HTMLElement | null; html: string }[] };
type Figure = { kind: "figure"; name: string; icon: string; draw: (w: number, h: number) => string; onFocus?: boolean; onPoint?: boolean };
type Widget = Adjunct | Figure;

const ICON: Record<string, string> = {
  none: `<path d="M5 5l6 6M11 5l-6 6"/>`,
  shape: `<path d="M3 3h7M3 6h9M6 9h6M6 12h4"/>`,
  tree: `<path d="M3 3h4M6 8h6M8 13h5M4.5 3v5M6.5 8v5"/>`,
  ahead: `<path d="M2 3v10M6 3v5M6 8v5M10 3v2M10 5v3M10 8v5M2 3h12M2 8h8M2 13h12M2 5h8"/>`,
  plate: `<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/>`,
  settings: `<path d="M4 11.5a5.5 5.5 0 1 1 8 0"/><path d="M8 8v-3"/>`,
  links: `<path d="M6 10 10 6M4.5 8.5 3 10a2.1 2.1 0 0 0 3 3l1.5-1.5M11.5 7.5 13 6a2.1 2.1 0 0 0-3-3L8.5 4.5"/>`,
};
const icon = (name: string): string => `<svg class="icon" viewBox="0 0 16 16">${ICON[name] ?? ICON.none}</svg>`;

const WIDGETS: Record<string, Widget> = {
  none: { kind: "figure", name: "close", icon: "none", draw: () => "" },
  shape: { kind: "figure", name: "the shape: the lane as laid", icon: "shape", draw: (w, h) => shapeSvg(w, h) },
  tree: { kind: "figure", name: "the tree", icon: "tree", draw: () => treeHtml(), onFocus: true },
  ahead: { kind: "figure", name: "the ahead: what lies beneath and is not in the lane", icon: "ahead", draw: (w, h) => aheadSvg(w, h), onFocus: true, onPoint: true },
  plate: { kind: "figure", name: "the plate: the body whole", icon: "plate", draw: (w, h) => plateSvg(Math.floor(Math.min(w, h))) },
  settings: { kind: "figure", name: "settings", icon: "settings", draw: () => settingsHtml() },
  links: { kind: "adjunct", name: "links: what a brief points at, and what points at it", icon: "links", of: (b, el) => linkAdjuncts(b, el) },
};

const AREAS: { name: AreaName; kind: Widget["kind"] }[] = [
  { name: "wingL", kind: "figure" },
  { name: "gutterL", kind: "adjunct" },
  { name: "gutterR", kind: "adjunct" },
  { name: "wingR", kind: "figure" },
];
const widgetOf = (area: AreaName): Widget => WIDGETS[state.settings.areas[area]] ?? WIDGETS.none;
const isOpen = (area: AreaName): boolean => state.settings.areas[area] !== "none" && state.settings.areas[area] in WIDGETS;
const choicesFor = (kind: Widget["kind"]): string[] => Object.keys(WIDGETS).filter((k) => k === "none" || WIDGETS[k].kind === kind);

/** The strip of an area: one light icon per widget it can hold, the one in use a little darker; closed, it stands as a rail. */
const stripHtml = (area: AreaName, kind: Widget["kind"]): string =>
  `<div class="strip${isOpen(area) ? "" : " rail"}" data-strip="${area}">${choicesFor(kind)
    .map((k) => `<button class="pick${state.settings.areas[area] === k ? " on" : ""}" data-area="${area}" data-widget="${k}" title="${esc(WIDGETS[k].name)}">${icon(WIDGETS[k].icon)}</button>`)
    .join("")}</div>`;

// ## 3.5 The tree: where you came from
//
// The body as a tree, opened along the path and further as the reader opens
// it; the tree's own opening is not the lane's grade. The name goes; the mark
// opens or closes the node; a line lies across the row of the focus.

function treeHtml(): string {
  const node = (b: Brief, d: number): string => {
    const open = state.treeOpen.has(b.address);
    const kids = level(b.address);
    const on = prefixesOf(state.focus).includes(b.address);
    return (
      `<div class="node"><div class="row${on ? " on" : ""}${b.address === state.focus ? " here" : ""}" data-a="${esc(b.address)}" style="--h:${hueOf(b.address)};--d:${d}">` +
      (kids.length ? `<button class="mark ${open ? "open" : "closed"}" data-toggle="${esc(b.address)}" title="open or close">${CHEVRON}</button>` : `<span class="mark leaf"></span>`) +
      `<span class="name" data-go="${esc(b.address)}">${esc(b.title)}</span></div>` +
      (open ? kids.map((k) => node(k, d + 1)).join("") : "") +
      `</div>`
    );
  };
  return `<div class="tree"><div class="row root${state.focus === "" ? " here" : ""}" data-a="" style="--d:0"><span class="mark leaf"></span><span class="name" data-go="">${esc(state.body!.title)}</span></div>${level("")
    .map((b) => node(b, 1))
    .join("")}<div class="laser"></div></div>`;
}

// ## 3.6 The ahead: what lies beneath, and is not in the lane
//
// For the pointed brief, or else the focus: its subtree as columns left to
// right, one per depth, each brief a cell as tall as its branch is heavy. Drawn
// only where the level beneath is not in the lane, and only as large as it
// needs to be.

const AHEAD = { floor: 14, gap: 3, col: 120, row: 21 };

type Bar = { a: string; x: number; y: number; w: number; h: number; more: boolean; label: string | null };

function layoutAhead(root: string, W: number, H: number): Bar[] {
  const ix = state.index!;
  const depthBeneath = (a: string): number => Math.max(0, ...level(a).map((k) => 1 + depthBeneath(k.address)));
  const D = Math.max(1, Math.min(depthBeneath(root), Math.floor((W + AHEAD.gap) / (AHEAD.col + AHEAD.gap))));
  const cw = (W - AHEAD.gap * (D - 1)) / D;
  const col = (d: number) => d * (cw + AHEAD.gap);
  const fits = (kids: Brief[], d: number, h: number) => kids.length > 0 && d < D && kids.length * AHEAD.floor + (kids.length - 1) * AHEAD.gap <= h;
  const lay = (parent: string, y0: number, h: number, d: number): Bar[] => {
    const kids = level(parent);
    if (!fits(kids, d, h)) return [];
    const heights = spread(
      kids.map((k) => Math.max(1, ix.branch.get(k.address)!)),
      h - AHEAD.gap * (kids.length - 1),
      AHEAD.floor,
    );
    const ys = offsets(heights, AHEAD.gap);
    return kids.flatMap((k, i) => {
      const bar: Bar = {
        a: k.address,
        x: col(d),
        y: y0 + ys[i],
        w: cw,
        h: heights[i],
        more: level(k.address).length > 0 && !fits(level(k.address), d + 1, heights[i]),
        label: heights[i] >= 13 ? trim(k.title, Math.floor((cw - 10) / 5.8)) : null,
      };
      return [bar, ...lay(k.address, bar.y, heights[i], d + 1)];
    });
  };
  return lay(root, 0, H, 0);
}

/** The brief the ahead answers for: the pointed brief when its level is out of view, otherwise the focus. */
function aheadTarget(): string | null {
  const hidden = (a: string) => level(a).length > 0 && !level(a).some((k) => inLane(k.address));
  if (state.pointed !== null && brief(state.pointed) && hidden(state.pointed)) return state.pointed;
  return hidden(state.focus) ? state.focus : null;
}

function aheadSvg(W: number, H: number): string {
  const target = aheadTarget();
  if (target === null) return "";
  const depthBeneath = (a: string): number => Math.max(0, ...level(a).map((k) => 1 + depthBeneath(k.address)));
  const w = Math.min(W, depthBeneath(target) * (AHEAD.col + AHEAD.gap));
  const h = clamp(beneathCount(target) * AHEAD.row, 48, H - 24);
  const bars = layoutAhead(target, w, h);
  const cells = bars.map((b) => {
    const cls = `cell${b.more ? " more" : ""}`;
    return (
      `<g class="${cls}" data-a="${esc(b.a)}" ${hued(b.a)}><rect x="${b.x.toFixed(1)}" y="${b.y.toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.h.toFixed(1)}" rx="4"/>` +
      (b.label ? `<text x="${(b.x + 6).toFixed(1)}" y="${(b.y + Math.min(b.h / 2 + 4, 12)).toFixed(1)}">${esc(b.label)}</text>` : "") +
      `</g>`
    );
  });
  const t = brief(target)!;
  return `<div class="ahead-box"><div class="chrome dim">beneath ${esc(t.address === "" ? state.body!.title : t.title)}</div><svg class="fig ahead" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cells.join("")}</svg></div>`;
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

type Knob = { key: "zoom" | "ratio" | "measure" | "gap" | "fade"; name: string; min: number; max: number; step: number; glyph: string };
const KNOBS: Knob[] = [
  { key: "zoom", name: "zoom", min: 0.75, max: 1.6, step: 0.05, glyph: `<path d="M8 4v8M4 8h8"/>` },
  { key: "ratio", name: "heading ratio", min: 1, max: 1.6, step: 0.02, glyph: `<path d="M3 12h10M4.5 8.5h7M6 5h4"/>` },
  { key: "measure", name: "measure", min: 440, max: 900, step: 10, glyph: `<path d="M3 8h10M5 6v4M11 6v4"/>` },
  { key: "gap", name: "gap between areas", min: 8, max: 64, step: 2, glyph: `<path d="M3 4v8M13 4v8M6 8h4"/>` },
  { key: "fade", name: "fade", min: 0, max: 0.8, step: 0.05, glyph: `<path d="M8 3v10M4.5 6a4.5 4.5 0 0 0 0 4M11.5 6a4.5 4.5 0 0 1 0 4"/>` },
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
    const shown = k.key === "measure" || k.key === "gap" ? `${Math.round(s[k.key])}px` : s[k.key].toFixed(2);
    return (
      `<div class="knob" data-knob="${k.key}" title="${k.name}: ${shown}">` +
      `<svg viewBox="0 0 40 40"><path class="track" d="${meterArc(1, 15)}"/><path class="value" d="${meterArc(Math.max(t, 0.002), 15)}"/><g class="glyph" transform="translate(12 12)">${k.glyph}</g></svg>` +
      `<span class="hint chrome dim">${k.name} ${shown}</span></div>`
    );
  };
  return `<div class="settings"><div class="knobs">${KNOBS.map(knob).join("")}</div><div class="switches chrome"><button class="pick${s.flick ? " on" : ""}" data-set="flick" data-value="${s.flick ? 0 : 1}">flick ${s.flick ? "on" : "off"}</button></div></div>`;
}

const SETTINGS_KEY = "surface.settings";
function loadSettings(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
    if (saved) state.settings = { ...DEFAULTS, ...saved, areas: { ...DEFAULTS.areas, ...(saved.areas ?? {}) } };
  } catch {}
  AREAS.forEach(({ name }) => (state.settings.areas[name] in WIDGETS ? null : (state.settings.areas[name] = DEFAULTS.areas[name])));
}
const saveSettings = (): void => void localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));

// ## 3.9 The shape: the lane as laid
//
// Each brief in the lane as its blocks, a paragraph a block as tall as it is
// drawn, shifted right by the brief's depth, with the viewport drawn over it.
// Dragging scrubs; pressing goes.

const SHAPE = { indent: 9, bar: 46, pad: 6 };

/** The lane's briefs and their blocks as laid, in the scroll box's own coordinates. */
function laidBlocks(): { a: string; top: number; height: number; blocks: { top: number; height: number; head: boolean }[] }[] {
  const c = ui.content.getBoundingClientRect().top;
  return all<HTMLElement>(".brief", ui.lane).map((el) => {
    const r = el.getBoundingClientRect();
    const blocks = all<HTMLElement>(":scope > h1, :scope > h2, :scope > p, :scope > ul, :scope > ol, :scope > pre, :scope > blockquote, :scope > .table", el).map((b) => {
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
  const deepest = Math.max(0, ...laid.map((l) => depthOf(l.a)));
  const w = Math.min(W, SHAPE.pad * 2 + deepest * SHAPE.indent + SHAPE.bar);
  const cells = laid.map((l) => {
    const x = SHAPE.pad + depthOf(l.a) * SHAPE.indent;
    const bars = l.blocks
      .map((b) => `<rect class="${b.head ? "head" : "para"}" x="${x}" y="${(4 + b.top * k).toFixed(1)}" width="${b.head ? Math.round(SHAPE.bar * 0.6) : SHAPE.bar}" height="${Math.max(1.2, b.height * k - 1).toFixed(1)}" rx="1"/>`)
      .join("");
    return `<g class="cell${l.a === state.focus ? " here" : ""}" data-a="${esc(l.a)}" ${hued(l.a)}><rect class="hit" x="0" y="${(4 + l.top * k).toFixed(1)}" width="${w}" height="${Math.max(1, l.height * k).toFixed(1)}"/>${bars}</g>`;
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

/** Lays the body out radially inside a square of side `S`: sector by branch weight, ring by depth. */
function layoutPlate(S: number): { drops: Drop[]; rc: number } {
  const deepest = (drops: Drop[]) => Math.max(1, ...drops.map((d) => depthOf(d.a)));
  const first = layoutRings(S, Math.max(1, state.index!.depth));
  const again = deepest(first.drops) < first.D ? layoutRings(S, deepest(first.drops)) : first;
  return { drops: again.drops, rc: again.rc };
}

/** The plate with `D` rings outside a centre one ring thick. */
function layoutRings(S: number, D: number): { drops: Drop[]; rc: number; D: number } {
  const ix = state.index!;
  const R = (S / 2) * 0.97;
  const t = R / (D + 1);
  const rc = t;
  const ring = (d: number) => ({ r0: rc + (d - 1) * t + PLATE.gap / 2, r1: rc + d * t - PLATE.gap / 2 });
  const floorAt = (d: number) => Math.max(PLATE.floor, (ring(d).r1 - ring(d).r0) * 0.2);
  const full = (span: number) => span >= 2 * Math.PI - 1e-6;
  const gapsIn = (n: number, span: number) => (full(span) ? n : n - 1);
  const usable = (n: number, d: number, span: number) => span - (gapsIn(n, span) * sideGap(d)) / ring(d).r0;
  const fits = (kids: Brief[], d: number, span: number) => {
    const { r0, r1 } = ring(d);
    return kids.length > 0 && d <= D && r1 - r0 >= PLATE.floor && (kids.length * floorAt(d)) / r0 <= usable(kids.length, d, span);
  };
  const lay = (parent: string, a0: number, span: number, d: number): Drop[] => {
    const kids = level(parent);
    if (!fits(kids, d, span)) return [];
    const { r0, r1 } = ring(d);
    const angles = spread(
      kids.map((k) => Math.max(1, ix.branch.get(k.address)!)),
      usable(kids.length, d, span),
      floorAt(d) / r0,
    );
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
  if (S < 80) return "";
  const { drops, rc } = layoutPlate(S);
  const c = S / 2;
  const onPath = new Set(prefixesOf(state.focus));
  const cls = (d: Drop) => `${d.more ? " more" : ""}${onPath.has(d.a) ? " on" : ""}${inLane(d.a) ? "" : " away"}`;
  const cells = drops.map((d) => `<g class="cell${cls(d)}" data-a="${esc(d.a)}" ${hued(d.a)}><path d="${dropletPath(c, c, d.r0, d.r1, d.a0, d.a1, PLATE.round)}"/></g>`);
  const labels = drops
    .filter((d) => d.label)
    .map((d) => {
      const mid = (d.a0 + d.a1) / 2;
      const rm = (d.r0 + d.r1) / 2;
      const chord = 2 * d.r0 * Math.sin(Math.min(Math.PI, d.a1 - d.a0) / 2);
      return `<text class="label${onPath.has(d.a) ? " on" : ""}" data-a="${esc(d.a)}" x="${(c + rm * Math.cos(mid)).toFixed(1)}" y="${(c + rm * Math.sin(mid)).toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${esc(trim(d.label!, Math.floor((chord - 8) / 5.6)))}</text>`;
    });
  const centre = `<g class="cell centre${state.focus === "" ? " on" : ""}" data-a=""><circle cx="${c}" cy="${c}" r="${(rc - PLATE.gap / 2).toFixed(1)}"/><text class="label" x="${c}" y="${c}" text-anchor="middle" dominant-baseline="middle">${esc(trim(state.body!.title, Math.floor(rc / 3.4)))}</text></g>`;
  return `<svg class="fig plate" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${cells.join("")}${centre}${labels.join("")}</svg>`;
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
const RAIL = 30;

/** Which areas the width allows at all: the wings need room of their own, and the gutters go before the lane does. */
function fits(): Record<AreaName, boolean> {
  const s = state.settings;
  const W = ui.areas.getBoundingClientRect().width;
  const gutters = W >= s.measure + 2 * (GUTTER + s.gap) + 48;
  const wings = W >= s.measure + 2 * (GUTTER + 200 + 2 * s.gap) + 48;
  return { wingL: wings, gutterL: gutters, gutterR: gutters, wingR: wings };
}

/** Applies the settings: type registers from zoom and ratio, and the row of areas from measure, gap and what is open. */
function drawLayout(): void {
  const s = state.settings;
  const root = document.documentElement.style;
  const body = 17 * s.zoom;
  root.setProperty("--body", `${body.toFixed(2)}px`);
  root.setProperty("--t", `${(body * s.ratio ** 3).toFixed(2)}px`);
  root.setProperty("--h1", `${(body * s.ratio ** 2).toFixed(2)}px`);
  root.setProperty("--h2", `${(body * s.ratio).toFixed(2)}px`);
  root.setProperty("--h3", `${(body * Math.sqrt(s.ratio)).toFixed(2)}px`);
  root.setProperty("--gap", `${s.gap}px`);
  root.setProperty("--fade", `${s.fade}`);
  const on = fits();
  // a viewport narrower than the measure gives the lane what there is
  const measure = Math.min(s.measure, ui.areas.getBoundingClientRect().width - 32);
  root.setProperty("--measure", `${measure}px`);
  const gutter = (a: "gutterL" | "gutterR") => (!on[a] ? 0 : isOpen(a) ? GUTTER : RAIL);
  const wing = (a: "wingL" | "wingR") => (!on[a] ? "0px" : isOpen(a) ? "minmax(0, 1fr)" : `${RAIL}px`);
  const gl = gutter("gutterL");
  const gr = gutter("gutterR");
  const inner = [gl, measure, gr].filter((x) => x > 0);
  const mid = inner.reduce((x, y) => x + y, 0) + s.gap * (inner.length - 1);
  ui.areas.style.gridTemplateColumns = `${wing("wingL")} ${mid}px ${wing("wingR")}`;
  ui.areas.style.columnGap = `${s.gap}px`;
  ui.content.style.gridTemplateColumns = `${gl}px ${measure}px ${gr}px`;
  ui.content.style.columnGap = `${s.gap}px`;
  ui.parts.gutterL.hidden = gl === 0;
  ui.parts.gutterR.hidden = gr === 0;
  (["gutterL", "gutterR"] as const).forEach((a) => ui.parts[a].classList.toggle("closed", !isOpen(a)));
  (["wingL", "wingR"] as const).forEach((a) => ui.parts[a].classList.toggle("closed", !isOpen(a)));
}

/** Draws the lane whole and lays the adjuncts beside it. */
function drawLane(): void {
  ui.lane.innerHTML = laneHtml();
  drawAdjuncts();
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

/** The reading line: the middle of the scroll box. */
const readingLine = (): number => ui.scroll.getBoundingClientRect().top + ui.scroll.clientHeight * 0.5;

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
  all<HTMLElement>("svg.shape .cell", ui.areas).forEach((el) => el.classList.toggle("here", el.dataset.a === state.focus));
  const tree = ui.areas.querySelector<HTMLElement>(".tree");
  const row = tree?.querySelector<HTMLElement>(`.row[data-a="${cssEsc(state.focus)}"]`);
  const laser = tree?.querySelector<HTMLElement>(".laser");
  if (tree && laser) laser.hidden = !row;
  if (tree && laser && row) {
    laser.style.top = `${row.offsetTop + row.offsetHeight - 1}px`;
    laser.style.left = `${row.offsetLeft}px`;
    laser.style.width = `${row.offsetWidth}px`;
    const wing = tree.closest<HTMLElement>(".wing")!;
    const rr = row.getBoundingClientRect();
    const wr = wing.getBoundingClientRect();
    if (rr.top < wr.top + 24 || rr.bottom > wr.bottom - 48) wing.scrollTo({ top: row.offsetTop - wing.clientHeight / 2, behavior: "smooth" });
  }
}

/** Draws one wing's figure whole, into the box that centres it. */
function drawWing(area: "wingL" | "wingR"): void {
  const el = ui.parts[area];
  const widget = widgetOf(area);
  const box = el.querySelector<HTMLElement>(".box")!;
  box.innerHTML = fits()[area] && isOpen(area) && widget.kind === "figure" ? widget.draw(Math.floor(el.clientWidth - 2 * 20), Math.floor(el.clientHeight - 2 * 20 - 34)) : "";
}

function drawWings(only?: "focus" | "point"): void {
  (["wingL", "wingR"] as const).forEach((area) => {
    const w = widgetOf(area);
    if (!only || (w.kind === "figure" && (only === "focus" ? w.onFocus : w.onPoint))) drawWing(area);
  });
  drawFocusMarks();
}

/** The strips stand at the foot of their areas, laid over the row by the areas' own geometry. */
function drawStrips(): void {
  const on = fits();
  const a0 = ui.areas.getBoundingClientRect();
  ui.strips.innerHTML = AREAS.filter(({ name }) => on[name])
    .map(({ name, kind }) => stripHtml(name, kind))
    .join("");
  AREAS.forEach(({ name }) => {
    const strip = ui.strips.querySelector<HTMLElement>(`[data-strip="${name}"]`);
    if (!strip) return;
    const r = ui.parts[name].getBoundingClientRect();
    strip.style.left = `${Math.round(r.left - a0.left)}px`;
    strip.style.width = `${Math.round(r.width)}px`;
  });
}

function drawAll(): void {
  if (!state.body) return;
  drawLayout();
  drawLane();
  drawStrips();
  drawWings();
  light();
}

// ## 3.12 One brief lit, wherever it is drawn

function light(): void {
  const a = state.pointed;
  all<HTMLElement>(".lit").forEach((el) => el.classList.remove("lit"));
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

const readHash = (): string => decodeURIComponent(location.hash.replace(/^#\/?/, "")).replace(/\/+$/, "");
let arriving = false;

/** Goes to an address: enters the history, then arrives. */
function goTo(a: string): void {
  if (readHash() === a) return arrive(a);
  location.hash = `#/${a}`;
}

/** Arrives at an address: lays the lane afresh and scrolls the brief under the reading line. */
function arrive(a: string): void {
  arriving = true;
  const target = brief(a) ? a : nearest(a);
  notice(target === a ? "" : `No brief at ${a}; showing ${target || "the root"} instead.`);
  lay(target);
  state.focus = target;
  drawAll();
  scrollToFocus(false);
  arriving = false;
}

function scrollToFocus(smooth: boolean): void {
  const art = ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.focus)}"]`);
  if (!art) return;
  const top = art.getBoundingClientRect().top - ui.content.getBoundingClientRect().top;
  ui.scroll.scrollTo({ top: Math.max(0, top - ui.scroll.clientHeight * 0.5 + 24), behavior: smooth ? "smooth" : "auto" });
}

/** Scrolling moves the focus and nothing else; the address follows without entering the history. */
function onScroll(): void {
  drawShapeCursor();
  const f = focusUnderLine();
  if (f === state.focus) return;
  state.focus = f;
  prefixesOf(f).forEach((p) => state.treeOpen.add(p));
  if (!arriving) history.replaceState(null, "", `#/${f}`);
  drawWings("focus");
}

/** Changes grades under a function, keeping the focused heading where it stood on the screen. */
function refold(change: () => void): void {
  const before = ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.focus)}"]`)?.getBoundingClientRect().top;
  change();
  if (!inLane(state.focus)) state.focus = nearestInLane(state.focus);
  drawLane();
  const after = ui.lane.querySelector<HTMLElement>(`.brief[data-a="${cssEsc(state.focus)}"]`)?.getBoundingClientRect().top;
  if (before !== undefined && after !== undefined) ui.scroll.scrollTop += after - before;
  history.replaceState(null, "", `#/${state.focus}`);
  drawWings();
  light();
}

/** The fold mark cycles one brief: heading, face, whole, heading. Opening a brief not in the lane opens what leads to it. */
function cycle(a: string): void {
  if (a === "") return;
  refold(() => {
    if (!inLane(a)) prefixesOf(a).forEach((p) => p !== a && gradeOf(p) !== "whole" && setGrade(p, "whole"));
    setGrade(a, inLane(a) ? nextGrade(gradeOf(a)) : "whole");
  });
}

/** Every brief of one level to the next grade together. */
function cycleLevel(parent: string): void {
  refold(() => {
    const next = nextGrade(levelGrade(parent));
    level(parent).forEach((b) => setGrade(b.address, next));
  });
}

/** Up: the parent of the focus becomes the focus, without relaying the lane. */
function up(): void {
  const p = parentOf(state.focus);
  if (p === state.focus) return;
  state.focus = p;
  history.replaceState(null, "", `#/${p}`);
  scrollToFocus(true);
  drawWings("focus");
}

/** Wires the gestures: pointing lights, pressing goes, the mark folds, dragging scrubs, and keys do the same. */
function wire(): void {
  const named = (e: Event) => (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-a]") ?? null;

  document.addEventListener("pointermove", (e) => {
    const el = named(e);
    point(el ? el.dataset.a! : null);
  });
  document.documentElement.addEventListener("pointerleave", () => point(null));

  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const fold = t.closest<HTMLElement>("[data-fold]");
    if (fold) return void cycle(fold.dataset.fold!);
    const toggle = t.closest<HTMLElement>("[data-toggle]");
    if (toggle) {
      const a = toggle.dataset.toggle!;
      state.treeOpen.has(a) ? state.treeOpen.delete(a) : state.treeOpen.add(a);
      const wing = toggle.closest<HTMLElement>(".wing")!.dataset.area as "wingL" | "wingR";
      drawWing(wing);
      return void drawFocusMarks();
    }
    const pick = t.closest<HTMLElement>("[data-widget]");
    if (pick) {
      state.settings.areas[pick.dataset.area as AreaName] = pick.dataset.widget!;
      saveSettings();
      return void drawAll();
    }
    const set = t.closest<HTMLElement>("[data-set]");
    if (set) {
      (state.settings as unknown as Record<string, unknown>)[set.dataset.set!] = Number(set.dataset.value);
      saveSettings();
      return void drawAll();
    }
    if (t.closest("a[href]") || window.getSelection()?.toString()) return;
    const go = t.closest<HTMLElement>("[data-go]");
    if (go) return void goTo(go.dataset.go!);
    const cell = t.closest<HTMLElement>("svg.fig [data-a]");
    if (cell && !state.scrubbing) return void goTo(cell.dataset.a!);
  });

  // dragging: a knob turns, the shape scrubs
  let drag: { kind: "knob" | "shape"; el: HTMLElement; y: number; start: number; moved: boolean } | null = null;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const knob = (e.target as HTMLElement).closest<HTMLElement>("[data-knob]");
    const map = (e.target as HTMLElement).closest<HTMLElement>("svg.shape");
    if (knob) drag = { kind: "knob", el: knob, y: e.clientY, start: state.settings[knob.dataset.knob as Knob["key"]], moved: false };
    else if (map) drag = { kind: "shape", el: map, y: e.clientY, start: ui.scroll.scrollTop, moved: false };
    if (drag) (e.target as Element).setPointerCapture?.(e.pointerId);
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) < 3) return;
    drag.moved = true;
    state.scrubbing = true;
    if (drag.kind === "knob") {
      const k = KNOBS.find((k) => k.key === drag!.el.dataset.knob)!;
      const v = clamp(drag.start - (dy / 150) * (k.max - k.min), k.min, k.max);
      state.settings[k.key] = Math.round(v / k.step) * k.step;
      drawLayout();
      drawAdjuncts();
      const wing = drag.el.closest<HTMLElement>(".wing");
      if (wing) drawWing(wing.dataset.area as "wingL" | "wingR");
    } else {
      const k = Number(drag.el.dataset.k);
      ui.scroll.scrollTop = drag.start + dy / k;
    }
  });
  const release = () => {
    if (drag?.kind === "knob" && drag.moved) (saveSettings(), drawStrips());
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

  // the flick: a small reversal of the scroll, down then up then down within a moment, cycles the brief in focus
  const legs: { t: number; d: number }[] = [];
  let flicked = 0;
  ui.scroll.addEventListener(
    "wheel",
    (e) => {
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
    },
    { passive: true },
  );

  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    if (e.key === "Tab" && !e.shiftKey) (e.preventDefault(), cycle(state.focus));
    else if (e.key === "Tab" && e.shiftKey) (e.preventDefault(), cycleLevel(parentOf(state.focus)));
    else if (e.key === "ArrowLeft" || e.key === "u") up();
    else if (e.key === "Enter" && gradeOf(state.focus) !== "whole") cycle(state.focus);
  });

  ui.scroll.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  window.addEventListener("hashchange", () => arrive(readHash()));
  window.addEventListener("resize", () => {
    drawLayout();
    drawAdjuncts();
    drawStrips();
    drawWings();
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
  if (first) return arrive(readHash());
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
    <header id="header"><span class="warnings chrome dim"></span><span class="notice chrome"></span></header>
    <main id="areas">
      <section class="wing" data-area="wingL"><div class="box"></div></section>
      <section id="scroll"><div id="content"><div class="gutter" data-area="gutterL"></div><div id="lane"></div><div class="gutter" data-area="gutterR"></div></div></section>
      <section class="wing" data-area="wingR"><div class="box"></div></section>
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
// the bottom edges. The page is white. This part stays with the server, which
// writes it into the page's head.

const CSS = `
:root {
  --ink: #141414; --muted: #6b6b6b; --dim: #a8a8a8; --ground: #ffffff;
  --serif: "Source Serif 4", "Iowan Old Style", "Charter", Georgia, serif;
  --sans: "Source Sans 3", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --body: 17px; --t: 33px; --h1: 26.5px; --h2: 21px; --h3: 19px; --small: 13px;
  --gap: 24px; --measure: 600px; --fade: .4;
  --meter: oklch(62% 0.19 28);
  --h: 60;
}
*, ::before, ::after {
  --rest: oklch(88% 0.045 var(--h)); --door: oklch(74% 0.085 var(--h)); --on: oklch(42% 0.09 var(--h));
  --lit: oklch(58% 0.17 var(--h)); --grey: oklch(90% 0 0);
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { display: flex; flex-direction: column; background: var(--ground); color: var(--ink); font-family: var(--serif); font-size: var(--body); line-height: 1.6; overflow: hidden; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: underline; text-decoration-color: var(--door); text-decoration-thickness: 1px; text-underline-offset: .18em; }
a:hover, a.lit { text-decoration-color: var(--lit); }
a.web { text-decoration-style: dotted; }
a.owed { text-decoration-style: dashed; color: var(--muted); cursor: help; }
a.outside { text-decoration-style: dotted; color: var(--muted); cursor: help; }
.chrome { font-family: var(--sans); font-size: var(--small); color: var(--muted); letter-spacing: .01em; line-height: 1.4; }
.dim { color: var(--dim); }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }

#header { position: absolute; top: 8px; left: 0; right: 0; z-index: 4; display: flex; justify-content: center; gap: 16px; pointer-events: none; }
#header > * { pointer-events: auto; }
#header .warnings { cursor: help; }
#header .notice { color: var(--lit); }

#areas { position: relative; flex: 1 1 auto; min-height: 0; display: grid; justify-content: center; }
.wing { position: relative; overflow-y: auto; overflow-x: hidden; padding: 20px 20px 54px; scrollbar-width: none; display: flex; align-items: center; justify-content: center; }
.wing::-webkit-scrollbar { display: none; }
.wing .box { max-width: 100%; max-height: 100%; display: flex; justify-content: center; }
.wing .box > * { max-width: 100%; }
.wing.closed .box { display: none; }
#scroll { overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 12%, black 82%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0, black 12%, black 82%, transparent 100%); }
#scroll::-webkit-scrollbar { display: none; }
#content { position: relative; display: grid; margin: 0 auto; padding: 30vh 0 55vh; }
.gutter { position: relative; }
.gutter.closed { visibility: hidden; }
#lane { min-width: 0; }

#strips { position: absolute; left: 0; right: 0; bottom: 0; height: 0; z-index: 5; pointer-events: none; }
.strip { position: absolute; bottom: 10px; display: flex; gap: 4px; justify-content: center; pointer-events: auto; }
.strip.rail { flex-direction: column; align-items: center; }
.strip .pick { width: 26px; height: 24px; display: grid; place-items: center; border-radius: 6px; color: var(--dim); opacity: .45; transition: opacity .15s, color .15s; }
.strip .pick:hover { opacity: 1; }
.strip .pick.on { opacity: .9; color: var(--muted); }
.strip.rail .pick.on { opacity: .45; }
.icon { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }

.opening { margin-bottom: 40px; }
.opening h1 { font-size: var(--t); font-weight: 600; line-height: 1.12; letter-spacing: -.014em; margin: 6px 0 18px; }
.record { margin: 4px 0 24px; }

.brief { position: relative; margin: 0 0 36px; opacity: calc(1 - var(--fade)); transition: opacity .3s; }
.brief.here { opacity: 1; }
.brief.heading { margin-bottom: 14px; }
.brief.face { margin-bottom: 26px; }
.brief.face .first { color: var(--muted); }
.brief.heading .head, .brief.face .head { margin-bottom: 8px; }
.head { position: relative; display: flex; align-items: baseline; font-weight: 600; line-height: 1.2; letter-spacing: -.012em; margin: 0 0 12px; transition: color .12s; }
.head.d1 { font-size: var(--h1); }
.head.d2 { font-size: var(--h2); }
.head.d3 { font-size: var(--h3); }
.head.d4 { font-size: var(--body); }
.head .num { flex: 0 0 auto; margin-right: .5rem; font-family: var(--sans); font-size: var(--small); font-weight: 500; letter-spacing: 0; color: var(--dim); }
.head .title { flex: 1 1 auto; cursor: pointer; }
.head .title:hover, .brief.lit .title { color: var(--on); }
.brief.on .num { color: var(--on); font-weight: 600; }
.brief.here .num { color: var(--lit); }
.mark { position: absolute; left: -22px; top: .1em; width: 16px; height: 16px; display: grid; place-items: center; color: var(--door); opacity: .7; transition: opacity .15s; }
.mark:hover { opacity: 1; color: var(--lit); }
.mark svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s; }
.mark.whole svg, .mark.open svg { transform: rotate(90deg); }
.mark.heading svg { stroke-dasharray: 1.6 1.6; }
.mark.leaf { visibility: hidden; }
.brief p, .brief li { margin: 0 0 12px; }
.brief li { margin-bottom: 8px; }
.brief ul, .brief ol { padding-left: 1.4rem; margin: 0 0 12px; }
.brief blockquote { margin: 0 0 12px; padding-left: 16px; border-left: 2px solid var(--rest); color: var(--muted); }
.brief pre { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: var(--small); line-height: 1.5; background: rgba(0,0,0,.035); border-radius: 10px; padding: 12px 16px; overflow-x: auto; margin: 0 0 12px; }
.brief code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: .92em; }
.brief .table { overflow-x: auto; margin: 0 0 12px; }
.brief table { border-collapse: collapse; font-family: var(--sans); font-size: var(--small); line-height: 1.4; }
.brief th { text-align: left; font-weight: 600; padding: 4px 12px 4px 0; border-bottom: 1px solid var(--rest); }
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
.adj.dim .gloss { color: var(--dim); }
.adj.foot { border-left-color: transparent; border-right-color: transparent; }
.adj.foot .name { display: inline; margin-right: 8px; }
.adj.foot .gloss { margin-bottom: 2px; }

.tree { position: relative; font-family: var(--sans); font-size: var(--small); line-height: 1.35; color: var(--muted); width: 100%; max-width: 320px; }
.tree .row { position: relative; display: flex; align-items: center; gap: 6px; padding: 2px 8px 2px calc(20px + var(--d) * 14px); border-radius: 6px; }
.tree .row .mark { position: absolute; left: calc(2px + var(--d) * 14px); top: 3px; }
.tree .row.root { color: var(--ink); font-weight: 600; margin-bottom: 4px; }
.tree .row:hover, .tree .row.lit { background: rgba(0,0,0,.035); }
.tree .name { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tree .row.on .name { color: var(--ink); }
.tree .row.here .name { color: var(--on); font-weight: 600; }
.tree .laser { position: absolute; height: 1.5px; background: var(--on); border-radius: 1px; transition: top .28s cubic-bezier(.2,.7,.2,1), left .28s, width .28s; pointer-events: none; }

svg.fig { display: block; overflow: visible; touch-action: none; user-select: none; }
svg.fig .cell { cursor: pointer; }
.ahead-box { display: flex; flex-direction: column; align-items: center; gap: 6px; }
svg.ahead rect { fill: var(--rest); }
svg.ahead .cell.more rect { stroke: var(--door); stroke-width: 1; stroke-dasharray: 3 3; }
svg.ahead .cell.lit rect { fill: var(--lit); }
svg.ahead text { font-family: var(--sans); font-size: 11px; fill: var(--ink); pointer-events: none; }
svg.ahead .cell.lit text { fill: var(--ground); }

svg.shape .hit { fill: transparent; }
svg.shape .para { fill: var(--rest); }
svg.shape .head { fill: var(--door); }
svg.shape .cell.here .para { fill: var(--door); }
svg.shape .cell.here .head { fill: var(--on); }
svg.shape .cell.lit .para, svg.shape .cell.lit .head { fill: var(--lit); }
svg.shape .cursor { fill: rgba(0,0,0,.05); cursor: grab; }

svg.plate .cell path, svg.plate .cell circle { fill: var(--rest); }
svg.plate .cell.away path { fill: var(--grey); }
svg.plate .cell.centre circle { --h: 60; fill: oklch(92% 0.01 var(--h)); }
svg.plate .cell.more path { fill: oklch(83% 0.06 var(--h)); }
svg.plate .cell.on path { fill: var(--door); }
svg.plate .cell.lit path, svg.plate .cell.lit circle { fill: var(--lit); }
svg.plate .label { font-family: var(--sans); font-size: 11px; fill: var(--ink); pointer-events: none; }
svg.plate .label.lit, svg.plate .cell.lit .label { fill: var(--ground); }

.settings { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.knobs { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.knob { position: relative; width: 48px; height: 48px; cursor: ns-resize; touch-action: none; user-select: none; color: var(--dim); }
.knob svg { width: 48px; height: 48px; display: block; }
.knob .track { fill: none; stroke: rgba(0,0,0,.08); stroke-width: 3; stroke-linecap: round; }
.knob .value { fill: none; stroke: var(--meter); stroke-width: 3; stroke-linecap: round; }
.knob .glyph { fill: none; stroke: var(--muted); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.knob .hint { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 2px; white-space: nowrap; opacity: 0; transition: opacity .15s; pointer-events: none; }
.knob:hover .hint { opacity: 1; }
.switches { display: flex; gap: 4px; }
.switches .pick { padding: 2px 8px; border-radius: 6px; color: var(--dim); }
.switches .pick.on { color: var(--ink); }
.switches .pick:hover { background: rgba(0,0,0,.04); }
`;

// The run, last, so that everything it calls stands above it.
if (import.meta.main) run();
