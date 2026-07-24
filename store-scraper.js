import { writeFileSync } from 'fs';
import minimist from 'minimist';
import appstore from 'app-store-scraper';
import gplay from "google-play-scraper";
import { createObjectCsvWriter } from 'csv-writer';
import { TOPIC, headerFor, filePrefixFor, isValidStore, isValidGroup } from './csv-schema.js';

const args = minimist(process.argv.slice(2));

const MAX_RETRIES = 2;
const MAX_HITS_PER_SEARCH = 200;

// HART semi-annual search, keywords 1-14 split into 3 manually-run groups
const KEYWORD_GROUPS = {
    1: ["Aging", "Alzheimers", "Cognitive Stimulation", "Dementia Caregiver", "Dementia"],
    2: ["Healthy Aging", "Healthy Brain", "Medication Management", "Behavior tracking", "Symptom Tracking"],
    3: ["Senior Nutrition", "Malnutrition", "Memory games", "Care Coordination"],
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const keywords = KEYWORD_GROUPS[group];
const timestamp = Date.now();
const filePrefix = filePrefixFor(store);
const csvPath = `./output/${filePrefix}_${TOPIC}_group${group}_${timestamp}.csv`;
const logPath = `./output/${filePrefix}_${TOPIC}_group${group}_${timestamp}_log.json`;

const totalRecords = {};
const duplicateRecords = {};
const seenAppIds = new Set();

const csvWriterInstance = createObjectCsvWriter({
    path: csvPath,
    header: headerFor(store),
});

function writeLog() {
    const log = {
        store,
        group,
        generatedAt: timestamp,
        keywords: keywords.map(keyword => ({
            keyword,
            totalFetched: totalRecords[keyword] ?? 0,
            duplicates: duplicateRecords[keyword] ?? 0,
        })),
    };
    writeFileSync(logPath, JSON.stringify(log, null, 2));
    console.info(`Log saved to '${logPath}'`);
}

async function scrapeAppstore() {
    const resultList = [];
    for (const keyword of keywords) {
        let retries = 0;
        let success = false;
        let duplicateCount = 0;
        while (retries < MAX_RETRIES && !success) {
            try {
                const delayTime = Math.random() * 10000 + 5000;
                console.warn(`Waiting for ${delayTime / 1000} seconds before the next request for '${keyword}'...`);
                await delay(delayTime);

                const apps = await appstore.search({
                    term: keyword,
                    num: MAX_HITS_PER_SEARCH,
                });

                for (const appInfo of apps) {
                    const appId = appInfo.id;
                    console.log(`Processing app '${appId}'...`);
                    if (!seenAppIds.has(appId)) {
                        seenAppIds.add(appId);
                        try {
                            const appDetails = await appstore.app({ id: appId, country: 'us', lang: 'en' });
                            console.log(`App details for '${appId}':`, appDetails);
                            resultList.push({
                                id: appDetails.id,
                                appId: appDetails.appId,
                                title: appDetails.title,
                                url: appDetails.url,
                                description: appDetails.description,
                                genres: appDetails.genres,
                                contentRating: appDetails.contentRating,
                                languages: appDetails.languages,
                                size: appDetails.size,
                                released: appDetails.released,
                                updated: appDetails.updated,
                                releaseNotes: appDetails.releaseNotes,
                                requiredOsVersion: appDetails.requiredOsVersion,
                                version: appDetails.version,
                                price: appDetails.price,
                                currency: appDetails.currency,
                                developer: appDetails.developer,
                                developerUrl: appDetails.developerUrl,
                                developerWebsite: appDetails.developerWebsite,
                                score: appDetails.score,
                                reviews: appDetails.reviews,
                                supportedDevices: appDetails.supportedDevices
                            });
                        } catch (error) {
                            console.error(`Error fetching details for app '${appId}':`, error);
                        }
                    } else {
                        duplicateCount += 1;
                        console.log(`App '${appId}' already processed. Skipping...`);
                    }
                }
                totalRecords[keyword] = apps.length;
                duplicateRecords[keyword] = duplicateCount;
                success = true;
            } catch (error) {
                retries += 1;
                console.error(`Attempt ${retries} failed for keyword '${keyword}':`, error);
                if (retries >= MAX_RETRIES) {
                    console.error(`Max retries reached for keyword '${keyword}'. Skipping...`);
                }
            }
        }
    }

    for (const keyword of keywords) {
        console.info(`Total initial apps fetched for keyword '${keyword}': ${totalRecords[keyword]}`);
        console.info(`Total duplicate apps with the same appID skipped: ${duplicateRecords[keyword]} with keyword '${keyword}'`);
    }
    await csvWriterInstance.writeRecords(resultList);
    console.info(`Results saved to '${csvPath}'`);
    writeLog();
}

async function scrapeGPstore() {
    const resultList = [];
    for (const keyword of keywords) {
        let retries = 0;
        let success = false;
        let duplicateCount = 0;

        while (retries < MAX_RETRIES && !success) {
            try {
                const delayTime = Math.random() * 10000 + 5000;
                console.warn(`Waiting for ${delayTime / 1000} seconds before the next request for '${keyword}'...`);
                await delay(delayTime);

                const apps = await gplay.search({
                    term: keyword,
                    num: MAX_HITS_PER_SEARCH,
                });

                for (const appInfo of apps) {
                    const appId = appInfo.appId;
                    if (!seenAppIds.has(appId)) {
                        seenAppIds.add(appId);
                        try {
                            const appDetails = await gplay.app({ appId: appId });

                            resultList.push({
                                appId: appDetails.appId,
                                title: appDetails.title,
                                url: appDetails.url,
                                description: appDetails.description,
                                genres: appDetails.categories.map(category => category.name).join(', '),
                                contentRating: appDetails.contentRating,
                                released: appDetails.released,
                                updated: appDetails.updated,
                                recentChanges: appDetails.recentChanges,
                                androidMaxVersion: appDetails.androidMaxVersion,
                                version: appDetails.version,
                                price: appDetails.price,
                                currency: appDetails.currency,
                                developer: appDetails.developer,
                                developerWebsite: appDetails.developerWebsite,
                                score: appDetails.score,
                                reviews: appDetails.reviews,
                            });
                        } catch (error) {
                            console.error(`Error fetching details for app '${appId}':`, error);
                        }
                    } else {
                        duplicateCount += 1;
                        console.log(`App '${appId}' already processed. Skipping...`);
                    }
                }
                totalRecords[keyword] = apps.length;
                duplicateRecords[keyword] = duplicateCount;
                success = true;
            } catch (error) {
                retries += 1;
                console.error(`Attempt ${retries} failed for keyword '${keyword}':`, error);
                if (retries >= MAX_RETRIES) {
                    console.error(`Max retries reached for keyword '${keyword}'. Skipping...`);
                }
            }
        }
    }

    for (const keyword of keywords) {
        console.info(`Total initial apps fetched for keyword '${keyword}': ${totalRecords[keyword]}`);
        console.info(`Total duplicate apps with the same appID skipped: ${duplicateRecords[keyword]} with keyword '${keyword}'`);
    }
    await csvWriterInstance.writeRecords(resultList);
    console.info(`Results saved to '${csvPath}'`);
    writeLog();
}

if (store === 'appstore') {
    scrapeAppstore().catch(console.error);
} else {
    scrapeGPstore().catch(console.error);
}
