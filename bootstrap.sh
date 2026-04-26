#!/usr/bin/env bash
# bootstrap.sh — declarative truth of the project's Claude memory.
#
# All knowledge belongs in the repo. The Claude memory dir holds exactly one
# file: MEMORY.md, a pointer back to the repo's reading order. Anything else
# in the memory dir is an antipattern — knowledge stored outside the repo,
# invisible to humans, divergent across machines, disembodied from the
# project itself.
#
# Run from the repo root:
#     ./bootstrap.sh
#
# Effect: writes the canonical MEMORY.md to:
#     ~/.claude/projects/<this-repo-path>/memory/MEMORY.md
#
# Anything else in that directory is reported (not deleted). Move that
# knowledge into the repo, or remove it manually.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Claude Code project key: every non-[a-zA-Z0-9-] char becomes a hyphen.
# So /Users/foo/@x/bar -> -Users-foo--x-bar (the / and the @ each map to -).
#
# This encoding rule is empirically observed, not documented in the Claude
# Code CLI. The CLI does not expose a way for standalone scripts to resolve
# the per-project memory dir; $CLAUDE_PROJECT_DIR exists but only inside
# hooks. If Claude Code ever changes the encoding, this script will write
# to the wrong directory — easy to spot (a new project key dir appears
# under ~/.claude/projects/) but worth knowing.
PROJECT_KEY="$(printf '%s' "$PROJECT_DIR" | sed 's|[^a-zA-Z0-9-]|-|g')"
MEMORY_DIR="$HOME/.claude/projects/$PROJECT_KEY/memory"
LIVE_FILE="$MEMORY_DIR/MEMORY.md"

mkdir -p "$MEMORY_DIR"

# The canonical MEMORY.md: just the bootstrap directive. Nothing else.
cat > "$LIVE_FILE" <<'EOF'
## Bootstrap

**BEFORE responding to the user's first message**, read `README.md` and follow its reading order.
EOF

echo "wrote    $LIVE_FILE"

# Detect any other files in the memory dir. They should not exist —
# all knowledge belongs in the repo. Inform, don't delete.
ANTIPATTERN=()
for path in "$MEMORY_DIR"/*; do
  [[ -e "$path" ]] || continue
  name="$(basename "$path")"
  [[ "$name" == "MEMORY.md" ]] && continue
  ANTIPATTERN+=("$name")
done

if (( ${#ANTIPATTERN[@]} > 0 )); then
  echo ""
  echo "antipattern: $MEMORY_DIR holds files besides MEMORY.md:"
  for name in "${ANTIPATTERN[@]}"; do
    echo "  - $name"
  done
  echo ""
  echo "All knowledge belongs in the repo. Move these into the repo, or"
  echo "remove them. Personal memory dir disembodies knowledge from the"
  echo "project, breaks transparency, and diverges across machines."
fi
