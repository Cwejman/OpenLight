#!/usr/bin/env python3
"""Turns a session's transcript into substrate: what was asked, in order.

The harness keeps a session as a line of JSON per event. This reads one and writes
either a folder of briefs the reader can open, or a single record of the asks, so
what a person asked for during a long sitting is addressable afterwards instead of
buried in scrollback.

Usage: transcript.py <session.jsonl> <out dir>          a brief per turn
       transcript.py <session.jsonl> <file.md> --asks   one record of the asks

The record keeps whatever cleaned entries the file already carries, so a pass that
corrected spelling is not undone by a later refresh.
"""
import json
import os
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
SKIP = ("<system-reminder>", "Caveat:", "<local-command", "<command-name>")


def text_of(msg):
    c = msg.get("content")
    if isinstance(c, str):
        return c
    return "\n".join(b.get("text", "") for b in c or []
                     if isinstance(b, dict) and b.get("type") == "text")


def turns(path):
    """Every turn the person took, in order, with what the session said back."""
    out, pending = [], None
    for line in open(path, encoding="utf-8", errors="replace"):
        try:
            o = json.loads(line)
        except Exception:
            continue
        if not isinstance(o, dict) or not isinstance(o.get("message"), dict):
            continue
        t = text_of(o["message"]).strip()
        if o.get("type") == "user" and o.get("toolUseResult") is None:
            if not t or t.startswith(SKIP):
                continue
            if pending:
                out.append(pending)
            pending = {"said": t, "back": [], "at": (o.get("timestamp") or "")[11:16]}
        elif o.get("type") == "assistant" and pending and t:
            pending["back"].append(t)
    if pending:
        out.append(pending)
    return out


def title(said):
    """A name for a turn: its first sentence, kept short and readable."""
    first = re.split(r"(?<=[.!?])\s|\n", said.strip())[0]
    first = re.sub(r"\s+", " ", first).strip(" .!?,")
    if len(first) > 72:
        first = first[:71].rsplit(" ", 1)[0] + "…"
    return first or "a turn"


def slug(s, i):
    return f"{i:03d}-" + (re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:48] or "turn")


def asks_record(path):
    """One record of the asks, refreshed without losing entries already cleaned by hand."""
    ts = turns(SRC)
    old, kept = "", []
    if os.path.exists(path):
        old = open(path, encoding="utf-8").read()
        kept = re.split(r"\n## \d+\. At \d\d:\d\d\n", old)[1:]
    start = max(0, len(ts) - len(kept))
    head = old.split("## 1. At")[0].rstrip() if old else ""
    if not head:
        head = ("---\nunder: the code\nkind: record\nentries: oldest first\n---\n\n"
                "# What was asked, through the sitting\n\nEvery ask of the sitting, in order, "
                "taken from the harness's record.")
    out = [head, ""]
    for i, t in enumerate(ts, 1):
        out += [f"## {i}. At {t['at']}", ""]
        body = kept[i - start - 1].strip() if i > start and (i - start - 1) < len(kept) else t["said"].strip()
        for para in body.split("\n"):
            if para.strip():
                out += [para.strip(), ""]
    open(path, "w", encoding="utf-8").write("\n".join(out).rstrip() + "\n")
    print(f"{len(ts)} asks written to {path}, {len(kept)} kept as already cleaned")


def main():
    if "--asks" in sys.argv:
        return asks_record(OUT)
    ts = turns(SRC)
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for i, t in enumerate(ts, 1):
        name = title(t["said"])
        fn = slug(name, i) + ".md"
        back = "\n\n".join(t["back"]).strip()
        body = [f"# {name}", "",
                f"Said at {t['at']}, the {ordinal(i)} turn of the sitting. What follows is "
                f"the ask in the words it was made in, and then what came back.", "",
                "## 1. As it was said", "", t["said"].strip(), ""]
        if back:
            body += ["## 2. What came back", "", back, ""]
        open(os.path.join(OUT, fn), "w", encoding="utf-8").write("\n".join(body))
        rows.append((i, name, fn, len(t["said"])))
    entry = ["# What was asked, in order", "",
             f"A sitting of {len(ts)} turns, read as the substrate it always was. Every ask is a "
             f"brief here, in the words it was made in, with the answer beneath it. Written from "
             f"the harness's own record of the session, so nothing said during a long sitting has "
             f"to survive in anyone's memory of it.", "",
             "## 1. The turns", ""]
    for i, name, fn, n in rows:
        entry.append(f"- [{name}]({fn}) — {n} characters")
        entry.append("")
    open(os.path.join(OUT, "README.md"), "w", encoding="utf-8").write("\n".join(entry))
    print(f"{len(ts)} turns written to {OUT}")


def ordinal(i):
    return f"{i}{'th' if 11 <= i % 100 <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(i % 10, 'th')}"


if __name__ == "__main__":
    main()
