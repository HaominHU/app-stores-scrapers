# Agent Activity Log

Batch-level record of agent work on this repo. See `AGENTS.md` for the rules governing
batches, commits, and what belongs here. Append new entries at the bottom; don't rewrite
past entries.

---

## 2026-07-23 — README fixes, license consistency, AGENTS.md/log setup

**What:**
- Fixed README.md "Project Structure" section to match the actual flat repo layout
  (`store-scraper.js` + `output/`, no `src/`/`data/`).
- Changed `package.json` `license` field from `ISC` to `MIT`, matching the existing
  `LICENSE` file and README badge.
- Populated `AGENTS.md` with coding standards (karpathy-12rule.md, karpathy-guidelines
  plugin, Clean Code), the TODO-before-action workflow rule, batch/commit-checkpoint rules,
  and the commit message convention.
- Created this log file.

**Why:** README structure section no longer matched the codebase; license was
inconsistent across three places; repo will be touched by multiple agents/sessions so
shared ground rules needed to live in AGENTS.md.

**Commit/push:** pending user confirmation (manual vs. agent).
