# App Stores Ecosystem Scraper

> A JavaScript scraper for collecting iOS and Android app data from the App Store and Google Play Store.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Important Notes](#important-notes)
- [Project Structure](#project-structure)
- [References](#references)
- [License](#license)

## About

This scraper is a wrapped mHealth app scrapper designed to collect and synchronize mHealth app market data from both major app stores. The scraper is designed to connect with a JS-based backend. For research purpose only at the moment.

## Features

- 📱 Scrape iOS apps from the Apple App Store
- 🤖 Scrape Android apps from the Google Play Store
- 🔄 Separate scraping processes for each platform
- 🔗 Integration with a JS based backend

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd /path/to/your/app-stores-scrapper
```

2. Install dependencies:
```bash
npm install
```

## Usage

The 14 HART semi-annual search keywords are split into 3 fixed groups (keys 1-5, 6-10,
11-14). Each group is run as a separate command, one at a time per store, to avoid
triggering rate-limiting/blocking on a home network. Run each command, review the
output, then move on to the next group.

### Scrape iOS Apps

```bash
npm run scrape-ios-group1
npm run scrape-ios-group2
npm run scrape-ios-group3
```

### Scrape Android Apps

```bash
npm run scrape-android-group1
npm run scrape-android-group2
npm run scrape-android-group3
```

Each run writes two files to `output/`, named
`<store>_apps_hart_semi_annual_search_group<N>_<timestamp>.csv` and the matching
`..._log.json`:
- the CSV holds the scraped app records
- the JSON log holds the per-keyword fetch/duplicate counts for that group

## Important Notes

⚠️ **Polyfill Issue**: Due to polyfill compatibility issues with Angular, the scraping workflow must follow this specific order if you are using the Angular frontend:

1. Run the scraper (iOS and/or Android)
2. Synchronize the results with the backend
3. Run the Angular application

Running these steps out of order may cause compatibility issues.

## Project Structure

```
hart-ecosys-scrapper/
├── store-scraper.js  # Scraper entry point (iOS + Android, selected via --store flag)
├── output/           # Scraped data output (timestamped CSVs)
├── package.json      # Project dependencies and scripts
└── README.md         # Project documentation
```

## References

This project builds upon the following open-source libraries:

- [app-store-scraper](https://github.com/facundoolano/app-store-scraper) - iOS App Store scraper
- [google-play-scraper](https://github.com/facundoolano/google-play-scraper) - Google Play Store scraper

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

**Note**: This scraper is intended for educational and research purposes. Please ensure you comply with the App Store and Google Play Store terms of service when using this tool.
