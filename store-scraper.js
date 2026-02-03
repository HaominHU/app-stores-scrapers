import minimist from 'minimist';
import appstore from 'app-store-scraper';
import gpplay from "google-play-scraper";
import { createObjectCsvWriter } from 'csv-writer';

const args = minimist(process.argv.slice(2));

let appstoreList = [];
let gpstoreList = [];
let seenAppIds = new Set();
let androidSeenAppIds = new Set();

const MAX_RETRIES = 2;
const MAX_HITS_PER_SEARCH = 30;

const keywords = [
    "Aging",
    "Alzheimers",
    "Cognitive Stimulation",
    "Dementia Caregiver",
    "Dementia",
    "Healthy Aging",
    "Healthy Brain",
    "Medication Management"
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const csvWriter = createObjectCsvWriter;
const csvWriterInstance = csvWriter({
    path: './output/app_store_apps.csv',
    header: [
        { id: 'id', title: 'ID' },
        { id: 'appId', title: 'App ID' },
        { id: 'title', title: 'Title' },
        { id: 'url', title: 'URL' },
        { id: 'description', title: 'Description' },
        { id: 'genres', title: 'Genres' },
        { id: 'contentRating', title: 'Content Rating' },
        { id: 'languages', title: 'Languages' },
        { id: 'size', title: 'Size' },
        { id: 'released', title: 'Released' },
        { id: 'updated', title: 'Updated' },
        { id: 'releaseNotes', title: 'Release Notes' },
        { id: 'requiredOsVersion', title: 'Required OS Version' },
        { id: 'version', title: 'Version' },
        { id: 'price', title: 'Price' },
        { id: 'currency', title: 'Currency' },
        { id: 'developer', title: 'Developer' },
        { id: 'developerUrl', title: 'Developer URL' },
        { id: 'developerWebsite', title: 'Developer Website' },
        { id: 'score', title: 'Score' },
        { id: 'reviews', title: 'Reviews' }
    ]
});

const gpstoreCSVWriterInstance = csvWriter({
    path: './output/google_play_apps.csv',
    header: [
        { id: 'appId', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'url', title: 'URL' },
        { id: 'description', title: 'Description' },
        { id: 'genres', title: 'Genres' },
        { id: 'contentRating', title: 'Content Rating' },
        { id: 'released', title: 'Released' },
        { id: 'updated', title: 'Updated' },
        { id: 'recentChanges', title: 'Release Notes' },
        { id: 'androidMaxVersion', title: 'androidMaxVersion' },
        { id: 'version', title: 'Version' },
        { id: 'price', title: 'Price' },
        { id: 'currency', title: 'Currency' },
        { id: 'developer', title: 'Developer' },
        { id: 'developerWebsite', title: 'Developer Website' },
        { id: 'score', title: 'Score' },
        { id: 'reviews', title: 'Reviews' },
    ]
});

const store = args.store || 'appstore';

async function scrapeAppstore() {
    for (const keyword of keywords) {
        let retries = 0;
        let success = false;

        while (retries < MAX_RETRIES && !success) {
            try {
                const delayTime = Math.random() * 10000 + 5000;
                console.warn(`Waiting for ${delayTime / 1000} seconds before the next request for '${keyword}'...`);
                await delay(delayTime);

                const apps = await appstore.search({
                    term: keyword
                });

                for (const appInfo of apps) {
                    const appId = appInfo.id;
                    console.log(`Processing app '${appId}'...`);
                    if (!seenAppIds.has(appId)) {
                        seenAppIds.add(appId);
                        try {
                            const appDetails = await appstore.app({ id: appId, country: 'us', lang: 'en' });
                            console.log(`App details for '${appId}':`, appDetails);
                            const result = {
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
                            };

                            // TODO: upload to the HART backend
                            appstoreList.push(result);
                        } catch (error) {
                            console.error(`Error fetching details for app '${appId}':`, error);
                        }
                    } else {
                        console.log(`App '${appId}' already processed. Skipping...`);
                    }
                }
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

    await csvWriterInstance.writeRecords(appstoreList);
    console.info("Results saved to 'app_store_apps.csv'");
}

async function scrapeGPstore() {
    for (const keyword of keywords) {
        let retries = 0;
        let success = false;

        while (retries < MAX_RETRIES && !success) {
            try {
                const delayTime = Math.random() * 10000 + 5000;
                console.warn(`Waiting for ${delayTime / 1000} seconds before the next request for '${keyword}'...`);
                await delay(delayTime);

                const apps = await gpplay.search({
                    term: keyword
                });

                for (const appInfo of apps) {
                    const appId = appInfo.appId;
                    if (!androidSeenAppIds.has(appId)) {
                        androidSeenAppIds.add(appId);
                        try {
                            const appDetails = await gpplay.app({appId: appId});

                            const result = {
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
                            };

                            // TODO: upload to the HART backend
                            gpstoreList.push(result);
                        } catch (error) {
                            console.error(`Error fetching details for app '${appId}':`, error);
                        }
                    } else {
                        console.log(`App '${appId}' already processed. Skipping...`);
                    }
                }
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

    await gpstoreCSVWriterInstance.writeRecords(gpstoreList);
    console.info("Results saved to 'gp_store_apps.csv'");
}



if (!store || (store !== 'appstore' && store !== 'gpstore')) {
    console.error("Please specify a valid store (appstore or gpstore).");
    process.exit(1);
}

if (store == 'appstore') {
    scrapeAppstore().catch(console.error);
} else {
    scrapeGPstore().catch(console.error);
}
