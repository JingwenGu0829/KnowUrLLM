# KnowUrLLM: The Note Says Cats. The Sentence Says Cataracts.

An interactive DSC 106 final project about checking whether a short dataset
note about GPT-2 matches the highlighted text and the full sentence behind it.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

There is no build step. The page loads local JSON data and a vendored D3 runtime,
so it can render without depending on a CDN during local review.

## What is included

- `index.html`, `style.css`, `main.js`: top-level GitHub Pages-ready website
- `vendor/d3.v7.min.js`: local D3 v7.9.0 runtime used by the visualizations
- `data/processed/features_site.json`: compact 6,000-row, 7-field browser dataset
- `data/processed/features_resjb.json`: full 6,000-row public GPT-2 response dataset
- `data/processed/feature_examples.json`: 12 richer source examples with highlighted text
- `scripts/build_resjb_dataset.py`: reproducible full processing-step dataset builder
- `scripts/build_site_features.js`: creates the compact browser dataset from the full export
- `scripts/validate_site_assets.js`: checks the compact dataset and local asset wiring
- `scripts/smoke_site.js`: Playwright viewport smoke test for the rendered local page
- `scripts/build_feature_examples.py`: reproducible API example fetcher

## Current explorable

The website narrows the project to one teachable question: when should a viewer
trust a short note attached to a saved GPT-2 moment? It starts with a
cat/cataracts mismatch, defines the saved moment in plain language, previews
the and-but-therefore story arc, then uses four scroll examples to compare the
short note, highlighted text, and full sentence. The broader dot map, topic
heatmap, rarity histogram, four-example matrix, and word-match chart connect
those examples back to the 6,000-row dataset. The sticky dot map supports hover,
tap, and keyboard probing so readers can check nearby saved moments without
opening extra controls. A compact methods strip explains how the dataset-level
numbers are computed, and the final takeaway returns to all four examples as
support for the rule. On narrow screens, each story chapter includes its own
compact support panel so the examples remain readable without the desktop
sticky stage. The required design note follows the final takeaway as supporting
writeup, so it does not interrupt the main story before the conclusion lands.

The page also reports local data loading status and gives a direct recovery
message if the JSON files are unavailable.

## Data sources

- Neuronpedia public website: <https://www.neuronpedia.org/>
- Neuronpedia public exports: <https://neuronpedia-datasets.s3.us-east-1.amazonaws.com/index.html?prefix=v1/>
- Dataset scope: `gpt2-small`, GPT-2 steps 0-11, source `res-jb`

The original approved proposal sample is still present as `data/processed/features.json`.

## Local checks

```bash
node --check main.js
node --check scripts/build_site_features.js
node --check scripts/validate_site_assets.js
node --check scripts/smoke_site.js
node scripts/validate_site_assets.js
node scripts/smoke_site.js
curl -sS -I http://localhost:8000/ | head
```

`scripts/smoke_site.js` expects the local server to be running. It checks desktop,
wide short-screen laptop, narrow short-screen laptop, tablet, and mobile
viewports for data loading, scroll-example sync, sticky dot-map fit, no horizontal
overflow, no visible form controls, and the chart-focus plus pointer and
keyboard dot-map interactions.

Regenerate the compact browser dataset after rebuilding the full export:

```bash
node scripts/build_site_features.js
```

Per the current local instructions in `AGENT.md`, this workspace is not doing
video work and is not pushing upstream. The site is kept rendered and verified
locally for review.
