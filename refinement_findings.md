# Refinement Findings — Round 0

Baseline (commit `49a5e5c`): `node scripts/smoke_site.js` GREEN across desktop 1366×768, wide-short 1280×650, laptop-short 1122×720, tablet 820×1180, mobile 390×844, plus data-failure recovery. `node scripts/validate_site_assets.js` GREEN. No automated defects detected.

Per user direction, this round skips slow Playwright screenshot capture. Audit is code-driven: paragraph word/sentence counts, jargon cold-read of hero/plain-terms/test-rule, and grep of `style.css` for risky CSS rules (`overflow: hidden`, fixed heights, sticky-stage constraints). The local server runs at `http://localhost:8080/` for direct browser inspection by the user.

## Density Audit (AC-9)

Sentences computed by counting `[.!?](?=\s|$)` per visible `<p>`; word counts after stripping HTML and collapsing whitespace.

| ID  | Section / Selector | Before (words / sents) | Target (words / sents) | Status |
|-----|--------------------|------------------------|------------------------|--------|
| D-1 | Hero `.lede` | 49 / 3 | ~40 / 2 | fixed |
| D-2 | Plain-terms `.plain-copy p` | 49 / 4 | ~40 / 3 | fixed |
| D-3 | Patterns intro `.section-heading p` | 40 / 3 | ~29 / 3 | fixed |
| D-4 | Agreement chart `.chart-note` | 41 / 2 | ~29 / 2 | fixed |
| D-5 | Story chapter intros (URL/Python/Cat/Star Wars) | 27–29 / 2–4 each | 18–20 / 2–3 each | fixed |
| D-6 | Takeaway `.takeaway-lede` | 30 / 1 | ~28 / 4 (rhythm-split) | fixed |

Each fix preserves every smoke-asserted phrase: hero `.lede` keeps `short note "cats."`, `patients after a cataracts procedure`, `letters c-a-t inside cataracts`; plain-terms keeps `gpt-2 reads text step by step`; all others are non-asserted intro/description copy.

Project-note `.note-sentences` paragraphs (smoke asserts ≥4 paragraphs and ≥4 sentences per article) are deliberately left intact at the lower bound — trimming further risks smoke failure for no visual gain.

## Jargon Cold-Read (AC-2)

Reading hero + plain-terms + test-rule top-to-bottom before `#patterns`. Five comprehension points:

| Point | Status | Where defined |
|-------|--------|---------------|
| (a) what GPT-2 is | covered | hero: "GPT-2 reads text and predicts the next word" (after D-1); plain-terms: "GPT-2 reads text step by step" |
| (b) what a "saved moment" is | covered | hero + plain-terms: "tiny part of the model lights up while reading text" |
| (c) what "highlighted text" means | covered | test-rule step 2: "small words or letters that make the model part light up most" |
| (d) cat / cataracts mismatch | covered | hero: "letters c-a-t inside cataracts"; story chapter 3: "matching letters inside a word, not the animal" |
| (e) the verdict the page asks for | covered | test-rule step 4: "Trust the note only when all three checks point the same way" |

Unexplained-jargon list: none in hero / plain-terms / test-rule after D-1/D-2/D-5 edits. Words like "Researchers", "sentence", "dataset" remain but are common-vocabulary terms not requiring inline definition.

## Layout Geometry (AC-3, AC-4)

Baseline smoke is GREEN, so all existing geometry assertions pass. Risk grep of `style.css` surfaces nothing requiring a fix:

- `.lede` has no fixed height; tightening copy reduces risk further.
- `.atlas-box` has explicit `max-height: calc(100vh - 82px)` and the canvas inherits sized dimensions; smoke `canvasFits` is already green.
- `#token-pills` is a flex-wrap container — no overflow risk; geometry assertion will verify.
- `.note-grid` is a CSS grid with stretchable rows; no clipping.
- `.takeaway-snapshot` smoke covers content phrases; bbox stays inside `.takeaway`.

No standalone CSS fixes are needed for this round (task2 and task4 effectively no-ops). The new geometry assertions added in task5 lock the current behavior so future edits cannot regress it.

## CSS / Polish (AC-4 manual review)

The baseline already meets the white/black futuristic vibe and the user-listed defect classes (text cut in half, image getting out of box) are not present per smoke. The user's "more minimal" directive is addressed by D-1 through D-6 density reductions, which give every section more breathing room without touching layout.

## Plan Mapping

| Plan Task | Outcome This Round |
|-----------|--------------------|
| task1 audit | done — baseline green; findings captured here |
| task2 CSS fixes | no-op — audit found no CSS-attributable defects |
| task3 copy + density | done — D-1 through D-6 applied to `index.html` |
| task4 sticky-stage fixes | no-op — smoke green at all viewports |
| task5 extend smoke geometry | done — geometry assertions added to `scripts/smoke_site.js` for named containers |
| task6 verify + close | done — re-run smoke + asset-validate green; all rows above status=fixed |
| task7 Codex rubric | done — see `round-0-summary.md` for rubric output |

## BitLesson Delta

- Action: none
- Lesson ID(s): NONE
- Notes: First round; no recurrent failure pattern surfaced yet.
