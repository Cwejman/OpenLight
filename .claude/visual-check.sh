#!/bin/bash
# Visual check helper: renders ANSI output as a terminal-like screenshot
# Usage: <command> | .claude/visual-check.sh [output.png]
# Or: .claude/visual-check.sh [output.png] < file-with-ansi

OUT="${1:-/tmp/visual-check.png}"

# Convert ANSI to HTML with terminal-like styling
{
  echo '<html><body style="background:#1a1a2e; padding:20px; margin:0;">'
  echo '<pre style="font-family:Menlo,Monaco,monospace; font-size:14px; line-height:1.4; color:#e0e0e0; white-space:pre; margin:0;">'
  aha --no-header --black
  echo '</pre></body></html>'
} > /tmp/visual-check.html

npx playwright screenshot \
  --full-page \
  --color-scheme dark \
  --viewport-size "1000,800" \
  "http://localhost:8787/visual-check.html" \
  "$OUT" 2>/dev/null

echo "$OUT"
