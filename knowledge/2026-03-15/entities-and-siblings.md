# Entities, Siblings, and Collections — Stress-Testing the Dimensional Model

> **Status: Agent-generated exploration, iterated with author.** Core tension identified but not resolved. Multiple approaches documented for decision later.

## The Test Case

An organization has projects (Alpha, Beta, Gamma) and people (Alice, Bob, Carol). They're siblings — same "type," distinct instances with attributes (name, phone, role, start date).

## How It Maps (Basic)

Entities start as chunks, become dimensions as knowledge accumulates. Siblings share a dimension (`{projects}` shows Alpha, Beta, Gamma). Cross-cutting queries work naturally (`{project-alpha, people}` → who's on Alpha).

## The Core Tension: Instance-of vs Relates-to

The model currently has one relationship type: weight on a dimension. But two fundamentally different things are happening:

1. **"Project Alpha IS a project"** — membership, identity, instance-of
2. **"This methodology chunk RELATES TO projects"** — topical, associative

Both look the same: a chunk with weight on `projects`. When browsing `{projects}` expecting to see projects, methodology chunks mixed in would "break" the view. The dimension is vulnerable to incorrect additions.

## Approaches Under Consideration

### A) Elemental quality on weights

The weight has a kind — "instance-of" vs "relates-to." A chunk can be an instance of `projects` (Alpha) or relate to `projects` (methodology). The browser shows instances by default.

**Risk:** Introducing types on weights could lock things in, similar to how graph DBs have rigid typed edges. If we do this, it must be very elemental — not a taxonomy of relationship types, just a fundamental distinction.

### B) Convention through meta-chunks

The meta-chunk for `projects` describes what instances look like. No enforcement — guidance for humans and agents. Soft, flexible, but relies on discipline.

### C) Dimension property (collection vs topic)

A dimension declares itself as a "collection" (expects instances) or a "topic" (expects related knowledge). `projects` is a collection; `project-management` is a topic.

**Note:** Culture might NOT have collections — it's pure knowledge, no structured instances. So this property wouldn't be universal.

### D) No new primitive — convention with two dimensions

`projects` for instances, `project-related` for topical. Works but feels like a workaround.

### Not decided. More examples and iteration needed to resolve.

## The Records Question

Each project has a name, creation date, status. Each person has first name, last name, phone, role. Where does structured data live?

### Approach: Records as text in chunks

A person-chunk contains "Alice Smith, +46 700 123 456, Senior Frontend Engineer, started 2024-01." It's just text. When a view needs to display a people directory with phone numbers, an agent parses the text and assembles the view. The view is the contract — if the phone number is no longer retrievable, the view is violated.

### Approach: Records as structured chunk metadata

A chunk has a payload/metadata field alongside its text content. `{name: "Alice Smith", phone: "+46 700 123 456", role: "Senior Frontend"}`. Queryable, structured, but now the chunk has two kinds of content — text and fields.

### Approach: Structured data lives outside the dimensional model

The knowledge system is for knowledge. Pure records (500 employees with name/phone/role) are a spreadsheet, not a knowledge system. The knowledge system knows ABOUT people (decisions, patterns, understanding) and references external structured data where needed.

### Not decided. Depends on what the system is ultimately for — pure knowledge, or also structured data?

## What's Needed to Decide

More test cases against the model. Different domains stress different aspects:
- Pure knowledge (culture, craft) — no structured records
- Organization (people, projects) — structured records + relationships
- Source code (structural, hierarchical, references)
- A website projection — needs stable views over evolving knowledge

Each case reveals where the model works naturally and where it strains.
