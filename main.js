const DATA_URL = "data/processed/features_site.json";
const EXAMPLES_URL = "data/processed/feature_examples.json";

const FEATURE_ORDER = [
  "gpt2-small/4-res-jb/14801",
  "gpt2-small/7-res-jb/6592",
  "gpt2-small/7-res-jb/24310",
  "gpt2-small/11-res-jb/14962",
];

const STORY = {
  "gpt2-small/4-res-jb/14801": {
    step: "Example 1 of 4",
    title: "URL example",
    short: "URL example",
    publicName: "web URLs",
    verdict: "Trust this label: the sentence is a web address, and the highlighted text looks like URL text.",
    scores: [3, 3, 3],
    scoreLabels: ["Label matches", "Highlight matches", "Sentence matches"],
    notes: [
      "Feature label says: web URLs.",
      "Highlighted text: URL, URI, url.",
      "Full sentence includes http://.",
    ],
    sourceCheck: "In the full sentence, URL text appears inside a real web address.",
    insight: "The label, highlight, and sentence all point to a web address. Trust it.",
    color: "#00bcd4",
  },
  "gpt2-small/7-res-jb/6592": {
    step: "Example 2 of 4",
    title: "Python example",
    short: "Python example",
    publicName: "Python and database text",
    verdict: "Partly trust this label: it sees Python, but nearby command-line words matter too.",
    scores: [2, 2, 3],
    scoreLabels: ["Label partial", "Highlight partial", "Sentence matches"],
    notes: [
      "Feature label mentions Python.",
      "Highlighted text also includes username and command-line words.",
      "Full sentence shows a Python command.",
    ],
    sourceCheck: "In the full sentence, a Python command appears with shell words nearby.",
    insight: "The sentence is Python, but the highlight also shows command-line context. Treat the label as incomplete.",
    color: "#12a878",
  },
  "gpt2-small/7-res-jb/24310": {
    step: "Example 3 of 4",
    title: "Cat example",
    short: "Cat / cataracts",
    publicName: "cats",
    verdict: "Do not trust this label yet: the feature lights up for cat inside cataracts.",
    scores: [2, 1, 1],
    scoreLabels: ["Label sounds right", "Highlight is a trap", "Sentence says no"],
    notes: [
      "Feature label says: cats.",
      "Highlighted text is only the letters cat.",
      "Full sentence is about cataracts, not pets.",
    ],
    sourceCheck: "In the full sentence, cat appears inside cataracts, an eye-surgery word.",
    insight: "The red highlight is inside cataracts, not a pet word. The cats label is not enough.",
    color: "#ff4057",
  },
  "gpt2-small/11-res-jb/14962": {
    step: "Example 4 of 4",
    title: "Star Wars example",
    short: "Star Wars",
    publicName: "Star Wars names",
    verdict: "This label needs backup: the sentence fits, but the highlighted text is weak.",
    scores: [2, 1, 3],
    scoreLabels: ["Label sounds right", "Weak highlight", "Sentence matches"],
    notes: [
      "Feature label mentions Star Wars.",
      "Highlighted text is mostly punctuation.",
      "Full sentence names Revenge of the Sith and Aayla Secura.",
    ],
    sourceCheck: "In the full sentence, Star Wars names appear. The highlight is mostly punctuation.",
    insight: "The sentence fits Star Wars, but the highlighted text is punctuation. Ask for more backup.",
    color: "#7a5cff",
  },
};

// Clean, minimal per-example comparison shown in the redesigned stage.
// state: good (matches) | mixed (partial) | bad (mismatch)
const CASE = {
  "gpt2-small/4-res-jb/14801": {
    verdict: "Easy to trust",
    badge: "Trust it",
    badgeState: "good",
    label: "web URLs",
    word: { tag: "URL, http", state: "good" },
    sentence: { tag: "a real web address", state: "good" },
  },
  "gpt2-small/7-res-jb/6592": {
    verdict: "Useful, but incomplete",
    badge: "Check the context",
    badgeState: "mixed",
    label: "Python",
    word: { tag: "shell + Python words", state: "mixed" },
    sentence: { tag: "a Python command", state: "good" },
  },
  "gpt2-small/7-res-jb/24310": {
    verdict: "Do not trust yet",
    badge: "Misleading",
    badgeState: "bad",
    label: "cats",
    word: { tag: "“cat” inside cataracts", state: "bad" },
    sentence: { tag: "eye surgery, not pets", state: "bad" },
  },
  "gpt2-small/11-res-jb/14962": {
    verdict: "Needs backup",
    badge: "Too weak",
    badgeState: "bad",
    label: "Star Wars",
    word: { tag: "mostly punctuation", state: "bad" },
    sentence: { tag: "Star Wars names", state: "good" },
  },
};

// Little cartoon robots shown on each verdict, to fill the space and add charm.
const MASCOTS = {
  // Trust it — happy robot with a green check
  "gpt2-small/4-res-jb/14801": `<svg viewBox="0 0 120 96" role="img" aria-label="A happy robot">
    <line x1="60" y1="20" x2="60" y2="9" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="60" cy="6" r="3.5" fill="#12a878"/>
    <rect x="34" y="20" width="52" height="40" rx="11" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <path d="M45 38 q4 -5 8 0" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M67 38 q4 -5 8 0" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M48 47 q12 9 24 0" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect x="40" y="60" width="40" height="26" rx="8" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <circle cx="60" cy="73" r="7" fill="#12a878"/>
    <path d="M56.5 73 l2.5 2.5 4.5 -4.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  // Check the context — robot with a magnifying glass
  "gpt2-small/7-res-jb/6592": `<svg viewBox="0 0 120 96" role="img" aria-label="A robot inspecting with a magnifying glass">
    <line x1="50" y1="20" x2="50" y2="9" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="50" cy="6" r="3.5" fill="#f2ae33"/>
    <rect x="24" y="20" width="52" height="40" rx="11" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <circle cx="40" cy="38" r="3.2" fill="#111"/>
    <circle cx="60" cy="38" r="3.2" fill="#111"/>
    <path d="M42 50 q8 4 16 0" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect x="30" y="60" width="40" height="26" rx="8" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <circle cx="92" cy="46" r="12" fill="rgba(242,174,51,0.25)" stroke="#111" stroke-width="2.5"/>
    <line x1="101" y1="55" x2="110" y2="64" stroke="#111" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  // Misleading — puzzled robot with a question mark
  "gpt2-small/7-res-jb/24310": `<svg viewBox="0 0 120 96" role="img" aria-label="A confused robot with a question mark">
    <text x="84" y="26" font-family="Inter, sans-serif" font-size="24" font-weight="900" fill="#ff4057">?</text>
    <line x1="50" y1="22" x2="50" y2="11" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="50" cy="8" r="3.5" fill="#ff4057"/>
    <rect x="24" y="22" width="52" height="40" rx="11" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <circle cx="40" cy="40" r="3.5" fill="#111"/>
    <circle cx="62" cy="40" r="6" fill="#ff4057" stroke="#111" stroke-width="1.5"/>
    <path d="M40 52 q5 -4 9 0 q5 4 9 0" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect x="30" y="62" width="40" height="24" rx="8" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
  </svg>`,
  // Too weak — robot asleep on the ground with Zzz
  "gpt2-small/11-res-jb/14962": `<svg viewBox="0 0 120 96" role="img" aria-label="A robot sleeping on the ground">
    <line x1="12" y1="80" x2="108" y2="80" stroke="#111" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
    <rect x="32" y="58" width="46" height="22" rx="10" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <rect x="13" y="54" width="30" height="26" rx="10" fill="#f4f3ee" stroke="#111" stroke-width="2.5"/>
    <path d="M20 66 q3 3 6 0" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M30 66 q3 3 6 0" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="74" y="44" font-family="Inter, sans-serif" font-size="13" font-weight="900" fill="#7a5cff">z</text>
    <text x="83" y="33" font-family="Inter, sans-serif" font-size="17" font-weight="900" fill="#7a5cff">Z</text>
    <text x="94" y="22" font-family="Inter, sans-serif" font-size="21" font-weight="900" fill="#7a5cff">Z</text>
  </svg>`,
};

const TOKEN_EVIDENCE_PRIORITY = {
  misleading: 0,
  supports: 0,
  context: 1,
  neutral: 2,
};

const CATEGORY_COLORS = new Map([
  ["Syntax / grammar", "#111111"],
  ["Other / unclear", "#8e8f88"],
  ["Names / entities", "#2f6df6"],
  ["Pop culture", "#ff4057"],
  ["Programming / technical", "#12a878"],
  ["Numbers / dates", "#f2ae33"],
  ["Geography", "#7a5cff"],
  ["Politics / news", "#c83a2e"],
  ["Social media / web", "#00a3bd"],
  ["Animals", "#6a8f1f"],
]);

const ATLAS_CALLOUTS = [
  {
    category: "Syntax / grammar",
    label: "grammar + punctuation",
    summary: "42% of labels",
    side: "left",
  },
  {
    category: "Names / entities",
    label: "names + places",
    summary: "13% of labels",
    side: "right",
  },
  {
    category: "Programming / technical",
    label: "code + data text",
    summary: "4% of labels",
    side: "top",
  },
  {
    category: "Animals",
    label: "animal labels are rare",
    summary: "14 of 6,000",
    side: "bottom",
  },
];

const PATTERN_DEFAULT_FOCUS = "Labels cluster by topic, most features fire rarely, and matching letters alone are not enough.";
const PATTERN_SCROLL_FOCUS = [
  {
    selector: ".evidence-matrix-panel",
    text: "Trust matrix: read one row at a time. Red means the label and sentence are not pointing to the same idea.",
  },
  {
    selector: ".method-strip",
    text: "Method notes: the dot map, topic shares, rarity, and word match are quick checks. None of them alone proves meaning.",
  },
  {
    selector: ".pattern-grid",
    text: "Topic and rarity charts: most labels are grammar or punctuation, and many features fire in very little text.",
  },
  {
    selector: ".agreement-panel",
    text: "Word-match check: matching letters can still be a trap. The cat example matches c-a-t inside cataracts.",
  },
];

let features = [];
let examplesById = new Map();
let activeId = FEATURE_ORDER[0];
let atlasContext = null;
let atlasBase = null;
let atlasFrame = 0;
let atlasAnimation = null;
let atlasVisible = false;
let atlasHoverRow = null;
let atlasPointerFrame = 0;
let atlasKeyboardIndex = 0;
let scrollProgressFrame = 0;
let lastRenderedFeatureId = null;
let patternScrollFrame = 0;
let patternScrollFocusText = PATTERN_DEFAULT_FOCUS;
let patternInteractionActive = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const ATLAS_DEFAULT_CAPTION = "Each dot is one saved moment. The colored path connects the four examples. Nearby dots give context, not proof.";

Promise.all([d3.json(DATA_URL), d3.json(EXAMPLES_URL)])
  .then(([featureRows, exampleRows]) => {
    features = featureRows.map(normalizeFeature);
    examplesById = new Map(exampleRows.map((row) => [row.feature_id, row]));
    setDataStatus("ready", `Loaded ${features.length.toLocaleString()} local GPT-2 saved moments.`);
    setupScrolly();
    renderFeature(activeId);
    renderAtlas();
    renderHeatmap();
    setupAtlasInteraction();
    setupSeaMap();
    setupRarityViz();
    setupAtlasVisibility();
    setupResize();
    setupHashNavigation();
    setupSectionNav();
    setupScrollProgress();
    setupRevealMotion();
    setupStageCaseRail();
    setupChartStoryMarks();
    restoreHashPosition();
  })
  .catch((error) => {
    console.error(error);
    setDataStatus("error", "Could not load local data. Start the local server from the repo root, then reload.");
  });

function setDataStatus(state, message) {
  const status = document.querySelector("#data-status");
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
}

function normalizeFeature(row) {
  return {
    ...row,
    x: Number(row.x) || 0,
    y: Number(row.y) || 0,
    layer_number: Number(row.layer_number),
    activation_density: Number(row.activation_density) || 0,
  };
}

function setupScrolly() {
  const chapters = Array.from(document.querySelectorAll(".chapter"));
  if (!chapters.length) return;
  let frame = 0;

  const updateActiveChapter = () => {
    frame = 0;
    const stackedStory = window.matchMedia("(max-width: 1120px)").matches;
    const readingLine = stackedStory ? Math.min(window.innerHeight * 0.28, 220) : window.innerHeight * 0.52;
    let activeChapter = chapters[0];
    let bestDistance = Infinity;

    chapters.forEach((chapter) => {
      const rect = chapter.getBoundingClientRect();
      if (stackedStory) {
        if (rect.top <= readingLine) activeChapter = chapter;
        return;
      }
      const chapterCenter = rect.top + rect.height / 2;
      const distance = Math.abs(chapterCenter - readingLine);
      if (distance < bestDistance) {
        bestDistance = distance;
        activeChapter = chapter;
      }
    });

    const id = activeChapter.dataset.featureId;
    if (id && id !== activeId) {
      activeId = id;
      renderFeature(activeId);
    }
    chapters.forEach((chapter) => {
      chapter.classList.toggle("is-active", chapter.dataset.featureId === activeId);
    });
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(updateActiveChapter);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateActiveChapter();
}

function setupResize() {
  const renderers = new Map([
    ["atlas-canvas", renderAtlas],
    ["evidence-matrix", renderEvidenceMatrix],
    ["heatmap", renderHeatmap],
    ["density-histogram", renderHistogram],
    ["agreement-strip", renderAgreementStrip],
  ]);
  const pendingIds = new Set();
  const lastSizes = new Map();
  let frame = 0;
  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const size = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      if (lastSizes.get(id) === size) return;
      lastSizes.set(id, size);
      pendingIds.add(id);
    });
    if (frame || !pendingIds.size) return;
    frame = requestAnimationFrame(() => {
      const ids = Array.from(pendingIds);
      pendingIds.clear();
      frame = 0;
      ids.forEach((id) => renderers.get(id)?.());
    });
  });
  ["#atlas-canvas", "#evidence-matrix", "#heatmap", "#density-histogram", "#agreement-strip"]
    .map((selector) => document.querySelector(selector))
    .filter(Boolean)
    .forEach((node) => observer.observe(node));
}

function setupHashNavigation() {
  window.addEventListener("hashchange", () => {
    scrollToHash(true);
  });
}

function setupSectionNav() {
  const sections = [
    { id: "story", href: "#story" },
    { id: "patterns", href: "#patterns" },
    { id: "takeaway", href: "#takeaway" },
    { id: "project-note", href: "#takeaway" },
    { id: "writeup",      href: "#writeup" },
  ]
    .map((item) => ({ ...item, node: document.querySelector(`#${item.id}`) }))
    .filter((item) => item.node);
  const navLinks = Array.from(document.querySelectorAll(".site-header nav a"));
  let frame = 0;

  const setCurrent = (href) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === href;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateCurrent = () => {
    frame = 0;
    const readingLine = window.scrollY + window.innerHeight * 0.38;
    const active = sections.reduce((current, section) => {
      return section.node.offsetTop <= readingLine ? section : current;
    }, sections[0]);
    if (active) setCurrent(active.href);
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(updateCurrent);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("hashchange", () => requestAnimationFrame(updateCurrent));
  updateCurrent();
}

function setupScrollProgress() {
  const update = () => {
    scrollProgressFrame = 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  const requestUpdate = () => {
    if (scrollProgressFrame) return;
    scrollProgressFrame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

function setupRevealMotion() {
  const targets = Array.from(document.querySelectorAll([
    ".hero-title",
    ".hero-bots",
    ".plain-copy",
    ".brain-figure",
    ".arc-grid article",
    ".thesis p",
    ".test-rule-heading",
    ".test-steps",
    ".patterns .section-heading",
    ".pattern-slide",
    ".reader-path",
    ".data-scope",
    ".finding-strip",
    ".method-strip",
    ".case-key",
    ".pattern-focus",
    ".chart-panel",
    ".project-note .note-grid article",
  ].join(",")));

  if (!targets.length) return;
  targets.forEach((target) => target.classList.add("reveal-item"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  targets.forEach((target) => observer.observe(target));
}

function setupPatternScrollFocus() {
  const patterns = document.querySelector("#patterns");
  const entries = PATTERN_SCROLL_FOCUS
    .map((item) => ({ ...item, node: document.querySelector(item.selector) }))
    .filter((item) => item.node);
  if (!patterns || !entries.length) return;

  entries.forEach((entry) => entry.node.classList.add("pattern-scroll-target"));

  const update = () => {
    patternScrollFrame = 0;
    const hoveredInteractive = patterns.querySelector([
      ".case-key [data-feature-id]:hover",
      "svg [data-feature-id]:hover",
      "svg [tabindex]:hover",
    ].join(","));
    if (patternInteractionActive && !hoveredInteractive && !patterns.contains(document.activeElement)) {
      patternInteractionActive = false;
    }
    const sectionRect = patterns.getBoundingClientRect();
    const sectionVisible = sectionRect.bottom > window.innerHeight * 0.22 && sectionRect.top < window.innerHeight * 0.72;
    const readingLine = window.innerHeight * 0.46;
    let active = null;
    let bestDistance = Infinity;

    if (sectionVisible) {
      entries.forEach((entry) => {
        const rect = entry.node.getBoundingClientRect();
        const visible = rect.bottom > window.innerHeight * 0.12 && rect.top < window.innerHeight * 0.86;
        if (!visible) return;
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - readingLine);
        if (distance < bestDistance) {
          active = entry;
          bestDistance = distance;
        }
      });
    }

    entries.forEach((entry) => entry.node.classList.toggle("is-scroll-focus", entry === active));
    patternScrollFocusText = active ? active.text : PATTERN_DEFAULT_FOCUS;
    if (!patternInteractionActive) setPatternFocus(patternScrollFocusText);
  };

  const requestUpdate = () => {
    if (patternScrollFrame) return;
    patternScrollFrame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

function setupCaseLegend() {
  document.querySelectorAll(".case-key [data-feature-id]").forEach((item) => {
    item.addEventListener("pointerenter", () => setCasePreview(item.dataset.featureId));
    item.addEventListener("focus", () => setCasePreview(item.dataset.featureId));
    item.addEventListener("pointerleave", clearCasePreview);
    item.addEventListener("blur", clearCasePreview);
    item.addEventListener("click", (event) => {
      event.preventDefault();
      setCasePreview(item.dataset.featureId);
      scrollToCase(item);
    });
  });

  document.querySelector(".case-key")?.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    const item = getCaseKeyItemFromEvent(event);
    if (!item) return;
    event.preventDefault();
    setCasePreview(item.dataset.featureId);
    scrollToCase(item);
  });
}

function getCaseKeyItemFromEvent(event) {
  const directItem = event.target.closest?.(".case-key [data-feature-id]");
  if (directItem) return directItem;
  return Array.from(document.querySelectorAll(".case-key [data-feature-id]"))
    .find((item) => {
      const rect = item.getBoundingClientRect();
      return event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
    });
}

function setupStageCaseRail() {
  document.querySelectorAll(".case-rail [data-feature-id]").forEach((item) => {
    item.addEventListener("click", () => {
      scrollToFeatureCase(item.dataset.featureId);
    });
    item.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      scrollToFeatureCase(item.dataset.featureId);
    });
  });
}

function setupChartStoryMarks() {
  const patterns = document.querySelector("#patterns");
  if (!patterns) return;

  patterns.addEventListener("pointerover", (event) => {
    const mark = getStoryMark(event.target, event);
    if (!mark) return;
    setCasePreview(mark.dataset.featureId);
    showStoryMarkTip(mark, event);
  });

  patterns.addEventListener("pointerout", (event) => {
    const mark = getStoryMark(event.target, event);
    if (!mark) return;
    clearCasePreview();
    hideTooltip();
  });

  patterns.addEventListener("focusin", (event) => {
    const mark = getStoryMark(event.target, event);
    if (!mark) return;
    setCasePreview(mark.dataset.featureId);
    showStoryMarkTip(mark);
  });

  patterns.addEventListener("focusout", (event) => {
    const mark = getStoryMark(event.target);
    if (!mark) return;
    clearCasePreview();
    hideTooltip();
  });

  patterns.addEventListener("click", (event) => {
    const mark = getStoryMark(event.target, event);
    if (!mark) return;
    clearCasePreview();
    scrollToFeatureCase(mark.dataset.featureId);
  });

  patterns.addEventListener("keydown", (event) => {
    const mark = getStoryMark(event.target);
    if (!mark || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    scrollToFeatureCase(mark.dataset.featureId);
  });
}

function scrollToCase(item) {
  const target = document.querySelector(item.getAttribute("href"));
  if (!target) return;
  activeId = item.dataset.featureId;
  renderFeature(activeId);
  document.querySelectorAll(".chapter").forEach((chapter) => {
    chapter.classList.toggle("is-active", chapter.dataset.featureId === activeId);
  });
  history.replaceState(null, "", item.getAttribute("href"));
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  const block = window.matchMedia("(max-width: 1120px)").matches ? "start" : "center";
  document.documentElement.style.scrollBehavior = "auto";
  target.scrollIntoView({ block });
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

function scrollToFeatureCase(featureId) {
  const chapter = document.querySelector(`.chapter[data-feature-id="${featureId}"]`);
  if (!chapter) return;
  activeId = featureId;
  renderFeature(activeId);
  document.querySelectorAll(".chapter").forEach((c) =>
    c.classList.toggle("is-active", c.dataset.featureId === activeId)
  );
  const previous = document.documentElement.style.scrollBehavior;
  const block = window.matchMedia("(max-width: 1120px)").matches ? "start" : "center";
  document.documentElement.style.scrollBehavior = "auto";
  chapter.scrollIntoView({ block });
  document.documentElement.style.scrollBehavior = previous;
}

function getStoryMark(target, event) {
  const mark = target.closest?.("svg .story-case-link[data-feature-id]");
  if (mark && FEATURE_ORDER.includes(mark.dataset.featureId)) return mark;
  if (!event || !target.closest?.("svg")) return null;
  const hitPadding = 24;
  return Array.from(document.querySelectorAll("svg .story-case-link[data-feature-id]"))
    .map((item) => {
      const rect = item.getBoundingClientRect();
      const inside = event.clientX >= rect.left - hitPadding &&
        event.clientX <= rect.right + hitPadding &&
        event.clientY >= rect.top - hitPadding &&
        event.clientY <= rect.bottom + hitPadding;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return { item, inside, distance: Math.hypot(event.clientX - centerX, event.clientY - centerY) };
    })
    .filter((candidate) => candidate.inside && FEATURE_ORDER.includes(candidate.item.dataset.featureId))
    .sort((a, b) => a.distance - b.distance)[0]?.item || null;
}

function setCasePreview(featureId) {
  holdPatternInteraction();
  const story = STORY[featureId];
  if (story) setPatternFocus(`${story.short}: ${story.verdict}`);
  document.querySelectorAll(".case-key [data-feature-id]").forEach((item) => {
    item.classList.toggle("is-previewed", item.dataset.featureId === featureId);
  });
  document.querySelectorAll("svg [data-feature-id]").forEach((item) => {
    const isMatch = item.dataset.featureId === featureId;
    item.classList.toggle("is-previewed", isMatch);
    item.classList.toggle("is-dimmed", !isMatch);
  });
}

function showStoryMarkTip(mark, event) {
  const story = STORY[mark.dataset.featureId];
  if (!story) return;
  showTooltip(`${story.short}\n${story.verdict}`, event, mark);
  setPatternFocus(`${story.short}: ${story.verdict}`);
}

function clearCasePreview() {
  document.querySelectorAll(".case-key [data-feature-id], svg [data-feature-id]").forEach((item) => {
    item.classList.remove("is-previewed", "is-dimmed");
  });
  releasePatternInteraction();
}

function restoreHashPosition() {
  scrollToHash(true);
}

function scrollToHash(instant) {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  requestAnimationFrame(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    if (instant) document.documentElement.style.scrollBehavior = "auto";
    target.scrollIntoView();
    if (instant) document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
}

function renderFeature(featureId) {
  const row = features.find((item) => item.feature_id === featureId);
  const example = examplesById.get(featureId);
  const story = STORY[featureId];
  if (!row || !story) return;

  const stage = document.querySelector(".stage");
  if (stage) {
    stage.dataset.activeFeature = featureId;
    if (lastRenderedFeatureId && lastRenderedFeatureId !== featureId && !reduceMotion.matches) {
      stage.classList.remove("case-switch");
      void stage.offsetWidth;
      stage.classList.add("case-switch");
    }
  }
  lastRenderedFeatureId = featureId;

  const detail = CASE[featureId];
  const link = document.querySelector("#feature-link");
  if (link) link.href = neuronpediaUrl(row.feature_id);

  if (detail) {
    setStageText("#case-label", detail.label);
    applyMatchRow("#match-word", "#match-word-tag", detail.word);
    applyMatchRow("#match-sentence", "#match-sentence-tag", detail.sentence);
    const verdict = document.querySelector("#case-verdict");
    if (verdict) {
      verdict.textContent = detail.badge;
      verdict.dataset.state = detail.badgeState;
    }
    const mascot = document.querySelector("#case-mascot");
    if (mascot) mascot.innerHTML = MASCOTS[featureId] || "";
  }

  const activationWindows = example?.activation_windows || [];
  renderActivationWindow(activationWindows[0], activationWindows.length);
  updateCaseRail(featureId);
  document.documentElement.style.setProperty("--active-color", story.color);
  atlasKeyboardIndex = Math.max(0, FEATURE_ORDER.indexOf(featureId));
  if (!atlasHoverRow) updateAtlasCaption(null);
  drawCurrentAtlasFrame();
}

function setStageText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function applyMatchRow(rowSelector, tagSelector, info) {
  const row = document.querySelector(rowSelector);
  const tag = document.querySelector(tagSelector);
  if (row) row.dataset.state = info.state;
  if (tag) tag.textContent = info.tag;
}

function updateCaseRail(featureId) {
  document.querySelectorAll(".case-rail [data-feature-id]").forEach((item) => {
    const isActive = item.dataset.featureId === featureId;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function renderTokenPills(featureId, tokens) {
  const container = document.querySelector("#token-pills");
  container.replaceChildren();
  tokens
    .slice(0, 8)
    .map((token, index) => {
      const cleaned = cleanToken(token).trim();
      return {
        index,
        cleaned,
        original: token,
        evidence: classifyTextPiece(featureId, cleaned),
      };
    })
    .sort((a, b) =>
      d3.ascending(TOKEN_EVIDENCE_PRIORITY[a.evidence.kind] ?? 3, TOKEN_EVIDENCE_PRIORITY[b.evidence.kind] ?? 3) ||
      d3.ascending(a.index, b.index)
    )
    .forEach((item) => {
      const pill = document.createElement("span");
      pill.className = "token-pill";
      pill.dataset.evidence = item.evidence.kind;
      pill.textContent = item.cleaned || cleanToken(item.original);
      pill.setAttribute("role", "listitem");
      pill.setAttribute("aria-label", `${pill.textContent}: ${item.evidence.label}`);
      pill.title = item.evidence.label;
      container.append(pill);
    });
}

function classifyTextPiece(featureId, token) {
  const value = token.toLowerCase();
  if (featureId === "gpt2-small/4-res-jb/14801") {
    return /(url|uri|http)/.test(value)
      ? { kind: "supports", label: "matches the web-address label" }
      : { kind: "context", label: "related URL context" };
  }
  if (featureId === "gpt2-small/7-res-jb/6592") {
    return /(python|input|output|export|username|prefix|enable|shared|webkit)/.test(value)
      ? { kind: "context", label: "needs command-line context" }
      : { kind: "neutral", label: "unclear highlighted text" };
  }
  if (featureId === "gpt2-small/7-res-jb/24310") {
    return value === "cat"
      ? { kind: "misleading", label: "letter match, but not the animal" }
      : { kind: "neutral", label: "does not clearly support cats" };
  }
  if (featureId === "gpt2-small/11-res-jb/14962") {
    return /[a-z0-9]/.test(value)
      ? { kind: "context", label: "needs Star Wars context" }
      : { kind: "misleading", label: "punctuation mark, weak support for the label" };
  }
  return { kind: "neutral", label: "unclear highlighted text" };
}

function renderActivationWindow(window, totalWindows = 0) {
  const container = document.querySelector("#activation-window");
  container.replaceChildren();
  container.setAttribute(
    "aria-label",
    totalWindows > 1 ? `Full sentence example, 1 of ${totalWindows}` : "Full sentence example"
  );
  if (!window) {
    container.textContent = "No saved full sentence for this moment.";
    return;
  }

  window.tokens.forEach((token, index) => {
    const span = document.createElement("span");
    const rawText = String(token.text || "");
    const nextRawText = String(window.tokens[index + 1]?.text || "");
    span.className = token.is_peak ? "hot-token peak" : "hot-token";
    if (index > 0 && rawText && !/^\s/.test(rawText)) span.classList.add("is-joined");
    if (nextRawText && !/^\s/.test(nextRawText)) span.classList.add("joins-next");
    span.style.setProperty("--heat", Math.max(0, Math.min(1, token.relative_value || 0)));
    span.textContent = cleanToken(rawText);
    container.append(span);
  });
}

function renderAtlas() {
  const canvas = document.querySelector("#atlas-canvas");
  if (!canvas || !features.length) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width || canvas.clientWidth || 320);
  const height = Math.max(1, rect.height || canvas.clientHeight || 260);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  atlasContext = canvas.getContext("2d");
  atlasContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  atlasBase = buildAtlasBase(width, height, dpr);
  drawAtlasFrame(width, height);
  if (shouldAnimateAtlas(canvas)) startAtlasAnimation();
  else stopAtlasAnimation();
}

function buildAtlasBase(width, height, dpr) {
  const margin = 34;
  const xExtent = d3.extent(features, (row) => row.x);
  const yExtent = d3.extent(features, (row) => row.y);
  const x = d3.scaleLinear().domain(xExtent).nice().range([margin, width - margin]);
  const y = d3.scaleLinear().domain(yExtent).nice().range([height - margin, margin]);
  const r = d3
    .scaleSqrt()
    .domain(d3.extent(features, (row) => row.activation_density))
    .range([1.3, 5.2]);
  const storyIds = new Set(FEATURE_ORDER);
  const points = features.map((row) => ({
    row,
    px: x(row.x),
    py: y(row.y),
    radius: storyIds.has(row.feature_id) ? 5.5 : r(row.activation_density),
  }));
  const quadtree = d3
    .quadtree()
    .x((point) => point.px)
    .y((point) => point.py)
    .addAll(points);
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = Math.round(width * dpr);
  baseCanvas.height = Math.round(height * dpr);
  const ctx = baseCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = "#fbfbf7";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e5e5df";
  ctx.lineWidth = 1;
  x.ticks(8).forEach((tick) => {
    const px = x(tick);
    ctx.beginPath();
    ctx.moveTo(px, margin);
    ctx.lineTo(px, height - margin);
    ctx.stroke();
  });
  y.ticks(5).forEach((tick) => {
    const py = y(tick);
    ctx.beginPath();
    ctx.moveTo(margin, py);
    ctx.lineTo(width - margin, py);
    ctx.stroke();
  });

  for (const point of points) {
    const isStoryPoint = storyIds.has(point.row.feature_id);
    ctx.globalAlpha = isStoryPoint ? 0.95 : 0.13;
    ctx.fillStyle = isStoryPoint
      ? STORY[point.row.feature_id].color
      : CATEGORY_COLORS.get(point.row.concept_category) || "#8e8f88";
    ctx.beginPath();
    ctx.arc(point.px, point.py, point.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAtlasCallouts(ctx, width, height, x, y);

  return { canvas: baseCanvas, width, height, x, y, points, quadtree };
}

function drawAtlasCallouts(ctx, width, height, x, y) {
  if (width < 620 || height < 330) return;

  const categoryStats = d3.rollups(
    features,
    (rows) => ({
      count: rows.length,
      x: d3.mean(rows, (row) => row.x),
      y: d3.mean(rows, (row) => row.y),
    }),
    (row) => row.concept_category
  );
  const statsByCategory = new Map(categoryStats);
  const compact = width < 430 || height < 245;

  ATLAS_CALLOUTS.forEach((callout) => {
    const stats = statsByCategory.get(callout.category);
    if (!stats) return;
    const pointX = x(stats.x);
    const pointY = y(stats.y);
    const labelWidth = compact ? 112 : 142;
    const labelHeight = compact ? 28 : 38;
    let labelX = pointX;
    let labelY = pointY;

    if (callout.side === "left") {
      labelX = pointX - labelWidth - 16;
      labelY = pointY + 10;
    } else if (callout.side === "right") {
      labelX = pointX + 16;
      labelY = pointY - 20;
    } else if (callout.side === "top") {
      labelX = pointX - labelWidth / 2;
      labelY = pointY - labelHeight - 18;
    } else {
      labelX = pointX - labelWidth / 2;
      labelY = pointY + 18;
    }

    labelX = Math.max(8, Math.min(width - labelWidth - 8, labelX));
    labelY = Math.max(8, Math.min(height - labelHeight - 8, labelY));

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = CATEGORY_COLORS.get(callout.category) || "#080808";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(labelX + labelWidth / 2, labelY + labelHeight / 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(247, 247, 242, 0.93)";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = 1;
    roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#080808";
    ctx.font = `${compact ? "720 10px" : "820 12px"} Inter, system-ui, sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(callout.label, labelX + 8, labelY + 6);

    if (!compact) {
      ctx.fillStyle = "#666762";
      ctx.font = "720 10px Inter, system-ui, sans-serif";
      ctx.fillText(callout.summary, labelX + 8, labelY + 22);
    }
    ctx.restore();
  });
}

function drawAtlasFrame(width, height) {
  if (!atlasContext || !atlasBase) return;
  const ctx = atlasContext;
  const active = features.find((row) => row.feature_id === activeId);
  const activeStory = STORY[activeId];

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(atlasBase.canvas, 0, 0, width, height);
  drawAtlasStoryPath(ctx, width, height);

  if (active) {
    const px = atlasBase.x(active.x);
    const py = atlasBase.y(active.y);
    const pulse = 14 + Math.sin(atlasFrame * 0.055) * 5;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = activeStory.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = activeStory.color;
    ctx.beginPath();
    ctx.arc(px, py, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.textBaseline = "middle";
    const label = activeStory.short;
    const textWidth = ctx.measureText(label).width;
    const labelX = Math.min(width - textWidth - 22, px + 18);
    const labelY = Math.max(24, Math.min(height - 24, py - 18));
    ctx.fillStyle = "rgba(247, 247, 242, 0.94)";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = 1;
    roundRect(ctx, labelX - 10, labelY - 15, textWidth + 20, 30, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#080808";
    ctx.fillText(label, labelX, labelY);
  }

  if (atlasHoverRow) {
    drawAtlasHover(ctx, width, height, atlasHoverRow);
  }

  ctx.globalAlpha = 1;
}

function getAtlasStoryPath() {
  if (!atlasBase) return [];
  return FEATURE_ORDER
    .map((id, index) => {
      const row = features.find((item) => item.feature_id === id);
      const story = STORY[id];
      return row && story
        ? { id, index, row, story, px: atlasBase.x(row.x), py: atlasBase.y(row.y) }
        : null;
    })
    .filter(Boolean);
}

function drawAtlasStoryPath(ctx, width, height) {
  const stops = getAtlasStoryPath();
  if (stops.length < 2) return;
  const compact = width < 430 || height < 245;
  const activeIndex = Math.max(0, FEATURE_ORDER.indexOf(activeId));

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = "rgba(8, 8, 8, 0.58)";
  ctx.lineWidth = compact ? 1.7 : 2.4;
  ctx.setLineDash([compact ? 5 : 8, compact ? 5 : 7]);
  ctx.beginPath();
  stops.forEach((stop, index) => {
    if (index === 0) ctx.moveTo(stop.px, stop.py);
    else ctx.lineTo(stop.px, stop.py);
  });
  ctx.stroke();

  ctx.setLineDash([]);
  stops.slice(1, activeIndex + 1).forEach((stop, index) => {
    const previous = stops[index];
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = stop.story.color;
    ctx.lineWidth = compact ? 2.4 : 3.4;
    ctx.beginPath();
    ctx.moveTo(previous.px, previous.py);
    ctx.lineTo(stop.px, stop.py);
    ctx.stroke();
  });

  stops.forEach((stop) => {
    const isActive = stop.id === activeId;
    const radius = isActive ? (compact ? 8 : 10) : (compact ? 6 : 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = isActive ? stop.story.color : "rgba(247, 247, 242, 0.96)";
    ctx.strokeStyle = stop.story.color;
    ctx.lineWidth = isActive ? 3 : 2.2;
    ctx.beginPath();
    ctx.arc(stop.px, stop.py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!compact || isActive) {
      ctx.fillStyle = isActive ? "#ffffff" : "#080808";
      ctx.font = `${compact ? "850 9px" : "900 10px"} Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(stop.index + 1), stop.px, stop.py + 0.5);
    }
  });

  ctx.restore();
}

function drawAtlasHover(ctx, width, height, row) {
  const story = STORY[row.feature_id];
  const color = story?.color || CATEGORY_COLORS.get(row.concept_category) || "#080808";
  const px = atlasBase.x(row.x);
  const py = atlasBase.y(row.y);
  const isCompact = width < 430 || height < 245;
  const label = story?.short || atlasProbeLabel(row);
  const detail = `Layer ${row.layer_number} | ${row.concept_category} | ${formatPercent(row.activation_density)}`;
  const labelWidth = Math.min(isCompact ? 196 : 242, width - 18);
  const labelHeight = isCompact ? 48 : 56;
  let labelX = px + 16;
  let labelY = py + 14;

  if (labelX + labelWidth > width - 8) labelX = px - labelWidth - 16;
  if (labelY + labelHeight > height - 8) labelY = py - labelHeight - 16;
  labelX = Math.max(8, Math.min(width - labelWidth - 8, labelX));
  labelY = Math.max(8, Math.min(height - labelHeight - 8, labelY));

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(labelX + 14, labelY + labelHeight / 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(247, 247, 242, 0.96)";
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = 1;
  roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#080808";
  ctx.font = `${isCompact ? "820 11px" : "850 12px"} Inter, system-ui, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(label, labelX + 10, labelY + 9);
  ctx.fillStyle = "#666762";
  ctx.font = `${isCompact ? "720 9px" : "760 10px"} Inter, system-ui, sans-serif`;
  ctx.fillText(detail, labelX + 10, labelY + (isCompact ? 27 : 32));
  ctx.restore();
}

function animateAtlas() {
  if (!shouldAnimateAtlas()) {
    stopAtlasAnimation();
    return;
  }
  atlasFrame += 1;
  drawCurrentAtlasFrame();
  atlasAnimation = requestAnimationFrame(animateAtlas);
}

function setupAtlasVisibility() {
  const canvas = document.querySelector("#atlas-canvas");
  if (!canvas) return;

  atlasVisible = isElementInViewport(canvas);
  if (shouldAnimateAtlas(canvas)) startAtlasAnimation();

  const observer = new IntersectionObserver((entries) => {
    atlasVisible = entries.some((entry) => entry.isIntersecting);
    if (shouldAnimateAtlas(canvas)) startAtlasAnimation();
    else stopAtlasAnimation();
  });
  observer.observe(canvas);

  reduceMotion.addEventListener?.("change", () => {
    drawCurrentAtlasFrame();
    if (shouldAnimateAtlas(canvas)) startAtlasAnimation();
    else stopAtlasAnimation();
  });
}

function setupAtlasInteraction() {
  const canvas = document.querySelector("#atlas-canvas");
  if (!canvas) return;

  const updateHover = (event) => {
    if (atlasPointerFrame) return;
    atlasPointerFrame = requestAnimationFrame(() => {
      atlasPointerFrame = 0;
      setAtlasHoverFromPointer(event);
    });
  };

  canvas.addEventListener("pointermove", updateHover);
  canvas.addEventListener("pointerdown", setAtlasHoverFromPointer);
  canvas.addEventListener("pointerleave", clearAtlasHover);
  canvas.addEventListener("focus", showActiveAtlasProbe);
  canvas.addEventListener("keydown", handleAtlasKeydown);
  canvas.addEventListener("blur", clearAtlasHover);
}

function setAtlasHoverFromPointer(event) {
  const canvas = document.querySelector("#atlas-canvas");
  if (!canvas || !atlasBase?.points?.length) return;
  const rect = canvas.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  const row = findNearestAtlasRow(px, py);

  setAtlasHoverRow(row);
}

function findNearestAtlasRow(px, py) {
  const threshold = 22;
  const nearest = atlasBase.quadtree?.find(px, py, threshold);
  return nearest?.row || null;
}

function clearAtlasHover() {
  if (!atlasHoverRow) return;
  setAtlasHoverRow(null);
}

function showActiveAtlasProbe() {
  const activeIndex = FEATURE_ORDER.indexOf(activeId);
  atlasKeyboardIndex = activeIndex >= 0 ? activeIndex : 0;
  const row = features.find((item) => item.feature_id === FEATURE_ORDER[atlasKeyboardIndex]);
  setAtlasHoverRow(row || null);
}

function handleAtlasKeydown(event) {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) return;
  event.preventDefault();

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    atlasKeyboardIndex = (atlasKeyboardIndex + 1) % FEATURE_ORDER.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    atlasKeyboardIndex = (atlasKeyboardIndex - 1 + FEATURE_ORDER.length) % FEATURE_ORDER.length;
  } else if (event.key === "Home") {
    atlasKeyboardIndex = 0;
  } else if (event.key === "End") {
    atlasKeyboardIndex = FEATURE_ORDER.length - 1;
  } else {
    const row = features.find((item) => item.feature_id === FEATURE_ORDER[atlasKeyboardIndex]);
    setAtlasHoverRow(row || null);
    if (row) scrollToFeatureCase(row.feature_id);
    return;
  }

  const row = features.find((item) => item.feature_id === FEATURE_ORDER[atlasKeyboardIndex]);
  setAtlasHoverRow(row || null);
}

function setAtlasHoverRow(row) {
  if (row?.feature_id === atlasHoverRow?.feature_id) return;
  atlasHoverRow = row;
  updateAtlasCaption(row);
  drawCurrentAtlasFrame();
}

function updateAtlasCaption(row) {
  const caption = document.querySelector("#atlas-caption");
  if (!caption) return;
  if (!row) {
    caption.textContent = ATLAS_DEFAULT_CAPTION;
    return;
  }
  const story = STORY[row.feature_id];
  const label = story?.short || atlasProbeLabel(row);
  caption.textContent = `Map dot: ${label}, GPT-2 step ${row.layer_number}, ${row.concept_category}, appears in ${formatPercent(row.activation_density)} of sampled text.`;
}

function startAtlasAnimation() {
  if (atlasAnimation || reduceMotion.matches) return;
  atlasAnimation = requestAnimationFrame(animateAtlas);
}

function stopAtlasAnimation() {
  if (!atlasAnimation) return;
  cancelAnimationFrame(atlasAnimation);
  atlasAnimation = null;
}

function shouldAnimateAtlas(canvas = document.querySelector("#atlas-canvas")) {
  return Boolean(canvas && atlasContext && atlasBase && atlasVisible && !reduceMotion.matches);
}

function drawCurrentAtlasFrame() {
  const canvas = document.querySelector("#atlas-canvas");
  if (!canvas || !atlasContext || !atlasBase) return;
  const rect = canvas.getBoundingClientRect();
  drawAtlasFrame(rect.width, rect.height);
}

function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
}

function renderPatternStats() {
  if (!features.length) return;
  const topicCounts = Array.from(
    d3.rollup(features, (rows) => rows.length, (row) => row.concept_category),
    ([category, count]) => ({ category, count })
  ).sort((a, b) => d3.descending(a.count, b.count));
  const topTopic = topicCounts[0];
  const medianFire = d3.median(features, (row) => row.activation_density);

  document.querySelector("#finding-topic").textContent =
    `${Math.round((topTopic.count / features.length) * 100)}%`;
  document.querySelector("#finding-typical").textContent = formatPercent(medianFire);
}

function getStoryRows() {
  return FEATURE_ORDER
    .map((id) => {
      const row = features.find((item) => item.feature_id === id);
      const story = STORY[id];
      return row && story ? { id, row, story } : null;
    })
    .filter(Boolean);
}

function agreementScore(row) {
  return Number(row.agreement_score) || 0;
}

function renderEvidenceMatrix() {
  const svg = d3.select("#evidence-matrix");
  if (svg.empty() || !features.length) return;
  const bounds = svg.node().getBoundingClientRect();
  const isCompact = bounds.width < 620;
  const width = Math.max(isCompact ? 360 : 760, bounds.width || 980);
  const height = Math.max(isCompact ? 320 : 280, bounds.height || 310);
  const margin = isCompact
    ? { top: 42, right: 12, bottom: 28, left: 78 }
    : { top: 46, right: 18, bottom: 30, left: 122 };

  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const columns = [
    { key: "label", label: "Feature label", compactLabel: "Label" },
    { key: "pieces", label: "Highlight", compactLabel: "Highlight" },
    { key: "text", label: "Full sentence", compactLabel: "Sentence" },
  ];
  const rows = getStoryRows();
  const x = d3
    .scaleBand()
    .domain(columns.map((column) => column.key))
    .range([margin.left, width - margin.right])
    .paddingInner(0.08);
  const y = d3
    .scaleBand()
    .domain(rows.map((item) => item.id))
    .range([margin.top, height - margin.bottom])
    .paddingInner(0.12);

  const scoreColor = (score) => {
    if (score >= 3) return "#12a878";
    if (score === 2) return "#f2ae33";
    return "#ff4057";
  };
  const scoreWord = (score) => {
    if (score >= 3) return "yes";
    if (score === 2) return "check";
    return "stop";
  };
  const rowName = (story) => story.short.replace(" example", "").replace(" / cataracts", "");

  svg
    .append("g")
    .selectAll("text")
    .data(columns)
    .join("text")
    .attr("x", (column) => x(column.key) + x.bandwidth() / 2)
    .attr("y", margin.top - 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#666762")
    .attr("font-size", isCompact ? 11 : 13)
    .attr("font-weight", 880)
    .attr("letter-spacing", 1.2)
    .text((column) => (isCompact ? column.compactLabel : column.label).toUpperCase());

  const rowGroups = svg
    .append("g")
    .selectAll("g")
    .data(rows)
    .join("g")
    .attr("class", "matrix-row story-case-link")
    .attr("data-feature-id", (item) => item.id)
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (item) =>
      `Jump to the ${item.story.short} example: ${item.story.scoreLabels.join(", ")}. ${item.story.verdict}`
    );

  rowGroups
    .append("rect")
    .attr("class", "matrix-row-hit")
    .attr("x", margin.left - 4)
    .attr("y", (item) => y(item.id) - 2)
    .attr("width", width - margin.left - margin.right + 8)
    .attr("height", y.bandwidth() + 4)
    .attr("fill", "transparent");

  rowGroups
    .append("text")
    .attr("class", "matrix-row-label")
    .attr("x", margin.left - 14)
    .attr("y", (item) => y(item.id) + y.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#080808")
    .attr("font-size", isCompact ? 12 : 15)
    .attr("font-weight", 880)
    .text((item) => rowName(item.story));

  rowGroups
    .selectAll("rect.matrix-cell")
    .data((item) => columns.map((column, index) => ({ ...item, column, index })))
    .join("rect")
    .attr("class", "matrix-cell")
    .attr("x", (item) => x(item.column.key))
    .attr("y", (item) => y(item.id))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 5)
    .attr("fill", (item) => scoreColor(item.story.scores[item.index]))
    .attr("opacity", 0.92)
    .attr("stroke", "#080808")
    .attr("stroke-width", 1);

  rowGroups
    .selectAll("text.matrix-cell-label")
    .data((item) => columns.map((column, index) => ({ ...item, column, index })))
    .join("text")
    .attr("class", "matrix-cell-label")
    .attr("x", (item) => x(item.column.key) + x.bandwidth() / 2)
    .attr("y", (item) => y(item.id) + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#080808")
    .attr("font-size", isCompact ? 11 : 14)
    .attr("font-weight", 900)
    .text((item) => scoreWord(item.story.scores[item.index]));

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", height - 8)
    .attr("fill", "#666762")
    .attr("font-size", isCompact ? 10 : 12)
    .attr("font-weight", 760)
    .text("One red cell is enough to stop trusting the label.");
}

function renderHeatmap() {
  const svg = d3.select("#heatmap");
  if (svg.empty() || !features.length) return;
  const bounds = svg.node().getBoundingClientRect();
  const isCompact = bounds.width < 520;
  const width = Math.max(isCompact ? 380 : 500, bounds.width || 680);
  const height = Math.max(isCompact ? 360 : 330, bounds.height || 470);
  const margin = isCompact
    ? { top: 28, right: 10, bottom: 42, left: 84 }
    : { top: 24, right: 18, bottom: 46, left: 142 };
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const layers = Array.from(new Set(features.map((row) => row.layer_number))).sort(d3.ascending);
  const allCategories = Array.from(new Set(features.map((row) => row.concept_category)))
    .sort((a, b) => d3.descending(
      features.filter((row) => row.concept_category === a).length,
      features.filter((row) => row.concept_category === b).length
    ));
  const storyCategories = new Set(getStoryRows().map(({ row }) => row.concept_category));
  const categories = isCompact
    ? allCategories.filter((category, index) => index < 3 || storyCategories.has(category))
    : allCategories;
  const x = d3.scaleBand().domain(layers).range([margin.left, width - margin.right]).padding(0.05);
  const y = d3.scaleBand().domain(categories).range([margin.top, height - margin.bottom]).padding(0.05);
  const totals = new Map(layers.map((layer) => [layer, features.filter((row) => row.layer_number === layer).length]));
  const counts = d3.rollup(
    features,
    (rows) => rows.length,
    (row) => row.concept_category,
    (row) => row.layer_number
  );
  const cells = [];
  categories.forEach((category) => {
    layers.forEach((layer) => {
      const count = counts.get(category)?.get(layer) || 0;
      cells.push({ category, layer, count, pct: count / totals.get(layer) });
    });
  });
  const fill = d3
    .scaleSequential((t) => d3.interpolateRgb("#f4f4ee", "#080808")(t))
    .domain([0, d3.max(cells, (row) => row.pct)]);

  svg
    .append("g")
    .selectAll("rect")
    .data(cells)
    .join("rect")
    .attr("x", (row) => x(row.layer))
    .attr("y", (row) => y(row.category))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (row) => fill(row.pct))
    .attr("stroke", "#fbfbf7")
    .attr("stroke-width", 2)
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr("aria-label", (row) =>
      `${row.category}, layer ${row.layer}: ${d3.format(",")(row.count)} features, ${formatPercent(row.pct)} of that layer`
    )
    .on("pointerenter pointermove", (event, row) => {
      showHeatmapTip(event.currentTarget, row, event);
    })
    .on("focus", (event, row) => {
      showHeatmapTip(event.currentTarget, row);
    })
    .on("blur pointerleave", (event) => {
      hideTooltip();
      releasePatternInteraction();
      d3.select(event.currentTarget).attr("stroke", "#fbfbf7").attr("stroke-width", 2);
    });

  const storyCells = getStoryRows()
    .map(({ id, row, story }) => ({
      id,
      story,
      category: row.concept_category,
      layer: row.layer_number,
    }))
    .filter((item) => x(item.layer) !== undefined && y(item.category) !== undefined);
  const storyRadius = Math.max(4, Math.min(8, Math.min(x.bandwidth(), y.bandwidth()) * 0.24));

  svg
    .append("g")
    .attr("aria-hidden", "true")
    .selectAll("rect")
    .data(storyCells)
    .join("rect")
    .attr("class", "story-cell-outline")
    .attr("x", (item) => x(item.layer) + 2)
    .attr("y", (item) => y(item.category) + 2)
    .attr("width", x.bandwidth() - 4)
    .attr("height", y.bandwidth() - 4)
    .attr("fill", "none")
    .attr("stroke", (item) => item.story.color)
    .attr("stroke-width", 3)
    .attr("rx", 4)
    .attr("data-feature-id", (item) => item.id);

  const storyGroups = svg
    .append("g")
    .selectAll("g")
    .data(storyCells)
    .join("g")
    .attr("class", "story-case-link story-mark")
    .attr("data-feature-id", (item) => item.id)
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (item) => `Jump to the ${item.story.short} example`);

  storyGroups
    .append("circle")
    .attr("class", "story-hit-target")
    .attr("cx", (item) => x(item.layer) + x.bandwidth() / 2)
    .attr("cy", (item) => y(item.category) + y.bandwidth() / 2)
    .attr("r", Math.max(18, storyRadius + 10))
    .attr("fill", "transparent");

  storyGroups
    .append("circle")
    .attr("class", "story-dot")
    .attr("cx", (item) => x(item.layer) + x.bandwidth() / 2)
    .attr("cy", (item) => y(item.category) + y.bandwidth() / 2)
    .attr("r", storyRadius)
    .attr("fill", (item) => item.story.color)
    .attr("stroke", "#fbfbf7")
    .attr("stroke-width", 3);

  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat((layer) => `L${layer}`).tickSizeOuter(0));
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat((category) => isCompact ? compactCategoryLabel(category) : category).tickSizeOuter(0));
}

function compactCategoryLabel(category) {
  return {
    "Syntax / grammar": "Grammar",
    "Other / unclear": "Other",
    "Names / entities": "Names",
    "Pop culture": "Pop",
    "Programming / technical": "Code",
    "Social media / web": "Web",
    "Numbers / dates": "Numbers",
    "Politics / news": "Politics",
  }[category] || category;
}

function renderHistogram() {
  const svg = d3.select("#density-histogram");
  if (svg.empty() || !features.length) return;
  const bounds = svg.node().getBoundingClientRect();
  const isCompact = bounds.width < 520;
  const width = Math.max(isCompact ? 360 : 420, bounds.width || 560);
  const height = Math.max(isCompact ? 360 : 330, bounds.height || 470);
  const margin = isCompact
    ? { top: 28, right: 18, bottom: 50, left: 54 }
    : { top: 24, right: 20, bottom: 52, left: 58 };
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const values = features.map((row) => Math.log10(row.activation_density + 1e-7));
  const x = d3.scaleLinear().domain(d3.extent(values)).nice().range([margin.left, width - margin.right]);
  const bins = d3.bin().domain(x.domain()).thresholds(28)(values);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (bin) => bin.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const barGroup = svg
    .append("g")
    .attr("class", "hist-bars");

  barGroup
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (bin) => x(bin.x0) + 1)
    .attr("y", (bin) => y(bin.length))
    .attr("width", (bin) => Math.max(0, x(bin.x1) - x(bin.x0) - 2))
    .attr("height", (bin) => y(0) - y(bin.length))
    .attr("fill", "#080808");

  const storyMarkers = getStoryRows()
    .map(({ id, row, story }) => ({
      id,
      story,
      value: Math.log10(row.activation_density + 1e-7),
    }))
    .filter((item) => Number.isFinite(item.value));
  const markerGroup = svg.append("g");

  markerGroup
    .selectAll("line")
    .data(storyMarkers)
    .join("line")
    .attr("class", "story-density-line")
    .attr("x1", (item) => x(item.value))
    .attr("x2", (item) => x(item.value))
    .attr("y1", margin.top + 20)
    .attr("y2", height - margin.bottom)
    .attr("stroke", (item) => item.story.color)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", "6 5")
    .attr("opacity", 0.9)
    .attr("aria-hidden", "true")
    .attr("data-feature-id", (item) => item.id);

  const densityGroups = markerGroup
    .selectAll("g.story-density-mark")
    .data(storyMarkers)
    .join("g")
    .attr("class", "story-case-link story-density-mark")
    .attr("data-feature-id", (item) => item.id)
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (item) => `Jump to the ${item.story.short} example`);

  densityGroups
    .append("circle")
    .attr("class", "story-hit-target")
    .attr("cx", (item) => x(item.value))
    .attr("cy", margin.top + 20)
    .attr("r", 18)
    .attr("fill", "transparent");

  densityGroups
    .append("circle")
    .attr("class", "story-density-dot")
    .attr("cx", (item) => x(item.value))
    .attr("cy", margin.top + 20)
    .attr("r", 6)
    .attr("fill", (item) => item.story.color)
    .attr("stroke", "#fbfbf7")
    .attr("stroke-width", 3);

  svg
    .append("g")
    .attr("class", "hist-hit-targets")
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (bin) => x(bin.x0) + 1)
    .attr("y", margin.top)
    .attr("width", (bin) => Math.max(3, x(bin.x1) - x(bin.x0) - 2))
    .attr("height", y(0) - margin.top)
    .attr("fill", "transparent")
    .attr("pointer-events", "all")
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr("aria-label", (bin) => {
      const low = Math.max(0, Math.pow(10, bin.x0) - 1e-7);
      const high = Math.max(0, Math.pow(10, bin.x1) - 1e-7);
      return `Appearance rate ${formatPercent(low)} to ${formatPercent(high)}: ${d3.format(",")(bin.length)} saved moments`;
    })
    .on("pointerenter pointermove", (event, bin) => {
      showHistogramTip(barGroup, event.currentTarget, bin, event);
    })
    .on("focus", (event, bin) => {
      showHistogramTip(barGroup, event.currentTarget, bin);
    })
    .on("blur pointerleave", () => {
      hideTooltip();
      releasePatternInteraction();
      barGroup.selectAll("rect").attr("fill", "#080808");
    });

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(histogramRateTicks(x.domain()))
        .tickFormat((value) => formatRateTick(Math.max(0, Math.pow(10, value) - 1e-7)))
    );
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#666762")
    .attr("font-size", 12)
    .text(isCompact ? "appearance rate, log scale" : "how often the saved moment appears, log scale");

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", height - 7)
    .attr("text-anchor", "start")
    .attr("fill", "#666762")
    .attr("font-size", 11)
    .attr("font-weight", 760)
    .text("rarer");

  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", height - 7)
    .attr("text-anchor", "end")
    .attr("fill", "#666762")
    .attr("font-size", 11)
    .attr("font-weight", 760)
    .text("more common");

  const median = d3.median(features, (row) => row.activation_density);
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top + 8)
    .attr("text-anchor", "end")
    .attr("fill", "#666762")
    .attr("font-size", 12)
    .attr("font-weight", 750)
    .text(isCompact ? `Typical: ${formatPercent(median)}` : `Typical saved moment appears in about ${formatPercent(median)} of sampled text.`);
}

function histogramRateTicks(domain) {
  const tickRates = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1];
  return tickRates
    .map((rate) => Math.log10(rate + 1e-7))
    .filter((value) => value >= domain[0] && value <= domain[1]);
}

function formatRateTick(value) {
  const percent = value * 100;
  if (percent < 0.001) return `${d3.format(".4f")(percent)}%`;
  if (percent < 0.01) return `${d3.format(".3f")(percent)}%`;
  if (percent < 0.1) return `${d3.format(".2f")(percent)}%`;
  if (percent < 1) return `${d3.format(".1f")(percent)}%`;
  return `${d3.format("~g")(percent)}%`;
}

function renderAgreementStrip() {
  const svg = d3.select("#agreement-strip");
  if (svg.empty() || !features.length) return;
  const bounds = svg.node().getBoundingClientRect();
  const isCompact = bounds.width < 620;
  const width = Math.max(isCompact ? 380 : 760, bounds.width || 980);
  const height = Math.max(isCompact ? 250 : 270, bounds.height || 280);
  const margin = isCompact
    ? { top: 28, right: 20, bottom: 74, left: 20 }
    : { top: 28, right: 34, bottom: 88, left: 34 };
  svg.attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const scored = features.map((row) => ({ row, score: agreementScore(row) }));
  const groups = [
    {
      key: "none",
      label: "No obvious match",
      note: "label needs backup",
      color: "#080808",
      rows: scored.filter((item) => item.score === 0),
    },
    {
      key: "some",
      label: "Some match",
      note: "still check text",
      color: "#8e8f88",
      rows: scored.filter((item) => item.score > 0 && item.score < 0.5),
    },
    {
      key: "strong",
      label: "Strong match",
      note: "not enough by itself",
      color: "#d8d8d0",
      rows: scored.filter((item) => item.score >= 0.5),
    },
  ];
  const noMatchGroup = groups[0];
  const noMatchEl = document.querySelector("#finding-no-match");
  if (noMatchEl) {
    noMatchEl.textContent = `${Math.round((noMatchGroup.rows.length / features.length) * 100)}%`;
  }

  const x = d3.scaleLinear().domain([0, features.length]).range([margin.left, width - margin.right]);
  const barY = margin.top + 36;
  const barHeight = isCompact ? 58 : 66;
  let running = 0;
  const segments = groups.map((group) => {
    const start = running;
    running += group.rows.length;
    return { ...group, start, end: running };
  });

  svg
    .append("text")
    .attr("x", margin.left)
    .attr("y", margin.top + 4)
    .attr("fill", "#666762")
    .attr("font-size", 12)
    .attr("font-weight", 780)
    .text("Quick check across all 6,000 saved moments");

  svg
    .append("g")
    .selectAll("rect")
    .data(segments)
    .join("rect")
    .attr("x", (segment) => x(segment.start))
    .attr("y", barY)
    .attr("width", (segment) => x(segment.end) - x(segment.start))
    .attr("height", barHeight)
    .attr("fill", (segment) => segment.color)
    .attr("stroke", "#fbfbf7")
    .attr("stroke-width", 2)
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr("aria-label", (segment) =>
      `${segment.label}: ${d3.format(",")(segment.rows.length)} saved moments, ${formatPercent(segment.rows.length / features.length)} of the dataset; warning, not enough`
    )
    .on("pointerenter pointermove", (event, segment) => showAgreementTip(event.currentTarget, segment, event))
    .on("focus", (event, segment) => showAgreementTip(event.currentTarget, segment))
    .on("pointerleave blur", (event) => {
      hideTooltip();
      releasePatternInteraction();
      d3.select(event.currentTarget).attr("stroke", "#fbfbf7").attr("stroke-width", 2);
    });

  const labelY = barY + barHeight + 27;
  if (isCompact) {
    const legend = svg.append("g").attr("aria-hidden", "true");
    const legendRows = legend
      .selectAll("g")
      .data(segments)
      .join("g")
      .attr("transform", (_segment, index) => `translate(${margin.left},${labelY + index * 20})`);
    legendRows
      .append("rect")
      .attr("width", 9)
      .attr("height", 9)
      .attr("y", -8)
      .attr("fill", (segment) => segment.color)
      .attr("stroke", "#080808")
      .attr("stroke-width", 0.8);
    legendRows
      .append("text")
      .attr("x", 15)
      .attr("fill", "#080808")
      .attr("font-size", 11)
      .attr("font-weight", 820)
      .text((segment) => `${Math.round((segment.rows.length / features.length) * 100)}% ${segment.label}`);
    legendRows
      .append("text")
      .attr("x", 150)
      .attr("fill", "#666762")
      .attr("font-size", 10)
      .text((segment) => segment.note);
  } else {
    svg
      .append("g")
      .selectAll("text")
      .data(segments)
      .join("text")
      .attr("class", "agreement-segment-label")
      .attr("x", (segment) => (x(segment.start) + x(segment.end)) / 2)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("fill", "#080808")
      .attr("font-size", 13)
      .attr("font-weight", 860)
      .text((segment) => `${Math.round((segment.rows.length / features.length) * 100)}% ${segment.label}`);

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", height - 10)
      .attr("fill", "#666762")
      .attr("font-size", 11)
      .attr("font-weight", 760)
      .text("Colored dots mark the four scroll examples.");
  }

  const scoreKey = (score) => (score === 0 ? "none" : score < 0.5 ? "some" : "strong");
  const segmentByKey = new Map(segments.map((segment) => [segment.key, segment]));
  const rawStoryMarkers = getStoryRows().map(({ id, row, story }) => ({
    id,
    story,
    score: agreementScore(row),
    key: scoreKey(agreementScore(row)),
    label: story.short,
  }));
  const markersByKey = d3.group(rawStoryMarkers, (item) => item.key);
  const storyMarkers = rawStoryMarkers.map((item) => {
    const group = markersByKey.get(item.key) || [];
    return {
      ...item,
      groupIndex: group.findIndex((groupItem) => groupItem.id === item.id),
      groupCount: group.length,
    };
  });
  const markerOffset = (item) => {
    if (item.groupCount <= 1) return 0;
    const spacing = isCompact ? 22 : 24;
    return (item.groupIndex - (item.groupCount - 1) / 2) * spacing;
  };
  const markerX = (item) => {
    const segment = segmentByKey.get(item.key);
    const middle = (x(segment.start) + x(segment.end)) / 2;
    return Math.max(margin.left + 8, Math.min(width - margin.right - 8, middle + markerOffset(item)));
  };
  const markerY = isCompact ? barY + barHeight / 2 : height - 52;

  const agreementGroups = svg
    .append("g")
    .selectAll("g.agreement-mark")
    .data(storyMarkers)
    .join("g")
    .attr("class", "story-case-link agreement-mark")
    .attr("data-feature-id", (item) => item.id)
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (item) => `Jump to the ${item.story.short} example`);

  agreementGroups
    .append("circle")
    .attr("class", "story-hit-target")
    .attr("cx", markerX)
    .attr("cy", markerY)
    .attr("r", isCompact ? 18 : 16)
    .attr("fill", "transparent");

  agreementGroups
    .append("circle")
    .attr("class", "agreement-marker")
    .attr("cx", markerX)
    .attr("cy", markerY)
    .attr("r", isCompact ? 7 : 6)
    .attr("fill", (item) => item.story.color)
    .attr("stroke", "#fbfbf7")
    .attr("stroke-width", isCompact ? 3.5 : 3);

  if (!isCompact) {
    const groupedMarkers = Array.from(
      d3.group(storyMarkers, (item) => scoreKey(item.score)),
      ([key, items]) => {
        const segment = segmentByKey.get(key);
        return {
          key,
          items,
          x: (x(segment.start) + x(segment.end)) / 2,
        label: items.map((item) => item.story.short.replace(" example", "")).join(" + "),
        };
      }
    );
    svg
      .append("g")
      .attr("aria-hidden", "true")
      .selectAll("text")
      .data(groupedMarkers)
      .join("text")
      .attr("class", "agreement-story-label")
      .attr("x", (item) => item.x)
      .attr("y", markerY + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#080808")
      .attr("font-size", 12)
      .attr("font-weight", 800)
      .text((item) => item.label);
  }
}

function showAgreementTip(node, segment, event) {
  holdPatternInteraction();
  const share = formatPercent(segment.rows.length / features.length);
  showTooltip(
    `${segment.label}\n${d3.format(",")(segment.rows.length)} saved moments\n${share} of the dataset\nWarning, not enough.`,
    event,
    node
  );
  setPatternFocus(`${segment.label}: ${share} of saved moments fall here. This quick word test is a warning, not an answer.`);
  d3.select(node).attr("stroke", "#ff4057").attr("stroke-width", 3);
}

function showHeatmapTip(node, row, event) {
  holdPatternInteraction();
  const share = formatPercent(row.pct);
  showTooltip(
    `${row.category} · layer ${row.layer}\n${d3.format(",")(row.count)} features\n${share} of this layer`,
    event,
    node
  );
  setPatternFocus(`${row.category} in layer ${row.layer}: ${d3.format(",")(row.count)} features, ${share} of that layer.`);
  d3.select(node).attr("stroke", "#ff4057").attr("stroke-width", 3);
}

function showHistogramTip(barGroup, node, bin, event) {
  holdPatternInteraction();
  const low = Math.pow(10, bin.x0) - 1e-7;
  const high = Math.pow(10, bin.x1) - 1e-7;
  const range = `${formatPercent(Math.max(0, low))} to ${formatPercent(high)}`;
  showTooltip(
    `${d3.format(",")(bin.length)} saved moments\nappear in ${range} of sampled text\nLeft is rarer; right is more common.`,
    event,
    node
  );
  setPatternFocus(`${d3.format(",")(bin.length)} saved moments appear in ${range} of sampled text.`);
  barGroup
    .selectAll("rect")
    .filter((item) => item === bin)
    .attr("fill", "#ff4057");
}

function setPatternFocus(text) {
  const focus = document.querySelector("#pattern-focus strong");
  if (focus) focus.textContent = text;
}

function holdPatternInteraction() {
  patternInteractionActive = true;
}

function releasePatternInteraction() {
  patternInteractionActive = false;
  resetPatternFocus();
}

function resetPatternFocus() {
  setPatternFocus(patternScrollFocusText);
}

function showTooltip(text, event, node) {
  const tooltip = document.querySelector("#chart-tooltip");
  if (!tooltip) return;
  tooltip.textContent = text;
  const point = getTooltipPoint(event, node);
  const x = point.x + 16 > window.innerWidth - 300 ? point.x - 300 : point.x + 16;
  const y = point.y + 16 > window.innerHeight - 130 ? point.y - 130 : point.y + 16;
  tooltip.style.left = `${Math.max(12, x)}px`;
  tooltip.style.top = `${Math.max(12, y)}px`;
  tooltip.style.opacity = "1";
}

function getTooltipPoint(event, node) {
  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    return { x: event.clientX, y: event.clientY };
  }
  const rect = node.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function hideTooltip() {
  const tooltip = document.querySelector("#chart-tooltip");
  if (!tooltip) return;
  tooltip.style.opacity = "0";
}

function splitTokens(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function cleanToken(value) {
  return String(value)
    .replace(/\u010a/g, "\n")
    .replace(/\u0120/g, " ")
    .replace(/<\|endoftext\|>/g, " <EOS> ");
}

function atlasProbeLabel(row) {
  if (!row?.concept_category) return "nearby feature";
  if (row.concept_category === "Other / unclear") return "other or unclear label";
  return `${row.concept_category.toLowerCase()} label`;
}

function neuronpediaUrl(featureId) {
  return `https://www.neuronpedia.org/${featureId}`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0%";
  const pct = value * 100;
  if (pct < 0.001) return "<0.001%";
  if (pct < 0.1) return `${d3.format(".3f")(pct)}%`;
  return `${d3.format(".2f")(pct)}%`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/* =====================================================================
   The Sea of Features: interactive, zoomable dot map (section #sea)
   ===================================================================== */
const SEA_TAU = Math.PI * 2;
const SEA_FADE_MS = 700;
const SEA_REVEAL_FIRST_MS = 550;
const SEA_REVEAL_GAP_MS = 1500;
let seaRevealAt = [];
let seaCanvas = null;
let seaCtx = null;
let seaStage = null;
let seaCssW = 0;
let seaCssH = 0;
let seaPoints = [];
let seaQuadtree = null;
let seaScaleX = null;
let seaScaleY = null;
let seaHoverRow = null;
let seaZoomed = false;
let seaInView = false;
let seaPointerRAF = 0;
let seaDrawRAF = 0;
let seaRevealActive = false;
let seaRevealCount = 0;
let seaRevealTimer = 0;
let seaAnimRAF = 0;
let seaFrame = 0;

function setupSeaMap() {
  seaCanvas = document.querySelector("#sea-canvas");
  seaStage = document.querySelector("#sea-stage");
  if (!seaCanvas || !seaStage || !features.length) return;
  seaCtx = seaCanvas.getContext("2d");

  buildSeaLegends();

  seaCanvas.addEventListener("pointermove", seaOnPointerMove);
  seaCanvas.addEventListener("pointerdown", seaOnPointerMove);
  seaCanvas.addEventListener("pointerleave", () => {
    seaHoverRow = null;
    hideSeaInfo();
    seaRequestDraw();
  });

  const zoomBtn = document.querySelector("#sea-zoom-btn");
  if (zoomBtn) zoomBtn.addEventListener("click", () => toggleSeaZoom());

  const promptEl = document.querySelector("#sea-prompt");
  if (promptEl) {
    promptEl.addEventListener("click", () => {
      if (seaRevealActive) stopSeaReveal();
      else startSeaReveal();
    });
  }

  window.addEventListener("keydown", seaOnKeydown);

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => seaResize());
    ro.observe(seaStage);
  } else {
    window.addEventListener("resize", seaResize);
  }

  const seaSection = document.querySelector("#sea");
  if (seaSection && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        seaInView = entry.isIntersecting;
      }),
      { threshold: 0.3 }
    );
    io.observe(seaSection);
  } else {
    seaInView = true;
  }

  seaResize();
}

function seaCategoryCounts() {
  const counts = new Map();
  for (const row of features) {
    const cat = row.concept_category || "Other / unclear";
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  return counts;
}

function buildSeaLegends() {
  const counts = seaCategoryCounts();
  const order = Array.from(CATEGORY_COLORS.keys()).sort(
    (a, b) => (counts.get(b) || 0) - (counts.get(a) || 0)
  );
  const legendEl = document.querySelector("#sea-legend");
  if (legendEl) {
    legendEl.innerHTML = order
      .map((cat) => {
        const color = CATEGORY_COLORS.get(cat) || "#8e8f88";
        return `<span style="--swatch:${color}"><i></i>${cat}</span>`;
      })
      .join("");
  }
  buildSeaPie(order, counts);
}

function buildSeaPie(order, counts) {
  const svg = document.querySelector("#sea-pie-svg");
  const legend = document.querySelector("#sea-pie-legend");
  const center = document.querySelector("#sea-pie-center");
  if (!svg || !legend || !center) return;

  const data = order.map((cat) => ({
    cat,
    count: counts.get(cat) || 0,
    color: CATEGORY_COLORS.get(cat) || "#8e8f88",
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const arc = d3.arc().innerRadius(58).outerRadius(100).padAngle(0.012).cornerRadius(2);
  const arcs = d3.pie().sort(null).value((d) => d.count)(data);

  svg.innerHTML = arcs
    .map((a, i) => {
      const d = arc(a);
      const [cx, cy] = arc.centroid(a);
      const len = Math.hypot(cx, cy) || 1;
      const dx = ((cx / len) * 9).toFixed(1);
      const dy = ((cy / len) * 9).toFixed(1);
      const pct = Math.round((data[i].count / total) * 100);
      return `<path class="sea-slice" data-i="${i}" d="${d}" fill="${data[i].color}" style="--dx:${dx}px;--dy:${dy}px"><title>${data[i].cat}: ${data[i].count.toLocaleString()} (${pct}%)</title></path>`;
    })
    .join("");

  legend.innerHTML = data
    .map(
      (d, i) =>
        `<li data-i="${i}" style="--swatch:${d.color}"><i></i>${d.cat}</li>`
    )
    .join("");

  const defaultCenter = `<strong>6,000</strong><span>features</span>`;
  const setActive = (i) => {
    const slices = svg.querySelectorAll(".sea-slice");
    const items = legend.querySelectorAll("li");
    slices.forEach((s, j) => s.classList.toggle("is-active", j === i));
    items.forEach((s, j) => s.classList.toggle("is-active", j === i));
    if (i == null) {
      center.innerHTML = defaultCenter;
      center.style.removeProperty("--swatch");
      return;
    }
    const d = data[i];
    const pct = Math.round((d.count / total) * 100);
    center.style.setProperty("--swatch", d.color);
    center.innerHTML = `<strong style="color:${d.color}">${d.count.toLocaleString()}</strong><span>${d.cat} · ${pct}%</span>`;
  };

  const wire = (nodes) => {
    nodes.forEach((node) => {
      const i = Number(node.dataset.i);
      node.addEventListener("pointerenter", () => setActive(i));
      node.addEventListener("click", () => setActive(i));
    });
  };
  wire(svg.querySelectorAll(".sea-slice"));
  wire(legend.querySelectorAll("li"));
  // Reset only when the pointer leaves the whole chart / legend, so moving
  // across the gaps between slices (or into the donut hole) does not flicker.
  svg.addEventListener("pointerleave", () => setActive(null));
  legend.addEventListener("pointerleave", () => setActive(null));
}

function seaResize() {
  if (!seaCanvas || !seaStage || !seaCtx) return;
  const rect = seaStage.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width));
  const h = Math.max(260, Math.round(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  seaCssW = w;
  seaCssH = h;
  seaCanvas.width = Math.round(w * dpr);
  seaCanvas.height = Math.round(h * dpr);
  seaCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const xExtent = d3.extent(features, (row) => row.x);
  const yExtent = d3.extent(features, (row) => row.y);
  const m = seaZoomed ? 64 : 30;
  seaScaleX = d3.scaleLinear().domain(xExtent).range([m, w - m]);
  seaScaleY = d3.scaleLinear().domain(yExtent).range([h - m, m]);
  const rScale = d3
    .scaleSqrt()
    .domain(d3.extent(features, (row) => row.activation_density))
    .range(seaZoomed ? [1.5, 6] : [1.1, 4.4]);

  const storyIndex = new Map(FEATURE_ORDER.map((id, i) => [id, i]));
  seaPoints = features.map((row) => {
    const isStory = storyIndex.has(row.feature_id);
    return {
      row,
      px: seaScaleX(row.x),
      py: seaScaleY(row.y),
      radius: isStory ? (seaZoomed ? 9 : 6.5) : rScale(row.activation_density),
      isStory,
      storyIndex: isStory ? storyIndex.get(row.feature_id) : -1,
      color: isStory
        ? STORY[row.feature_id].color
        : CATEGORY_COLORS.get(row.concept_category) || "#8e8f88",
    };
  });
  seaQuadtree = d3
    .quadtree()
    .x((p) => p.px)
    .y((p) => p.py)
    .addAll(seaPoints);
  seaDraw();
}

function seaDraw() {
  if (!seaCtx) return;
  const ctx = seaCtx;
  const w = seaCssW;
  const h = seaCssH;
  ctx.clearRect(0, 0, w, h);
  const revealing = seaRevealActive;

  for (const p of seaPoints) {
    if (p.isStory) continue;
    ctx.globalAlpha = revealing ? 0.09 : 0.5;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.px, p.py, p.radius, 0, SEA_TAU);
    ctx.fill();
  }

  const now = seaNow();
  for (const p of seaPoints) {
    if (!p.isStory) continue;
    const lit = !revealing || p.storyIndex < seaRevealCount;
    let fade = 1;
    if (revealing && lit && !reduceMotion.matches) {
      const t0 = seaRevealAt[p.storyIndex];
      fade = t0 ? seaEaseOut((now - t0) / SEA_FADE_MS) : 1;
    }
    const rr = revealing && lit ? p.radius * (0.5 + 0.5 * fade) : p.radius;
    ctx.globalAlpha = revealing ? (lit ? fade : 0.12) : 0.92;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.px, p.py, rr, 0, SEA_TAU);
    ctx.fill();
    if (revealing && lit) {
      const pulse = rr + 6 + Math.sin(seaFrame * 0.1 + p.storyIndex) * 2.5;
      ctx.globalAlpha = fade;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.px, p.py, pulse, 0, SEA_TAU);
      ctx.stroke();
      drawSeaExampleLabel(ctx, p, w, h, fade);
    }
  }

  if (seaHoverRow && !revealing) {
    const hp = seaPoints.find((p) => p.row === seaHoverRow);
    if (hp) {
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#080808";
      ctx.beginPath();
      ctx.arc(hp.px, hp.py, Math.max(hp.radius + 4, 7), 0, SEA_TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawSeaExampleLabel(ctx, p, w, h, fade = 1) {
  const story = STORY[p.row.feature_id];
  const text = `${p.storyIndex + 1} · ${story.publicName}`;
  ctx.font = "800 13px Inter, sans-serif";
  const tw = ctx.measureText(text).width;
  const padX = 10;
  const chipH = 25;
  const chipW = tw + padX * 2;
  let cx = p.px + p.radius + 14;
  let cy = p.py - chipH / 2 - (1 - fade) * 7;
  if (cx + chipW > w - 8) cx = p.px - p.radius - 14 - chipW;
  cy = Math.max(6, Math.min(h - chipH - 6, cy));
  ctx.globalAlpha = fade;
  ctx.strokeStyle = story.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.px, p.py);
  ctx.lineTo(cx < p.px ? cx + chipW : cx, cy + chipH / 2);
  ctx.stroke();
  roundRect(ctx, cx, cy, chipW, chipH, 12);
  ctx.fillStyle = story.color;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, cx + padX, cy + chipH / 2 + 0.5);
  ctx.textBaseline = "alphabetic";
}

function seaRequestDraw() {
  if (seaDrawRAF) return;
  seaDrawRAF = requestAnimationFrame(() => {
    seaDrawRAF = 0;
    seaDraw();
  });
}

function seaOnPointerMove(event) {
  if (seaPointerRAF) return;
  seaPointerRAF = requestAnimationFrame(() => {
    seaPointerRAF = 0;
    if (!seaQuadtree) return;
    const rect = seaCanvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const found = seaQuadtree.find(px, py, seaZoomed ? 18 : 14);
    const row = found ? found.row : null;
    if (row !== seaHoverRow) {
      seaHoverRow = row;
      if (row && !seaRevealActive) showSeaInfo(row);
      else hideSeaInfo();
      seaRequestDraw();
    }
  });
}

function showSeaInfo(row) {
  const info = document.querySelector("#sea-info");
  if (!info) return;
  const story = STORY[row.feature_id];
  const cat = row.concept_category || "Other / unclear";
  const color = story ? story.color : CATEGORY_COLORS.get(cat) || "#8e8f88";
  info.style.setProperty("--swatch", color);
  document.querySelector("#sea-info-tag").textContent = story
    ? `Example ${FEATURE_ORDER.indexOf(row.feature_id) + 1}`
    : "Feature";
  document.querySelector("#sea-info-id").textContent = story
    ? `“${story.publicName}”`
    : row.feature_id;
  document.querySelector("#sea-info-cat").textContent = cat;
  document.querySelector("#sea-info-layer").textContent = `layer ${row.layer_number} of 12`;
  document.querySelector("#sea-info-density").textContent = `${seaFormatPct(
    row.activation_density
  )} of text`;
  info.hidden = false;
}

function hideSeaInfo() {
  const info = document.querySelector("#sea-info");
  if (info) info.hidden = true;
}

function seaFormatPct(value) {
  const pct = (value || 0) * 100;
  if (pct === 0) return "0%";
  if (pct < 0.001) return "<0.001%";
  if (pct < 0.1) return `${pct.toFixed(3)}%`;
  return `${pct.toFixed(2)}%`;
}

function toggleSeaZoom(force) {
  seaZoomed = typeof force === "boolean" ? force : !seaZoomed;
  seaStage.classList.toggle("is-zoomed", seaZoomed);
  document.body.classList.toggle("sea-locked", seaZoomed);
  const btn = document.querySelector("#sea-zoom-btn");
  if (btn) btn.setAttribute("aria-pressed", String(seaZoomed));
  hideSeaInfo();
  seaHoverRow = null;
  seaResize();
}

function seaOnKeydown(event) {
  if (event.key === "Escape" && seaZoomed) {
    toggleSeaZoom(false);
    return;
  }
  if ((event.key === "x" || event.key === "X") && (seaInView || seaZoomed)) {
    event.preventDefault();
    if (seaRevealActive) stopSeaReveal();
    else startSeaReveal();
  }
}

function setSeaBanner(reveal) {
  const banner = document.querySelector("#sea-banner");
  if (!banner) return;
  if (reveal) {
    banner.textContent = "Here are the 4 example features we'll walk through.";
    banner.classList.add("is-reveal");
  } else {
    banner.textContent = "Hover any dot to read a feature.";
    banner.classList.remove("is-reveal");
  }
}

function startSeaReveal() {
  if (seaRevealActive) return;
  seaRevealActive = true;
  seaRevealCount = 0;
  seaRevealAt = [];
  seaHoverRow = null;
  hideSeaInfo();
  setSeaBanner(true);
  const prompt = document.querySelector("#sea-prompt");
  if (prompt) {
    prompt.classList.add("is-done");
    prompt.querySelector("span").textContent = "tracing the 4 examples… (X to reset)";
  }
  const step = () => {
    seaRevealAt[seaRevealCount] = seaNow();
    seaRevealCount += 1;
    seaRequestDraw();
    if (seaRevealCount < FEATURE_ORDER.length) {
      seaRevealTimer = window.setTimeout(step, SEA_REVEAL_GAP_MS);
    }
  };
  seaRevealTimer = window.setTimeout(step, SEA_REVEAL_FIRST_MS);
  seaStartAnim();
}

function seaNow() {
  return typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
}

function seaEaseOut(t) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

function stopSeaReveal() {
  seaRevealActive = false;
  seaRevealCount = 0;
  if (seaRevealTimer) {
    clearTimeout(seaRevealTimer);
    seaRevealTimer = 0;
  }
  if (seaAnimRAF) {
    cancelAnimationFrame(seaAnimRAF);
    seaAnimRAF = 0;
  }
  setSeaBanner(false);
  const prompt = document.querySelector("#sea-prompt");
  if (prompt) {
    prompt.classList.remove("is-done");
    prompt.querySelector("span").textContent = "trace the 4 example features";
  }
  seaDraw();
}

function seaStartAnim() {
  if (seaAnimRAF || reduceMotion.matches) {
    seaDraw();
    return;
  }
  const tick = () => {
    seaFrame += 1;
    seaDraw();
    if (seaRevealActive) {
      seaAnimRAF = requestAnimationFrame(tick);
    } else {
      seaAnimRAF = 0;
    }
  };
  seaAnimRAF = requestAnimationFrame(tick);
}

/* =====================================================================
   Zoom-out: rarity (0.038%) + matches (58%) interactive  (section #zoomout)
   ===================================================================== */
const RARE_TOTAL = 2632;     // 1 / 0.00038 ≈ 2632
const RARE_COLS = 56;
const RARE_ROWS = 47;        // 56 * 47 = 2632
const RARE_S = 16;           // world spacing
const MATCH_NO = 58;         // 58% share no words
let rareCanvas = null;
let rareCtx = null;
let rareStage = null;
let rareCssW = 0;
let rareCssH = 0;
let rareDots = [];
let rareLitIndex = 0;
let rarePhase = "rare";
let rareT = 0;
let rareTargetT = 0;
let rareRAF = 0;
let rareMatchProgress = 0;

function rareClamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function setupRarityViz() {
  rareCanvas = document.querySelector("#rare-canvas");
  rareStage = document.querySelector("#rare-stage");
  if (!rareCanvas || !rareStage) return;
  rareCtx = rareCanvas.getContext("2d");
  buildRareField();

  const slider = document.querySelector("#rare-slider");
  if (slider) {
    slider.addEventListener("input", () => {
      rareTargetT = Number(slider.value);
      rareT = rareTargetT;
      rareDraw();
    });
  }

  // Intentionally no wheel-to-zoom: scrolling over this viz must scroll the
  // page, not zoom. Zooming is driven only by the slider below.

  document.querySelector("#rare-next")?.addEventListener("click", rareToMatch);
  document.querySelector("#rare-back")?.addEventListener("click", rareToSea);

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => rareResize()).observe(rareStage);
  } else {
    window.addEventListener("resize", rareResize);
  }

  rareResize();
}

function buildRareField() {
  rareDots = [];
  for (let j = 0; j < RARE_ROWS; j++) {
    for (let i = 0; i < RARE_COLS; i++) {
      rareDots.push({
        wx: (i - (RARE_COLS - 1) / 2) * RARE_S,
        wy: (j - (RARE_ROWS - 1) / 2) * RARE_S,
      });
    }
  }
  rareLitIndex = Math.floor(RARE_ROWS / 2) * RARE_COLS + Math.floor(RARE_COLS / 2);
}

function rareResize() {
  if (!rareCanvas || !rareStage || !rareCtx) return;
  const rect = rareStage.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width));
  const h = Math.max(240, Math.round(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  rareCssW = w;
  rareCssH = h;
  rareCanvas.width = Math.round(w * dpr);
  rareCanvas.height = Math.round(h * dpr);
  rareCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rareDraw();
}

function rareScale(t) {
  const worldW = RARE_COLS * RARE_S;
  const worldH = RARE_ROWS * RARE_S;
  const kOut = Math.min(rareCssW / worldW, rareCssH / worldH) * 0.9;
  const kIn = rareCssW / (2.4 * RARE_S);
  return kIn * Math.pow(kOut / kIn, t);
}

function rareDraw() {
  if (!rareCtx) return;
  const ctx = rareCtx;
  const w = rareCssW;
  const h = rareCssH;
  ctx.clearRect(0, 0, w, h);
  if (rarePhase === "match") {
    rareDrawMatch(ctx, w, h);
    return;
  }

  const cx = w / 2;
  const cy = h / 2;
  const k = rareScale(rareT);
  const lit = rareDots[rareLitIndex];
  let visible = 1; // include lit
  const spacing = k * RARE_S;
  const r = Math.max(1.2, Math.min(4.8, spacing * 0.22));
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#9a9b91";
  for (let idx = 0; idx < rareDots.length; idx++) {
    if (idx === rareLitIndex) continue;
    const d = rareDots[idx];
    const sx = cx + (d.wx - lit.wx) * k;
    const sy = cy + (d.wy - lit.wy) * k;
    if (sx < -6 || sx > w + 6 || sy < -6 || sy > h + 6) continue;
    visible++;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const litR = Math.max(3.5, Math.min(34, k * 0.5));
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#ff4057";
  ctx.beginPath();
  ctx.arc(cx, cy, litR * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ff4057";
  ctx.beginPath();
  ctx.arc(cx, cy, litR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  rareUpdateReadout(visible);
}

function rareUpdateReadout(visible) {
  const atEnd = rareT >= 0.985;
  const atStart = rareT <= 0.04;
  const N = atEnd ? RARE_TOTAL : Math.max(1, visible);
  const numEl = document.querySelector("#rare-number");
  const capEl = document.querySelector("#rare-caption");
  const prompt = document.querySelector("#rare-prompt");
  const next = document.querySelector("#rare-next");
  if (numEl) {
    numEl.textContent = atEnd ? "0.038%" : atStart ? "1" : `1 in ${N.toLocaleString()}`;
  }
  if (capEl) {
    capEl.textContent = atEnd
      ? "of all text triggers this feature — about 1 in 2,632"
      : atStart
        ? "feature is active here"
        : "pieces of text trigger this feature";
  }
  if (prompt) prompt.style.opacity = rareT > 0.04 ? "0" : "1";
  if (next) next.hidden = !atEnd;
}

function rareAnimateZoom() {
  if (rareRAF) return;
  const slider = document.querySelector("#rare-slider");
  const step = () => {
    const diff = rareTargetT - rareT;
    if (Math.abs(diff) < 0.002) {
      rareT = rareTargetT;
      if (slider) slider.value = String(rareT);
      rareDraw();
      rareRAF = 0;
      return;
    }
    rareT += diff * 0.2;
    if (slider) slider.value = String(rareT);
    rareDraw();
    rareRAF = requestAnimationFrame(step);
  };
  rareRAF = requestAnimationFrame(step);
}

function rareToMatch() {
  rarePhase = "match";
  rareMatchProgress = 0;
  document.querySelector("#rare-zoomrow")?.setAttribute("hidden", "");
  document.querySelector("#rare-next")?.setAttribute("hidden", "");
  document.querySelector("#rare-back")?.removeAttribute("hidden");
  document.querySelector("#rare-legend")?.removeAttribute("hidden");
  const prompt = document.querySelector("#rare-prompt");
  if (prompt) prompt.style.opacity = "0";
  if (reduceMotion.matches) {
    rareMatchProgress = 1;
    rareDraw();
    return;
  }
  if (rareRAF) cancelAnimationFrame(rareRAF);
  const step = () => {
    rareMatchProgress = Math.min(1, rareMatchProgress + 0.018);
    rareDraw();
    if (rareMatchProgress < 1) rareRAF = requestAnimationFrame(step);
    else rareRAF = 0;
  };
  rareRAF = requestAnimationFrame(step);
}

function rareToSea() {
  rarePhase = "rare";
  document.querySelector("#rare-zoomrow")?.removeAttribute("hidden");
  document.querySelector("#rare-back")?.setAttribute("hidden", "");
  document.querySelector("#rare-legend")?.setAttribute("hidden", "");
  rareTargetT = 1;
  rareT = 1;
  const slider = document.querySelector("#rare-slider");
  if (slider) slider.value = "1";
  rareDraw();
}

function rareDrawMatch(ctx, w, h) {
  const cols = 10;
  const rows = 10;
  const total = cols * rows;
  const cell = Math.min(w / (cols + 2.5), h / (rows + 2.5));
  const gridW = cols * cell;
  const gridH = rows * cell;
  const ox = (w - gridW) / 2 + cell / 2;
  const oy = (h - gridH) / 2 + cell / 2;
  const r = cell * 0.3;
  for (let idx = 0; idx < total; idx++) {
    const i = idx % cols;
    const j = Math.floor(idx / cols);
    const sx = ox + i * cell;
    const sy = oy + j * cell;
    const isNoMatch = idx < MATCH_NO;
    const appear = rareClamp01(rareMatchProgress * 1.5 - idx / total);
    ctx.globalAlpha = 0.08 + 0.92 * appear;
    ctx.fillStyle = isNoMatch ? "#ff4057" : "#12a878";
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const shown = Math.round(MATCH_NO * rareClamp01(rareMatchProgress));
  const numEl = document.querySelector("#rare-number");
  const capEl = document.querySelector("#rare-caption");
  if (numEl) numEl.textContent = `${shown}%`;
  if (capEl) {
    capEl.textContent =
      "of features share no words between their label and the text that lit them up — a match is not enough";
  }
}
