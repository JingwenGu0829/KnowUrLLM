const fs = require("fs");

const SOURCE = "data/processed/features_resjb.json";
const OUTPUT = "data/processed/features_site.json";
const KEEP_FIELDS = [
  "feature_id",
  "layer_number",
  "activation_density",
  "concept_category",
  "x",
  "y",
  "agreement_score",
];

const STOP_WORDS = new Set([
  "a",
  "about",
  "and",
  "an",
  "are",
  "as",
  "character",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "lack",
  "model",
  "name",
  "names",
  "occurrence",
  "of",
  "or",
  "particularly",
  "phrases",
  "public",
  "reference",
  "references",
  "related",
  "signal",
  "signals",
  "specific",
  "such",
  "symbols",
  "terms",
  "text",
  "that",
  "the",
  "these",
  "this",
  "those",
  "to",
  "unclear",
  "when",
  "where",
  "with",
  "without",
  "words",
]);

function keywordRoots(value) {
  const words = String(value || "").toLowerCase().match(/[a-z][a-z0-9]+/g) || [];
  return Array.from(new Set(words))
    .map((word) =>
      word
        .replace(/^(http|https)$/u, "url")
        .replace(/urls?$/u, "url")
        .replace(/ies$/u, "y")
        .replace(/s$/u, "")
    )
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function agreementScore(row) {
  const nameWords = keywordRoots(row.explanation);
  const pieceWords = keywordRoots(row.top_positive_logits);
  if (!nameWords.length || !pieceWords.length) return 0;
  const pieceSet = new Set(pieceWords);
  const exactMatches = nameWords.filter((word) => pieceSet.has(word)).length;
  const fuzzyMatches = nameWords.filter((word) =>
    pieceWords.some((piece) => piece.includes(word) || word.includes(piece))
  ).length;
  return Math.min(1, Math.max(exactMatches, fuzzyMatches * 0.75) / Math.min(nameWords.length, 5));
}

const rows = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const compactRows = rows.map((row) => {
  const compactRow = Object.fromEntries(KEEP_FIELDS.map((field) => [field, row[field]]));
  compactRow.agreement_score = agreementScore(row);
  return compactRow;
});

fs.writeFileSync(OUTPUT, `${JSON.stringify(compactRows)}\n`);
console.log(`Wrote ${compactRows.length.toLocaleString()} rows to ${OUTPUT}`);
