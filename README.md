# Portfolio — David J Arun (Danny)

A personal portfolio website to showcase projects, skills, and development focus.

## Tech Stack

* HTML
* CSS
* Vanilla JavaScript

## Features

* Dynamic project system powered by `projects.json`
* Keyword-based search with highlighting
* Auto-generated skill ranking from project data
* Theme configuration via `settings.json` (colors, fonts, etc.)
* Responsive layout with glassmorphism UI

## Architecture

* `projects.json` → Single source of truth for all projects
* `settings.json` → Controls theme, colors, fonts, and profile config
* `script.js` → Handles rendering, search, routing, and interactions

## Structure

```
.
├── index.html
├── style.css
├── script.js
└── public/data
    ├── projects.json
    └── settings.json
```

## Setup

Open `index.html` in a browser
or run with a local server:

```
npx serve .
```

## Notes

Designed to be easily extendable:

* Add/edit projects via `projects.json`
* Change theme globally via `settings.json`
