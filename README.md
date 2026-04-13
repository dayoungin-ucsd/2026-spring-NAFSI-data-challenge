# NutriMap : Food Vulnerability Dashboard

**NourishNet 2026 Challenge · Team NutriHog of Ozark · University of Arkansas**

Live dashboard showing county-level food insecurity data for DC, Maryland, and Virginia — connecting families to food assistance, donors to organizations, and volunteers to opportunities.

## Deploy to GitHub Pages

1. Push this folder (or the repo root) to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch**, select `main`, folder `/nutrimap-app` (or `/` if this is the root)
4. Click **Save** — your site will be live at `https://<username>.github.io/<repo>/`

> No build step required. Pure HTML + CDN-loaded React & Leaflet.

## Local Preview

Just open `index.html` in any browser — or serve with:
```bash
python -m http.server 8080
# then visit http://localhost:8080
```

## Stack
- React 18 (CDN, no build step)
- Leaflet 1.9 (interactive map)
- Babel Standalone (JSX in-browser)
- CartoDB Dark Matter tiles

## Data
- ACS 2021 5-Year Estimates (US Census Bureau)
- CDC PLACES 2023 County Health Data
- USDA Food Access Research Atlas
- TIGER 2020 County Population Centroids

