# AGENTS.md

Rules for any agent (Claude Code or otherwise) working in this repo. This project may be
touched by multiple agents/sessions over time — this file is the shared source of truth so
work stays consistent across them. `CLAUDE.md` includes this file via `@AGENTS.md`.

## Project

mHealth app-market scraper for the HART project (App Store + Google Play, via
`store-scraper.js`). See `README.md` for usage. Research use only.

## Coding standards

Follow, in this order of specificity:

1. **This repo's conventions** — read existing code before writing new code. There's only
   one source file (`store-scraper.js`); match its style.
2. **`karpathy-12rule.md`** (in repo root) and the installed `karpathy-guidelines` plugin
   skill — read-before-write, think-before-code, state assumptions and tradeoffs instead of
   silently guessing, minimum code that solves the actual problem, no premature abstraction.
3. **Clean Code (Robert C. Martin)** — meaningful names, small single-purpose functions,
   DRY, comments only when the *why* isn't obvious from the code itself, no dead code.

## Workflow rule: TODO before action

Before making any change: state a short TODO (what you're about to do and why), write it to
`TODO.md` (see below), and wait for explicit user confirmation. Only act after confirmation.
This applies per batch (see below), not just at the start of a session — new information or
a change of plan mid-session means a new TODO and a new confirmation.

If a requirement is ambiguous, ask rather than guessing (see rule 2 above).

## Batches and commit checkpoints

A **batch** is one logical group of related edits (e.g. "fix README + license", not every
individual file save, and not an entire multi-hour session).

After each batch:
1. Append an entry to `AGENTS_LOG.md` (see below).
2. Ask the user whether they want to commit/push manually themselves, or have the agent do
   it. Never commit or push without this confirmation for that batch.

## Commit message format

Follow: https://gist.github.com/HaominHU/91de2458e880d217a59d1c5fd95e77c9

```
[:<Emoji>: ][<Type>[(<Scope>)]: ]<Subject>

<Message Body>

<Message Footer>
```

- Subject: imperative present tense ("add", not "added"/"adds"), no capitalized first
  letter, no trailing period, ≤72 chars.
- Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Footer references issues where relevant: `Issue #N`, `Fixes #N`, `Closes #N`, `Resolves #N`.

Note: commits already in this repo's history predate this convention — don't rewrite them,
just apply this format going forward.

## Activity log and current state

Two files, two different jobs — both repo-root, both git-tracked so any agent or session
picking this repo up has the full picture, not just whoever's local machine:

- **`AGENTS_LOG.md`** — retrospective, append-only. One entry per *completed* batch: what
  changed, why, commit/push outcome. Log entries, not tool-call noise. Never rewrite past
  entries.
- **`TODO.md`** — current state, mutable. What's done, what's in progress, what's next, and
  any locked-in design decisions for a multi-batch feature (so a re-derivation isn't needed
  after an interrupted session or a handoff to a different agent). Update it before starting
  a batch (per the TODO-before-action rule above) and again the moment a batch completes or
  the plan changes — it should always reflect where things actually stand right now, not
  where they stood at the start of the session.

## Context/compaction

Long sessions degrade output quality as context fills up. This is a reminder for the agent
to proactively suggest the user run `/compact` during long sessions — not something to
automate via a hook.

## Keep package.json and README.md reproducible

Whenever a change adds, removes, or alters an `npm run` command or any other CLI usage,
update `package.json`'s `scripts` and README.md's `Usage` section in the same batch — not
as a follow-up. The README must always be enough on its own for someone to reproduce the
current commands; don't let it drift from what the scripts actually do.

## TODOs in code

Existing `// TODO` comments in the codebase (e.g. backend upload) are the user's personal
notes. Do not act on them, remove them, or treat them as implicit task requests unless the
user explicitly brings them up.
