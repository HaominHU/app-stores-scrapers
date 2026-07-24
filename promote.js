import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import minimist from 'minimist';
import { parse } from 'csv-parse/sync';
import { createObjectCsvStringifier } from 'csv-writer';
import { TOPIC, headerFor, appIdColumnTitle, filePrefixFor, isValidStore, isValidGroup } from './csv-schema.js';
import { findLatest } from './file-lookup.js';

const args = minimist(process.argv.slice(2));
const store = args.store;
const group = Number(args.group);

if (!isValidStore(store)) {
    console.error("Please specify a valid store: --store=appstore or --store=gpstore.");
    process.exit(1);
}

if (!isValidGroup(group)) {
    console.error("Please specify a valid group: --group=1, --group=2, or --group=3.");
    process.exit(1);
}

function readCsv(path) {
    return parse(readFileSync(path), { columns: true, skip_empty_lines: true });
}

const rawFile = findLatest('output', store, group, '.csv');
if (!rawFile) {
    console.error(`No raw output CSV found for ${store} group ${group} in output/. Run the scraper first.`);
    process.exit(1);
}

const header = headerFor(store);
const idTitle = appIdColumnTitle(store);

// appId -> record (still keyed by CSV column title at this point)
const merged = new Map();

const oldBaselineFile = findLatest('last_search', store, group, '.csv');
if (oldBaselineFile) {
    for (const record of readCsv(`last_search/${oldBaselineFile.name}`)) {
        merged.set(record[idTitle], record);
    }
}

let addedCount = 0;
for (const record of readCsv(`output/${rawFile.name}`)) {
    if (!merged.has(record[idTitle])) addedCount += 1;
    merged.set(record[idTitle], record); // this cycle's data wins on conflict
}

const titleToId = Object.fromEntries(header.map(h => [h.title, h.id]));
const remapped = [...merged.values()].map(record =>
    Object.fromEntries(Object.entries(record).map(([title, value]) => [titleToId[title] ?? title, value]))
);

const stringifier = createObjectCsvStringifier({ header });
const newBaselineName = `${filePrefixFor(store)}_${TOPIC}_group${group}_${rawFile.timestamp}.csv`;
const newBaselinePath = `last_search/${newBaselineName}`;
writeFileSync(newBaselinePath, stringifier.getHeaderString() + stringifier.stringifyRecords(remapped));

if (oldBaselineFile && oldBaselineFile.name !== newBaselineName) {
    unlinkSync(`last_search/${oldBaselineFile.name}`);
}

console.info(`last_search for ${store} group ${group}: ${merged.size} total apps (${addedCount} newly added, ${merged.size - addedCount} already known).`);
console.info(`Baseline saved to '${newBaselinePath}'`);
