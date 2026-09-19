# Agent instructions

## Product

[README.md](README.md) is the source of truth for vision, evolution path (V0–V7), and the active version. Read the **Current phase** section before implementing or scoping work.

## Engineering

- Prefer minimal, focused diffs aligned with the README **Current phase** section.
- Add layers only when the current version fails at a real problem — see README evolution path.

## Documentation

- **Markdown:** one line per paragraph — no hard line breaks inside prose; rely on editor word wrap.
- **Abbreviations:** always write the abbreviation followed by the full term in quotes — e.g. HTTP ("Hypertext Transfer Protocol"), API ("Application Programming Interface"), SQL ("Structured Query Language"). Applies to README, docs, ADRs, and code comments.
- **README evolution table:** stable roadmap; do not add `(now)` badges or similar progress markers.
- **README progress:** shown only by the **Current phase** section and its link under Evolution path.
