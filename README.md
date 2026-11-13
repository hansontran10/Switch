# Switch

A mobile-first macro tracker that logs what you eat and drink, then surfaces lower-sugar, higher-protein grocery swaps to match your goal.

<!-- TODO: live demo link -->

## What it does

Most calorie trackers tell you what you ate but not what to buy instead. Switch lets you set a body goal (cut, maintain, bulk), get daily calorie and macro targets, and log foods and drinks by searching a public nutrition database or typing them in. The Switch tab then shows an "observed item vs. recommended swap" card, with a store and a link, and lets you save swaps for your next grocery run.

> Status: the nutrition tracking, search, and logging are real. The photo scanner and the swap recommendations are **not AI yet**. See [Current limitations](#current-limitations) and the [Roadmap](#roadmap).

## Screenshots

<!-- TODO: add screenshot -->
<img width="2830" height="1464" alt="image" src="https://github.com/user-attachments/assets/5834d075-aa5c-4848-ae98-9bfbd394a73c" />
<img width="2830" height="1328" alt="image" src="https://github.com/user-attachments/assets/3875086e-1909-40a4-b119-11490fec9f0b" />



<!-- TODO: add screenshot -->
<img width="2538" height="1194" alt="image" src="https://github.com/user-attachments/assets/628d6710-e4ed-41a1-9fa6-8eeb8321dc21" />

<!-- TODO: add screenshot -->
<img width="2834" height="1332" alt="image" src="https://github.com/user-attachments/assets/637b4fe3-b0ae-46c1-838e-e86d281068ff" />

## Features (implemented)

- **Dashboard** with progress bars for energy, protein, carbs, fat, and sugar, computed from the items you have logged today, plus a log of today's entries.
- **Profile and goals:** height, current/goal weight, body fat %, and a goal strategy (Fat Loss, Maintain, Muscle Gain). Daily targets are recalculated from current weight and goal using a simple formula (weight x 12 kcal, adjusted -400 / +350 for cut / bulk; protein ~1 g per lb; 40% carbs, 25% fat).
- **Unit switching:** kcal/kJ, lbs/kg, ft-in/cm.
- **Food and drink search** against the live [Open Food Facts](https://world.openfoodfacts.org/) API, with debounced queries and a one-tap add to the log. Values shown are per 100 g as reported by the database.
- **Manual entry** modal for custom foods or drinks (name, brand, store, macros).
- **Saved switches:** save a recommended swap for a future meal or grocery trip without changing today's totals; saved items appear on the Dashboard with an external link.
- **Installable / mobile:** PWA manifest via `vite-plugin-pwa` and Capacitor Android and iOS projects.

## Current limitations

These parts are simulated or hard-coded in the current code:

- **Photo scan is simulated.** The "Snap Meal" modal does not read any image. The "Simulate Photo Scan" button waits 1.8 seconds and returns one fixed result (an iced green tea, 80 kcal). The "94% Confidence" label is static text. (`src/App.jsx`, `handleSimulatePhotoScan`)
- **Swap recommendations are hard-coded.** The Switch tab shows two fixed cards (orange juice to Poppi soda, and a high-fat item to lean ground turkey). They do not depend on what you log or on your profile, other than the goal label text. The "View Item" links are Google image searches. (`src/App.jsx`, Switch tab)
- **State is in-memory only.** Profile, goals, logs, and saved switches reset on reload. There is no backend or accounts.
- The log starts with two seeded sample entries (Greek yogurt bowl, orange juice).

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`), lucide-react icons |
| Mobile | Capacitor 8 (Android + iOS), `vite-plugin-pwa` |
| Data | Open Food Facts search API (client-side `fetch`) |
| Tooling | ESLint 10 (react-hooks, react-refresh) |

Language: JavaScript (JSX). App ID: `com.switchapp.macro`.

## Getting started

Prerequisites: Node.js and npm. For mobile builds, Android Studio (Android) and/or Xcode on macOS (iOS).

```bash
# install
npm install

# run the dev server
npm run dev

# lint
npm run lint

# production build (outputs to dist/, which Capacitor uses as webDir)
npm run build

# preview the production build
npm run preview
```

### Run on Android / iOS (Capacitor)

Build the web app first, then sync it into the native projects and open them:

```bash
npm run build
npx cap sync
npx cap open android   # opens Android Studio
npx cap open ios       # opens Xcode (macOS only)
```

The `android/` and `ios/` projects are already generated and committed. There are no custom npm scripts for Capacitor; the commands above use the Capacitor CLI that ships with the project.

## Project structure
