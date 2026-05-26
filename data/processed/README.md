# Processed Neuronpedia SAE Feature Samples

This folder contains static samples of public Neuronpedia sparse-autoencoder feature data.

## Final website dataset

- Source: Neuronpedia public exports, `v1/gpt2-small/*-res-jb`
- Model: `gpt2-small`
- Layers sampled: 0 through 11
- Rows: 6,000 unique SAE features
- Columns: 18 in the full export; 7 in the compact browser dataset
- Output files: `features_resjb.csv`, `features_resjb.json`, `features_site.json`, `validation_report_resjb.json`

Each row represents one saved GPT-2 moment from the public feature export. The pipeline joins feature metadata with one selected short description, derives a keyword-based `concept_category`, computes a simple `legibility_score`, and creates global `x` / `y` coordinates using PCA over Neuronpedia description embeddings.

The final website loads `features_site.json`, a compact projection of the full 18-column dataset that keeps only the fields needed by the in-browser visualizations. It precomputes `agreement_score` and omits raw description, highlighted-text, and source-URL strings so the browser payload is about 1.1 MB instead of about 2.3 MB. Regenerate it with `node scripts/build_site_features.js` after rebuilding `features_resjb.json`, then run `node scripts/validate_site_assets.js` from the repo root. The final website also uses `feature_examples.json`, a small set of 12 richer Neuronpedia API feature responses with token activation windows for the detail panel.

## Approved proposal sample

- Source: Neuronpedia public exports, `v1/gpt2-small/*-res_scefr-ajt`
- Model: `gpt2-small`
- Layers sampled: 2, 6, 10
- Rows: 3,000 unique SAE features
- Columns: 18
- Output files: `features.csv`, `features.json`, `validation_report.json`

Each row represents one SAE feature. The pipeline joins feature metadata with one selected natural-language explanation per feature, derives a keyword-based `concept_category`, computes a simple `legibility_score`, and creates `x` / `y` coordinates using PCA over Neuronpedia explanation embeddings.

Both samples satisfy the DSC 106 outside-dataset requirement: they are public, non-synthetic, and have more than 100 rows and 5 columns.
