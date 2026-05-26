# KnowUrLLM: Hidden Vocabulary of GPT-2

An interactive DSC 106 final project that explains sparse-autoencoder features
inside GPT-2 using public Neuronpedia data.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## What is included

- `index.html`, `style.css`, `main.js`: top-level GitHub Pages-ready website
- `data/processed/features_resjb.json`: 6,000 GPT-2 `res-jb` SAE features
- `data/processed/feature_examples.json`: 12 richer Neuronpedia API examples with token activation windows
- `scripts/build_resjb_dataset.py`: reproducible full-layer dataset builder
- `scripts/build_feature_examples.py`: reproducible API example fetcher

## Data sources

- Neuronpedia public website: <https://www.neuronpedia.org/>
- Neuronpedia public exports: <https://neuronpedia-datasets.s3.us-east-1.amazonaws.com/index.html?prefix=v1/>
- Dataset scope: `gpt2-small`, layers 0-11, residual-stream SAE source `res-jb`

The original approved proposal sample is still present as `data/processed/features.json`.

## Final submission checklist

- Publish the repo root to GitHub Pages.
- Record a public YouTube demo video of 2 minutes or less.
- Add the video link to the web page before the final Gradescope submission.

See `video_script.md` for a concise recording script.
