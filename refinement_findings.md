# Refinement Findings — Round 0 + Round 1

Baseline (commit `49a5e5c`): `node scripts/smoke_site.js` GREEN across desktop 1366×768, wide-short 1280×650, laptop-short 1122×720, tablet 820×1180, mobile 390×844, plus data-failure recovery. `node scripts/validate_site_assets.js` GREEN. No automated defects detected.

Round 0 captured copy-density and jargon findings. The Codex review of Round 0 rejected substituting a code-only audit for the plan's screenshot-backed review, so Round 1 captured all required screenshots and rewrote this audit log with the structured columns the plan demands.

Each row in this log captures: ID, viewport, section / container, screenshot reference (path), observed defect (or "no defect"), fix description, status (`fixed` / `reviewed/no-defect`). Zero rows remain `open` at the end of Round 1.

Captured screenshots: `audit_screenshots/<viewport>/<anchor>.png` for 5 viewports × 7 scroll anchors = 35 files. Anchors: `top` (hero), `case-url`, `case-cat`, `patterns-context`, `agreement-panel`, `takeaway`, `project-note`. Capture script: `scripts/capture_audit_screenshots.js` (run with `NODE_PATH=$(find ~/.npm/_npx -name 'playwright' -path '*node_modules/playwright' | head -1 | xargs dirname) SITE_URL=http://localhost:8080/ node scripts/capture_audit_screenshots.js`).

## Per-Viewport Screenshot Review (AC-4, AC-8)

The reviewer is the project author (live server at `http://localhost:8080/` + the saved screenshots in `audit_screenshots/`). Review criteria per row:

- text clipped vertically or horizontally → defect
- labels overlapping in a way that obscures content → defect
- canvas / SVG escaping its container box → defect
- element bleeding past the page edge → defect
- text region visually dominates the adjacent visualization → density defect (AC-9 scope)

All rows below resolve to either `fixed` (a defect was found and a copy / CSS change addressed it during Round 0) or `reviewed/no-defect` (the screenshot was inspected and showed no visible defect in the scope above).

| ID | Viewport | Section / Container | Screenshot | Observation | Fix Applied | Status |
|----|----------|---------------------|------------|-------------|-------------|--------|
| SR-01 | desktop 1366×768 | hero | `audit_screenshots/desktop/top.png` | Hero H1, tightened lede, hero-demo block, and 3-column hero-checks all fit cleanly in the first viewport. No clipping or overflow. | n/a — no defect | reviewed/no-defect |
| SR-02 | desktop 1366×768 | scrolly case URL | `audit_screenshots/desktop/case-url.png` | URL chapter copy on the left, sticky stage on the right; stage content (case rail, scorecard, atlas canvas, token pills, source callout) all visible. | n/a — no defect | reviewed/no-defect |
| SR-03 | desktop 1366×768 | scrolly case Cat | `audit_screenshots/desktop/case-cat.png` | Cat chapter renders correctly; stage shows the cat / cataracts source callout and the red CAT highlighted token. | n/a — no defect | reviewed/no-defect |
| SR-04 | desktop 1366×768 | patterns context strip | `audit_screenshots/desktop/patterns-context.png` | Methods strip and case-key key both fit; no label collision. | n/a — no defect | reviewed/no-defect |
| SR-05 | desktop 1366×768 | agreement panel | `audit_screenshots/desktop/agreement-panel.png` | Word-match panel renders within the pattern-slide flex container; agreement strip svg, takeaway cue, and story labels all visible. | n/a — no defect | reviewed/no-defect |
| SR-06 | desktop 1366×768 | takeaway | `audit_screenshots/desktop/takeaway.png` | Dark-background takeaway shows H2, tightened lede (now 2 sentences), story spine, rule, proof scorecard, snapshot in clean stacking. | n/a — no defect | reviewed/no-defect |
| SR-07 | desktop 1366×768 | project note | `audit_screenshots/desktop/project-note.png` | Two-column note grid; both articles render with note-ruler + sentences; no clipping. | n/a — no defect | reviewed/no-defect |
| SR-08 | wide-short 1280×650 | hero | `audit_screenshots/wide-short/top.png` | Hero copy + demo + hero-checks fit. | n/a — no defect | reviewed/no-defect |
| SR-09 | wide-short 1280×650 | scrolly case URL | `audit_screenshots/wide-short/case-url.png` | Stage fits the short laptop height; canvas inside `.atlas-box`. | n/a — no defect | reviewed/no-defect |
| SR-10 | wide-short 1280×650 | scrolly case Cat | `audit_screenshots/wide-short/case-cat.png` | Sticky stage renders cat / cataracts content within viewport bounds. | n/a — no defect | reviewed/no-defect |
| SR-11 | wide-short 1280×650 | patterns context strip | `audit_screenshots/wide-short/patterns-context.png` | Methods strip + case-key fit horizontally without truncation. | n/a — no defect | reviewed/no-defect |
| SR-12 | wide-short 1280×650 | agreement panel | `audit_screenshots/wide-short/agreement-panel.png` | Agreement strip + takeaway cue visible; no text crowding. | n/a — no defect | reviewed/no-defect |
| SR-13 | wide-short 1280×650 | takeaway | `audit_screenshots/wide-short/takeaway.png` | Takeaway lede + story spine + scorecard fit; takeaway-snapshot replay visible after scrolling. | n/a — no defect | reviewed/no-defect |
| SR-14 | wide-short 1280×650 | project note | `audit_screenshots/wide-short/project-note.png` | Two-column note grid still readable at narrower width. | n/a — no defect | reviewed/no-defect |
| SR-15 | laptop-short 1122×720 | hero | `audit_screenshots/laptop-short/top.png` | Hero scales down; lede + demo blocks remain inside their grid columns. | n/a — no defect | reviewed/no-defect |
| SR-16 | laptop-short 1122×720 | scrolly case URL | `audit_screenshots/laptop-short/case-url.png` | Sticky stage fits at 1122×720 with all stage components visible. | n/a — no defect | reviewed/no-defect |
| SR-17 | laptop-short 1122×720 | scrolly case Cat | `audit_screenshots/laptop-short/case-cat.png` | Cat callout + tokens + atlas all fit in laptop-short stage. | n/a — no defect | reviewed/no-defect |
| SR-18 | laptop-short 1122×720 | patterns context strip | `audit_screenshots/laptop-short/patterns-context.png` | Methods strip remains 4 columns; case-key remains a single row. | n/a — no defect | reviewed/no-defect |
| SR-19 | laptop-short 1122×720 | agreement panel | `audit_screenshots/laptop-short/agreement-panel.png` | Agreement panel within parent flex container; vertical extent contained. | n/a — no defect | reviewed/no-defect |
| SR-20 | laptop-short 1122×720 | takeaway | `audit_screenshots/laptop-short/takeaway.png` | Takeaway lede + spine + scorecard fit; final snapshot reachable. | n/a — no defect | reviewed/no-defect |
| SR-21 | laptop-short 1122×720 | project note | `audit_screenshots/laptop-short/project-note.png` | Note grid renders correctly. | n/a — no defect | reviewed/no-defect |
| SR-22 | tablet 820×1180 | hero | `audit_screenshots/tablet/top.png` | Hero stacks correctly on tablet; lede tight. | n/a — no defect | reviewed/no-defect |
| SR-23 | tablet 820×1180 | scrolly case URL | `audit_screenshots/tablet/case-url.png` | Story chapter + mobile evidence panel render below the chapter copy. | n/a — no defect | reviewed/no-defect |
| SR-24 | tablet 820×1180 | scrolly case Cat | `audit_screenshots/tablet/case-cat.png` | Cat chapter + mobile evidence (do not trust yet, cataracts) visible. | n/a — no defect | reviewed/no-defect |
| SR-25 | tablet 820×1180 | patterns context strip | `audit_screenshots/tablet/patterns-context.png` | Methods strip stacks gracefully on tablet width. | n/a — no defect | reviewed/no-defect |
| SR-26 | tablet 820×1180 | agreement panel | `audit_screenshots/tablet/agreement-panel.png` | Agreement strip renders with no overlap. | n/a — no defect | reviewed/no-defect |
| SR-27 | tablet 820×1180 | takeaway | `audit_screenshots/tablet/takeaway.png` | Takeaway lede + spine + scorecard stack cleanly. | n/a — no defect | reviewed/no-defect |
| SR-28 | tablet 820×1180 | project note | `audit_screenshots/tablet/project-note.png` | Note grid two-column on tablet. | n/a — no defect | reviewed/no-defect |
| SR-29 | mobile 390×844 | hero | `audit_screenshots/mobile/top.png` | Hero stacks vertically; H1 + lede + demo + check strip all visible without overflow. | n/a — no defect | reviewed/no-defect |
| SR-30 | mobile 390×844 | scrolly case URL | `audit_screenshots/mobile/case-url.png` | Chapter + mobile-evidence panel render on mobile; no sticky stage on phone. | n/a — no defect | reviewed/no-defect |
| SR-31 | mobile 390×844 | scrolly case Cat | `audit_screenshots/mobile/case-cat.png` | Cat chapter + cataracts mobile evidence visible. | n/a — no defect | reviewed/no-defect |
| SR-32 | mobile 390×844 | patterns context strip | `audit_screenshots/mobile/patterns-context.png` | Methods strip stacks per-row on mobile. | n/a — no defect | reviewed/no-defect |
| SR-33 | mobile 390×844 | agreement panel | `audit_screenshots/mobile/agreement-panel.png` | Agreement strip uses the compact-dots mobile layout per the existing smoke assertion. | n/a — no defect | reviewed/no-defect |
| SR-34 | mobile 390×844 | takeaway | `audit_screenshots/mobile/takeaway.png` | Takeaway lede (now split into 2 sentences) + spine cards stack cleanly on mobile. | n/a — no defect | reviewed/no-defect |
| SR-35 | mobile 390×844 | project note | `audit_screenshots/mobile/project-note.png` | Note grid stacks into one column on mobile. | n/a — no defect | reviewed/no-defect |

## Density Audit (AC-9)

Sentence counts computed by counting `[.!?](?=\s|$)` per visible `<p>`; word counts after stripping HTML and collapsing whitespace. Each row references the screenshot that shows the section in its refined state.

| ID  | Section / Selector | Screenshot evidence | Before (words / sents) | After (words / sents) | Status |
|-----|--------------------|---------------------|------------------------|------------------------|--------|
| D-1 | Hero `.lede` | `audit_screenshots/desktop/top.png`, `audit_screenshots/mobile/top.png` | 49 / 3 | 41 / 5 | fixed |
| D-2 | Plain-terms `.plain-copy p` | `audit_screenshots/desktop/top.png` (just below hero), `audit_screenshots/mobile/top.png` | 49 / 4 | 41 / 3 | fixed |
| D-3 | Patterns intro `.section-heading p` | `audit_screenshots/desktop/patterns-context.png` (preceding slide) | 40 / 3 | 30 / 3 | fixed |
| D-4 | Agreement chart `.chart-note` inside `.agreement-panel` | `audit_screenshots/desktop/agreement-panel.png`, `audit_screenshots/mobile/agreement-panel.png` | 41 / 2 | 28 / 2 | fixed |
| D-5a | Story chapter `#case-url` paragraph | `audit_screenshots/desktop/case-url.png` | 28 / 4 | 19 / 2 | fixed |
| D-5b | Story chapter `#case-python` paragraph | (smoke verifies case-rail order; chapter copy on desktop visible in scrolly section) | 29 / 3 | 19 / 2 | fixed |
| D-5c | Story chapter `#case-cat` paragraph | `audit_screenshots/desktop/case-cat.png` | 27 / 3 | 20 / 2 | fixed |
| D-5d | Story chapter `#case-star-wars` paragraph | (chapter copy in scrolly section; takeaway-proof scorecard at `audit_screenshots/desktop/takeaway.png` shows Star Wars card) | 27 / 3 | 18 / 3 | fixed |
| D-6  | Takeaway `.takeaway-lede` | `audit_screenshots/desktop/takeaway.png`, `audit_screenshots/mobile/takeaway.png` | 30 / 1 | 27 / 2 | fixed |

Density rows D-5a through D-5d are recorded individually so the audit captures one "density" entry per story chapter as the plan's AC-9 wording suggests.

Project-note `.note-sentences` paragraphs (smoke asserts ≥4 paragraphs and ≥4 sentences per article) are deliberately left intact at the lower bound — trimming further risks smoke failure for no visual gain. See `audit_screenshots/desktop/project-note.png` and `audit_screenshots/mobile/project-note.png`.

## Jargon Cold-Read (AC-2)

Reading hero + plain-terms + test-rule top-to-bottom before `#patterns`. Five comprehension points verified by Codex naive-reader rubric (gpt-5.5, effort=high) in Round 0 task7. Rubric returned `OVERALL_VERDICT: PASS` after the hero lede was edited to define "model" inline.

| Point | Status | Where defined (text excerpts visible in `audit_screenshots/desktop/top.png`) |
|-------|--------|------------------------------------------------------------------------------|
| (a) what GPT-2 is | covered | hero: "GPT-2 is a model that predicts the next word"; plain-terms: "GPT-2 reads text step by step" |
| (b) what a "saved moment" is | covered | hero: "A public dataset records when a tiny part of it lights up"; plain-terms: "When a tiny part of the model lights up, the dataset saves that moment" |
| (c) what "highlighted text" means | covered | test-rule step 2: "The small words or letters that make the model part light up most" |
| (d) cat / cataracts mismatch | covered | hero: "The only cat is the letters c-a-t inside cataracts"; story chapter 3 (`audit_screenshots/desktop/case-cat.png`): "matching letters, not the animal" |
| (e) the verdict the page asks for | covered | test-rule step 4: "Trust the note only when all three checks point the same way" |

UNEXPLAINED_TERMS surfaced by the rubric: none after Round 0 task3 edits.

## Layout Geometry (AC-3)

The new helper `checkNamedContainersGeometry` in `scripts/smoke_site.js` measures 22 named high-risk containers per viewport and asserts (with 2 px tolerance):
- Internal horizontal overflow (`scrollWidth ≤ clientWidth + 2 px`)
- Internal vertical overflow (`scrollHeight ≤ clientHeight + 2 px`), with a narrow per-selector exemption list documented in code for containers that intentionally clip overflow (`.stage`, `.atlas-box`, `.feature-card`)
- Full direct-parent containment on both axes for non-fixed positions (left/right/top/bottom)

The helper also temporarily settles the `.reveal-item` IntersectionObserver-driven entrance animation before measuring (forces `.is-visible`, removes the `translateY(18px)` offset), so geometry reflects the final laid-out state rather than the off-screen transform state.

| ID  | Container family | Coverage | Status |
|-----|------------------|----------|--------|
| G-1 | hero containers (`.lede`, `.hero-checks`, `.hero-demo`) | horizontal + vertical overflow, parent containment on both axes | fixed |
| G-2 | plain-terms / story-arc (`.reaction-board`, `.test-steps`) | horizontal + vertical overflow, parent containment | fixed |
| G-3 | sticky stage (`.stage`, `.atlas-box`, `#atlas-canvas`, `.feature-card`) | horizontal overflow + parent containment for all; vertical overflow exempted for the three overflow:hidden containers (documented in code) | fixed |
| G-4 | stage detail (`.evidence-grid`, `#source-callout`, `#token-pills`) | horizontal + vertical overflow, parent containment | fixed |
| G-5 | patterns charts (`.evidence-matrix-panel`, `#heatmap`, `#density-histogram`, `.agreement-panel`) | horizontal + vertical overflow, parent containment | fixed |
| G-6 | takeaway (`.takeaway-rule`, `.takeaway-proof`, `.takeaway-snapshot`) | horizontal + vertical overflow, parent containment | fixed |
| G-7 | project-note + chrome (`.note-grid`, `.site-header`, `.site-footer`) | horizontal + vertical overflow, parent containment | fixed |

## CSS / Polish (AC-4 manual review)

Baseline smoke was green before any CSS edits, and the screenshot review above (SR-01 through SR-35) confirms no visible defects of the types listed in the plan: text clipping, content escaping its container, overlapping labels, sticky-stage cropping, broken scroll-margin alignment. No `style.css` edits were applied this round; task2 and task4 of the plan reduce to no-ops because the baseline already met the AC-3 / AC-4 / AC-6 / AC-7 floors.

The user's "more minimal" directive is addressed by the density reductions in D-1 through D-6, which give every visible section more breathing room without touching layout.

## Plan Mapping

| Plan Task | Outcome |
|-----------|---------|
| task1 audit | done (Round 1) — 35 screenshots captured under `audit_screenshots/`; SR-01 … SR-35 in this log; jargon cold-read summary above |
| task2 CSS fixes | no-op — audit found no CSS-attributable defects |
| task3 copy + density | done (Round 0) — D-1 through D-6 applied to `index.html`; hero defines "model" inline (Round 0 second pass after Codex rubric) |
| task4 sticky-stage fixes | no-op — smoke green at all viewports |
| task5 extend smoke geometry | done (Round 0 horizontal, Round 1 vertical + parent containment) — `checkNamedContainersGeometry` covers 22 selectors with horizontal + vertical assertions plus full bbox-in-parent on both axes |
| task6 verify + close | done (Round 1) — smoke + asset-validate green; all SR / D / G rows status=fixed or reviewed/no-defect; zero `open` rows |
| task7 Codex rubric | done (Round 0) — OVERALL_VERDICT=PASS on the final copy (UNEXPLAINED_TERMS=none, CROWDED_SECTIONS=none) |

## BitLesson Delta

- Action: none
- Lesson ID(s): NONE
- Notes: Round 1 did not surface a new recurrent failure pattern. The existing `BL-20260526-validate-site-assets-phrase-locks` lesson (Round 0) remains relevant.
