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

**Commit/push:** committed by agent (`b29b2bf`, `d8f6047`, `9d2662e`) and pushed to
`GitHub/main`, per user confirmation.

---

## 2026-07-23 — last_search naming cleanup

**What:**
- Renamed 5 of 6 `last_search/` files from inconsistent legacy naming (`key_1_5`,
  `key_1-5`, `key_6_10`, `key_11_14`) to the standard `group1`/`group2`/`group3` convention.
- Inspected the 6th file (`app_store_apps_..._key_1_5.xlsx`, App Store group 1) — found it
  contained 736 rows with extra manually-curated `Added?`/`Reason` columns beyond the
  standard scraper schema, so it wasn't safe to silently convert/rename. User decided to
  ignore it entirely and later deleted it themselves; App Store group 1 has no last_search
  baseline going forward (starts fresh).
- Temporarily installed the `xlsx` npm package (`--no-save`) to inspect the file's contents,
  then uninstalled it — confirmed no changes landed in `package.json`/`package-lock.json`.

**Why:** the incoming `--group` flag and future `refine`/`promote` tooling (see `TODO.md`)
need one predictable last_search filename pattern per store+group to compare against.

**Commit/push:** not committed (`last_search/` is gitignored — this only affected local,
untracked data files).

---

## 2026-07-24 — group-based scraping, refine/promote/merge-log design, process fix

**What:**
- `store-scraper.js`: replaced hand-edited keyword array with 3 codified `KEYWORD_GROUPS`
  (matching HART semi-annual keys 1-5, 6-10, 11-14), selected via `--group=1|2|3`. Output
  filenames now follow `<store>_apps_hart_semi_annual_search_group<N>_<timestamp>.csv`.
  Each run also writes a `..._log.json` sidecar with per-keyword fetch/duplicate counts, in
  order, for later use by `merge-log.js`. Invalid `--store`/`--group` now fails fast with a
  clear error instead of silently proceeding.
- `.gitignore`: added `output/` and `last_search/` so scraped data can't accidentally enter
  git history.
- `package.json`: replaced `scrape-ios`/`scrape-android` scripts (no longer valid without a
  group) with 6 explicit scripts, `scrape-ios-group1/2/3` and `scrape-android-group1/2/3`.
- `README.md`: rewrote the Usage section for the group-based workflow, documented the
  output filename convention.
- `AGENTS.md`: added a standing rule that `package.json`/README must be updated in the same
  batch as any CLI/script change; formalized `TODO.md` alongside `AGENTS_LOG.md` (see next
  bullet) and tied the TODO-before-action rule to writing `TODO.md`, not just stating a plan
  in chat.
- Created `TODO.md` capturing the full locked-in design for the still-unbuilt `refine.js`
  (dedup vs. last_search), `promote.js` (union+dedupe promotion to last_search), and
  `merge-log.js` (combined `.docx` per store) — negotiated over this session's conversation
  but not yet written anywhere in the repo before now.

**Why:** manual keyword-array editing was error-prone and gave the tooling no way to know
which group a run belonged to, which the dedup/log-merge features need. Separately, the
agent had been relying on conversation history alone to track the multi-batch plan for
those features and had not been updating this log — a real risk if the session were
interrupted or handed to a different agent, per user's explicit concern.

**Commit/push:** not yet committed — pending user confirmation.
