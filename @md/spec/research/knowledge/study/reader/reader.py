#!/usr/bin/env python3
"""The reader: serves a substrate rooted at a path as a navigable, weighted holarchy.

Knows nothing of harnesses, sessions or logs. It reads markdown files in folders
as the practice defines them and serves one page.

Usage: reader.py <root path> [port]
"""
import hashlib
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(sys.argv[1])
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766
HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reader.html")
SKIP = {".git", ".snapshots", "node_modules", ".playwright-mcp"}

state = {"tree": None, "read": 0}
lock = threading.Lock()


def face(text):
    """The first paragraph that is not a heading: what a brief says it gives."""
    for para in text.split("\n\n"):
        p = para.strip()
        if p and not p.startswith("#"):
            return re.sub(r"\s+", " ", p)
    return ""


def split_sections(lines, level):
    """(heading, body lines) for each heading at this level; the preface comes back first."""
    mark = "#" * level + " "
    pre, out, head, buf = [], [], None, []
    for line in lines:
        if line.startswith(mark):
            if head is None:
                pre = buf
            else:
                out.append((head, buf))
            head, buf = line[len(mark):].strip(), []
        else:
            buf.append(line)
    if head is None:
        pre = buf
    else:
        out.append((head, buf))
    return pre, out


def from_lines(name, lines, level, path, anchor):
    """A holon from a stretch of markdown: its own prose, and the headings beneath it."""
    pre, subs = split_sections(lines, level)
    own = "\n".join(pre).strip()
    kids = [from_lines(h, body, level + 1, path, slug(h)) for h, body in subs]
    return node(name, path, anchor, "brief", own, kids)


def slug(h):
    return re.sub(r"[^a-z0-9]+", "-", h.lower()).strip("-")


def paragraphs(own):
    """The lengths of a brief's own paragraphs: its texture, and how heavy it looks."""
    return [len(re.sub(r"\s+", " ", p.strip())) for p in own.split("\n\n")
            if p.strip() and not p.strip().startswith("#")]


def links_of(own, path):
    """Where a brief points: relative links resolved to a file, with an anchor if it names one."""
    out = []
    for m in re.finditer(r"\[[^\]]*\]\(([^)\s]+)", own):
        t = m.group(1).strip()
        if not t or t.startswith(("http", "mailto:", "www.")):
            continue
        tgt, _, anc = t.partition("#")
        if not tgt:
            out.append(path + "#" + anc)
            continue
        out.append(os.path.normpath(os.path.join(os.path.dirname(path), tgt)) + ("#" + anc if anc else ""))
    return sorted(set(out))


def ident(path, name):
    """A name that survives renumbering, so what a reader has seen stays seen."""
    return path + "#" + re.sub(r"[^a-z0-9]+", "-", re.sub(r"^[\d.]+\s*", "", name.lower())).strip("-")


def node(name, path, anchor, kind, own, kids):
    own_n = len(own)
    return {
        "name": name, "path": path, "anchor": anchor, "kind": kind,
        "id": ident(path, name), "h": hashlib.md5(own.encode()).hexdigest()[:10],
        "links": links_of(own, path),
        "own": own, "own_n": own_n, "face": face(own), "paras": paragraphs(own),
        "total_n": own_n + sum(k["total_n"] for k in kids), "kids": kids,
    }


def frontmatter(text):
    """The stamp at a file's head: whether it is under the code, and what kind of file it is."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end < 0:
        return {}, text
    meta = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return meta, text[end + 4:].lstrip("\n")


def read_file(path):
    text = open(path, encoding="utf-8", errors="replace").read()
    meta, text = frontmatter(text)
    lines = text.splitlines()
    title = next((l[2:].strip() for l in lines if l.startswith("# ")), os.path.basename(path))
    body = [l for l in lines if not l.startswith("# ")]
    rel = os.path.relpath(path, ROOT)
    n = from_lines(title, body, 2, rel, "")
    n["kind"] = "record" if meta.get("kind") == "record" else "file"
    n["meta"] = meta
    return n


def read_dir(path):
    rel = os.path.relpath(path, ROOT)
    names = sorted(n for n in os.listdir(path) if not n.startswith(".") and n not in SKIP)
    entry_path = os.path.join(path, "README.md")
    kids = []
    for n in names:
        p = os.path.join(path, n)
        if os.path.isdir(p):
            kids.append(read_dir(p))
        elif n.endswith(".md") and p != entry_path:
            kids.append(read_file(p))
    if os.path.exists(entry_path):
        e = read_file(entry_path)
        # the entry IS the folder's brief: its own prose and sections lead, the files follow
        out = node(e["name"], rel, "", "folder", e["own"], e["kids"] + kids)
        out["kids"] = e["kids"] + kids
        out["face"] = e["face"]
        return out
    return node(os.path.basename(path), rel, "", "pile", "", kids)


COMMITS = {"at": 0, "by_path": {}}


def commit_times():
    """When each file was last committed, so a brief can be told its ground moved after it did."""
    import subprocess
    if time.time() - COMMITS["at"] < 20:
        return COMMITS["by_path"]
    COMMITS["at"] = time.time()
    try:
        out = subprocess.run(["git", "log", "--pretty=format:@%ct", "--name-only", "--", "."],
                             cwd=ROOT if os.path.isdir(ROOT) else os.path.dirname(ROOT),
                             capture_output=True, text=True, timeout=20).stdout
    except Exception:
        return COMMITS["by_path"]
    by, now = {}, 0
    for line in out.splitlines():
        if line.startswith("@") and line[1:].isdigit():
            now = int(line[1:])
        elif line.strip() and line not in by:
            by[line.strip()] = now
    COMMITS["by_path"] = by
    return by


def stale_marks(root):
    """A brief is stale where something it stands on was committed after it was."""
    by = commit_times()
    if not by:
        return
    base = os.path.basename(ROOT) if os.path.isdir(ROOT) else ""
    def when(path):
        for k, v in by.items():
            if k.endswith("/" + path) or k == path or k.endswith("/" + base + "/" + path):
                return v
        return 0
    index = {}
    def walk(n):
        if n["kind"] in ("file", "folder"):
            index.setdefault(n["path"], n)
        for k in n["kids"]:
            walk(k)
    walk(root)
    def mark(n):
        mine = when(n["path"])
        late = []
        for l in n.get("links", []):
            tp = l.split("#")[0]
            t = when(tp)
            if mine and t and t > mine:
                late.append(tp)
        n["stale"] = sorted(set(late))
        n["at"] = mine
        for k in n["kids"]:
            mark(k)
    mark(root)


def build():
    return read_dir(ROOT) if os.path.isdir(ROOT) else read_file(ROOT)


def depths(n, d=0, acc=None):
    """Own prose per depth: what stopping at each level costs a reader."""
    acc = acc if acc is not None else {}
    acc[d] = acc.get(d, 0) + n["own_n"]
    for k in n["kids"]:
        depths(k, d + 1, acc)
    return acc


def loop():
    while True:
        try:
            t = build()
            stale_marks(t)
            with lock:
                state["tree"] = t
                state["depths"] = depths(t)
                state["read"] = time.time()
        except Exception as e:
            sys.stderr.write(f"read error: {e}\n")
        time.sleep(4)


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path.startswith("/tree"):
            with lock:
                body = json.dumps({"root": os.path.basename(ROOT), "tree": state["tree"],
                                   "depths": state.get("depths", {})}).encode()
            ctype = "application/json"
        else:
            body = open(HTML, "rb").read()
            ctype = "text/html; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    threading.Thread(target=loop, daemon=True).start()
    print(f"reader on http://127.0.0.1:{PORT}  root {ROOT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
