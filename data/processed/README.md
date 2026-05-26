# Processed Neuronpedia SAE Feature Samples

This folder contains static samples of public Neuronpedia sparse-autoencoder feature data.

## Final website dataset

- Source: Neuronpedia public exports, `v1/gpt2-small/*-res-jb`
- Model: `gpt2-small`
- Layers sampled: 0 through 11
- Rows: 6,000 unique SAE features
- Columns: 18
- Output files: `features_resjb.csv`, `features_resjb.json`, `validation_report_resjb.json`

Each row represents one SAE feature. The pipeline joins feature metadata with one selected natural-language explanation, derives a keyword-based `concept_category`, computes a simple `legibility_score`, and creates global `x` / `y` coordinates using PCA over Neuronpedia explanation embeddings.

The final website also uses `feature_examples.json`, a small set of 12 richer Neuronpedia API feature responses with token activation windows for the detail panel.

## Approved proposal sample

- Source: Neuronpedia public exports, `v1/gpt2-small/*-res_scefr-ajt`
- Model: `gpt2-small`
- Layers sampled: 2, 6, 10
- Rows: 3,000 unique SAE features
- Columns: 18
- Output files: `features.csv`, `features.json`, `validation_report.json`

Each row represents one SAE feature. The pipeline joins feature metadata with one selected natural-language explanation per feature, derives a keyword-based `concept_category`, computes a simple `legibility_score`, and creates `x` / `y` coordinates using PCA over Neuronpedia explanation embeddings.

Both samples satisfy the DSC 106 outside-dataset requirement: they are public, non-synthetic, and have more than 100 rows and 5 columns.
