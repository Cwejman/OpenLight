#!/usr/bin/env node
// Claude Code statusline — context remaining % only.

let raw = '';
process.stdin.on('data', d => raw += d);
process.stdin.on('end', () => {
  let session = {};
  try { session = JSON.parse(raw); } catch {}

  const ctxPct = session?.context_window?.remaining_percentage ?? null;
  const ctxRem = ctxPct !== null ? Math.round(ctxPct) : null;
  const ctxStr = ctxRem !== null
    ? ctxRem < 20 ? `\x1b[31m${ctxRem}%\x1b[0m`
    : ctxRem < 40 ? `\x1b[33m${ctxRem}%\x1b[0m`
    : `\x1b[32m${ctxRem}%\x1b[0m`
    : '—';

  process.stdout.write(`rem ${ctxStr}\n`);
});
