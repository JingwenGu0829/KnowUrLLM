# Research Plan: Mapping the Hidden Vocabulary of a Language Model

## 0. One-Sentence Summary

We will build an interactive data visualization project using public Neuronpedia sparse autoencoder (SAE) feature data to map and explain the internal “concept space” of a language model, showing what kinds of features appear inside the model, how they vary across layers, and how users can explore them through search, filtering, and detail views.

---

## 1. Working Title

**The Hidden Vocabulary of GPT-2: Visualizing SAE Features from Neuronpedia**

Possible alternatives:

- **An Atlas of Artificial Concepts**
- **Mapping the Hidden Concepts Inside GPT-2**
- **Inside the Model: A Visual Atlas of Sparse Autoencoder Features**
- **What Does a Language Model Know? A Visualization of Internal Features**

---

## 2. Project Motivation

Most people interact with language models only through input and output: they type a prompt and receive a response. However, mechanistic interpretability tools try to expose some of the intermediate structures inside models. Sparse autoencoders, or SAEs, are one method for discovering internal features that may correspond to human-understandable patterns such as Star Wars terms, Twitter usernames, animal names, URLs, programming syntax, dates, names, or grammatical structures.

Neuronpedia provides public data and tooling for browsing these SAE features. However, Neuronpedia is primarily designed as an inspection tool for researchers looking at individual features. Our project will use Neuronpedia data to build a broader visual explanation: an atlas of many internal features at once.

The goal is not to prove that language models “think” like humans. Instead, the goal is to help users explore what kinds of internal features have been discovered, where they appear across model layers, and how interpretable or ambiguous those features are.

---

## 3. Core Research Question

**What kinds of human-interpretable concepts appear inside a language model, and how are they organized across layers?**

Subquestions:

1. What categories of concepts appear among SAE features?
2. Are some concept types more common in certain layers?
3. Which features are easy for humans to interpret, and which are vague or strange?
4. How sparse are these features? Do most activate rarely, or do some activate broadly?
5. Can users search the model’s internal feature space for concepts like “Twitter,” “Star Wars,” “cats,” “Python,” or “URLs”?
6. How can visualization make interpretability more understandable without overstating what the data proves?

---

## 4. Dataset

### 4.1 Primary Data Source

We will use public sparse autoencoder feature data from **Neuronpedia**, an open platform for mechanistic interpretability research.

Important links:

- Neuronpedia main site: <https://www.neuronpedia.org/>
- Neuronpedia API documentation: <https://docs.neuronpedia.org/api>
- API sandbox: <https://neuronpedia.org/api-doc>
- Public dataset exports: <https://neuronpedia-datasets.s3.us-east-1.amazonaws.com/index.html?prefix=v1/>
- Example feature page: <https://www.neuronpedia.org/gpt2-small/6-res_scefr-ajt/650>
- Example feature JSON endpoint: <https://www.neuronpedia.org/api/feature/gpt2-small/6-res_scefr-ajt/650>

### 4.2 Recommended Dataset Scope

Use a manageable subset of Neuronpedia data.

Recommended initial scope:

- **Model:** `gpt2-small`
- **SAE source:** GPT-2 small residual stream SAE features, such as `res-jb` or `res_scefr-ajt`
- **Layers:** start with 2–4 layers; expand if the data pipeline is easy
- **Rows:** one row per SAE feature
- **Final target size:** approximately 1,000–10,000 features

A single feature row should include fields such as:

```text
model_id
source
layer
feature_index
feature_id
explanation
activation_density
top_positive_logits
top_negative_logits
top_activating_text
max_activation
concept_category
legibility_score
x
y
```

The exact available fields may differ depending on the API/export format. Some fields will come directly from Neuronpedia, while others will be derived by us.

### 4.3 Dataset Requirement

This dataset satisfies the final project requirement of at least **100 rows and 5 columns**. Each row is one SAE feature. Neuronpedia contains far more than 100 features, and even a small subset of GPT-2 small features should provide thousands of rows.

### 4.4 Proposal-Ready Dataset Paragraph

We plan to use publicly available sparse autoencoder feature data from Neuronpedia, an open platform and public database for mechanistic interpretability research. Each row in our working dataset will represent one SAE feature from an open-source language model such as GPT-2 small, with columns including model name, SAE source, layer, feature index, natural-language explanation, activation density, top positive logits, top negative logits, and top activating examples. We will also derive additional fields such as concept category, legibility score, and two-dimensional map coordinates. This dataset satisfies the project requirement because it contains far more than 100 rows and more than 5 useful columns, while also providing a rich basis for visualizing internal model features rather than only model outputs.

### 4.5 Proposal-Ready “Why Interesting” Paragraph

This dataset will make for an interesting final project because it lets us visualize a language model’s internal “vocabulary” rather than only its final responses. By mapping many SAE features at once, we can explore what kinds of concepts appear inside the model, how they are distributed across layers, and which features are easier or harder for humans to interpret. The project will combine an atlas-level view of feature clusters with detail views showing explanations, logits, activation density, and example activations for individual features. This makes the visualization both educational and analytical: users can see the promise of mechanistic interpretability while also seeing where explanations become vague, uncertain, or misleading.

---

## 5. What Makes This Project Original?

We should avoid simply recreating Neuronpedia’s interface.

Neuronpedia already lets researchers inspect individual SAE features. Our project will instead aggregate many features and build an explanatory, comparative visualization.

Original contributions:

### 5.1 Feature Atlas

We will create a map of many SAE features at once. Each point represents one internal feature. Users can search, filter, and inspect the model’s internal feature space.

### 5.2 Concept Taxonomy

We will classify feature explanations into rough concept categories, such as:

```text
Pop culture
Social media
Animals
Geography
Programming
Numbers and dates
URLs and usernames
Names and entities
Syntax and punctuation
Politics and news
Academic writing
Other or unclear
```

This lets us compare different kinds of internal features across layers.

### 5.3 Legibility Score

We will create an exploratory score for how human-readable a feature seems. This score is not meant to be a scientific truth. It is a visual aid for comparing features.

Possible simple scoring rule:

```text
legibility_score =
  +1 if explanation exists
  +1 if explanation length is neither too short nor too long
  +1 if explanation avoids vague phrases such as “various,” “related to,” “seems to,” or “appears to”
  +1 if top positive logits are available
  +1 if top activating examples are available
```

This gives each feature a rough score from 0 to 5.

### 5.4 Searchable Internal Concept Space

Users can search for terms such as:

```text
Twitter
Star Wars
cat
dog
Python
URL
capital
number
date
name
politics
```

The atlas highlights matching internal features. This turns the project into an interactive exploration of the model’s hidden vocabulary.

### 5.5 Critical Interpretation

The project will explicitly discuss limitations. A feature explanation may be automatically generated, incomplete, or misleading. A clean visualization can create a false sense of understanding. We will present the visualization as an exploratory tool, not as proof that the model reasons like a human.

---

## 6. Proposed Website Structure

The final project should be a scrollytelling-style interactive article with one main dashboard.

### Section 1: The Black Box

Start with the familiar view of an LLM:

```text
Prompt -> Model -> Output
```

Explain that most users only see the input and output, but interpretability research tries to inspect internal model representations.

### Section 2: What Is an SAE Feature?

Introduce sparse autoencoder features in simple terms.

Suggested explanation:

> A sparse autoencoder feature is a pattern discovered inside a model’s internal activations. Some features appear to activate for recognizable concepts, such as Star Wars names, Twitter handles, animal words, code syntax, dates, or URLs.

Include one feature card example showing:

```text
Feature explanation
Layer
Feature index
Activation density
Top positive logits
Top negative logits
Top activating examples
```

### Section 3: The Hidden Vocabulary Atlas

Introduce the main visualization.

Each point is one SAE feature.

Encodings:

```text
x/y position: 2D projection from feature explanations or existing UMAP coordinates
color: layer, category, or legibility score
size: activation density or max activation
tooltip: feature explanation, layer, index, top logits
```

Main message:

> Instead of viewing one feature at a time, we can map thousands of features together to see the model’s internal concept space.

### Section 4: Concepts Across Layers

Show aggregate patterns using heatmaps and charts.

Possible message:

> Some layers may contain more surface-level or syntactic features, while others may contain more semantic or prediction-oriented features. We should phrase this carefully as an exploratory observation, not as a definitive claim.

### Section 5: Search the Model’s Internal Concepts

Add a search box and category filters.

User actions:

- Search “Twitter”
- Search “Star Wars”
- Search “cat”
- Search “Python”
- Filter by layer
- Filter by concept category
- Click a dot to inspect a feature

Main message:

> The model’s internal features do not behave like a human dictionary. Some concepts form tight clusters, while others are scattered across the feature space.

### Section 6: Feature Detail View

When a user clicks a point, show a detail card:

```text
Feature ID
Model
Source
Layer
Index
Explanation
Activation density
Top positive logits
Top negative logits
Top activating text examples
Legibility score
```

### Section 7: Limits of Interpretability

End with a critical section.

Explain:

- Feature labels may be noisy or automatically generated.
- Top logits, top activations, and explanations may not always agree.
- A feature can look interpretable without fully explaining the model’s behavior.
- Visualization can clarify structure, but it can also make uncertain explanations seem more certain than they are.

---

## 7. Proposed Visualizations

The project can include at least 5–6 static visualizations in the proposal, which later become interactive components.

### Visualization 1: Feature Atlas Scatterplot

Each point is one SAE feature.

Encodings:

```text
x/y: 2D feature coordinates
color: layer or concept category
size: activation density
tooltip: explanation, layer, index, top logits
```

Purpose:

Show the model’s internal concept space as a map.

### Visualization 2: Layer by Concept Category Heatmap

Rows are concept categories. Columns are model layers. Cell values are feature counts or percentages.

Purpose:

Show how different kinds of features are distributed across layers.

### Visualization 3: Activation Density Histogram

x-axis: activation density  
y-axis: number of features

Purpose:

Show that many SAE features are sparse and activate only in limited contexts.

### Visualization 4: Feature Detail Card

For a selected feature, show explanation, logits, activation density, top activating examples, and metadata.

Purpose:

Teach users how to read one feature before interpreting the full atlas.

### Visualization 5: Legibility Score by Layer

Could be a box plot, bar chart, or stacked bar chart.

Purpose:

Show whether some layers contain more human-readable features than others.

### Visualization 6: Search Results View

Search a concept like “Twitter” or “Star Wars” and show matching features highlighted on the atlas.

Purpose:

Show whether concepts appear in clusters or are spread across the internal feature space.

### Optional Visualization 7: Prompt Token by Layer Activation Heatmap

If prompt activation data is easy to access, show:

```text
x-axis: token
y-axis: layer
color: number of activated features or total activation strength
```

Purpose:

Show which features activate for specific input tokens.

This should be treated as a stretch goal, not a dependency for the main project.

---

## 8. Data Processing Plan

### Step 1: Inspect One API Response

Start with this endpoint:

```text
https://www.neuronpedia.org/api/feature/gpt2-small/6-res_scefr-ajt/650
```

Goal:

Understand the JSON structure.

Expected output:

```text
data/raw/example_feature.json
```

Task for Codex:

```text
Write a Python script that fetches the example Neuronpedia feature JSON endpoint, prints the top-level keys, and saves the response to data/raw/example_feature.json.
```

### Step 2: Inspect Public Exports

Use the export page:

```text
https://neuronpedia-datasets.s3.us-east-1.amazonaws.com/index.html?prefix=v1/
```

Goal:

Find relevant files for GPT-2 small features. Do not download everything.

Task for Codex:

```text
Write a script that inspects the Neuronpedia public export index and identifies files related to gpt2-small SAE features. Print file names and sizes before downloading anything.
```

### Step 3: Build a Feature Table

Create a clean table where each row is one feature.

Target files:

```text
data/processed/features.csv
data/processed/features.json
```

Target columns:

```text
feature_id
model_id
source
layer
feature_index
explanation
activation_density
top_positive_logits
top_negative_logits
top_activation_text
max_activation
```

### Step 4: Add Concept Categories

Use keyword-based rules first.

Example rules:

```python
CATEGORY_KEYWORDS = {
    "social_media": ["twitter", "tweet", "username", "handle", "hashtag", "url"],
    "pop_culture": ["star wars", "jedi", "vader", "kenobi", "movie", "song", "character"],
    "animals": ["cat", "dog", "animal", "bird", "horse", "fish", "pet"],
    "geography": ["city", "country", "state", "capital", "location", "place"],
    "programming": ["python", "function", "code", "variable", "def", "class"],
    "numbers_dates": ["number", "date", "year", "month", "time"],
    "syntax": ["comma", "period", "punctuation", "sentence", "grammar"],
    "names_entities": ["name", "person", "company", "organization"],
    "politics_news": ["political", "president", "election", "government", "news"],
}
```

Output column:

```text
concept_category
```

### Step 5: Add Legibility Score

Create a simple exploratory score.

Example:

```python
def compute_legibility_score(row):
    score = 0

    explanation = str(row.get("explanation", "")).strip().lower()
    top_positive = str(row.get("top_positive_logits", "")).strip()
    top_activation = str(row.get("top_activation_text", "")).strip()

    if explanation:
        score += 1

    word_count = len(explanation.split())
    if 5 <= word_count <= 25:
        score += 1

    vague_phrases = ["various", "related to", "seems to", "appears to", "unclear", "unknown"]
    if explanation and not any(p in explanation for p in vague_phrases):
        score += 1

    if top_positive:
        score += 1

    if top_activation:
        score += 1

    return score
```

Output column:

```text
legibility_score
```

### Step 6: Compute 2D Coordinates

Option A:

Use existing UMAP coordinates if available from Neuronpedia.

Option B:

Compute our own from explanations.

Simple method:

1. Use `TfidfVectorizer` on feature explanations.
2. Reduce to 2D using PCA.
3. Save coordinates as `x` and `y`.

Task for Codex:

```text
Use sklearn TfidfVectorizer on the feature explanations and reduce to 2D using PCA. Save the resulting coordinates as x and y columns in features.csv. If UMAP is installed, optionally use UMAP instead of PCA, but PCA should be the default fallback.
```

### Step 7: Validate the Processed Dataset

Check:

```text
At least 100 rows
At least 5 columns
No missing feature IDs
Layer values parsed correctly
Categories assigned
Legibility scores computed
x/y coordinates available
```

---

## 9. Frontend Implementation Plan

### 9.1 Required Stack

The class requires a web-based visualization, likely using:

```text
HTML
CSS
JavaScript
D3.js
GitHub Pages
```

Recommended project structure:

```text
project/
  index.html
  style.css
  main.js
  data/
    processed/
      features.csv
      features.json
  scripts/
    build_dataset.py
  README.md
```

### 9.2 Main D3 Components

#### Component 1: Feature Atlas

Input:

```text
data/processed/features.csv
```

Interactions:

```text
Hover dot -> tooltip
Click dot -> update feature detail panel
Search box -> highlight matching explanations/logits
Dropdown -> color by layer, category, or legibility score
Slider -> filter by activation density
Checkbox -> show only features with explanations
```

#### Component 2: Layer-Category Heatmap

Input:

```text
features.csv
```

Interaction:

```text
Click heatmap cell -> filter atlas to that layer/category
```

#### Component 3: Activation Density Histogram

Input:

```text
features.csv
```

Interaction:

```text
Brush histogram range -> filter atlas by activation density
```

#### Component 4: Feature Detail Panel

Input:

```text
selected feature
```

Display:

```text
feature_id
model_id
source
layer
feature_index
explanation
activation_density
top_positive_logits
top_negative_logits
top_activation_text
legibility_score
```

#### Component 5: Narrative Scrollytelling

Use text sections to guide the reader:

```text
1. What is an SAE feature?
2. What does the feature atlas show?
3. How are concepts distributed across layers?
4. What happens when we search for a concept?
5. How should we interpret these visualizations carefully?
```

---

## 10. MVP Plan

This is the smallest version that would still make a strong final project.

### MVP Dataset

Use 1,000–3,000 GPT-2 small features.

Required columns:

```text
feature_id
model_id
source
layer
feature_index
explanation
activation_density
top_positive_logits
top_negative_logits
concept_category
legibility_score
x
y
```

### MVP Visualizations

1. Feature atlas scatterplot
2. Layer-category heatmap
3. Activation density histogram
4. Feature detail card
5. Legibility score by layer

### MVP Interactions

```text
Search features
Filter by layer
Filter by category
Click feature for detail
Color atlas by layer/category/legibility
```

If the project reaches this point, it is already a complete and original visualization.

---

## 11. Stretch Goals

Only attempt these after the MVP works.

### Stretch Goal 1: Prompt Probe

Add preselected prompts and show which features activate for each token/layer.

Possible prompts:

```text
Help me, Obi-Wan Kenobi.
What if cats and dogs were friends?
Follow me on Twitter @example.
The capital of the state containing Dallas is
def fibonacci(n):
```

Visualization:

```text
Token by layer heatmap
Click cell to show top activated features
```

### Stretch Goal 2: Circuit Tracing Case Study

Add one small attribution graph case study, such as:

```text
The capital of the state containing Dallas is ___
```

This can be a final zoom-in section, but it should not be the core dependency of the project.

### Stretch Goal 3: Better Concept Classification

Improve categories using:

```text
Embeddings
Manual labels
Clustering
LLM-assisted labeling
```

Only do this if the keyword-based version is already working.

### Stretch Goal 4: Compare Two SAE Sources or Layers

Compare features across two SAE sources or across early, middle, and late layers.

### Stretch Goal 5: Threshold Sensitivity

Show how filters change the story.

Example metrics:

```text
Number of visible features
Average legibility score
Category distribution
Layer distribution
```

---

## 12. Risks and Mitigations

### Risk 1: Export files are too large or confusing

Mitigation:

Start with individual API calls and a small feature sample. Do not depend on processing the entire Neuronpedia export.

### Risk 2: Some desired fields are missing

Mitigation:

Design the MVP around fields we can reliably get:

```text
model
source
layer
index
explanation
top logits
activation density
top activations
```

If UMAP coordinates are missing, compute our own using explanations.

### Risk 3: Prompt activation data is hard to access

Mitigation:

Treat prompt probing as a stretch goal. The feature atlas alone is enough for the final project.

### Risk 4: Feature explanations are noisy

Mitigation:

Make this part of the project. The visualization should explicitly show that interpretability is imperfect.

### Risk 5: Too much technical theory

Mitigation:

Keep the explanation simple:

```text
A feature is a pattern inside the model.
Some features are human-interpretable.
SAEs help expose these features.
Visualization helps us explore many features at once.
```

---

## 13. Suggested Division of Labor

### Person A: Data Pipeline

Responsibilities:

```text
Inspect API/export data
Write scripts to fetch/process feature data
Build features.csv/features.json
Create concept categories
Compute legibility score
Compute 2D coordinates
Validate dataset quality
```

### Person B: Visualization Frontend

Responsibilities:

```text
Build D3 atlas scatterplot
Build heatmap and charts
Build feature detail panel
Implement search/filter interactions
Style the page
Deploy to GitHub Pages
```

### Shared Responsibilities

```text
Write narrative text
Choose example features
Interpret visual patterns
Prepare proposal and final writeup
Test usability with classmates
```

---

## 14. Concrete Codex Brief

Paste this into Codex:

```text
We are building a D3.js data visualization project using public Neuronpedia sparse autoencoder feature data.

Goal:
Create an interactive “Hidden Vocabulary of GPT-2” feature atlas. Each row is one SAE feature from Neuronpedia. The frontend should let users explore features by layer, concept category, activation density, explanation text, and legibility score.

Data source:
Neuronpedia API and exports.

Links:
- Docs: https://docs.neuronpedia.org/api
- Exports: https://neuronpedia-datasets.s3.us-east-1.amazonaws.com/index.html?prefix=v1/
- Example JSON endpoint: https://www.neuronpedia.org/api/feature/gpt2-small/6-res_scefr-ajt/650

Tasks:
1. Create a Python data pipeline in scripts/build_dataset.py.
2. Fetch or load a manageable subset of GPT2-small SAE features.
3. Produce data/processed/features.csv with columns:
   feature_id, model_id, source, layer, feature_index, explanation,
   activation_density, top_positive_logits, top_negative_logits,
   top_activation_text, max_activation, concept_category,
   legibility_score, x, y.
4. Add keyword-based concept categories from explanation text.
5. Add a simple legibility_score based on explanation availability, specificity, and available logits/examples.
6. Compute x/y coordinates using TF-IDF on explanations plus PCA to 2D. Use UMAP only if already installed.
7. Build a frontend with index.html, style.css, and main.js.
8. Use D3 to create:
   - feature atlas scatterplot
   - layer-category heatmap
   - activation density histogram
   - feature detail card
   - controls for search, layer filter, category filter, activation density filter, and color mode
9. Keep the data static so the site can be deployed on GitHub Pages.
10. Do not rely on a backend server.

Important:
This is not a Neuronpedia clone. The project should aggregate and compare many features to show patterns in the model’s internal concept space.
```

---

## 15. Final Deliverable Vision

The final website should feel like an explorable article.

A user should leave understanding:

1. Language models contain internal features that can sometimes be interpreted.
2. These features can be mapped, searched, and compared.
3. Different layers may contain different types of features.
4. Some features are clear and specific, while others are vague or strange.
5. Visualization can make interpretability more accessible, but it should not be mistaken for definitive proof of model reasoning.

The strongest version of this project is not a clone of Neuronpedia. It is a guided visual atlas that helps non-experts understand what Neuronpedia-style SAE data reveals about language model internals.
