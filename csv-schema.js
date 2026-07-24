export const TOPIC = "hart_semi_annual_search";

export const APPSTORE_HEADER = [
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
];

export const GPSTORE_HEADER = [
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
];

export function headerFor(store) {
    return store === 'appstore' ? APPSTORE_HEADER : GPSTORE_HEADER;
}

export function filePrefixFor(store) {
    return store === 'appstore' ? 'app_store_apps' : 'google_play_apps';
}

export function docPrefixFor(store) {
    return store === 'appstore' ? 'app_store' : 'google_play';
}

export function storeLabelFor(store) {
    return store === 'appstore' ? 'App Store' : 'Google Play';
}

export function appIdColumnTitle(store) {
    return headerFor(store).find(h => h.id === 'appId').title;
}

export function isValidStore(store) {
    return store === 'appstore' || store === 'gpstore';
}

export function isValidGroup(group) {
    return group === 1 || group === 2 || group === 3;
}
