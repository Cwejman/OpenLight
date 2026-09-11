#!/usr/bin/env python3
"""Tails Claude Code subagent transcripts and a lab debrief; serves one page that polls it.

Usage: monitor.py <tasks_dir> <lab_dir> [port]
"""
import glob
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TASKS = sys.argv[1]
LAB = sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8765
HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "monitor.html")

state = {"agents": {}, "debrief": {}, "updated": None}
offsets = {}   # file -> byte offset already parsed
lock = threading.Lock()


def new_agent(aid):
    return {
        "id": aid, "model": None, "first": None, "last": None,
        "messages": 0, "output": 0, "cache_w": 0, "cache_r": 0, "input": 0,
        "seen": {}, "events": [], "text": "", "children": set(), "tools": {},
        "mtime": 0,
    }


def excerpt(t, n):
    t = (t or "").strip()
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + " …"


def first_para(t):
    for para in (t or "").split("\n\n"):
        para = para.strip()
        if para and not para.startswith("#"):
            return para
    return ""


def relpath(p):
    return os.path.relpath(p, LAB) if p and p.startswith(LAB) else os.path.basename(p or "")


def tool_event(name, inp):
    """One narrative event per tool call: kind, short label, and the words that matter."""
    inp = inp or {}
    if name == "Write":
        return {"k": "write", "s": relpath(inp.get("file_path")), "q": excerpt(first_para(inp.get("content")), 420)}
    if name == "Edit":
        return {"k": "write", "s": relpath(inp.get("file_path")), "q": excerpt(inp.get("new_string"), 300)}
    if name == "Read":
        return {"k": "act", "s": "reads " + relpath(inp.get("file_path")), "q": ""}
    if name == "Bash":
        return {"k": "act", "s": inp.get("description") or excerpt(inp.get("command"), 80), "q": ""}
    if name == "Agent":
        return {"k": "spawn", "s": f"{inp.get('description', '')} · {inp.get('model', 'default')}", "q": excerpt(inp.get("prompt"), 520)}
    if name == "SendMessage":
        return {"k": "say", "s": "message → " + (inp.get("to") or "")[:9], "q": excerpt(inp.get("message"), 400)}
    return {"k": "act", "s": name, "q": ""}


def parse_line(a, line):
    try:
        o = json.loads(line)
    except Exception:
        return
    if not isinstance(o, dict):
        return
    m = o.get("message")
    ts = o.get("timestamp")
    if o.get("type") == "assistant" and isinstance(m, dict):
        if m.get("model"):
            a["model"] = m["model"]
        rid = o.get("requestId") or m.get("id")
        u = m.get("usage")
        if u and rid:
            # a streamed message logs several lines; the last carries the full usage
            a["seen"][rid] = u
            a["messages"] = len(a["seen"])
            tot = lambda k: sum((x.get(k, 0) or 0) for x in a["seen"].values())
            a["output"], a["cache_w"] = tot("output_tokens"), tot("cache_creation_input_tokens")
            a["cache_r"], a["input"] = tot("cache_read_input_tokens"), tot("input_tokens")
            if ts:
                a["first"] = a["first"] or ts
                a["last"] = ts
        for b in m.get("content") or []:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "text" and b.get("text", "").strip():
                a["text"] = excerpt(b["text"], 700)
                a["events"].append({"t": ts, "k": "say", "s": "", "q": a["text"]})
            elif b.get("type") == "tool_use":
                e = tool_event(b.get("name"), b.get("input"))
                e["t"] = ts
                a["tools"][b.get("id")] = b.get("name")
                if b.get("name") == "Agent":
                    a["children"].add(e["s"])
                a["events"].append(e)
    elif o.get("type") == "attachment" and isinstance(o.get("attachment"), dict):
        # a spawned agent's report can also arrive as a queued notification attachment
        txt = o["attachment"].get("prompt") or ""
        r = re.search(r"<result>(.*?)</result>", txt, re.S)
        if r and "<task-notification>" in txt:
            q = excerpt(r.group(1), 1100)
            if not any(e["k"] == "report" and e["q"] == q for e in a["events"][-6:]):
                a["events"].append({"t": ts, "k": "report", "s": "a fresh head returns", "q": q})
    elif o.get("type") == "user" and isinstance(m, dict):
        # a spawned agent's report arrives later as a task notification inside a user turn
        c = m.get("content")
        txt = c if isinstance(c, str) else " ".join(x.get("text", "") for x in c or [] if isinstance(x, dict) and x.get("type") == "text")
        r = re.search(r"<result>(.*?)</result>", txt or "", re.S)
        if r and "<task-notification>" in txt:
            a["events"].append({"t": ts, "k": "report", "s": "a fresh head returns", "q": excerpt(r.group(1), 1100)})
        else:
            # a head run synchronously returns its report as the Agent tool's result
            for b in (c if isinstance(c, list) else []):
                if isinstance(b, dict) and b.get("type") == "tool_result" and a["tools"].get(b.get("tool_use_id")) == "Agent":
                    cc = b.get("content")
                    t2 = cc if isinstance(cc, str) else " ".join(x.get("text", "") for x in cc or [] if isinstance(x, dict))
                    if t2 and "Async agent launched" not in t2:
                        a["events"].append({"t": ts, "k": "report", "s": "a fresh head returns", "q": excerpt(t2, 1100)})
    a["events"] = a["events"][-600:]


def tail_all():
    for f in glob.glob(os.path.join(TASKS, "*.output")):
        aid = os.path.basename(f).split(".")[0]
        with lock:
            a = state["agents"].setdefault(aid, new_agent(aid))
        size = os.path.getsize(f)
        off = offsets.get(f, 0)
        if size < off:
            off = 0
        if size == off:
            a["mtime"] = os.path.getmtime(f)
            continue
        with open(f, "rb") as fh:
            fh.seek(off)
            chunk = fh.read()
        # keep an incomplete trailing line for next time
        nl = chunk.rfind(b"\n")
        if nl == -1:
            continue
        offsets[f] = off + nl + 1
        for line in chunk[:nl].split(b"\n"):
            if line.strip():
                with lock:
                    parse_line(a, line.decode("utf-8", "replace"))
        a["mtime"] = os.path.getmtime(f)


def read_debrief():
    p = os.path.join(LAB, "debrief.md")
    d = {"rounds": [], "account": [], "sizes": [], "standing": ""}
    if not os.path.exists(p):
        return d
    txt = open(p, encoding="utf-8", errors="replace").read()
    sec = None
    for line in txt.splitlines():
        if line.startswith("## "):
            sec = line[3:].strip()
        if line.startswith("### ") and sec and sec.startswith("2"):
            d["rounds"].append(line[4:].strip())
        if line.startswith("|") and not re.match(r"^\|\s*-", line) and sec:
            cells = [c.strip() for c in line.strip("|").split("|")]
            if sec.startswith("1") and len(cells) >= 3 and cells[0] not in ("step", "what"):
                (d["sizes"] if "bytes" in line or cells[0].startswith(("the raw", "corpus", "piece")) else d["account"]).append(cells)
    m = re.search(r"### 2\.\d+ Where stage one stands\n\n(.+?)(\n\n|$)", txt, re.S)
    if m:
        d["standing"] = m.group(1).strip()[:600]
    files = {}
    for root, _, names in os.walk(LAB):
        for n in names:
            if n.endswith(".md"):
                rel = os.path.relpath(os.path.join(root, n), LAB)
                top = rel.split(os.sep)[0]
                files[top] = files.get(top, 0) + os.path.getsize(os.path.join(root, n))
    d["tree"] = sorted(files.items())
    return d


def snapshot():
    now = time.time()
    with lock:
        agents = []
        for a in state["agents"].values():
            if not a["messages"]:
                continue
            eq = a["output"] * 5 + a["cache_w"] * 1.25 + a["cache_r"] * 0.1 + a["input"]
            agents.append({
                "id": a["id"], "model": a["model"], "first": a["first"], "last": a["last"],
                "messages": a["messages"], "output": a["output"], "cache_w": a["cache_w"],
                "cache_r": a["cache_r"], "eq_m": round(eq / 1e6, 2),
                "active": (now - a["mtime"]) < 120,
                "idle_s": int(now - a["mtime"]),
                "text": a["text"], "events": a["events"][-120:],
                "children": sorted(a["children"]),
            })
        agents.sort(key=lambda x: x["first"] or "")
        return {"agents": agents, "debrief": state["debrief"], "updated": time.strftime("%H:%M:%S")}


def loop():
    while True:
        try:
            tail_all()
            with lock:
                state["debrief"] = read_debrief()
        except Exception as e:  # keep serving
            sys.stderr.write(f"tail error: {e}\n")
        time.sleep(3)


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path.startswith("/state"):
            body = json.dumps(snapshot()).encode()
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
    print(f"monitor on http://127.0.0.1:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
