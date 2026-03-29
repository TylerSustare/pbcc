# PBCC App Version 2: Native Content Migration

The goal of Version 2 is to move away from using `WebView` for primary content and instead deliver a fully native Flutter experience. This ensures compliance with App Store Guideline 4.2 (Minimum Functionality) and provides a superior user experience.

## Phase 1: Research & Content Mapping
- [ ] **Audit Website Structure:** Map out all pages and content types on `https://powellbuttechurch.com/`.
    - Content to migrate: Sermons, Events, Staff, Ministries, Contact Info, and Announcements.
- [ ] **Data Modeling:** Define the schema for the data to be served to the app (e.g., `Sermon` model, `Event` model).
- [ ] **Identify Dynamic Elements:** Determine which parts of the site change frequently (e.g., weekly bulletins or event calendars).

## Phase 2: Backend Scraper & API Development
- [ ] **Scraper Selection:** Implement a web scraper (Node.js/Playwright or Python/BeautifulSoup) to extract structured data from the site.
- [ ] **Cloud Function Setup:** Deploy the scraper as a serverless function (Firebase Functions or AWS Lambda) for cost-effective, on-demand execution.
- [ ] **API Design:** Create a simple REST or GraphQL API to serve the scraped JSON data to the Flutter app.
- [ ] **Automated Scheduling:** Set up a CRON job to trigger the scraper periodically (e.g., every 12 hours) to keep content fresh without manual intervention.
- [ ] **Caching Layer:** Implement a caching strategy (e.g., Redis or simple JSON storage) to ensure fast API responses.

## Phase 3: Flutter App Native UI
- [ ] **Data Layer:** Implement a repository pattern in the Flutter app to fetch and cache data from the new API.
- [ ] **Home Screen:** Replace the main WebView with a native dashboard showing featured verses, upcoming events, and recent sermons.
- [ ] **Sermon Library:** Create a native list view for sermons with a built-in media player (audio/video).
- [ ] **Events Calendar:** Build a native events list with "Add to Calendar" functionality.
- [ ] **Giving Integration:** Replace the Giving WebView with a native UI that links directly to the payment gateway (maintaining security while improving feel).
- [ ] **Ministry Pages:** Create native detail screens for each ministry (Youth, Kids, etc.).

## Phase 4: Performance & UX
- [ ] **Asynchronous Loading:** Ensure all content loads asynchronously with shimmer effects/placeholders to maintain app responsiveness.
- [ ] **Offline Support:** Use `sqflite` or `hive` to cache the scraped content for offline viewing.
- [ ] **Native Navigation:** Update deep links (`PBCC://`) to route directly to native screens instead of WebView triggers.

## Phase 5: Submission & Verification
- [ ] **App Store Review Prep:** Document the native functionality to provide to reviewers as proof of significant "app-like" value beyond the website.
- [ ] **Final QA:** Verify that all content parity exists between the website and the native app.
