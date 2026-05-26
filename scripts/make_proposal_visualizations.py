#!/usr/bin/env python3
"""Render static proposal figures from the processed Neuronpedia sample."""

from __future__ import annotations

import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import Rectangle


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "processed" / "features.csv"
OUT_DIR = ROOT / "proposal_visualizations"

CATEGORY_ORDER = [
    "Syntax / grammar",
    "Names / entities",
    "Programming / technical",
    "Pop culture",
    "Numbers / dates",
    "Geography",
    "Politics / news",
    "Social media / web",
    "Animals",
    "Other / unclear",
]

LAYER_ORDER = ["Layer 2", "Layer 6", "Layer 10"]

PALETTE = {
    "Syntax / grammar": "#4E79A7",
    "Names / entities": "#F28E2B",
    "Programming / technical": "#59A14F",
    "Pop culture": "#E15759",
    "Numbers / dates": "#76B7B2",
    "Geography": "#EDC948",
    "Politics / news": "#B07AA1",
    "Social media / web": "#FF9DA7",
    "Animals": "#9C755F",
    "Other / unclear": "#BAB0AC",
}


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    numeric_cols = [
        "layer_number",
        "feature_index",
        "activation_density",
        "max_activation",
        "legibility_score",
        "x",
        "y",
    ]
    for column in numeric_cols:
        df[column] = pd.to_numeric(df[column], errors="coerce")
    df["layer_label"] = "Layer " + df["layer_number"].astype(int).astype(str)
    df["layer_label"] = pd.Categorical(
        df["layer_label"], categories=LAYER_ORDER, ordered=True
    )
    df["concept_category"] = pd.Categorical(
        df["concept_category"], categories=CATEGORY_ORDER, ordered=True
    )
    return df


def set_theme() -> None:
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "axes.edgecolor": "#D0D5DD",
            "axes.labelcolor": "#344054",
            "axes.titlecolor": "#101828",
            "xtick.color": "#475467",
            "ytick.color": "#475467",
            "font.size": 11,
            "axes.titlesize": 17,
            "axes.titleweight": "bold",
            "axes.labelsize": 11,
            "legend.frameon": False,
            "savefig.dpi": 180,
        }
    )


def save(fig: plt.Figure, filename: str) -> None:
    path = OUT_DIR / filename
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)
    print(path.relative_to(ROOT))


def plot_atlas(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(10.5, 7.2))

    for category in CATEGORY_ORDER:
        subset = df[df["concept_category"] == category]
        if subset.empty:
            continue
        ax.scatter(
            subset["x"],
            subset["y"],
            s=18,
            c=PALETTE[category],
            alpha=0.68 if category != "Other / unclear" else 0.36,
            linewidths=0,
            label=f"{category} ({len(subset)})",
        )

    ax.set_title("Feature Atlas: 3,000 GPT-2 SAE Features")
    ax.set_xlabel("Explanation embedding PCA 1")
    ax.set_ylabel("Explanation embedding PCA 2")
    ax.grid(True, color="#EAECF0", linewidth=0.8)
    ax.legend(loc="center left", bbox_to_anchor=(1.02, 0.5), fontsize=9)
    save(fig, "01_feature_atlas_by_category.png")


def plot_layer_category_heatmap(df: pd.DataFrame) -> None:
    counts = pd.crosstab(df["concept_category"], df["layer_label"]).reindex(
        CATEGORY_ORDER
    )
    counts = counts.reindex(columns=LAYER_ORDER)
    counts = counts.dropna(how="all").fillna(0).astype(int)

    fig, ax = plt.subplots(figsize=(8.4, 7.4))
    image = ax.imshow(counts.values, cmap="YlGnBu", aspect="auto")

    ax.set_title("Concept Types Across Sampled Layers")
    ax.set_xticks(np.arange(counts.shape[1]), counts.columns)
    ax.set_yticks(np.arange(counts.shape[0]), counts.index)
    ax.set_xlabel("GPT-2 residual stream SAE layer")
    ax.set_ylabel("")

    for y in range(counts.shape[0]):
        for x in range(counts.shape[1]):
            value = counts.iat[y, x]
            color = "white" if value > counts.values.max() * 0.55 else "#101828"
            ax.text(x, y, str(value), ha="center", va="center", color=color, fontsize=9)

    cbar = fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("Feature count")
    save(fig, "02_layer_category_heatmap.png")


def plot_activation_density(df: pd.DataFrame) -> None:
    density = df["activation_density"].fillna(0).clip(lower=1e-7)
    log_density = np.log10(density)

    fig, ax = plt.subplots(figsize=(9.6, 5.8))
    ax.hist(log_density, bins=42, color="#4E79A7", alpha=0.86)
    ax.axvline(np.log10(density.median()), color="#E15759", linewidth=2.0)
    ax.text(
        np.log10(density.median()) + 0.05,
        ax.get_ylim()[1] * 0.9,
        f"median = {density.median():.4f}",
        color="#C2410C",
        fontsize=10,
    )
    ax.set_title("Most Sampled Features Activate Sparsely")
    ax.set_xlabel("log10 activation density")
    ax.set_ylabel("Number of features")
    ax.grid(True, axis="y", color="#EAECF0")
    save(fig, "03_activation_density_histogram.png")


def plot_legibility_by_layer(df: pd.DataFrame) -> None:
    counts = pd.crosstab(df["layer_label"], df["legibility_score"]).reindex(
        LAYER_ORDER
    )
    counts = counts.reindex(columns=sorted(counts.columns)).fillna(0)
    shares = counts.div(counts.sum(axis=1), axis=0)

    fig, ax = plt.subplots(figsize=(9.2, 5.6))
    colors = ["#BAB0AC", "#76B7B2", "#59A14F", "#F28E2B", "#E15759"]
    bottom = np.zeros(len(shares))
    x_positions = np.arange(len(shares))

    for i, score in enumerate(shares.columns):
        values = shares[score].values
        ax.bar(
            x_positions,
            values,
            bottom=bottom,
            width=0.58,
            color=colors[i % len(colors)],
            label=f"Score {int(score)}",
        )
        bottom += values

    ax.set_title("Legibility Scores Are Mostly Mid-to-High")
    ax.set_ylabel("Share of features")
    ax.set_xticks(x_positions, shares.index)
    ax.set_ylim(0, 1)
    ax.legend(ncol=len(shares.columns), loc="upper center", bbox_to_anchor=(0.5, -0.12))
    ax.grid(True, axis="y", color="#EAECF0")
    save(fig, "04_legibility_by_layer.png")


def plot_search_highlights(df: pd.DataFrame) -> None:
    search_terms = {
        "names": ["name", "names", "individual", "person", "people"],
        "code/math": ["code", "algorithm", "math", "technical", "technology"],
        "money": ["money", "economic", "financial", "currency"],
        "legal/news": ["legal", "news", "political", "government"],
    }
    colors = {
        "names": "#F28E2B",
        "code/math": "#59A14F",
        "money": "#76B7B2",
        "legal/news": "#B07AA1",
    }

    labels = []
    for _, row in df.iterrows():
        explanation = str(row["explanation"]).lower()
        label = ""
        for name, terms in search_terms.items():
            if any(term in explanation for term in terms):
                label = name
                break
        labels.append(label)
    df = df.copy()
    df["search_match"] = labels

    fig, ax = plt.subplots(figsize=(10.5, 7.2))
    ax.scatter(df["x"], df["y"], s=12, c="#D0D5DD", alpha=0.28, linewidths=0)
    for name in search_terms:
        subset = df[df["search_match"] == name]
        ax.scatter(
            subset["x"],
            subset["y"],
            s=26,
            c=colors[name],
            alpha=0.86,
            linewidths=0,
            label=f"{name} ({len(subset)})",
        )

    ax.set_title("Search Preview: Concept Matches in the Atlas")
    ax.set_xlabel("Explanation embedding PCA 1")
    ax.set_ylabel("Explanation embedding PCA 2")
    ax.grid(True, color="#EAECF0", linewidth=0.8)
    ax.legend(loc="upper right")
    save(fig, "05_search_highlight_atlas.png")


def plot_feature_detail_card(df: pd.DataFrame) -> None:
    candidates = df[
        (df["concept_category"] == "Names / entities")
        & (df["legibility_score"] >= 4)
        & (df["top_positive_logits"].str.len() > 0)
    ]
    row = candidates.iloc[0] if not candidates.empty else df.iloc[0]

    fig, ax = plt.subplots(figsize=(8.6, 5.6))
    ax.axis("off")
    ax.add_patch(
        Rectangle(
            (0.02, 0.02),
            0.96,
            0.96,
            transform=ax.transAxes,
            facecolor="#F9FAFB",
            edgecolor="#D0D5DD",
            linewidth=1.2,
        )
    )

    ax.text(
        0.08,
        0.88,
        "Example Feature Detail Card",
        transform=ax.transAxes,
        fontsize=18,
        fontweight="bold",
        color="#101828",
    )
    ax.text(
        0.08,
        0.81,
        row["feature_id"],
        transform=ax.transAxes,
        fontsize=10,
        color="#667085",
    )

    fields = [
        ("Explanation", row["explanation"]),
        ("Layer", f"{int(row['layer_number'])}"),
        ("Activation density", f"{row['activation_density']:.5f}"),
        ("Legibility score", f"{int(row['legibility_score'])} / 5"),
        ("Top positive logits", row["top_positive_logits"]),
        ("Top negative logits", row["top_negative_logits"]),
    ]

    y = 0.70
    for label, value in fields:
        wrapped = "\n".join(textwrap.wrap(str(value), width=70))
        ax.text(
            0.08,
            y,
            label,
            transform=ax.transAxes,
            fontsize=10,
            fontweight="bold",
            color="#344054",
        )
        ax.text(
            0.30,
            y,
            wrapped,
            transform=ax.transAxes,
            fontsize=10,
            color="#101828",
            va="top",
        )
        y -= 0.12 + 0.035 * wrapped.count("\n")

    save(fig, "06_feature_detail_card.png")


def write_summary(df: pd.DataFrame) -> None:
    summary = [
        "# Proposal Visualization Outputs",
        "",
        f"- Rows: {len(df):,}",
        "- Processed dataset columns: 18",
        f"- Layers: {', '.join(LAYER_ORDER)}",
        f"- Categories: {', '.join(CATEGORY_ORDER)}",
        "",
        "Generated figures:",
        "1. `01_feature_atlas_by_category.png`",
        "2. `02_layer_category_heatmap.png`",
        "3. `03_activation_density_histogram.png`",
        "4. `04_legibility_by_layer.png`",
        "5. `05_search_highlight_atlas.png`",
        "6. `06_feature_detail_card.png`",
    ]
    (OUT_DIR / "README.md").write_text("\n".join(summary) + "\n", encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    set_theme()
    df = load_data()
    plot_atlas(df)
    plot_layer_category_heatmap(df)
    plot_activation_density(df)
    plot_legibility_by_layer(df)
    plot_search_highlights(df)
    plot_feature_detail_card(df)
    write_summary(df)


if __name__ == "__main__":
    main()
