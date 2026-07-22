# Vamshi Aitharaju — Portfolio

A single-page analytics-themed portfolio site for **Vamshi Aitharaju**, Data Analyst
(Fraud & Risk Analytics · Power BI, Python & Excel).

Built as a static site — plain HTML, CSS, and vanilla JavaScript, no build step.

## Signature element

The hero recreates the real **NYC Air Quality pollution trend** and draws it in on
load. The **Annual / Winter / Summer** toggle swaps the chart to the real seasonal
data from the Power BI dashboards and shifts the page accent color. Every number in
the chart is pulled from the underlying project (the season averages match the
documented KPI values — e.g. winter NO₂ ≈ 25.4, summer O₃ ≈ 30.7).

## Projects featured

| Project | Repo |
|---|---|
| NYC Air Quality Analytics & Forecasting | [nyc-air-quality-analytics](https://github.com/aitharajuvamshi-cell/nyc-air-quality-analytics) |
| Coffee Shop Sales Analysis & KPI Dashboarding | [power-bi-analytics](https://github.com/aitharajuvamshi-cell/power-bi-analytics) |
| E-Commerce Sales Analysis (Vrinda Store) | [vrinda-store-data-analysis](https://github.com/aitharajuvamshi-cell/vrinda-store-data-analysis) |
| Surplus to Serve — Project Management | [surplus-to-serve-project-management](https://github.com/aitharajuvamshi-cell/surplus-to-serve-project-management) |

Project card thumbnails in `assets/` are real charts copied from each project repo.

## Running locally

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html    All page content
styles.css    Design system + responsive + reduced-motion
main.js       Hero chart engine, season toggle, typewriter, count-up, reveals
assets/       Real project chart images
```

## Accessibility

Respects `prefers-reduced-motion`, has visible keyboard focus states throughout,
skip-to-content link, and is fully responsive to mobile.

---

© 2026 Vamshi Aitharaju. Project content and charts are original work.
