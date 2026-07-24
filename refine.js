import { readFileSync, writeFileSync } from 'fs';
import minimist from 'minimist';
import { parse } from 'csv-parse/sync';
import { createObjectCsvStringifier } from 'csv-writer';
import { headerFor, appIdColumnTitle, isValidStore, isValidGroup } from './csv-schema.js';
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

const rawRecords = readCsv(`output/${rawFile.name}`);

const baselineFile = findLatest('last_search', store, group, '.csv');
const baselineIds = new Set();
if (baselineFile) {
    for (const record of readCsv(`last_search/${baselineFile.name}`)) {
        baselineIds.add(record[idTitle]);
    }
    console.info(`Comparing against last_search baseline '${baselineFile.name}' (${baselineIds.size} known apps).`);
} else {
    console.info(`No last_search baseline found for ${store} group ${group} — treating all apps as new.`);
}

const newRecords = rawRecords.filter(record => !baselineIds.has(record[idTitle]));

const titleToId = Object.fromEntries(header.map(h => [h.title, h.id]));
const remapped = newRecords.map(record =>
    Object.fromEntries(Object.entries(record).map(([title, value]) => [titleToId[title] ?? title, value]))
);

const stringifier = createObjectCsvStringifier({ header });
const outPath = `output/${rawFile.name.replace(/\.csv$/, '_new_only.csv')}`;
writeFileSync(outPath, stringifier.getHeaderString() + stringifier.stringifyRecords(remapped));

console.info(`${rawRecords.length} apps in raw output, ${rawRecords.length - newRecords.length} already in last_search, ${newRecords.length} new.`);
console.info(`New apps saved to '${outPath}'`);
