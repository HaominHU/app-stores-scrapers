# TODO.md

Current state of in-progress work. Update before starting a batch and again the moment a
batch completes or the plan changes — see `AGENTS.md` for the rule. This file always
reflects where things stand *right now*, not the session's starting point.

## Feature: group-based scrape → refine → promote → merge-log pipeline

### Why

User manually runs 3 fixed keyword groups (1-5, 6-10, 11-14) per store, one command at a
time (not looped), to avoid rate-limiting/blocking on a home network. Wants to (1) exclude
apps already reported in a previous half-year cycle from this cycle's output, and (2)
auto-generate the combined per-store `.docx` results summary that's currently assembled by
hand from copy-pasted terminal output.

### Locked-in design decisions

- 3 keyword groups codified in `store-scraper.js`, selected via `--group=1|2|3` — **done**.
- Output filenames: `<store>_apps_hart_semi_annual_search_group<N>_<timestamp>.csv`, with a
  matching `..._log.json` sidecar holding `{ keyword, totalFetched, duplicates }` per
  keyword, in group order — **done**.
- `last_search/` files renamed to the same `group<N>` convention — **done**. App Store
  group 1 has no last_search baseline (old `.xlsx` file was removed by the user); its next
  `refine` run will treat everything as new.
- **`refine.js`** (not built yet): `npm run refine -- --store=<store> --group=<N>`, run
  manually whenever ready. Diffs this cycle's raw CSV in `output/` against the matching
  `last_search/..._group<N>...csv` by `appId`, writes `..._new_only.csv`. Raw CSV is left
  untouched.
- **`promote.js`** (not built yet): `npm run promote -- --store=<store> --group=<N>`, run
  manually whenever ready. New `last_search` file = union of (old `last_search` rows) +
  (this cycle's new rows), deduplicated by `appId`. Replaces the old `last_search` file for
  that store+group. (Union with raw output and union with refine's `_new_only.csv` produce
  the identical result — `_new_only` is by definition raw minus old.)
- **`merge-log.js`** (not built yet): `npm run merge-log -- --store=<store>`, run manually
  once after all 3 groups for a store are scraped/refined. Reads the 3 `..._log.json`
  sidecars in `output/`; requires exactly groups 1, 2, 3 present (errors naming what's
  missing, doesn't produce a partial doc); if a group has two log files (a re-run), auto-picks
  the newest by timestamp. Flattens to one `[1]`-`[14]` numbered list in group order, writes
  `app_store_results_log.docx` / `google_play_results_log.docx` matching the user's exact
  sample format (store name heading, then per keyword: `Total initial apps fetched for
  keyword 'X': Y` / `Total duplicate apps with the same appID skipped: Z with keyword 'X'`).
- New deps needed: `csv-parse` (reading last_search/output CSVs safely — descriptions
  contain commas/quotes) and `docx` (generating the Word file).
- Stack: JS/Node only, no Python — every operation here is simple set/array work on
  ≤200-row files, not worth a second toolchain.
- Standing rule (added to AGENTS.md): any change to `npm run` commands or CLI usage must
  update `package.json` scripts and README.md's Usage section in the same batch.

### Status

- [x] **Batch A** — `--group` flag + codified keyword groups, JSON log sidecar, new
      filename convention, `package.json`/README updates, `.gitignore` for `output/` and
      `last_search/`. Done in the working tree. **Not yet committed** — awaiting the user's
      commit/push decision.
- [ ] **Batch B** — `refine.js`
- [ ] **Batch C** — `promote.js`
- [ ] **Batch D** — `merge-log.js`

### Immediate next step

Ask the user whether to commit/push Batch A (and this TODO.md/AGENTS.md process update) now,
or hold for review — then, once resolved, state a TODO for Batch B (`refine.js`) and wait
for confirmation before implementing, per the workflow rule.
