#!/usr/bin/env python3
"""Fetch rich Neuronpedia feature examples for the final detail panel."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import requests


ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
RAW_DIR = ROOT / "data" / "raw" / "feature_api_examples"
FEATURES_PATH = PROCESSED_DIR / "features_resjb.json"
OUTPUT_PATH = PROCESSED_DIR / "feature_examples.json"

FEATURE_IDS = [
    "gpt2-small/4-res-jb/7023",   # Twitter handles / user mentions
    "gpt2-small/4-res-jb/14801",  # URLs
    "gpt2-small/7-res-jb/6592",   # Python and database symbols
    "gpt2-small/7-res-jb/24310",  # cats
    "gpt2-small/3-res-jb/15682",  # New York City
    "gpt2-small/4-res-jb/19488",  # money
    "gpt2-small/11-res-jb/14962", # Star Wars
    "gpt2-small/0-res-jb/5437",   # military vessels
    "gpt2-small/7-res-jb/14716",  # President Donald Trump
    "gpt2-small/0-res-jb/21622",  # number eight
    "gpt2-small/5-res-jb/6807",   # code structure
    "gpt2-small/0-res-jb/5566",   # names
]


def split_feature_id(feature_id: str) -> tuple[str, str, str]:
    model_id, source, index = feature_id.split("/")
    return model_id, source, index


def fetch_feature(feature_id: str) -> dict[str, Any]:
    model_id, source, index = split_feature_id(feature_id)
    target = RAW_DIR / model_id / source / f"{index}.json"
    if target.exists():
        return json.loads(target.read_text(encoding="utf-8"))

    target.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://www.neuronpedia.org/api/feature/{model_id}/{source}/{index}"
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    data = response.json()
    target.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def token_window(activation: dict[str, Any], radius: int = 22) -> dict[str, Any]:
    tokens = activation.get("tokens") or []
    values = activation.get("values") or []
    max_index = activation.get("maxValueTokenIndex")
    if not isinstance(max_index, int):
        max_index = 0
    start = max(0, max_index - radius)
    end = min(len(tokens), max_index + radius + 1)
    local_values = [float(value or 0) for value in values[start:end]]
    local_max = max(local_values) if local_values else 0

    return {
        "max_value": activation.get("maxValue"),
        "max_token_index": max_index,
        "tokens": [
            {
                "text": str(tokens[index]),
                "value": float(values[index] or 0) if index < len(values) else 0,
                "relative_value": (
                    (float(values[index] or 0) / local_max)
                    if local_max and index < len(values)
                    else 0
                ),
                "is_peak": index == max_index,
            }
            for index in range(start, end)
        ],
    }


def best_activation_windows(feature: dict[str, Any], limit: int = 3) -> list[dict[str, Any]]:
    activations = feature.get("activations") or []
    ranked = sorted(
        activations,
        key=lambda activation: float(activation.get("maxValue") or 0),
        reverse=True,
    )
    return [token_window(activation) for activation in ranked[:limit]]


def main() -> None:
    rows = json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
    by_id = {row["feature_id"]: row for row in rows}
    examples = []

    for feature_id in FEATURE_IDS:
        row = by_id[feature_id]
        feature = fetch_feature(feature_id)
        api_explanations = feature.get("explanations") or []
        examples.append(
            {
                "feature_id": feature_id,
                "model_id": row["model_id"],
                "source": row["source"],
                "layer_number": row["layer_number"],
                "feature_index": row["feature_index"],
                "concept_category": row["concept_category"],
                "explanation": row["explanation"],
                "api_explanations": [
                    {
                        "description": str(item.get("description", "")).strip(),
                        "model": item.get("explanationModelName", ""),
                    }
                    for item in api_explanations[:3]
                ],
                "activation_density": row["activation_density"],
                "max_activation": row["max_activation"],
                "top_positive_logits": feature.get("pos_str") or [],
                "top_negative_logits": feature.get("neg_str") or [],
                "activation_windows": best_activation_windows(feature),
                "neuronpedia_url": row["neuronpedia_url"],
            }
        )
        print(f"fetched {feature_id}", flush=True)

    OUTPUT_PATH.write_text(json.dumps(examples, indent=2), encoding="utf-8")
    print(json.dumps({"examples": len(examples), "output": str(OUTPUT_PATH)}, indent=2))


if __name__ == "__main__":
    main()
