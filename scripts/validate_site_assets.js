const fs = require("fs");
const path = require("path");

const FULL_DATA = "data/processed/features_resjb.json";
const SITE_DATA = "data/processed/features_site.json";
const EXAMPLES = "data/processed/feature_examples.json";
const INDEX = "index.html";
const MAIN = "main.js";
const STYLE = "style.css";
const SMOKE = "scripts/smoke_site.js";

const REQUIRED_FIELDS = [
  "feature_id",
  "layer_number",
  "activation_density",
  "concept_category",
  "x",
  "y",
  "agreement_score",
];

const STORY_IDS = [
  "gpt2-small/4-res-jb/14801",
  "gpt2-small/7-res-jb/6592",
  "gpt2-small/7-res-jb/24310",
  "gpt2-small/11-res-jb/14962",
];

const LOCAL_ASSETS = [
  "style.css",
  "vendor/d3.v7.min.js",
  "main.js",
  "scripts/smoke_site.js",
  "data/processed/features_site.json",
  "data/processed/feature_examples.json",
];

const BANNED_COPY = [
  "A label is not an explanation",
  "hidden signal",
  "internal signal",
  "public label",
  "name pattern",
  "measured pattern",
  "student",
  "word-piece",
  "word pieces",
  "input/output",
  "chunks",
  "GPT-2 can see",
  "A label for GPT-2",
  "The evidence says",
  "One reaction. Three checks.",
  "recorded reaction",
  "Text pieces",
  "text pieces",
  "Source check",
  "What to notice",
  "Strongest source example",
  "A GPT-2 guess",
  "short guess",
  "Dataset guess",
  "One response. Three checks.",
  "text clues",
  "saved behavior",
  "saved behaviors",
  "behavior records",
  "Chart focus",
  "Atlas probe",
];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fullRows = readJson(FULL_DATA);
const siteRows = readJson(SITE_DATA);
const examples = readJson(EXAMPLES);
const indexHtml = fs.readFileSync(INDEX, "utf8");
const indexText = indexHtml.toLowerCase();
const mainJs = fs.readFileSync(MAIN, "utf8");
const styleCss = fs.readFileSync(STYLE, "utf8");
const smokeJs = fs.readFileSync(SMOKE, "utf8");

function getAttributeValues(html, attribute) {
  const values = [];
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|[\\s<])${escapedAttribute}\\s*=\\s*["']([^"']+)["']`, "gi");
  let match = pattern.exec(html);

  while (match) {
    values.push(match[1]);
    match = pattern.exec(html);
  }

  return values;
}

function getIds(html) {
  return getAttributeValues(html, "id");
}

function isExternalLink(value) {
  return /^(https?:|mailto:|tel:)/i.test(value);
}

function isDataUrl(value) {
  return /^data:/i.test(value);
}

function assertLocalFileExists(assetPath) {
  assert(!path.isAbsolute(assetPath), `Local asset should use a relative path: ${assetPath}`);
  assert(fs.existsSync(assetPath), `Missing local asset: ${assetPath}`);
  assert(fs.statSync(assetPath).isFile(), `Local asset is not a file: ${assetPath}`);
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countSentences(value) {
  return (value.match(/[.!?](?=\s|$)/g) || []).length;
}

function getProjectNoteAnswers(html) {
  const section = html.match(/<section id="project-note"[\s\S]*?<\/section>/i)?.[0] || "";
  const answers = [];
  const articlePattern = /<article>[\s\S]*?<\/article>/gi;
  let articleMatch = articlePattern.exec(section);

  while (articleMatch) {
    const sentences = [];
    const paragraphPattern = /<p>([\s\S]*?)<\/p>/gi;
    let paragraphMatch = paragraphPattern.exec(articleMatch[0]);
    while (paragraphMatch) {
      sentences.push(stripTags(paragraphMatch[1]));
      paragraphMatch = paragraphPattern.exec(articleMatch[0]);
    }
    answers.push(sentences);
    articleMatch = articlePattern.exec(section);
  }

  return answers;
}

assert(Array.isArray(fullRows) && fullRows.length >= 100, "Full dataset must have at least 100 rows.");
assert(Array.isArray(siteRows) && siteRows.length === fullRows.length, "Compact dataset must match full row count.");
assert(siteRows.length === 6000, "Website dataset should contain 6,000 rows.");
assert(fs.statSync(SITE_DATA).size < 1_300_000, "Compact website dataset should stay under 1.3 MB.");

const siteIds = new Set(siteRows.map((row) => row.feature_id));
const exampleIds = new Set(examples.map((row) => row.feature_id));

for (const id of STORY_IDS) {
  assert(siteIds.has(id), `Missing story feature in compact dataset: ${id}`);
  assert(exampleIds.has(id), `Missing story feature example: ${id}`);
}

for (const row of siteRows) {
  for (const field of REQUIRED_FIELDS) {
    assert(Object.hasOwn(row, field), `Missing compact field ${field} on ${row.feature_id}`);
  }
  assert(Number.isFinite(Number(row.layer_number)), `Invalid layer number on ${row.feature_id}`);
  assert(Number.isFinite(Number(row.activation_density)), `Invalid appearance rate on ${row.feature_id}`);
  assert(Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)), `Invalid atlas coordinates on ${row.feature_id}`);
  assert(Number.isFinite(Number(row.agreement_score)), `Invalid agreement score on ${row.feature_id}`);
  assert(!Object.hasOwn(row, "explanation"), `Compact row should not include raw explanation text: ${row.feature_id}`);
  assert(!Object.hasOwn(row, "top_positive_logits"), `Compact row should not include raw text-piece strings: ${row.feature_id}`);
  assert(!Object.hasOwn(row, "neuronpedia_url"), `Compact row should reconstruct source URLs instead of storing them: ${row.feature_id}`);
}

assert(indexHtml.includes("vendor/d3.v7.min.js"), "index.html should load vendored D3.");
assert(indexHtml.includes("https://www.neuronpedia.org/"), "index.html should link to Neuronpedia.");
assert(indexHtml.includes("neuronpedia-datasets.s3.us-east-1.amazonaws.com"), "index.html should link to the public dataset exports.");
assert(indexHtml.includes("The page loads only 7 needed fields so the charts stay fast"), "Dataset scope note should disclose the compact browser view in plain language.");
assert(indexHtml.includes('When an LLM reads a sentence, what is it "thinking" about?'), "Hero headline should pose the LLM-thinking framing directly.");
assert(indexHtml.includes('sparse autoencoder') && indexHtml.includes('So what is a "feature,"'), "Page should introduce sparse autoencoders and the feature concept before the test rule.");
assert(indexHtml.includes('class="sae-gallery"') && (indexHtml.match(/class="sae-mismatch"/g) || []).length >= 1, "SAE intro should include the gallery and a mismatch teaser card.");
assert(indexHtml.includes('How to read the 6,000-feature dot map') && indexHtml.includes('id="atlas-intro-svg"'), "Atlas intro section should teach how to read the dot map before the story chapters.");
assert(indexHtml.indexOf('class="sae-intro"') < indexHtml.indexOf('id="test"') && indexHtml.indexOf('class="atlas-intro"') < indexHtml.indexOf('id="story"'), "SAE intro and atlas intro should appear before the test-rule + story sections.");
assert(indexHtml.includes('auto-generated label') && indexHtml.includes("patients after a cataracts procedure") && indexHtml.includes("letters c-a-t inside cataracts"), "Hero lede should explain the auto-generated label + cat/cataracts mismatch in plain language.");
assert(indexHtml.includes("What is this page checking?"), "index.html should include the plain-language setup slide.");
assert(indexText.includes("gpt-2 reads text step by step") && indexText.includes('label, like "cats,"'), "index.html should define the auto-generated feature label for no-prior viewers.");
assert(indexHtml.includes('<a href="#story">Story</a>'), "Header Story link should land on the scrollytelling examples.");
assert(indexHtml.includes("The story arc"), "index.html should preview the and-but-therefore story arc.");
assert(indexHtml.includes("<span>And</span>") && indexHtml.includes("<span>But</span>") && indexHtml.includes("<span>Therefore</span>"), "index.html should include explicit and-but-therefore structure.");
assert(indexHtml.includes("Dot map: where this saved moment sits") && indexHtml.includes("The colored path connects the four examples") && indexHtml.includes("Nearby dots give context, not proof."), "Dot-map caption should explain the story path and caveat map proximity without crowding the panel.");
assert(indexHtml.includes("Read each chart as support for the rule") && indexHtml.includes("not proof that GPT-2 understands those topics"), "Dataset section should explain what chart and atlas support can and cannot prove.");
assert(indexHtml.includes("not proof that GPT-2 understands those topics"), "Atlas screen-reader summary should avoid overstating map proximity.");
assert(indexHtml.includes("thin line") && indexHtml.includes("links the four scroll examples"), "Atlas screen-reader summary should explain the four-example path.");
assert(indexHtml.includes('id="atlas-canvas"') && indexHtml.includes('tabindex="0"'), "Atlas canvas should be keyboard focusable.");
assert(indexHtml.includes('class="scroll-meter"'), "Header should include a lightweight scroll progress meter.");
assert(indexHtml.includes('id="data-status"') && indexHtml.includes('data-state="loading"'), "Page should expose local data loading status.");
assert(styleCss.includes('.data-status[data-state="error"]') && styleCss.includes("pointer-events: auto") && smokeJs.includes("checkDataFailureRecovery"), "Local data load failures should show a visible recovery message and be smoke-tested.");
assert(indexHtml.includes("How these numbers are made"), "Dataset findings should include a compact methods strip.");
assert(indexHtml.includes('class="reader-path"') && indexHtml.includes("Read this section in three passes."), "Broader chart section should give no-prior readers a reading path.");
assert((indexHtml.match(/class="pattern-slide/g) || []).length >= 4 && styleCss.includes(".pattern-slide"), "Broader chart section should be paced as scroll slides, not a dense dashboard.");
assert(indexHtml.includes('class="pattern-slide pattern-slide-charts"') && styleCss.includes(".pattern-slide-charts"), "Topic and rarity charts should get their own scroll slide instead of sharing the method slide.");
assert(indexHtml.includes("Dot map") && indexHtml.includes("similar labels"), "Methods strip should explain how dot-map positions are made in plain language.");
assert(indexHtml.includes("Treat a match as a warning sign, not the answer."), "Word-match method should be caveated in plain language.");
assert(indexHtml.includes('id="evidence-matrix"'), "Bigger-picture section should include the four-example matrix.");
assert(indexHtml.includes("One red cell is enough") || mainJs.includes("One red cell is enough"), "Four-example matrix should state the visual rule clearly.");
assert(indexHtml.includes("Tap, hover, or focus a colored mark to trace one example"), "Bigger-picture interactions should be discoverable without extra controls.");
assert(indexHtml.includes('class="agreement-takeaway"') && indexHtml.includes("A word match is not enough."), "Agreement chart should state the key interpretation before the stacked bar.");
assert(indexHtml.includes("Four-example support behind the takeaway"), "Takeaway should include a final four-example scorecard.");
assert(indexHtml.includes('style="--case-color: #ff4057"') && styleCss.includes(".takeaway-proof div::before"), "Takeaway support cards should visually reuse the story example colors.");
assert(indexHtml.includes('class="takeaway-lede"'), "Takeaway should explain why the visualization supports the rule near the headline.");
assert(indexHtml.includes("The URL label passes, Python and Star Wars need context, and the cat"), "Takeaway should explain why the rule follows from the examples.");
assert(indexHtml.includes("Which words or letters light up"), "Final takeaway rule should describe highlighted text in no-prior language.");
assert(indexHtml.includes('class="takeaway-snapshot"') && indexHtml.includes("c-a-t inside cataracts") && indexHtml.includes("eye surgery, not pets"), "Final takeaway should replay the concrete cat/cataracts evidence.");
assert(indexHtml.indexOf('id="takeaway"') < indexHtml.indexOf('id="project-note"'), "Takeaway should land the story before the assignment design note.");
assert(styleCss.includes(".takeaway-snapshot") && styleCss.includes(".takeaway-snapshot mark"), "style.css should style the final evidence replay.");
assert(styleCss.includes("@media (max-height: 700px)") && styleCss.includes(".takeaway-snapshot > div"), "Short laptop takeaway should compress enough to keep the final check replay visible.");
assert(styleCss.includes("@media (max-width: 720px)") && styleCss.includes("#patterns") && styleCss.includes("scroll-margin-top: 108px"), "Mobile anchor offsets should account for the taller stacked header.");
assert(indexHtml.includes('id="token-guide"') && indexHtml.includes('class="token-legend"'), "Stage detail card should explain highlighted-text color encoding.");
assert(indexHtml.includes('id="source-callout"') && indexHtml.includes("Read this sentence"), "Stage detail card should include a visible full-sentence reading cue.");
assert(indexHtml.includes('aria-label="Highlighted-text labels"') && mainJs.includes('role", "listitem"'), "Highlighted-text pills should be accessible as a labeled list.");
assert(indexHtml.includes('id="example-count"') && mainJs.includes("Full sentence example") && mainJs.includes("of ${activationWindows.length} saved"), "Stage detail card should disclose that the shown example is the full sentence example.");
assert(mainJs.includes("sourceCheck") && mainJs.includes("cat appears inside cataracts") && mainJs.includes("eye-surgery"), "Story examples should include plain-language full-sentence checks.");
assert(styleCss.includes(".token-legend") && styleCss.includes('.token-legend span[data-evidence="misleading"]'), "style.css should style the text-piece color key.");
assert(styleCss.includes(".source-callout"), "style.css should style the source-example reading cue.");
assert(indexHtml.includes("color-coded highlighted text") && indexHtml.includes("four-example matrix") && indexHtml.includes("dot map"), "Project note should describe the current visualization set.");
assert(indexHtml.includes("After the four examples, the detail view shows the label, highlight, sentence, and decision"), "Mobile stage should include a transition note before the detail panel.");
assert((indexHtml.match(/class="mobile-evidence"/g) || []).length === 4, "Each story example should include a mobile evidence panel.");
assert(styleCss.includes(".project-note h2") && styleCss.includes("font-size: clamp(2.2rem, 4.1vw, 4.4rem)"), "Project note heading should stay visually secondary to the main story and takeaway.");
assert(indexHtml.includes('role="link" aria-label="Jump to the cat example"'), "Sticky stage example rail should expose accessible jump targets.");
assert(mainJs.includes('const DATA_URL = "data/processed/features_site.json";'), "main.js should load the compact site dataset.");
assert(mainJs.includes("function neuronpediaUrl("), "main.js should reconstruct Neuronpedia source URLs from feature IDs.");
assert(mainJs.includes("function setupAtlasInteraction()"), "main.js should include the atlas probe interaction.");
assert(mainJs.includes("function handleAtlasKeydown("), "main.js should include keyboard atlas probing.");
assert(mainJs.includes("function drawAtlasStoryPath(") && mainJs.includes("function getAtlasStoryPath("), "Atlas should draw an annotated path through the four scroll examples.");
assert(mainJs.includes("scrollToFeatureCase(row.feature_id);"), "Atlas keyboard selection should jump to the selected example on Enter or Space.");
assert(/d3\s*\.\s*quadtree\(\)/.test(mainJs) && mainJs.includes("atlasBase.quadtree?.find"), "Atlas probe should use a spatial index instead of scanning every point on pointer move.");
assert(mainJs.includes("stackedStory") && mainJs.includes('"(max-width: 1120px)"'), "Scrollytelling should use stacked-layout chapter selection on tablet and phone.");
assert(mainJs.includes("function renderEvidenceMatrix()"), "main.js should render the four-example matrix.");
assert(mainJs.includes("function setupPatternScrollFocus()") && mainJs.includes("PATTERN_SCROLL_FOCUS"), "Dataset charts should update the chart-focus explanation while readers scroll.");
assert(styleCss.includes(".pattern-scroll-target.is-scroll-focus"), "style.css should visually emphasize the chart currently being explained.");
assert(styleCss.includes(".pattern-focus") && styleCss.includes("position: sticky") && styleCss.includes("top: 70px"), "Chart-focus explanation should stay visible while laptop readers scroll through dataset charts.");
assert(styleCss.includes("scroll-margin-top: 172px"), "Dataset chart blocks should reserve jump-scroll space below the sticky chart-focus explanation.");
assert(mainJs.includes("storyCategories") && mainJs.includes("Largest + story topics."), "Compact heatmap should keep mobile rows readable by showing top and story topics.");
assert(indexHtml.includes("L0-L11 are GPT-2 steps") && indexHtml.includes("Darker means a larger share of that step") && styleCss.includes(".layer-icon"), "Heatmap reading guide should explain GPT-2 step columns for no-prior viewers.");
assert(mainJs.includes("agreement-story-label") && mainJs.includes("Colored dots mark the four scroll examples."), "Agreement chart should separate story-example labels from segment percentages.");
assert(mainJs.includes("story-hit-target") && styleCss.includes(".story-hit-target"), "Story marks should have larger pointer hit targets for touch interaction.");
assert(mainJs.includes("function classifyTextPiece("), "main.js should classify text-piece pills as evidence.");
assert(mainJs.includes("TOKEN_EVIDENCE_PRIORITY"), "main.js should prioritize meaningful text-piece evidence in the compact stage.");
assert(mainJs.includes("function setupScrollProgress()"), "main.js should update the scroll progress meter.");
assert(mainJs.includes("function setupRevealMotion()"), "main.js should add section reveal motion.");
assert(mainJs.includes("case-switch") && styleCss.includes("@keyframes stage-scan"), "Sticky stage should animate example changes without adding controls.");
assert(mainJs.includes("function setupStageCaseRail()") && mainJs.includes('".case-rail [data-feature-id]"'), "Sticky stage example rail should support click and keyboard jumps.");
assert(mainJs.includes("function setDataStatus("), "main.js should update the local data loading status.");
assert(mainJs.includes('{ id: "project-note", href: "#takeaway" }'), "Project note should stay grouped with the final takeaway, after the story has landed.");
assert(mainJs.includes("showHeatmapTip(event.currentTarget, row);"), "Heatmap cells should reveal their explanation on keyboard focus.");
assert(mainJs.includes("showHistogramTip(barGroup, event.currentTarget, bin);"), "Histogram bins should reveal their explanation on keyboard focus.");
assert(mainJs.includes("Darker means a larger share") && mainJs.includes("Left is rarer; right is more common.") && mainJs.includes("Warning, not enough."), "Chart tooltips should include plain-language interpretation, not just raw numbers.");
assert(mainJs.includes('warning, not enough') && mainJs.includes('.attr("role", "img")'), "Agreement chart segments should be keyboard-readable with an interpretive label.");
assert(!indexHtml.includes("cdn.jsdelivr"), "index.html should not depend on a CDN for D3.");

for (const asset of LOCAL_ASSETS) {
  assertLocalFileExists(asset);
}

const ids = getIds(indexHtml);
const uniqueIds = new Set(ids);
assert(ids.length === uniqueIds.size, "index.html should not contain duplicate IDs.");

for (const href of getAttributeValues(indexHtml, "href")) {
  if (href === "#" || isExternalLink(href) || isDataUrl(href)) continue;
  if (href.startsWith("#")) {
    const targetId = decodeURIComponent(href.slice(1));
    assert(uniqueIds.has(targetId), `Broken internal link target: ${href}`);
    continue;
  }

  assertLocalFileExists(href);
}

for (const src of getAttributeValues(indexHtml, "src")) {
  if (isExternalLink(src) || isDataUrl(src)) continue;
  assertLocalFileExists(src);
}

for (const attribute of ["aria-describedby", "aria-labelledby", "aria-controls"]) {
  for (const value of getAttributeValues(indexHtml, attribute)) {
    for (const id of value.trim().split(/\s+/)) {
      assert(uniqueIds.has(id), `Broken ${attribute} reference: ${id}`);
    }
  }
}

for (const phrase of BANNED_COPY) {
  const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  assert(!pattern.test(indexHtml), `Confusing old copy remains in index.html: "${phrase}"`);
  assert(!pattern.test(mainJs), `Confusing old copy remains in main.js: "${phrase}"`);
}

const projectNoteAnswers = getProjectNoteAnswers(indexHtml);
assert(projectNoteAnswers.length === 2, "Project note should answer the two prototype writeup questions.");
for (const [index, sentences] of projectNoteAnswers.entries()) {
  assert(sentences.length >= 4, `Project note answer ${index + 1} should be split into at least 4 readable rows.`);
  assert(sentences.reduce((total, sentence) => total + countSentences(sentence), 0) >= 4, `Project note answer ${index + 1} should have at least 4 sentences.`);
}

assert(/\.stage\b/.test(styleCss), "style.css should include sticky stage styles.");
assert(/#top,\s*[\s\S]*#story,/.test(styleCss), "Top anchor should leave room for the sticky header.");
assert(/max-height:\s*calc\(100vh/.test(styleCss), "Sticky stage should be capped to the viewport.");
assert(styleCss.includes("#heatmap rect[tabindex]:focus-visible"), "Heatmap cells should show a visible keyboard focus ring.");
assert(styleCss.includes("#density-histogram rect[tabindex]:focus-visible"), "Histogram bins should show a visible keyboard focus ring.");
assert(styleCss.includes(".scroll-meter"), "style.css should style the scroll progress meter.");
assert(styleCss.includes(".reader-path"), "style.css should style the broader-section reading path.");
assert(styleCss.includes("#evidence-matrix"), "style.css should size the evidence matrix.");
assert(styleCss.includes('.token-pill[data-evidence="misleading"]'), "style.css should color misleading text-piece pills.");
assert(styleCss.includes(".case-dot::before") && styleCss.includes(".case-dot::after"), "Chart legend should reserve space for the two story-example dots.");
assert(styleCss.includes(".mobile-stage-note"), "style.css should style the mobile stage transition note.");
assert(styleCss.includes(".case-rail li:focus-visible") && styleCss.includes("cursor: pointer"), "Sticky stage example rail should look and behave interactive.");
assert(styleCss.includes(".pattern-hint"), "style.css should style the chart interaction hint.");
assert(styleCss.includes(".agreement-takeaway"), "style.css should style the agreement interpretation note.");
assert(styleCss.includes(".motion-ready .reveal-item"), "style.css should include scroll reveal styles.");
assert(styleCss.includes("@keyframes token-peak-pulse") && styleCss.includes(".hot-token.peak"), "Peak source tokens should have a subtle visual pulse.");
assert(styleCss.includes(".note-sentences"), "style.css should style the project-note answer rows.");
assert(/\.case-key a\[data-feature-id\]:focus-visible[\s\S]*outline:\s*3px solid var\(--cyan\)/.test(styleCss), "Example-key links should keep a visible keyboard focus outline.");
assert(styleCss.includes("--score-color: var(--amber)") && styleCss.includes("--score-color: var(--red)"), "Evidence meters should use score-matched colors.");
assert(!styleCss.includes("border-radius: 10px"), "Card-like panels should keep border radius at 8px or less.");
assert(!styleCss.includes("radial-gradient"), "The page should avoid decorative gradient-orb backgrounds.");

console.log(`Validated ${siteRows.length.toLocaleString()} website rows, ${examples.length} examples, local assets, links, ARIA wiring, and prototype writeup sentences.`);
