# Bookflix

Bookflix is a mobile-first, privacy-first book discovery app. The core idea is simple: **give Bookflix 3 books you loved and it finds the next one.**

## Current product

- 🇫🇷 French-first interface and Open Library discovery
- 🔎 Title/author search with cover images and metadata
- 🧬 Reader profile / "ADN lecteur" built from selected books
- 🎯 Personalized recommendations combining selected books, mood and learned preferences
- 👍 1–5 star ratings that improve future recommendations
- 🚫 Hide recommendations you don't want to see
- 🎲 Surprise mode
- 🧠 Local preference learning without requiring an account
- 📚 Local library for selected and saved books
- ↥ Local JSON profile export / import for portability between devices
- ↗ Share recommendations using the device share sheet or clipboard
- 📱 Installable PWA with offline shell and resilient Open Library caching
- ♿ Keyboard-friendly search and responsive mobile/desktop UI
- 🔒 Privacy page explaining local data and portability

## Architecture

Bookflix is intentionally lightweight:

- Static HTML/CSS/JavaScript frontend
- Open Library as the external book-data source
- `localStorage` for the local reader profile, ratings, history and library
- Service worker for offline shell/caching
- No mandatory account and no Bookflix backend required for the core experience
- Hosted on Vercel and deployed automatically from `main`

## Recommendation philosophy

Bookflix is designed to avoid simple "same genre = same recommendation" logic. It combines:

1. explicit books the reader selected;
2. thematic signals extracted from book metadata;
3. the reader's mood / current intent;
4. positive and negative feedback from previous recommendations;
5. diversity so the result set does not collapse onto one author or one obvious match.

The goal is a recommendation that feels **personal, explainable and a little surprising**.

## Data & privacy

The reader profile is stored locally on the device. Ratings, hidden recommendations, learned preferences, history and library are not required to be sent to a Bookflix server. The profile can be exported as JSON and imported on another device.

Book metadata and covers are retrieved from Open Library. See the in-app privacy information for details.

## Product direction

Future improvements can focus on recommendation quality, richer reading states, better discovery controls, stronger explanations, shareable recommendation sessions, accessibility, performance and optional premium capabilities — while keeping the free core simple and privacy-first.

<!-- deployment trigger: 2026-09-13 -->
