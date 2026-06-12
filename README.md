# Heme/Onc PubMed Tracker

**Live site:** https://shankara-a.github.io/heme-onc-pubmed-tracker/

A static, client-side website that searches PubMed for recent hematology/oncology
publications, ranks them, and highlights papers with authors from a chosen institution.
No backend required — it calls the [NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
API directly from the browser and runs entirely on GitHub Pages.

## Features

- Toggle between **Hematology**, **Oncology**, and **Bioinformatics** fields
- Pick a disease "flag" (defaults to **Multiple Myeloma** under Hematology).
  The **Bioinformatics** field covers tools & software, DNA sequencing &
  genomics, RNA sequencing & single-cell, proteomics & mass spectrometry, and
  PTM mass spectrometry — searched without any heme/onc relevance filter, so
  you see the latest methods advances across all disease areas
- Filter by recency: last week (default), month, 3 months, 6 months, or year
- Sort by **SCImago Journal Rank** (default, using a curated lookup table), **journal
  impact factor**, **citation count** (live from NIH iCite), or **publication date**
- Highlight publications with an author affiliated with a given institution
  (defaults to **Stanford**) — the matching author name is bolded and the card
  is flagged
- A **GitHub** badge appears on any article whose abstract links to a public
  GitHub repo (e.g. from a "Code availability" statement), linking directly
  to that repo
- Optional free-text "additional search terms" box to further narrow results
- Optional NCBI API key field to raise the request rate limit

## Running locally

Because the app fetches local JSON-like data via `<script>` tags (not `fetch`),
you can open `index.html` directly in a browser. If you prefer a local server:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploying to GitHub Pages

This repo is already configured: GitHub Pages serves from the `main` branch
(root folder), live at https://shankara-a.github.io/heme-onc-pubmed-tracker/.
Pushing to `main` redeploys automatically (takes a minute or two; hard-refresh
to bypass cached CSS/JS).

## Customizing

- **Diseases / search terms**: edit `js/data.js` → `DISEASES`. Each entry has a
  PubMed search `query` (MeSH heading + Title/Abstract synonyms). Add new
  diseases or tweak existing queries here.
- **Journal rankings**: edit `js/data.js` → `JOURNAL_RANKS` (SCImago Journal
  Rank, the default sort) and `IMPACT_FACTORS` (impact factor, an alternative
  sort). Both are manually curated lookups, since neither SJR nor JCR data is
  available live via a free API. Journal names are matched after lowercasing
  and stripping periods, so add both the full journal title and its PubMed ISO
  abbreviation (e.g. `"blood"` and `"blood"`, or `"journal of clinical
  oncology"` and `"j clin oncol"`) if they differ. Journals missing from a
  table show "SJR N/A" / "IF N/A" and sort to the bottom under that metric's
  sort.
- **Default field/disease/time/sort/institution**: edit the `state` object at
  the top of `js/app.js`, and the corresponding `selected`/`value` attributes
  in `index.html`.

## Notes & limitations

- **CORS**: NCBI's E-utilities support cross-origin requests, so this works
  from a static site without a proxy. If you start seeing errors, it's most
  often a temporary NCBI rate limit (3 requests/sec without an API key) — wait
  a moment or add a free [NCBI API key](https://www.ncbi.nlm.nih.gov/account/settings/)
  in the settings field.
- **SJR and impact factors are approximate** and manually maintained — update
  `js/data.js` periodically (e.g. once a year when new SCImago/JCR figures are
  released).
- **Citation counts** come from the NIH [iCite](https://icite.od.nih.gov/) API
  in a single batch request per search. Very recent papers may show "0
  citations" or "N/A" simply because iCite hasn't indexed them yet.
- Each search fetches up to 60 of the most recent matching articles
  (`RETMAX` in `js/app.js`).
