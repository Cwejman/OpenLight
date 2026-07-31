// The compiler behind `ol://` (host.md §Authoring Programs, as served): one
// long-lived bun process the host talks to over stdio, one JSON object per line
// in each direction. `{ id, op, path }` in, `{ id, ok, code, files }` or
// `{ id, ok: false, error }` out.
//
// Two ops, one process:
//
//   `module`  one file, transpiled — the lane described below.
//   `styles`  the surface's whole stylesheet, compiled by Tailwind from
//             `@openlight/react/ol.css` (see `styles` at the foot of this file).
//
// bun is here for two things Rust would have to reimplement badly: the TSX/TS
// transform, and node_modules resolution. Every import is resolved from the
// importing file with `Bun.resolveSync` — the same walk `bun run` does — and
// the result is canonicalized, so one file on disk always becomes one URL.
//
// Two modes, chosen by the file itself:
//
//   source (.ts/.tsx/.jsx, or .js in a `"type": "module"` package)
//     Every import stays external — the host serves each file separately.
//     Relative specifiers are left alone: the browser resolves them against the
//     module's own `ol://` URL, which is the file's path, so they land exactly
//     where the filesystem says. Only bare specifiers are rewritten.
//
//   CJS (.cjs, or .js in a package without `"type": "module"` — react,
//     react-dom, scheduler)
//     The dep's own files are bundled together, which is what turns CommonJS
//     into a module the browser can import; its *bare* dependencies stay
//     external, so `react` is one instance no matter who imports it. This is
//     the one general conversion rule — nothing names a package.

import { dirname, extname, join, resolve } from 'node:path'
import { existsSync, readdirSync, readFileSync, realpathSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'

const PREFIX = 'ol://app/mod'

/** The canonical URL of a file: its own absolute path, segment-encoded. */
function moduleUrl(absolute: string): string {
  return PREFIX + absolute.split('/').map(encodeURIComponent).join('/')
}

/** The nearest enclosing package's `type`, which is what makes a `.js` ESM. */
function packageType(file: string): string | undefined {
  let dir = dirname(file)
  for (;;) {
    const manifest = join(dir, 'package.json')
    if (existsSync(manifest)) {
      try {
        return JSON.parse(readFileSync(manifest, 'utf8')).type
      } catch {
        return undefined
      }
    }
    const up = dirname(dir)
    if (up === dir) return undefined
    dir = up
  }
}

function isCommonJs(file: string): boolean {
  const ext = extname(file)
  if (ext === '.cjs') return true
  if (ext !== '.js' && ext !== '.jsx') return false
  return packageType(file) !== 'module'
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Point one bare specifier at its URL. Only at statement position — an import
 * clause runs from the keyword to `from` without a quote, a paren or a
 * semicolon in it, so a matching run of text inside a string literal cannot be
 * mistaken for one. (A literal `from 'react'` written inside a double-quoted
 * string would still match; no dependency has ever contained one.)
 */
function point(code: string, specifier: string, url: string): string {
  const spec = escapeForRegExp(specifier)
  const target = JSON.stringify(url)
  return code
    .replace(
      new RegExp(`(^|[\\n;{}])(\\s*(?:import|export)[^;'"()]*?from\\s*)(['"])${spec}\\3`, 'gm'),
      (_match, before, clause) => before + clause + target,
    )
    .replace(
      new RegExp(`(^|[\\n;{}])(\\s*import\\s*)(['"])${spec}\\3`, 'gm'),
      (_match, before, clause) => before + clause + target,
    )
    .replace(new RegExp(`\\bimport\\(\\s*(['"])${spec}\\1\\s*\\)`, 'g'), `import(${target})`)
}

const RESERVED = new Set([
  'default', 'class', 'function', 'var', 'let', 'const', 'new', 'delete', 'typeof', 'in',
  'instanceof', 'void', 'if', 'else', 'do', 'while', 'for', 'switch', 'case', 'break', 'continue',
  'return', 'throw', 'try', 'catch', 'finally', 'this', 'super', 'extends', 'import', 'export',
  'null', 'true', 'false', 'yield', 'await', 'enum', 'with', 'debugger',
])

/**
 * What a CommonJS module puts on `module.exports`, by name. A CJS module says
 * so only by running, and an `import { useEffect }` is settled before it runs —
 * so the bundle is executed once, here, and its keys become real ES exports.
 * (The alternative is a static lexer that has to follow the package's own
 * `require` graph and still guesses. This is the same code the surface will
 * run, one directory away.)
 */
async function namedExports(code: string): Promise<string[]> {
  // The bare imports are already URLs; a URL whose path is the file's path is a
  // `file:` URL with one word changed, which is what makes this runnable here.
  const runnable = code.replaceAll(`"${PREFIX}`, '"file://')
  const scratch = join(tmpdir(), `ol-cjs-${Bun.hash(code).toString(16)}.mjs`)
  await Bun.write(scratch, runnable)
  try {
    const value = (await import(scratch)).default
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return []
    return Object.keys(value).filter(
      (name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && !RESERVED.has(name),
    )
  } catch {
    return [] // a dep that will not run here still serves; only names are lost
  } finally {
    try {
      unlinkSync(scratch)
    } catch {}
  }
}

/** Bun ends a CommonJS entry with its whole `module.exports` as the default. */
const DEFAULT_EXPORT = /\nexport default ([^\n]+);\s*$/

async function withNamedExports(code: string): Promise<string> {
  const match = code.match(DEFAULT_EXPORT)
  if (!match) return code
  const names = await namedExports(code)
  if (names.length === 0) return code
  // Bound under a prefix nothing else uses: a bundle's own top-level names are
  // its package's, and `isValidElement` is already one of them.
  const bind = names.map((name) => `${name}: __ol$${name}`).join(', ')
  const expose = names.map((name) => `__ol$${name} as ${name}`).join(', ')
  return code.replace(
    DEFAULT_EXPORT,
    () =>
      `\nvar __ol_exports = ${match[1]};\n` +
      `export default __ol_exports;\n` +
      `const { ${bind} } = __ol_exports;\n` +
      `export { ${expose} };\n`,
  )
}

async function transpile(path: string): Promise<string> {
  const commonjs = isCommonJs(path)
  const bare = new Map<string, string>()

  const built = await Bun.build({
    entrypoints: [path],
    target: 'browser',
    format: 'esm',
    // Dependencies branch on it at module scope; nothing sets it in a webview.
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'ol',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            if (!args.importer) return undefined // the entry itself
            const relative = args.path.startsWith('.') || args.path.startsWith('/')
            if (relative) {
              // Bundled in CJS mode; served on its own otherwise, under the URL
              // the browser derives from this module's own.
              return commonjs ? undefined : { path: args.path, external: true }
            }
            const resolved = realpathSync(Bun.resolveSync(args.path, dirname(args.importer)))
            bare.set(args.path, moduleUrl(resolved))
            return { path: args.path, external: true }
          })
        },
      },
    ],
  })

  if (!built.success) throw new Error(built.logs.map((log) => String(log)).join('\n'))
  let code = await built.outputs[0]!.text()
  for (const [specifier, url] of bare) code = point(code, specifier, url)
  return commonjs ? withNamedExports(code) : code
}

// ---- the stylesheet lane -------------------------------------------------

/** What a surface's classes may be written in — everything else is not read. */
const SCANNED = ['.ts', '.tsx', '.js', '.jsx', '.html']

/**
 * Resolve one `@import` in the stylesheet graph. A bare specifier is a package
 * whose *style* entry is wanted (`tailwindcss` publishes `index.css` there);
 * bun resolves the import condition, so the package manifest is read for the
 * style one whenever what came back is not CSS.
 */
function stylesheetPath(id: string, base: string): string {
  if (id.startsWith('.') || id.startsWith('/')) return resolve(base, id)
  try {
    const direct = Bun.resolveSync(id, base)
    if (direct.endsWith('.css')) return direct
  } catch {}
  const manifest = Bun.resolveSync(`${id}/package.json`, base)
  const style = JSON.parse(readFileSync(manifest, 'utf8')).style ?? 'index.css'
  return join(dirname(manifest), style)
}

/** Every source file under a directory the stylesheet declared, depth first. */
function sourceFiles(dir: string, found: string[] = []): string[] {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) sourceFiles(path, found)
    else if (SCANNED.includes(extname(entry.name))) found.push(path)
  }
  return found
}

/**
 * The candidates in one file. Tailwind's own extractor is a native module
 * (`@tailwindcss/oxide`) that segfaults under bun, so the run of text between
 * the characters a class name cannot contain is taken as a candidate instead.
 * Over-collecting is free: a candidate that names no utility compiles to
 * nothing, and every real class name is one run of such text.
 */
function candidates(text: string): string[] {
  return text.split(/[\s"'`<>=(){};,\\]+/).filter((token) => token.length > 0)
}

/**
 * One surface's stylesheet: `@openlight/react/ol.css` — which imports Tailwind,
 * maps the `--ol-*` tokens through `@theme`, and carries the semantic layer —
 * compiled against the classes actually written in this program's `src` and in
 * the React layer's own components.
 *
 * The files read are returned with it: the host caches the sheet under
 * `target/` and keeps it only while it is newer than every one of them.
 */
async function styles(programSource: string): Promise<{ code: string; files: string[] }> {
  const entry = Bun.resolveSync('@openlight/react/ol.css', programSource)
  const read: string[] = [entry]
  // Tailwind is resolved from the stylesheet's own package — the layer that
  // declares it — not from this helper, which the host writes out beside the
  // cache under `target/`, where there is no `node_modules` at all.
  const { compile } = await import(Bun.resolveSync('tailwindcss', dirname(entry)))

  const compiler = await compile(
    `@import ${JSON.stringify(entry)};\n@source ${JSON.stringify(programSource)};\n`,
    {
      base: dirname(entry),
      async loadStylesheet(id: string, base: string) {
        const path = stylesheetPath(id, base)
        read.push(path)
        return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
      },
    },
  )

  // The `@source` directives, as the stylesheet declared them: a pattern is
  // resolved against the file that wrote it, and names a directory to scan.
  const scanned = compiler.sources.flatMap((source) =>
    source.negated ? [] : sourceFiles(resolve(source.base, source.pattern)),
  )
  const found = new Set<string>()
  for (const file of scanned) {
    read.push(file)
    for (const candidate of candidates(readFileSync(file, 'utf8'))) found.add(candidate)
  }
  return { code: compiler.build([...found]), files: [...new Set(read)] }
}

// ---- the loop ------------------------------------------------------------

type Request = { id: number; op: 'module' | 'styles'; path: string }

for await (const line of console) {
  const trimmed = line.trim()
  if (!trimmed) continue
  const request = JSON.parse(trimmed) as Request
  try {
    const answer =
      request.op === 'styles'
        ? await styles(request.path)
        : { code: await transpile(request.path), files: [] }
    console.log(JSON.stringify({ id: request.id, ok: true, ...answer }))
  } catch (error) {
    console.log(
      JSON.stringify({ id: request.id, ok: false, error: (error as Error).message ?? String(error) }),
    )
  }
}
