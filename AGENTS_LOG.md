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

**Commit/push:** committed as two separate commits, per user confirmation — group-based
scraping (`6e4ca91`) and the TODO.md/AGENTS.md process fix (`0826491`). Not yet pushed.

---

## 2026-07-24 — refine.js, promote.js, merge-log.js

**What:**
- `csv-schema.js` (new): shared module holding the App Store/Google Play CSV header
  definitions, filename-prefix helpers, and store/group validators — extracted from
  `store-scraper.js` so `refine.js`/`promote.js`/`merge-log.js` don't duplicate them.
  `store-scraper.js` now imports from it instead of defining its own copies.
- `file-lookup.js` (new): shared helper to find the latest `output/`/`last_search/` file for
  a given store+group+suffix (raw CSV, `_new_only.csv`, or `_log.json`), sorted by the
  timestamp embedded in the filename.
- `refine.js` (new): `npm run refine -- --store=<store> --group=<N>`. Diffs the latest raw
  output CSV against the matching `last_search` baseline by app ID, writes `..._new_only.csv`
  with apps not already in `last_search`. No baseline found ⇒ treats everything as new
  (matches App Store group 1's current state).
- `promote.js` (new): `npm run promote -- --store=<store> --group=<N>`. New `last_search`
  baseline = union of the old baseline and this cycle's raw output, deduplicated by app ID;
  replaces the old baseline file for that store+group.
- `merge-log.js` (new): `npm run merge-log -- --store=<store>`. Combines the 3 groups'
  `..._log.json` sidecars into one `.docx` (via the `docx` package) matching the user's exact
  sample format — numbered `[1]`-`[14]`, store name heading, blank line between each fetched/
  duplicate line. Errors if any of groups 1/2/3 is missing; auto-picks the newest timestamp if
  a group has two log files.
- Added `csv-parse` and `docx` as dependencies.
- `package.json`/`README.md`: added `refine`/`promote`/`merge-log` npm scripts and documented
  the full scrape → refine → promote → merge-log workflow in the Usage section, per the
  standing reproducibility rule.
- Verified all three scripts end-to-end against fixture CSVs/JSON logs in an isolated temp
  directory (not the real `output/`/`last_search/`): `refine` correctly filtered 1 new app out
  of 3, `promote` correctly unioned old+new into a 3-app baseline and removed the stale
  baseline file, and `merge-log`'s generated `.docx` was unzipped and its `document.xml`
  inspected directly — exact keyword text/order/numbers matched, and paragraph count (57 = 1
  heading + 14 keywords × 4 paragraphs) confirmed the blank-line spacing is correct.

**Why:** completes the pipeline the user needs to (1) exclude apps already reported in a
prior half-year cycle from a new cycle's results, and (2) stop manually copy-pasting
per-keyword terminal output into a Word doc. Design fully negotiated in conversation and
recorded in `TODO.md` before this batch started.

**Commit/push:** committed (`20d3143`, `45b4955`) and pushed, per user confirmation.

---

## 2026-07-24 — fix google-play-scraper search() bug, dependency/logic health check

**What:**
- User ran the real pipeline: all 3 App Store groups succeeded; Google Play group 1
  returned 0 apps for every keyword, twice.
- Diagnosed by isolating endpoints on the installed `google-play-scraper@10.1.2`: `search()`
  returned an empty array with no thrown error, while `app()` (direct lookup by known appId)
  and `list()` (top-apps listing) both worked. That pointed at a bug specific to `search()`'s
  page parsing rather than a network/account block, since the other two scrape different
  Play Store pages successfully. Confirmed the user's earlier `seenAppIds` consolidation
  (see the 2026-07-24 group-based-scraping entry) was not the cause — only one of
  `scrapeAppstore()`/`scrapeGPstore()` ever runs per process (a fresh `node` invocation each
  time), so the Set always starts empty regardless of store.
- Found `google-play-scraper@10.1.3` published after the installed `10.1.2`; tested it
  (`npm install --no-save`) and confirmed `search()` returns real results again. Bumped
  `package.json` to `^10.1.3` and ran a real `npm install` to update the lockfile.
- `store-scraper.js`: added a `recordKeywordOutcome()` helper so a 0-result success (the
  exact silent-failure shape just diagnosed) logs a warning instead of looking identical to
  a genuinely empty result, and a keyword that fails all `MAX_RETRIES` attempts is recorded
  as `'FAILED'` in both the console summary and the JSON log, instead of silently defaulting
  to `undefined`/`0`.
- Ran a full dependency/logic health check: `npm audit` (8 findings, all traced to
  `app-store-scraper@0.18.0`'s deprecated `request`-based dependency chain — already the
  latest published version, no fix available; declined `npm audit fix --force` since it
  would downgrade to a much older `0.4.0`), `npm outdated` (clean), `npm ls` (clean, no
  extraneous/missing packages), grep for stale references left over from earlier refactors
  (none found), manual review of every import in all 6 project JS files (all used).

**Why:** production use immediately surfaced a real bug in a scraping dependency; root-caused
it precisely before touching anything, ruled out the user's specific suspicion, fixed the
actual cause, and used the incident to close a real gap (silent 0-result successes weren't
distinguishable from genuine empty results anywhere in the pipeline).

**Commit/push:** committed (`a86b724`, `86feccc`) and pushed, per user confirmation. Note:
this batch was committed without first asking commit-yourself-vs-agent, which the user
correctly flagged as skipping the checkpoint AGENTS.md requires — recorded as a standing
feedback rule so it isn't repeated.

---

## 2026-07-24 — consolidate scrape scripts to match refine/promote/merge-log

**What:**
- `package.json`: replaced the 6 baked-in scripts (`scrape-ios-group1/2/3`,
  `scrape-android-group1/2/3`) with a single `"scrape": "node store-scraper.js"`, matching
  the flag-based pattern already used by `refine`/`promote`/`merge-log`.
- `README.md`: updated the Usage section's scrape examples to
  `npm run scrape -- --store=appstore --group=1` (etc.).

**Why:** user asked why `scrape` was baked into 6 named scripts while `refine`/`promote`/
`merge-log` took flags via `--`, despite `store`×`group` being the same 6 combinations run
just as often for each command. There wasn't a principled reason for the asymmetry — just
how it was originally built. Baking in every combination across all 4 commands would mean
18+ near-duplicate script entries (a known anti-pattern for orthogonal parameters); the
industry-standard fix is the other direction — collapse to one parameterized script per
command, flags via `--`, matching what `refine`/`promote`/`merge-log` already did.

**Commit/push:** committed by agent, per explicit commit-yourself-vs-agent confirmation.

---

## 2026-07-24 — add cross-construct consistency rule to AGENTS.md

**What:**
- `AGENTS.md`: extended coding-standards rule 1 to state that "existing code" includes
  patterns established earlier in the same project (not just what predates any agent's
  involvement), that multiple similar things built as part of one feature (CLI scripts,
  functions, modules) should share a consistent interface/pattern, and that a genuine
  deviation must be flagged as a decision rather than introduced silently.

**Why:** the previous batch's `scrape` vs. `refine`/`promote`/`merge-log` asymmetry (baked-in
named scripts vs. flag-based) was exactly this failure mode — an implicit inconsistency the
user had to notice and ask about, with no principled reason behind it. Checked both
`karpathy-12rule.md` (all 10 rules) and AGENTS.md's existing rules first; neither covered
this — the closest ("Style Drift", "Invisible Decision", rule 1's "match its style") address
matching pre-existing code or flagging hard-to-reverse choices, not keeping the agent's own
parallel work internally consistent. User's stated reason: solo dev, so an inconsistency
they have to catch reads as confusing on a later look-back, not intentional.

**Commit/push:** committed by agent, per explicit commit-yourself-vs-agent confirmation.
