# Cresselia

A clean, distraction-free EPUB reader — built as a personal project, no accounts, no cloud, no tracking. Your books and your reading progress stay on your own device.

## Features

- **Upload and read `.epub` files** — drag in a book, start reading
- **Reading progress that actually persists** — resumes exactly where you left off, per book, per device (no login required)
- **Highlights & annotations** — select text, save a highlight with a note, color-coded, saved locally
- **Table of contents navigation** — jump to any chapter, auto-expands to show where you are
- **In-book search**
- **Typography controls** — font size, font family, and reading themes (light, sepia, dark, and more)
- **Library view** — tracks each book's status (New / Reading / Finished) automatically as you read

## Status

This is an actively evolving personal project. Current state:

- ✅ Core reading experience — stable
- ✅ Progress & highlight persistence — stable
- ✅ Desktop app (Windows / macOS / Linux) — built via [Tauri](https://tauri.app), automated through GitHub Actions. Check the [Releases](../../releases) page for the latest installer.
- 🚧 Android app — planned, not yet built
- 🚧 Auto-update for installed apps — not yet set up

**Note on reading progress:** progress and highlights are saved locally on whichever device you're reading on (via the browser's/app's own on-device storage). They currently do **not** sync between devices — reading on your PC and your phone will track separately. Cross-device sync may be added later.

## Getting the app

Grab the latest installer for your platform from the [Releases](../../releases) page.

Desktop builds are currently unsigned, so Windows/macOS may show an "unknown publisher" warning on first run — this is expected for an unsigned personal project, not a sign anything's wrong.

## Tech stack

- React + TypeScript + Vite
- [epub.js](https://github.com/futurepress/epub.js) for EPUB parsing and rendering
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) for local (IndexedDB) storage
- [Tauri](https://tauri.app) for the desktop app build
- Built with the help of Google AI Studio / Gemini 

## Local development

```bash
npm install
npm run dev
```

To build the desktop app locally, you'll additionally need [Rust](https://www.rust-lang.org/tools/install) installed, then:

```bash
npm run tauri build
```

## Acknowledgments

Built as a personal reading app for myself and friends — not intended for wide distribution, but feel free to poke around.
