# Roam — Travel planning workspace

Roam is a responsive, client-side travel planner built with React and Vite. It includes trip management, destination discovery, saved places, a day-by-day itinerary, expense tracking, an OpenStreetMap view, and light/dark themes.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Available scripts

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
```

## Features

- Create, edit, and delete trips with date validation.
- Trip data is persisted in browser localStorage.
- Search and filter a curated destination collection.
- Save and remove destinations; saved places persist locally.
- Build a daily itinerary with activity editing, deletion, and drag-and-drop ordering.
- Record expenses in multiple currencies, with totals grouped by currency and category.
- View destination coordinates on OpenStreetMap. Curated destinations are pre-geocoded; custom trips can provide latitude and longitude.
- Responsive layouts and a persisted light/dark theme.

## Data and privacy

This version is a front-end application. Trip, itinerary, expense, saved-place, and theme data are stored in the current browser using localStorage. There is no account, backend, cloud synchronization, or cross-device sync. Clearing browser site data will remove locally stored app data. Export your data before clearing site storage if you need to preserve it.

The map is provided by OpenStreetMap and requires an internet connection. Destination photography uses remote Unsplash image URLs, except the included local Paris image and local hero illustration. If remote image hosts are unavailable, cards show a designed fallback rather than a broken-image icon.

## Publish with GitHub Pages

1. Create a new GitHub repository (for example, `roam`).
2. Upload the contents of this project folder to the repository root. Do not upload `node_modules/` or `dist/`.
3. Push the default branch named `main`.
4. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
5. The included workflow at `.github/workflows/deploy.yml` runs lint and build, then deploys `dist/` to GitHub Pages.
6. When the workflow finishes, open the Pages URL shown in the repository's deployment settings.

The Vite configuration automatically uses the repository path when building in GitHub Actions. React Router is configured with the matching base path, and the workflow adds a `404.html` fallback for client-side routes.

## Project structure

```text
roam/
├── .github/workflows/deploy.yml
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── context/AppDataContext.jsx
│   ├── data/destinations.js
│   ├── services/storage.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
