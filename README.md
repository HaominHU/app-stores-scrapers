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

This scraper is part of the HART ecosystem, designed to collect and synchronize mobile application data from both major app stores. The data is then integrated with the HART backend for further processing and analysis.

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
cd hart-ecosys-scrapper
```

2. Install dependencies:
```bash
npm install
```

## Usage

The scraper provides separate commands for each platform:

### Scrape iOS Apps

```bash
npm run scrape-ios
```

### Scrape Android Apps

```bash
npm run scrape-android
```

### Running Both

You can run both scrapers sequentially:

```bash
npm run scrape-ios && npm run scrape-android
```

## Important Notes

⚠️ **Polyfill Issue**: Due to polyfill compatibility issues with Angular, the scraping workflow must follow this specific order if you are using the Angular frontend:

1. Run the scraper (iOS and/or Android)
2. Synchronize the results with the backend
3. Run the Angular application

Running these steps out of order may cause compatibility issues.

## Project Structure

```
app-stores-scrapper/
├── src/              # Source files
├── data/             # Scraped data output (if applicable)
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

