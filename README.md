# Prajwal Lakshminath — Quantitative Finance Portfolio

Responsive portfolio built with HTML, CSS and vanilla JavaScript. No build step.

## Files
- `index.html`, `style.css`, `script.js` at the top level of the repository
- `assets/prajwal-professional.jpeg` (portrait)
- `assets/Prajwal_Lakshminath_Resume.pdf` (résumé download)

## Editing links and project results
Open `script.js`. The `SITE` settings at the very top control:
- `linkedin` and `github` profile links
- `projects.factor.code` / `projects.market.code`: links for the "View code on GitHub" buttons
- `projects.factor.results` / `projects.market.results`: text for the Results section in each project's detail window

Anything left as `''` stays hidden, so there are no broken links.

## Features
- Scrolling ticker of key figures, a candlestick chart and counting figures in the hero
- Bright light theme by default, with an optional dark theme toggle
- Project detail windows
- Interactive mean-variance portfolio optimizer with an efficient frontier
- Contact form that opens the visitor's email app (nothing is sent to a server)

Charts in the hero and project cards are illustrative, and the optimizer uses made-up assumptions; none of them are market data or reported investment performance.

## Run locally
Open `index.html` in a browser, or run `python -m http.server 8000` in this folder.
