const DATA_URL = "data/processed/features_resjb.json";
const EXAMPLES_URL = "data/processed/feature_examples.json";

const CATEGORY_COLORS = new Map([
  ["Syntax / grammar", "#0b0b0b"],
  ["Other / unclear", "#8f9089"],
  ["Names / entities", "#2f6df6"],
  ["Pop culture", "#ff4a5c"],
  ["Programming / technical", "#12b886"],
  ["Numbers / dates", "#f6b33f"],
  ["Geography", "#8b5cf6"],
  ["Politics / news", "#d03a2f"],
  ["Social media / web", "#00a8c8"],
  ["Animals", "#6a8f1f"],
]);

const state = {
  query: "",
  colorMode: "category",
  layer: "all",
  category: "all",
  minDensity: 0,
  onlyLegible: false,
  selectedId: null,
  activeTour: null,
};

const TOUR_STEPS = {
  url: {
    query: "url",
    layer: "all",
    category: "all",
    colorMode: "category",
    featureId: "gpt2-small/4-res-jb/14801",
    context:
      "URLs are the clean case: the label, top tokens, and activation text all point to web-address structure.",
  },
  python: {
    query: "python",
    layer: "all",
    category: "Programming / technical",
    colorMode: "category",
    featureId: "gpt2-small/7-res-jb/6592",
    context:
      "The Python example shows why details matter: a feature can fire on terminal prompts, database strings, and programming symbols together.",
  },
  cat: {
    query: "cat",
    layer: "all",
    category: "all",
    colorMode: "category",
    featureId: "gpt2-small/7-res-jb/24310",
    context:
      "The cat feature is a useful warning: the label is readable, but one cached activation is actually in a medical word fragment.",
  },
  starwars: {
    query: "star wars",
    layer: "all",
    category: "Pop culture",
    colorMode: "category",
    featureId: "gpt2-small/11-res-jb/14962",
    context:
      "Star Wars is rare in this sample, but it shows that some specific cultural handles still appear in later GPT-2 layers.",
  },
};

const EVIDENCE_NOTES = new Map([
  [
    "gpt2-small/4-res-jb/7023",
    "Good agreement: the label says Twitter handles, and the activation window highlights an @-style user mention.",
  ],
  [
    "gpt2-small/4-res-jb/14801",
    "Strong agreement: the label, logits, and source text all point toward URLs and web-address fragments.",
  ],
  [
    "gpt2-small/7-res-jb/6592",
    "Mixed but useful: the Python label is real, while the same feature also captures shell and database prompt structure.",
  ],
  [
    "gpt2-small/7-res-jb/24310",
    "Cautionary example: the feature is labeled cats, but one activation appears inside the word cataracts.",
  ],
  [
    "gpt2-small/3-res-jb/15682",
    "Good agreement: label and tokens point to New York City, with skyline, mayor, borough, and city-related terms.",
  ],
  [
    "gpt2-small/4-res-jb/19488",
    "Good agreement: dollar signs and fine amounts support the money label.",
  ],
  [
    "gpt2-small/11-res-jb/14962",
    "Interesting late-layer example: a very specific pop-culture label appears, but the top logits are punctuation-heavy.",
  ],
  [
    "gpt2-small/0-res-jb/5437",
    "Good token evidence: USS, HMS, Starfleet, and Admiral support the military-vessel interpretation.",
  ],
  [
    "gpt2-small/7-res-jb/14716",
    "Good named-entity evidence: the activation text directly includes President Donald Trump.",
  ],
  [
    "gpt2-small/0-res-jb/21622",
    "Clean low-level feature: top tokens are neighboring numerals, which fits an early-layer number detector.",
  ],
  [
    "gpt2-small/5-res-jb/6807",
    "Mixed code evidence: predicted tokens include programming settings and the activation window overlaps with a Python prompt.",
  ],
  [
    "gpt2-small/0-res-jb/5566",
    "Clean name feature: the label and activating text both include the name Sean.",
  ],
]);

let features = [];
let examples = [];
let examplesById = new Map();
let categories = [];
let layers = [];
let atlasZoom;
let atlasTransform = d3.zoomIdentity;
let atlasScales = null;

const el = {
  search: document.querySelector("#search-input"),
  colorMode: document.querySelector("#color-mode"),
  layerFilter: document.querySelector("#layer-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  densityFilter: document.querySelector("#density-filter"),
  densityLabel: document.querySelector("#density-label"),
  legibleFilter: document.querySelector("#legible-filter"),
  resetFilters: document.querySelector("#reset-filters"),
  resetZoom: document.querySelector("#reset-zoom"),
  matchSummary: document.querySelector("#match-summary"),
  tooltip: document.querySelector("#tooltip"),
};

Promise.all([d3.json(DATA_URL), d3.json(EXAMPLES_URL)])
  .then(([featureRows, exampleRows]) => {
    features = featureRows.map(normalizeFeature);
    examples = exampleRows;
    examplesById = new Map(examples.map((item) => [item.feature_id, item]));
    categories = Array.from(new Set(features.map((row) => row.concept_category))).sort(
      (a, b) => d3.descending(countCategory(a), countCategory(b))
    );
    layers = Array.from(new Set(features.map((row) => row.layer_number))).sort(
      d3.ascending
    );
    state.selectedId = examples[0]?.feature_id || features[0]?.feature_id || null;

    setupControls();
    renderHeroFlow();
    renderAll();
    setupResize();
  })
  .catch((error) => {
    console.error(error);
    el.matchSummary.textContent = "Could not load the dataset. Run a local server and try again.";
  });

function normalizeFeature(row) {
  const density = Number(row.activation_density) || 0;
  const maxActivation = Number(row.max_activation) || 0;
  const x = Number(row.x) || 0;
  const y = Number(row.y) || 0;
  const layerNumber = Number(row.layer_number);
  const searchText = [
    row.explanation,
    row.top_positive_logits,
    row.top_negative_logits,
    row.concept_category,
    row.feature_id,
  ]
    .join(" ")
    .toLowerCase();

  return {
    ...row,
    activation_density: density,
    max_activation: maxActivation,
    x,
    y,
    layer_number: layerNumber,
    legibility_score: Number(row.legibility_score) || 0,
    searchText,
  };
}

function countCategory(category) {
  return features.filter((row) => row.concept_category === category).length;
}

function setupControls() {
  layers.forEach((layer) => {
    const option = document.createElement("option");
    option.value = String(layer);
    option.textContent = `Layer ${layer}`;
    el.layerFilter.append(option);
  });

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    el.categoryFilter.append(option);
  });

  el.search.addEventListener("input", () => {
    state.query = el.search.value.trim();
    state.activeTour = null;
    renderAll();
  });
  el.colorMode.addEventListener("change", () => {
    state.colorMode = el.colorMode.value;
    state.activeTour = null;
    renderAll();
  });
  el.layerFilter.addEventListener("change", () => {
    state.layer = el.layerFilter.value;
    state.activeTour = null;
    renderAll();
  });
  el.categoryFilter.addEventListener("change", () => {
    state.category = el.categoryFilter.value;
    state.activeTour = null;
    renderAll();
  });
  el.densityFilter.addEventListener("input", () => {
    state.minDensity = Number(el.densityFilter.value);
    state.activeTour = null;
    renderAll();
  });
  el.legibleFilter.addEventListener("change", () => {
    state.onlyLegible = el.legibleFilter.checked;
    state.activeTour = null;
    renderAll();
  });
  el.resetFilters.addEventListener("click", () => {
    state.query = "";
    state.layer = "all";
    state.category = "all";
    state.minDensity = 0;
    state.onlyLegible = false;
    state.activeTour = null;
    el.search.value = "";
    syncControls();
    renderAll();
  });
  el.resetZoom.addEventListener("click", () => {
    const svg = d3.select("#atlas");
    if (atlasZoom) {
      svg.transition().duration(350).call(atlasZoom.transform, d3.zoomIdentity);
    }
  });

  document.querySelectorAll(".preset-search").forEach((button) => {
    button.addEventListener("click", () => {
      state.query = button.dataset.query || "";
      state.activeTour = null;
      el.search.value = state.query;
      document.querySelector("#atlas-section").scrollIntoView({ behavior: "smooth" });
      renderAll();
    });
  });

  document.querySelectorAll(".tour-step").forEach((button) => {
    button.addEventListener("click", () => {
      const tour = TOUR_STEPS[button.dataset.tour];
      if (!tour) return;
      state.activeTour = button.dataset.tour;
      state.query = tour.query;
      state.layer = tour.layer;
      state.category = tour.category;
      state.colorMode = tour.colorMode;
      state.minDensity = 0;
      state.onlyLegible = false;
      state.selectedId = tour.featureId;
      el.search.value = state.query;
      document.querySelector("#atlas-section").scrollIntoView({ behavior: "smooth", block: "start" });
      renderAll();
    });
  });
}

function setupResize() {
  const observer = new ResizeObserver(() => {
    renderAtlas();
    renderHeatmap();
    renderHistogram();
    renderLegibilityBars();
    renderHeroFlow();
  });
  ["#atlas", "#heatmap", "#density-histogram", "#legibility-bars", "#hero-flow"]
    .map((selector) => document.querySelector(selector))
    .filter(Boolean)
    .forEach((node) => observer.observe(node));
}

function syncControls() {
  if (el.search.value !== state.query) {
    el.search.value = state.query;
  }
  el.layerFilter.value = state.layer;
  el.categoryFilter.value = state.category;
  el.colorMode.value = state.colorMode;
  el.densityFilter.value = String(state.minDensity);
  el.legibleFilter.checked = state.onlyLegible;
}

function renderAll() {
  syncControls();
  el.densityLabel.textContent = state.minDensity === 0 ? "0" : formatPercent(state.minDensity);
  renderStats();
  renderTour();
  renderAtlas();
  renderDetail();
  renderSearchResults();
  renderHeatmap();
  renderHistogram();
  renderLegibilityBars();
}

function renderStats() {
  document.querySelector("#stat-rows").textContent = d3.format(",")(features.length);
  document.querySelector("#stat-layers").textContent = layers.length;
  document.querySelector("#stat-categories").textContent = categories.length;
  document.querySelector("#stat-density").textContent = formatPercent(
    d3.median(features, (row) => row.activation_density)
  );
}

function renderTour() {
  document.querySelectorAll(".tour-step").forEach((button) => {
    button.classList.toggle("active", button.dataset.tour === state.activeTour);
  });
  const context = document.querySelector("#tour-context");
  if (!context) return;
  context.textContent = state.activeTour
    ? TOUR_STEPS[state.activeTour].context
    : "Pick a tour card to let the atlas set a search, choose a feature, and show why that example matters.";
}

function baseVisible(row) {
  if (state.layer !== "all" && row.layer_number !== Number(state.layer)) return false;
  if (state.category !== "all" && row.concept_category !== state.category) return false;
  if (row.activation_density < state.minDensity) return false;
  if (state.onlyLegible && row.legibility_score < 4) return false;
  return true;
}

function queryMatches(row) {
  const query = state.query.toLowerCase().trim();
  if (!query) return true;
  const terms = query.split(/\s+/).filter(Boolean);
  return terms.every((term) => {
    if (/^[a-z0-9-]{1,4}$/.test(term)) {
      return new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i").test(
        row.searchText
      );
    }
    return row.searchText.includes(term);
  });
}

function activeRows() {
  return features.filter((row) => baseVisible(row) && queryMatches(row));
}

function renderAtlas() {
  if (!features.length) return;

  const svg = d3.select("#atlas");
  const bounds = svg.node().getBoundingClientRect();
  const width = Math.max(640, bounds.width || 900);
  const height = Math.max(500, bounds.height || 660);
  const margin = 32;
  svg.attr("viewBox", [0, 0, width, height]);

  let plot = svg.select(".atlas-plot");
  if (plot.empty()) {
    plot = svg.append("g").attr("class", "atlas-plot");
    plot.append("g").attr("class", "grid-layer");
    plot.append("g").attr("class", "point-layer");
    plot.append("g").attr("class", "annotation-layer");

    atlasZoom = d3
      .zoom()
      .scaleExtent([0.8, 12])
      .on("zoom", (event) => {
        atlasTransform = event.transform;
        plot.attr("transform", atlasTransform);
      });
    svg.call(atlasZoom);
  }

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(features, (row) => row.x))
    .nice()
    .range([margin, width - margin]);
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(features, (row) => row.y))
    .nice()
    .range([height - margin, margin]);
  const radiusScale = d3
    .scaleSqrt()
    .domain(d3.extent(features, (row) => row.activation_density))
    .range([2.2, 8.2]);
  atlasScales = { xScale, yScale, radiusScale };

  renderAtlasGrid(plot.select(".grid-layer"), xScale, yScale, width, height, margin);

  const hasQuery = Boolean(state.query.trim());
  const points = plot
    .select(".point-layer")
    .selectAll("circle")
    .data(features, (row) => row.feature_id)
    .join("circle")
    .attr("class", "atlas-point")
    .attr("cx", (row) => xScale(row.x))
    .attr("cy", (row) => yScale(row.y))
    .attr("r", (row) => radiusScale(row.activation_density))
    .attr("fill", (row) => colorFor(row))
    .attr("stroke", (row) => {
      if (row.feature_id === state.selectedId) return "#ff4a5c";
      if (examplesById.has(row.feature_id)) return "#0b0b0b";
      return "rgba(255,255,255,0.75)";
    })
    .attr("stroke-width", (row) => (row.feature_id === state.selectedId ? 2.4 : 0.8))
    .style("display", (row) => (baseVisible(row) ? null : "none"))
    .style("opacity", (row) => {
      if (!baseVisible(row)) return 0;
      if (!hasQuery) return examplesById.has(row.feature_id) ? 0.96 : 0.62;
      return queryMatches(row) ? 0.96 : 0.055;
    })
    .on("pointerenter", function (event, row) {
      d3.select(this).attr("stroke", "#ff4a5c").attr("stroke-width", 2.4);
      showTooltip(event, row);
    })
    .on("pointermove", moveTooltip)
    .on("pointerleave", function (_event, row) {
      d3.select(this)
        .attr("stroke", row.feature_id === state.selectedId ? "#ff4a5c" : examplesById.has(row.feature_id) ? "#0b0b0b" : "rgba(255,255,255,0.75)")
        .attr("stroke-width", row.feature_id === state.selectedId ? 2.4 : 0.8);
      hideTooltip();
    })
    .on("click", (_event, row) => selectFeature(row.feature_id));

  points.raise();
  renderAtlasAnnotations(plot.select(".annotation-layer"), xScale, yScale, width);
  plot.attr("transform", atlasTransform);

  const visibleCount = features.filter(baseVisible).length;
  const matchCount = activeRows().length;
  el.matchSummary.textContent = hasQuery
    ? `${d3.format(",")(matchCount)} matching features inside ${d3.format(",")(visibleCount)} visible rows`
    : `${d3.format(",")(visibleCount)} visible features; search to highlight matching concepts`;
  renderLegend();
}

function renderAtlasGrid(grid, xScale, yScale, width, height, margin) {
  const xTicks = xScale.ticks(8);
  const yTicks = yScale.ticks(6);
  grid
    .selectAll(".x-grid")
    .data(xTicks)
    .join("line")
    .attr("class", "x-grid")
    .attr("x1", (tick) => xScale(tick))
    .attr("x2", (tick) => xScale(tick))
    .attr("y1", margin)
    .attr("y2", height - margin)
    .attr("stroke", "#e2e2dc")
    .attr("stroke-width", 1);
  grid
    .selectAll(".y-grid")
    .data(yTicks)
    .join("line")
    .attr("class", "y-grid")
    .attr("x1", margin)
    .attr("x2", width - margin)
    .attr("y1", (tick) => yScale(tick))
    .attr("y2", (tick) => yScale(tick))
    .attr("stroke", "#e2e2dc")
    .attr("stroke-width", 1);
}

function renderAtlasAnnotations(layer, xScale, yScale, width) {
  const labels = [
    ["gpt2-small/4-res-jb/14801", "URLs act like a tiny web detector"],
    ["gpt2-small/7-res-jb/6592", "Code features can be language-specific"],
    ["gpt2-small/11-res-jb/14962", "Pop-culture labels survive late"],
    ["gpt2-small/7-res-jb/24310", "A label can be messier than it looks"],
  ]
    .map(([id, label]) => ({ row: features.find((item) => item.feature_id === id), label }))
    .filter((item) => item.row && baseVisible(item.row));

  const groups = layer
    .selectAll("g")
    .data(labels, (item) => item.row.feature_id)
    .join((enter) => {
      const g = enter.append("g").attr("class", "annotation-label");
      g.append("line");
      g.append("text");
      return g;
    });

  groups.each(function (item, index) {
    const g = d3.select(this);
    const x = xScale(item.row.x);
    const y = yScale(item.row.y);
    const dx = index % 2 === 0 ? 24 : -180;
    const dy = index < 2 ? -22 : 34;
    const approximateWidth = item.label.length * 7.5;
    const anchor = x + dx < x ? "end" : "start";
    const labelX =
      anchor === "end"
        ? Math.max(46 + approximateWidth, Math.min(width - 46, x + dx))
        : Math.max(46, Math.min(width - 46 - approximateWidth, x + dx));
    const labelY = y + dy;
    g.select("line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", labelX)
      .attr("y2", labelY);
    g.select("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("text-anchor", anchor)
      .text(item.label);
  });
}

function renderLegend() {
  const legend = document.querySelector("#atlas-legend");
  legend.replaceChildren();

  let items;
  if (state.colorMode === "category") {
    items = categories.slice(0, 10).map((category) => [category, CATEGORY_COLORS.get(category)]);
  } else if (state.colorMode === "layer") {
    items = layers.map((layer) => [`L${layer}`, d3.interpolateRgb("#d9d9d2", "#0b0b0b")(layer / 11)]);
  } else {
    items = [
      ["Score 3", "#a7a8a0"],
      ["Score 4", "#0b0b0b"],
      ["Cached API example", "#ff4a5c"],
    ];
  }

  items.forEach(([label, color]) => {
    const item = document.createElement("span");
    item.className = "legend-item";
    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.background = color;
    item.append(swatch, document.createTextNode(label));
    legend.append(item);
  });
}

function colorFor(row) {
  if (examplesById.has(row.feature_id) && state.colorMode === "legibility") return "#ff4a5c";
  if (state.colorMode === "category") {
    return CATEGORY_COLORS.get(row.concept_category) || "#8f9089";
  }
  if (state.colorMode === "layer") {
    return d3.interpolateRgb("#d9d9d2", "#0b0b0b")(row.layer_number / 11);
  }
  return row.legibility_score >= 4 ? "#0b0b0b" : "#a7a8a0";
}

function selectFeature(featureId) {
  state.selectedId = featureId;
  if (state.activeTour && TOUR_STEPS[state.activeTour].featureId !== featureId) {
    state.activeTour = null;
  }
  renderAtlas();
  renderDetail();
  renderTour();
}

function renderDetail() {
  const row = features.find((item) => item.feature_id === state.selectedId) || activeRows()[0];
  if (!row) return;
  state.selectedId = row.feature_id;
  const example = examplesById.get(row.feature_id);

  document.querySelector("#detail-title").textContent = row.explanation || row.feature_id;
  document.querySelector("#detail-subtitle").textContent = row.feature_id;
  document.querySelector("#detail-layer").textContent = `L${row.layer_number}`;
  document.querySelector("#detail-density").textContent = formatPercent(row.activation_density);
  document.querySelector("#detail-legibility").textContent = `${row.legibility_score}/5`;
  document.querySelector("#detail-category").textContent = row.concept_category;
  document.querySelector("#evidence-note").textContent =
    EVIDENCE_NOTES.get(row.feature_id) ||
    "No cached API activation note for this feature yet. Use the label and logits as clues, not proof.";
  const sourceLink = document.querySelector("#source-link");
  sourceLink.href = row.neuronpedia_url || "https://www.neuronpedia.org/";

  renderTokenPills(
    document.querySelector("#positive-logits"),
    example?.top_positive_logits?.length ? example.top_positive_logits : splitTokens(row.top_positive_logits)
  );
  renderTokenPills(
    document.querySelector("#negative-logits"),
    example?.top_negative_logits?.length ? example.top_negative_logits : splitTokens(row.top_negative_logits)
  );
  renderActivationWindows(example);
}

function renderTokenPills(container, tokens) {
  container.replaceChildren();
  tokens.slice(0, 10).forEach((token) => {
    const pill = document.createElement("span");
    pill.className = "token-pill";
    pill.textContent = cleanToken(token);
    container.append(pill);
  });
}

function renderActivationWindows(example) {
  const container = document.querySelector("#activation-windows");
  const note = document.querySelector("#activation-note");
  container.replaceChildren();
  if (!example || !example.activation_windows?.length) {
    note.textContent = "This point is in the atlas dataset, but no API activation snippet is cached for it.";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Try one of the annotated points or search-result examples.";
    container.append(empty);
    return;
  }

  note.textContent = "Darker tokens are where this feature activated most strongly in Neuronpedia examples.";
  example.activation_windows.forEach((window, index) => {
    const block = document.createElement("div");
    block.className = "activation-window";
    const title = document.createElement("strong");
    title.textContent = `Example ${index + 1} - peak ${formatNumber(window.max_value)}`;
    const strip = document.createElement("div");
    strip.className = "token-strip";
    window.tokens.forEach((token) => {
      const span = document.createElement("span");
      span.className = token.is_peak ? "hot-token peak" : "hot-token";
      span.style.setProperty("--heat", String(Math.max(0, Math.min(1, token.relative_value || 0))));
      span.textContent = cleanToken(token.text);
      strip.append(span);
    });
    block.append(title, strip);
    container.append(block);
  });
}

function renderSearchResults() {
  const container = document.querySelector("#search-results");
  container.replaceChildren();
  let rows;
  if (state.query.trim()) {
    rows = activeRows();
  } else {
    rows = examples
      .map((example) => features.find((row) => row.feature_id === example.feature_id))
      .filter(Boolean);
  }

  rows
    .slice()
    .sort((a, b) => {
      const exampleScore = Number(examplesById.has(b.feature_id)) - Number(examplesById.has(a.feature_id));
      if (exampleScore) return exampleScore;
      return d3.descending(a.activation_density, b.activation_density);
    })
    .slice(0, 7)
    .forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "result-item";
      const title = document.createElement("b");
      title.textContent = row.explanation || row.feature_id;
      const meta = document.createElement("span");
      meta.textContent = `L${row.layer_number} | ${row.concept_category} | ${formatPercent(row.activation_density)}`;
      button.append(title, meta);
      button.addEventListener("click", () => selectFeature(row.feature_id));
      container.append(button);
    });

  if (!container.children.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matching features under the current filters.";
    container.append(empty);
  }
}

function renderHeatmap() {
  if (!features.length) return;
  const svg = d3.select("#heatmap");
  const bounds = svg.node().getBoundingClientRect();
  const width = Math.max(620, bounds.width || 760);
  const height = Math.max(420, bounds.height || 460);
  const margin = { top: 34, right: 18, bottom: 50, left: 154 };
  svg.attr("viewBox", [0, 0, width, height]);

  const x = d3.scaleBand().domain(layers).range([margin.left, width - margin.right]).padding(0.04);
  const y = d3.scaleBand().domain(categories).range([margin.top, height - margin.bottom]).padding(0.04);
  const layerTotals = new Map(layers.map((layer) => [layer, features.filter((row) => row.layer_number === layer).length]));
  const data = [];
  categories.forEach((category) => {
    layers.forEach((layer) => {
      const count = features.filter((row) => row.layer_number === layer && row.concept_category === category).length;
      data.push({ category, layer, count, pct: count / layerTotals.get(layer) });
    });
  });
  const maxPct = d3.max(data, (row) => row.pct) || 1;
  const fill = d3.scaleSequential((t) => d3.interpolateRgb("#f4f4ee", "#0b0b0b")(t)).domain([0, maxPct]);

  svg.selectAll("*").remove();
  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("class", "heat-cell")
    .attr("x", (row) => x(row.layer))
    .attr("y", (row) => y(row.category))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (row) => fill(row.pct))
    .attr("stroke", (row) =>
      String(row.layer) === state.layer && row.category === state.category ? "#ff4a5c" : "#fbfbf7"
    )
    .attr("stroke-width", (row) =>
      String(row.layer) === state.layer && row.category === state.category ? 3 : 2
    )
    .on("pointerenter", (event, row) => {
      el.tooltip.innerHTML = `<b>${escapeHtml(row.category)} in layer ${row.layer}</b>${row.count} features (${formatPercent(row.pct)})`;
      moveTooltip(event);
      el.tooltip.style.opacity = 1;
    })
    .on("pointermove", moveTooltip)
    .on("pointerleave", hideTooltip)
    .on("click", (_event, row) => {
      state.layer = String(row.layer);
      state.category = row.category;
      state.query = "";
      state.activeTour = null;
      renderAll();
      document.querySelector("#atlas-section").scrollIntoView({ behavior: "smooth", block: "start" });
    });

  svg
    .append("g")
    .selectAll("text")
    .data(data.filter((row) => row.pct > 0.08))
    .join("text")
    .attr("x", (row) => x(row.layer) + x.bandwidth() / 2)
    .attr("y", (row) => y(row.category) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "middle")
    .attr("fill", (row) => (row.pct > maxPct * 0.55 ? "#fff" : "#111"))
    .attr("font-size", 10)
    .attr("font-weight", 800)
    .style("pointer-events", "none")
    .text((row) => d3.format(".0%")(row.pct));

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat((layer) => `L${layer}`).tickSizeOuter(0));
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0));
}

function renderHistogram() {
  if (!features.length) return;
  const svg = d3.select("#density-histogram");
  const bounds = svg.node().getBoundingClientRect();
  const width = Math.max(560, bounds.width || 680);
  const height = Math.max(420, bounds.height || 460);
  const margin = { top: 24, right: 22, bottom: 58, left: 54 };
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const values = features.map((row) => Math.log10(row.activation_density + 1e-7));
  const x = d3.scaleLinear().domain(d3.extent(values)).nice().range([margin.left, width - margin.right]);
  const bins = d3.bin().domain(x.domain()).thresholds(26)(values);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (bin) => bin.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const activeCut = Math.log10(state.minDensity + 1e-7);

  svg
    .append("g")
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (bin) => x(bin.x0) + 1)
    .attr("y", (bin) => y(bin.length))
    .attr("width", (bin) => Math.max(0, x(bin.x1) - x(bin.x0) - 2))
    .attr("height", (bin) => y(0) - y(bin.length))
    .attr("fill", (bin) => (bin.x1 >= activeCut ? "#0b0b0b" : "#c6c7bf"))
    .attr("cursor", "pointer")
    .on("click", (_event, bin) => {
      const density = Math.max(0, Math.pow(10, bin.x0) - 1e-7);
      state.minDensity = Math.min(0.005, density);
      state.activeTour = null;
      renderAll();
    });

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(6)
        .tickFormat((value) => formatPercent(Math.pow(10, value) - 1e-7))
    );
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#5b5c58")
    .attr("font-size", 12)
    .text("activation density, log-scaled");
}

function renderLegibilityBars() {
  if (!features.length) return;
  const svg = d3.select("#legibility-bars");
  const bounds = svg.node().getBoundingClientRect();
  const width = Math.max(720, bounds.width || 960);
  const height = Math.max(300, bounds.height || 320);
  const margin = { top: 24, right: 22, bottom: 46, left: 52 };
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const data = layers.map((layer) => ({
    layer,
    avg: d3.mean(
      features.filter((row) => row.layer_number === layer),
      (row) => row.legibility_score
    ),
    high: features.filter((row) => row.layer_number === layer && row.legibility_score >= 4).length,
  }));
  const x = d3.scaleBand().domain(layers).range([margin.left, width - margin.right]).padding(0.22);
  const y = d3.scaleLinear().domain([0, 5]).range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (row) => x(row.layer))
    .attr("y", (row) => y(row.avg))
    .attr("width", x.bandwidth())
    .attr("height", (row) => y(0) - y(row.avg))
    .attr("fill", (row) => (String(row.layer) === state.layer ? "#ff4a5c" : "#0b0b0b"))
    .attr("cursor", "pointer")
    .on("click", (_event, row) => {
      state.layer = String(row.layer);
      state.query = "";
      state.activeTour = null;
      renderAll();
      document.querySelector("#atlas-section").scrollIntoView({ behavior: "smooth", block: "start" });
    });

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat((layer) => `L${layer}`).tickSizeOuter(0));
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  svg
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", y(4))
    .attr("y2", y(4))
    .attr("stroke", "#00a8c8")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5 5");
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", y(4) - 7)
    .attr("text-anchor", "end")
    .attr("fill", "#00a8c8")
    .attr("font-size", 12)
    .attr("font-weight", 800)
    .text("score 4 threshold");
}

function renderHeroFlow() {
  const svg = d3.select("#hero-flow");
  if (!svg.node()) return;
  const bounds = svg.node().getBoundingClientRect();
  const width = Math.max(520, bounds.width || 760);
  const height = Math.max(320, bounds.height || 520);
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const leftX = 90;
  const boxX = width * 0.42;
  const rightX = width - 120;
  const midY = height * 0.5;
  const tokens = ["The", "URL", "mentions", "Python", "in", "NYC"];
  const featureLabels = ["URLs", "Code", "Cities", "Names", "Numbers", "Syntax"];
  const nodeData = d3.range(52).map((index) => ({
    x: rightX + Math.cos(index * 0.74) * (58 + (index % 4) * 18),
    y: midY + Math.sin(index * 1.12) * (48 + (index % 5) * 15),
    r: 2.5 + (index % 5),
    color: [CATEGORY_COLORS.get("Social media / web"), CATEGORY_COLORS.get("Programming / technical"), CATEGORY_COLORS.get("Geography"), "#ffffff"][index % 4],
  }));

  svg
    .append("rect")
    .attr("x", boxX - 92)
    .attr("y", midY - 92)
    .attr("width", 184)
    .attr("height", 184)
    .attr("rx", 8)
    .attr("fill", "none")
    .attr("stroke", "#f6f6f1")
    .attr("stroke-width", 2);
  svg
    .append("text")
    .attr("x", boxX)
    .attr("y", midY - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#f6f6f1")
    .attr("font-size", 18)
    .attr("font-weight", 900)
    .text("GPT-2");
  svg
    .append("text")
    .attr("x", boxX)
    .attr("y", midY + 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#9a9a92")
    .attr("font-size", 12)
    .text("residual stream");

  const tokenG = svg.append("g");
  tokenG
    .selectAll("rect")
    .data(tokens)
    .join("rect")
    .attr("x", leftX - 36)
    .attr("y", (_token, index) => midY - 105 + index * 34)
    .attr("width", 96)
    .attr("height", 24)
    .attr("rx", 4)
    .attr("fill", "#f6f6f1");
  tokenG
    .selectAll("text")
    .data(tokens)
    .join("text")
    .attr("x", leftX + 12)
    .attr("y", (_token, index) => midY - 88 + index * 34)
    .attr("text-anchor", "middle")
    .attr("fill", "#0b0b0b")
    .attr("font-size", 12)
    .attr("font-weight", 800)
    .text((token) => token);

  svg
    .append("path")
    .attr("d", `M${leftX + 72},${midY} C${boxX - 180},${midY - 95} ${boxX - 170},${midY + 96} ${boxX - 104},${midY}`)
    .attr("fill", "none")
    .attr("stroke", "#f6f6f1")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 8");
  svg
    .append("path")
    .attr("d", `M${boxX + 104},${midY} C${rightX - 145},${midY - 120} ${rightX - 120},${midY + 130} ${rightX - 70},${midY}`)
    .attr("fill", "none")
    .attr("stroke", "#f6f6f1")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 8");

  svg
    .append("g")
    .selectAll("circle")
    .data(nodeData)
    .join("circle")
    .attr("cx", (node) => node.x)
    .attr("cy", (node) => node.y)
    .attr("r", (node) => node.r)
    .attr("fill", (node) => node.color)
    .attr("opacity", 0.8);

  svg
    .append("g")
    .selectAll("text")
    .data(featureLabels)
    .join("text")
    .attr("x", rightX - 54)
    .attr("y", (_label, index) => midY - 95 + index * 38)
    .attr("fill", "#f6f6f1")
    .attr("font-size", 13)
    .attr("font-weight", 800)
    .text((label) => label);

  const pulse = svg
    .append("circle")
    .attr("cx", leftX + 72)
    .attr("cy", midY)
    .attr("r", 6)
    .attr("fill", "#00d0ff");

  function animatePulse() {
    pulse
      .attr("cx", leftX + 72)
      .attr("cy", midY)
      .attr("opacity", 1)
      .transition()
      .duration(1300)
      .attr("cx", boxX)
      .attr("cy", midY)
      .transition()
      .duration(1300)
      .attr("cx", rightX - 70)
      .attr("cy", midY)
      .attr("opacity", 0.2)
      .on("end", animatePulse);
  }
  animatePulse();
}

function showTooltip(event, row) {
  el.tooltip.innerHTML = `
    <b>${escapeHtml(row.explanation || row.feature_id)}</b>
    L${row.layer_number} | ${escapeHtml(row.concept_category)}<br>
    density ${formatPercent(row.activation_density)}
  `;
  moveTooltip(event);
  el.tooltip.style.opacity = 1;
}

function moveTooltip(event) {
  const pad = 18;
  const width = 330;
  const x = Math.min(event.clientX + pad, window.innerWidth - width);
  const y = Math.min(event.clientY + pad, window.innerHeight - 120);
  el.tooltip.style.left = `${Math.max(10, x)}px`;
  el.tooltip.style.top = `${Math.max(10, y)}px`;
}

function hideTooltip() {
  el.tooltip.style.opacity = 0;
}

function splitTokens(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanToken(token) {
  return String(token)
    .replace(/\u010a/g, "\n")
    .replace(/\u0120/g, " ")
    .replace(/<\|endoftext\|>/g, " <EOS> ");
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0%";
  const pct = value * 100;
  if (pct < 0.001) return `${pct.toExponential(1)}%`;
  if (pct < 0.1) return `${d3.format(".3f")(pct)}%`;
  return `${d3.format(".2f")(pct)}%`;
}

function formatNumber(value) {
  return Number.isFinite(Number(value)) ? d3.format(".2f")(Number(value)) : "-";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
