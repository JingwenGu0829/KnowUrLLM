#!/usr/bin/env python3
"""Build a small Neuronpedia SAE feature sample for the DSC 106 proposal.

The script downloads a reproducible subset of public Neuronpedia export files,
joins feature metadata with auto-interp explanations, derives simple category
and legibility fields, and writes static CSV/JSON files suitable for D3.
"""

from __future__ import annotations

import csv
import gzip
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import numpy as np
import requests


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"

BASE_URL = "https://neuronpedia-datasets.s3.amazonaws.com"
FEATURE_API_URL = (
    "https://www.neuronpedia.org/api/feature/gpt2-small/6-res_scefr-ajt/650"
)

MODEL_ID = "gpt2-small"
SOURCES = ["2-res_scefr-ajt", "6-res_scefr-ajt", "10-res_scefr-ajt"]
TARGET_FEATURES_PER_SOURCE = 1000

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Social media / web": [
        "twitter",
        "tweet",
        "username",
        "usernames",
        "handle",
        "handles",
        "hashtag",
        "url",
        "http",
        "website",
        "online",
        "email",
        "media",
    ],
    "Pop culture": [
        "star wars",
        "jedi",
        "vader",
        "kenobi",
        "movie",
        "film",
        "song",
        "music",
        "character",
        "characters",
        "celebrity",
        "anime",
        "game",
        "gaming",
        "sports",
        "players",
    ],
    "Animals": [
        "cat",
        "dog",
        "animal",
        "bird",
        "horse",
        "fish",
        "pet",
        "species",
        "wildlife",
    ],
    "Geography": [
        "city",
        "country",
        "state",
        "capital",
        "location",
        "locations",
        "place",
        "places",
        "province",
        "region",
        "geographical",
        "map",
        "river",
    ],
    "Programming / technical": [
        "python",
        "function",
        "code",
        "programming",
        "variable",
        "algorithm",
        "software",
        "technical",
        "math",
        "mathematical",
        "data",
        "technology",
        "scientific",
        "research",
    ],
    "Numbers / dates": [
        "number",
        "numeric",
        "date",
        "year",
        "month",
        "time",
        "percent",
        "measurement",
        "measurements",
        "meters",
        "feet",
        "currency",
        "money",
        "economic",
        "financial",
        "numerical",
        "value",
        "values",
    ],
    "Syntax / grammar": [
        "comma",
        "period",
        "punctuation",
        "sentence",
        "grammar",
        "syntax",
        "phrase",
        "phrases",
        "word",
        "words",
        "text",
        "term",
        "terms",
        "noun",
        "nouns",
        "verb",
        "verbs",
        "expression",
        "expressions",
        "symbol",
        "symbols",
        "letters",
    ],
    "Names / entities": [
        "name",
        "names",
        "person",
        "people",
        "individual",
        "individuals",
        "company",
        "companies",
        "organization",
        "organizations",
        "brand",
        "entity",
        "entities",
        "proper",
        "mentions",
        "figures",
        "title",
        "titles",
    ],
    "Politics / news": [
        "political",
        "president",
        "election",
        "government",
        "news",
        "policy",
        "law",
        "court",
        "legal",
        "military",
        "historical",
    ],
}

VAGUE_PHRASES = [
    "various",
    "related to",
    "seems to",
    "appears to",
    "unclear",
    "unknown",
    "something",
    "certain",
]

OUTPUT_COLUMNS = [
    "feature_id",
    "model_id",
    "source",
    "layer_number",
    "feature_index",
    "explanation",
    "explanation_model",
    "activation_density",
    "top_positive_logits",
    "top_negative_logits",
    "top_activation_text",
    "max_activation",
    "concept_category",
    "legibility_score",
    "x",
    "y",
    "umap_cluster",
    "neuronpedia_url",
]


def download_bytes(url: str) -> bytes:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def load_jsonl_gz(url: str, raw_path: Path) -> list[dict[str, Any]]:
    if not raw_path.exists():
        raw_path.write_bytes(download_bytes(url))
    rows = []
    with gzip.open(raw_path, "rt", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def list_s3_keys(prefix: str) -> list[str]:
    keys: list[str] = []
    continuation_token = ""
    namespace = {"s3": "http://s3.amazonaws.com/doc/2006-03-01/"}

    while True:
        params = {"list-type": "2", "prefix": prefix, "max-keys": "1000"}
        if continuation_token:
            params["continuation-token"] = continuation_token
        url = f"{BASE_URL}/?{urlencode(params)}"
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        keys.extend(
            key.text or "" for key in root.findall("s3:Contents/s3:Key", namespace)
        )
        token = root.find("s3:NextContinuationToken", namespace)
        if token is None or not token.text:
            break
        continuation_token = token.text

    return keys


def sorted_batch_keys(keys: list[str]) -> list[str]:
    def batch_number(key: str) -> int:
        match = re.search(r"batch-(\d+)\.jsonl\.gz$", key)
        return int(match.group(1)) if match else 10**9

    return sorted(keys, key=batch_number)


def save_example_api_response() -> None:
    target = RAW_DIR / "example_feature.json"
    if not target.exists():
        response = requests.get(FEATURE_API_URL, timeout=60)
        response.raise_for_status()
        target.write_text(json.dumps(response.json(), indent=2), encoding="utf-8")


def source_layer_number(source: str) -> int:
    match = re.match(r"^(\d+)-", source)
    if not match:
        raise ValueError(f"Could not parse layer number from source: {source}")
    return int(match.group(1))


def explanation_rank(explanation: dict[str, Any]) -> tuple[int, int, int, int]:
    model_priority = {
        "gpt-4o-mini": 4,
        "claude-3-5-sonnet-20240620": 3,
        "gpt-4-1106-preview": 3,
        "gpt-3.5-turbo": 2,
    }
    description = str(explanation.get("description", "")).strip()
    word_count = len(description.split())
    has_reasonable_length = int(5 <= word_count <= 28)
    has_embedding = int(bool(explanation.get("embedding")))
    has_description = int(bool(description))
    priority = model_priority.get(str(explanation.get("explanationModelName", "")), 1)
    return has_description, priority, has_embedding, has_reasonable_length


def choose_explanation(
    current: dict[str, Any] | None, candidate: dict[str, Any]
) -> dict[str, Any]:
    if current is None:
        return candidate
    if explanation_rank(candidate) > explanation_rank(current):
        return candidate
    return current


def explanation_sort_key(explanation: dict[str, Any]) -> tuple[int, str]:
    index = str(explanation.get("index", ""))
    try:
        return int(index), index
    except ValueError:
        return 10**12, index


def contains_keyword(text: str, keyword: str) -> bool:
    if " " in keyword:
        return keyword in text
    return re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", text) is not None


def classify_concept(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(contains_keyword(lowered, keyword) for keyword in keywords):
            return category
    if not lowered.strip():
        return "No explanation"
    return "Other / unclear"


def compute_legibility_score(row: dict[str, Any]) -> int:
    score = 0
    explanation = str(row.get("explanation", "")).strip().lower()
    top_positive = str(row.get("top_positive_logits", "")).strip()
    top_activation = str(row.get("top_activation_text", "")).strip()

    if explanation:
        score += 1

    word_count = len(explanation.split())
    if 5 <= word_count <= 25:
        score += 1

    if explanation and not any(phrase in explanation for phrase in VAGUE_PHRASES):
        score += 1

    if top_positive:
        score += 1

    if top_activation:
        score += 1

    return score


def stringify_list(value: Any, limit: int = 8) -> str:
    if not value:
        return ""
    if not isinstance(value, list):
        return str(value)
    return ", ".join(str(item) for item in value[:limit])


def parse_embedding(value: Any) -> list[float] | None:
    if not value:
        return None
    if isinstance(value, list):
        return [float(item) for item in value]
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return None
        if isinstance(parsed, list):
            return [float(item) for item in parsed]
    return None


def add_embedding_pca_coordinates(rows: list[dict[str, Any]]) -> None:
    embeddings: list[list[float]] = []
    valid_rows: list[dict[str, Any]] = []

    for row in rows:
        embedding = row.pop("_embedding", None)
        if embedding and len(embedding) >= 2:
            embeddings.append(embedding)
            valid_rows.append(row)

    if len(valid_rows) < 2:
        for row in rows:
            row["x"] = 0
            row["y"] = 0
        return

    matrix = np.asarray(embeddings, dtype=float)
    matrix -= matrix.mean(axis=0, keepdims=True)
    _, _, vt = np.linalg.svd(matrix, full_matrices=False)
    coords = matrix @ vt[:2].T

    for axis in range(2):
        std = coords[:, axis].std()
        if std > 0:
            coords[:, axis] = (coords[:, axis] - coords[:, axis].mean()) / std

    valid_ids = {id(row) for row in valid_rows}
    for row, (x_coord, y_coord) in zip(valid_rows, coords):
        row["x"] = round(float(x_coord), 6)
        row["y"] = round(float(y_coord), 6)

    for row in rows:
        if id(row) not in valid_ids:
            row["x"] = 0
            row["y"] = 0


def build_rows() -> list[dict[str, Any]]:
    save_example_api_response()
    rows: list[dict[str, Any]] = []
    manifest: list[dict[str, Any]] = []

    for source in SOURCES:
        layer_number = source_layer_number(source)
        feature_keys = sorted_batch_keys(
            list_s3_keys(f"v1/{MODEL_ID}/{source}/features/")
        )
        explanation_keys = sorted_batch_keys(
            list_s3_keys(f"v1/{MODEL_ID}/{source}/explanations/")
        )
        features_by_index: dict[str, dict[str, Any]] = {}

        for feature_key in feature_keys:
            batch_name = Path(feature_key).name
            feature_url = f"{BASE_URL}/{feature_key}"
            feature_raw = RAW_DIR / MODEL_ID / source / "features" / batch_name
            feature_raw.parent.mkdir(parents=True, exist_ok=True)
            features = load_jsonl_gz(feature_url, feature_raw)
            for feature in features:
                features_by_index[str(feature.get("index", ""))] = feature

        sampled_by_index: dict[str, dict[str, Any]] = {}
        loaded_explanation_batches = []
        for explanation_key in explanation_keys:
            batch_name = Path(explanation_key).name
            explanation_url = f"{BASE_URL}/{explanation_key}"
            explanation_raw = RAW_DIR / MODEL_ID / source / "explanations" / batch_name
            explanation_raw.parent.mkdir(parents=True, exist_ok=True)
            explanations = load_jsonl_gz(explanation_url, explanation_raw)
            for explanation in explanations:
                feature_index = str(explanation.get("index", ""))
                sampled_by_index[feature_index] = choose_explanation(
                    sampled_by_index.get(feature_index), explanation
                )
            loaded_explanation_batches.append(batch_name)
            if len(sampled_by_index) >= TARGET_FEATURES_PER_SOURCE:
                break

        sampled_explanations = sorted(
            sampled_by_index.values(), key=explanation_sort_key
        )[:TARGET_FEATURES_PER_SOURCE]

        manifest.append(
            {
                "source": source,
                "feature_batches_loaded": len(feature_keys),
                "explanation_batches_loaded": loaded_explanation_batches,
                "sampled_unique_features": len(sampled_explanations),
                "feature_metadata_rows": len(features_by_index),
            }
        )

        for explanation in sampled_explanations:
            feature_index = str(explanation.get("index", ""))
            feature = features_by_index.get(feature_index, {})
            description = str(explanation.get("description", "")).strip()
            row = {
                "feature_id": f"{MODEL_ID}/{source}/{feature_index}",
                "model_id": MODEL_ID,
                "source": source,
                "layer_number": layer_number,
                "feature_index": feature_index,
                "explanation": description,
                "explanation_model": explanation.get("explanationModelName", ""),
                "activation_density": feature.get("frac_nonzero"),
                "top_positive_logits": stringify_list(feature.get("pos_str")),
                "top_negative_logits": stringify_list(feature.get("neg_str")),
                "top_activation_text": "",
                "max_activation": feature.get("maxActApprox"),
                "concept_category": classify_concept(description),
                "x": 0,
                "y": 0,
                "umap_cluster": explanation.get("umap_cluster"),
                "neuronpedia_url": (
                    f"https://www.neuronpedia.org/{MODEL_ID}/{source}/{feature_index}"
                ),
                "_embedding": parse_embedding(explanation.get("embedding")),
            }
            row["legibility_score"] = compute_legibility_score(row)
            rows.append(row)

        print(
            f"{source}: sampled {len(sampled_explanations)} explained features",
            flush=True,
        )

    (RAW_DIR / "neuronpedia_manifest_sample.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8"
    )
    add_embedding_pca_coordinates(rows)
    return rows


def clean_for_output(value: Any) -> Any:
    if value is None:
        return ""
    return value


def write_outputs(rows: list[dict[str, Any]]) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = PROCESSED_DIR / "features.csv"
    json_path = PROCESSED_DIR / "features.json"

    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    column: clean_for_output(row.get(column, ""))
                    for column in OUTPUT_COLUMNS
                }
            )

    compact_rows = [
        {column: clean_for_output(row.get(column, "")) for column in OUTPUT_COLUMNS}
        for row in rows
    ]
    json_path.write_text(json.dumps(compact_rows, indent=2), encoding="utf-8")


def validate(rows: list[dict[str, Any]]) -> dict[str, Any]:
    missing_ids = sum(1 for row in rows if not row.get("feature_id"))
    missing_xy = sum(
        1 for row in rows if row.get("x") in (None, "") or row.get("y") in (None, "")
    )
    missing_density = sum(1 for row in rows if row.get("activation_density") is None)
    categories = sorted({str(row["concept_category"]) for row in rows})
    return {
        "rows": len(rows),
        "columns": len(OUTPUT_COLUMNS),
        "sources": SOURCES,
        "target_features_per_source": TARGET_FEATURES_PER_SOURCE,
        "missing_feature_ids": missing_ids,
        "missing_xy": missing_xy,
        "missing_activation_density": missing_density,
        "categories": categories,
    }


def main() -> None:
    rows = build_rows()
    write_outputs(rows)
    report = validate(rows)
    (PROCESSED_DIR / "validation_report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
