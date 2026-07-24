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
- **`refine.js`**: `npm run refine -- --store=<store> --group=<N>`, run manually whenever
  ready. Diffs this cycle's raw CSV in `output/` against the matching
  `last_search/..._group<N>...csv` by `appId`, writes `..._new_only.csv`. Raw CSV is left
  untouched.
- **`promote.js`**: `npm run promote -- --store=<store> --group=<N>`, run manually whenever
  ready. New `last_search` file = union of (old `last_search` rows) + (this cycle's new
  rows), deduplicated by `appId`. Replaces the old `last_search` file for that store+group.
  (Union with raw output and union with refine's `_new_only.csv` produce the identical
  result — `_new_only` is by definition raw minus old.)
- **`merge-log.js`**: `npm run merge-log -- --store=<store>`, run manually once after all 3
  groups for a store are scraped/refined. Reads the 3 `..._log.json` sidecars in `output/`;
  requires exactly groups 1, 2, 3 present (errors naming what's missing, doesn't produce a
  partial doc); if a group has two log files (a re-run), auto-picks the newest by
  timestamp. Flattens to one `[1]`-`[14]` numbered list in group order, writes
  `app_store_results_log.docx` / `google_play_results_log.docx` matching the user's exact
  sample format (store name heading, then per keyword: `Total initial apps fetched for
  keyword 'X': Y` / `Total duplicate apps with the same appID skipped: Z with keyword 'X'`).
- `csv-schema.js` / `file-lookup.js`: shared modules factored out to avoid duplicating the
  CSV header definitions and the "find latest file for this store+group" logic across
  `store-scraper.js`, `refine.js`, `promote.js`, and `merge-log.js`.
- New deps added: `csv-parse` (reading last_search/output CSVs safely — descriptions
  contain commas/quotes) and `docx` (generating the Word file).
- Stack: JS/Node only, no Python — every operation here is simple set/array work on
  ≤200-row files, not worth a second toolchain.
- Standing rule (added to AGENTS.md): any change to `npm run` commands or CLI usage must
  update `package.json` scripts and README.md's Usage section in the same batch.

### Status

- [x] **Batch A** — `--group` flag + codified keyword groups, JSON log sidecar, new
      filename convention, `package.json`/README updates, `.gitignore` for `output/` and
      `last_search/`. **Committed & pushed** (`6e4ca91`).
- [x] **process fix** — `TODO.md` + `AGENTS.md`/`AGENTS_LOG.md` rules. **Committed & pushed**
      (`0826491`).
- [x] **Batch B/C/D** — `refine.js`, `promote.js`, `merge-log.js`. **Committed & pushed**
      (`20d3143`, `45b4955`).
- [x] **Real-world test** — user ran all 3 App Store groups successfully. Google Play group
      1 returned 0 apps (twice) — root-caused to a bug in `google-play-scraper@10.1.2`'s
      `search()` specifically (`app()`/`list()` still worked, isolating it to the search
      endpoint). Fixed by upgrading to `10.1.3`; verified live (0 → 5 results for a test
      search). **Committed, not yet pushed.**
- [x] **Health check** — traced all 8 `npm audit` findings to `app-store-scraper@0.18.0`'s
      dependency on the deprecated `request` library; that's already the latest published
      version (no newer fix exists) — see "Known issues" below. No stale references/unused
      imports from the various refactors; dependency tree clean. Added a `recordKeywordOutcome`
      helper in `store-scraper.js` so a 0-result success (silent library bug, like the one
      just found) logs a warning instead of looking identical to a real empty result, and a
      full-retry failure is recorded as `'FAILED'` instead of blending into `0`/`undefined`.

The pipeline is now feature-complete and has a real successful run behind it (App Store, all
3 groups). Google Play is unblocked as of the `google-play-scraper` upgrade but not yet
re-verified end to end by the user.

### Known issues (accepted risk, not fixed)

- `npm audit`: 8 vulnerabilities (5 moderate, 1 high, 2 critical), all originating from
  `app-store-scraper@0.18.0`'s use of the deprecated `request` HTTP library (pulls in
  vulnerable `form-data`/`qs`/`tough-cookie`/`uuid`/`ajv`) and an old `cheerio`→`undici`
  chain. `app-store-scraper` hasn't published a release since Nov 2023 and 0.18.0 is already
  the latest — there's no upgrade path that fixes this. `npm audit fix --force` would
  downgrade to `0.4.0` (much older), which isn't a real fix, so it wasn't applied. Low
  practical risk here since this tool only makes outbound calls to Apple's own servers, not
  a network-facing service handling untrusted input — but worth re-checking `npm audit`
  periodically in case `app-store-scraper` gets an update, or a lower-risk alternative
  library becomes worth switching to.

### Immediate next step

Push the `google-play-scraper` fix + `recordKeywordOutcome` logic hardening commit, then
the user re-runs Google Play group 1 to confirm the fix holds against a real scrape.
