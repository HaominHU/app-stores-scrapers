import { readdirSync } from 'fs';
import { filePrefixFor, TOPIC } from './csv-schema.js';

function buildRegex(prefix, group, suffix) {
    const escapedSuffix = suffix.replace(/[.]/g, '\\.');
    return new RegExp(`^${prefix}_${TOPIC}_group${group}_(\\d+)${escapedSuffix}$`);
}

// Newest first, by the timestamp embedded in the filename.
export function findFiles(dir, store, group, suffix) {
    const re = buildRegex(filePrefixFor(store), group, suffix);
    return readdirSync(dir)
        .filter(name => re.test(name))
        .map(name => ({ name, timestamp: Number(name.match(re)[1]) }))
        .sort((a, b) => b.timestamp - a.timestamp);
}

export function findLatest(dir, store, group, suffix) {
    return findFiles(dir, store, group, suffix)[0] ?? null;
}
