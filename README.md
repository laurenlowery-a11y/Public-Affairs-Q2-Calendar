# CodePath Public Affairs · Q2 2026

Internal dashboard for the OOCEO + W/A Public Affairs team. Three ways to look at the same data, pulled from the Asana Public Affairs Project Tracker.

## Pages

- **`index.html`** — landing page; pick a view
- **`Q2 Calendar.html`** — day-by-day calendar grid (May & June)
- **`Q2 by Section.html`** — all items grouped by Asana section, mapped to strategic goals
- **`Q2 Snapshot.html`** — This week / next two weeks / later in Q2, with risk callouts

## Running locally

It's a static site — open `index.html` in any browser. No build step.

## Hosting on GitHub Pages

1. Push to a repo
2. Settings → Pages → Source: `main` branch, root
3. The `.nojekyll` file disables Jekyll so files with spaces in names work

## Data refresh

Currently a snapshot from May 5, 2026. To refresh, replace the data in `tasks-data.js` (used by the Calendar view).
