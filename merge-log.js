import { readFileSync, writeFileSync } from 'fs';
import minimist from 'minimist';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { docPrefixFor, storeLabelFor, isValidStore } from './csv-schema.js';
import { findFiles } from './file-lookup.js';

const args = minimist(process.argv.slice(2));
const store = args.store;

if (!isValidStore(store)) {
    console.error("Please specify a valid store: --store=appstore or --store=gpstore.");
    process.exit(1);
}

const latestLogPerGroup = {};
for (const group of [1, 2, 3]) {
    const matches = findFiles('output', store, group, '_log.json');
    if (matches.length === 0) continue;
    if (matches.length > 1) {
        console.warn(`Multiple log files found for group ${group}; using the newest ('${matches[0].name}').`);
    }
    latestLogPerGroup[group] = matches[0];
}

const missingGroups = [1, 2, 3].filter(group => !latestLogPerGroup[group]);
if (missingGroups.length > 0) {
    console.error(`Missing log file(s) for group(s) ${missingGroups.join(', ')}. Run all 3 groups for ${store} before merging.`);
    process.exit(1);
}

const allKeywords = [1, 2, 3].flatMap(group => {
    const log = JSON.parse(readFileSync(`output/${latestLogPerGroup[group].name}`, 'utf8'));
    return log.keywords;
});

const paragraphs = [
    new Paragraph({ text: storeLabelFor(store), heading: HeadingLevel.HEADING_1 }),
];

allKeywords.forEach((entry, index) => {
    paragraphs.push(new Paragraph({
        children: [new TextRun(`[${index + 1}] Total initial apps fetched for keyword '${entry.keyword}': ${entry.totalFetched}`)],
    }));
    paragraphs.push(new Paragraph({ text: '' }));
    paragraphs.push(new Paragraph({
        children: [new TextRun(`Total duplicate apps with the same appID skipped: ${entry.duplicates} with keyword '${entry.keyword}'`)],
    }));
    paragraphs.push(new Paragraph({ text: '' }));
});

const doc = new Document({ sections: [{ children: paragraphs }] });
const buffer = await Packer.toBuffer(doc);

const outPath = `output/${docPrefixFor(store)}_results_log.docx`;
writeFileSync(outPath, buffer);
console.info(`Combined log saved to '${outPath}'`);
