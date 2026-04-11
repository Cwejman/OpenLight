#!/usr/bin/env python3
"""Generate a nested filetree sidebar from a list of markdown files.

Usage:
  tree.py <prefix> <current> <file1.md> <file2.md> ...

<prefix>  — relative path prefix from the current page to the site root.
            Empty string if the current page is at root. "../" if one level
            deep. "../../" if two, and so on.
<current> — the file currently being rendered (e.g. "insideout/core.md").
            Used to auto-open the dirs along the path, and to mark the
            matching sidebar link with class="current".

Output is a <div class="brand"> + a recursive <ul> structure where every
<li class="dir"> owns a <ul> of its children. Files come before subdirs at
each level, both sorted alphabetically.
"""

import sys
from pathlib import PurePosixPath
from html import escape


def build_tree(files: list[PurePosixPath]) -> dict:
    """Build a nested dict: {'files': [Path, ...], 'dirs': {name: subtree}}."""
    root: dict = {"files": [], "dirs": {}}
    for f in files:
        node = root
        for part in f.parts[:-1]:
            node = node["dirs"].setdefault(part, {"files": [], "dirs": {}})
        node["files"].append(f)
    return root


def render(node: dict, path_so_far: str, prefix: str, current: str) -> list[str]:
    out: list[str] = ["<ul>"]

    # Files at this level, alphabetical.
    for p in sorted(node["files"]):
        stem = p.stem
        html_rel = str(p.with_suffix(".html"))
        href = f"{prefix}{html_rel}"
        cls = ' class="current"' if str(p) == current else ""
        out.append(f'<li class="file"><a href="{escape(href)}"{cls}>{escape(stem)}</a></li>')

    # Subdirectories, alphabetical. Auto-open the branch containing current.
    for name in sorted(node["dirs"].keys()):
        full = f"{path_so_far}/{name}" if path_so_far else name
        is_open = current == full or current.startswith(full + "/")
        open_cls = " open" if is_open else ""
        out.append(f'<li class="dir{open_cls}"><span class="dir-label">{escape(name)}</span>')
        out.extend(render(node["dirs"][name], full, prefix, current))
        out.append("</li>")

    out.append("</ul>")
    return out


def main() -> None:
    prefix = sys.argv[1]
    current = sys.argv[2]
    files = [PurePosixPath(f) for f in sys.argv[3:]]

    tree = build_tree(files)

    print(f'<div class="brand"><a href="{escape(prefix)}index.html">night</a></div>')
    print("\n".join(render(tree, "", prefix, current)))


if __name__ == "__main__":
    main()
