# Refine KnowUrLLM Website for Beginner Readability, Frontend Polish, and Minimal Density

## Goal Description
Refine the existing KnowUrLLM site — a mature DSC 106 final-project interactive explainable about whether a short dataset note attached to a saved GPT-2 moment can be trusted — along three axes without regressing existing behavior:

1. **Beginner readability**: a DSC 106 student with no AI background can read the page top-to-bottom and answer five comprehension questions about what the page is checking.
2. **Frontend polish**: zero visible defects (text clipping, content escaping its container, overlapping labels, sticky-stage cropping, broken scroll-margin alignment) at the five viewports already exercised by `scripts/smoke_site.js`.
3. **Minimal density**: visualizations and keyword labels carry meaning wherever feasible; prose is concise and uncrowded; no section presents a wall of text that competes with its visualization for the reader's attention.

The refinement preserves the current narrative (cat/cataracts hook, URL → Python → Cat → Star Wars case order), the existing visualization set (dot-map atlas canvas, evidence matrix, topic heatmap, rarity histogram, agreement strip, takeaway scorecard), and every existing smoke assertion. No new visualizations, no new local libraries, no GitHub push, no video work.

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Existing Playwright smoke and asset-validation harnesses pass after the refinement.
  - Positive Tests (expected to PASS):
    - `node scripts/smoke_site.js` exits 0 across desktop 1366×768, wide-short 1280×650, laptop-short 1122×720, tablet 820×1180, and mobile 390×844, plus the data-failure recovery scenario.
    - `node scripts/validate_site_assets.js` exits 0 against the unmodified `data/processed/features_site.json` and `data/processed/feature_examples.json`.
  - Negative Tests (expected to FAIL):
    - Introducing a visible `<input>`, `<select>`, `<textarea>`, or `<button>` anywhere in the page causes smoke to fail the "Expected no visible form controls" assertion.
    - Breaking the `features_site.json` field expectations causes `validate_site_assets.js` to exit non-zero.

- AC-2: Beginner-comprehension contract — the page defines five concepts in plain language before the first chart appears.
  - Positive Tests (expected to PASS):
    - Hero, plain-terms, and test-rule sections (read top-to-bottom and ending before `#patterns`) each contain a sentence that, in plain English with no unexplained jargon, defines or names: (a) what GPT-2 is in one line; (b) what a "saved moment" is; (c) what "highlighted text" means; (d) what the cat / cataracts mismatch is concretely; (e) what verdict the page is asking the reader to make.
    - The Codex naive-reader rubric (task7) returns explicit YES for all five comprehension points and lists no unexplained terms.
  - Negative Tests (expected to FAIL):
    - Replacing "saved moment" copy with terms like "sparse autoencoder feature activation" without an inline plain-language definition causes the Codex rubric (task7) to flag the unexplained term and return NO.
    - Removing the plain-terms section so that no plain-language definition of "GPT-2 reading text" appears before `#patterns` causes the rubric to return NO for (a) and (b).

- AC-3: No visible defects in the named high-risk containers at any tested viewport (automated geometry).
  - Containers in scope for automated geometry: `.lede`, `.hero-checks`, `.hero-demo`, `.reaction-board`, `.test-steps`, `.stage`, `.atlas-box`, `#atlas-canvas`, `.feature-card`, `.evidence-grid`, `#source-callout`, `#token-pills`, `.evidence-matrix-panel`, `#heatmap`, `#density-histogram`, `.agreement-panel`, `.takeaway-rule`, `.takeaway-proof`, `.takeaway-snapshot`, `.note-grid`, `.site-header`, `.site-footer`.
  - Positive Tests (expected to PASS):
    - For each named container, smoke asserts `scrollWidth ≤ clientWidth + 2px` and `scrollHeight ≤ clientHeight + 2px` (no internal overflow), and the bounding box stays inside its direct parent within a 2 px tolerance.
    - Existing horizontal-overflow checks (`documentWidth - viewportWidth ≤ 2`) still pass at all five viewports and after scrolling to `#case-cat`, `.pattern-slide-context`, and `#takeaway`.
  - Negative Tests (expected to FAIL):
    - A CSS change that pins `.lede` to a fixed height and causes its second line to be clipped fails the new `.lede` overflow assertion.
    - A change that allows `#atlas-canvas` to render wider than `.atlas-box` fails the canvas-in-container assertion.
    - A header overlap regression that pushes a section heading under the sticky `.site-header` fails existing nav-alignment assertions.

- AC-4: No visible defects across the whole page on manual screenshot review at three viewports.
  - Positive Tests (expected to PASS):
    - Captured screenshots from task1 at desktop (1366×768), laptop-short (1122×720), and mobile (390×844) at scroll positions covering hero, sticky scrolly midway, patterns midway, takeaway, and project-note show: no clipped text lines, no labels visibly overlapping in a way that obscures content, no canvas/SVG escaping its container box, no element bleeding past the page edge.
    - `refinement_findings.md` lists every defect observed in the audit and the resolution applied for each.
  - Negative Tests (expected to FAIL):
    - A captured screenshot where the `.note-grid` text spills over the `.project-note` background fails manual review.
    - A `refinement_findings.md` that omits a defect visible in a captured screenshot fails AC-4 (the audit must be complete).

- AC-5: Narrative anchors preserved.
  - Positive Tests (expected to PASS):
    - Smoke confirms hero H1 remains 'The note says "cats." The sentence says "cataracts."'.
    - Case-rail order remains URL → Python → Cat → Star Wars; case anchors `#case-url`, `#case-python`, `#case-cat`, `#case-star-wars` still resolve.
    - And / But / Therefore story arc is intact in `.arc-grid`.
  - Negative Tests (expected to FAIL):
    - Reordering cases so Cat is first fails the smoke `case-rail` order assertion and the "URL works → Python partial → Cat misleads → Star Wars needs backup" key.
    - Renaming the hero hook to a non-cat / cataracts headline fails smoke.

- AC-6: Accessibility floors hold.
  - Positive Tests (expected to PASS):
    - Mobile evidence-panel verdict contrast ratio remains ≥ 7.
    - Keyboard interactions remain functional on `#atlas-canvas` (arrow keys cycle the four story cases; Enter jumps), `.case-rail` items, `#heatmap` focusable cells, `#density-histogram` focusable bins, and `#agreement-strip` focusable segments.
    - The skip link "Skip to main content" is the first Tab target and becomes visible on focus.
  - Negative Tests (expected to FAIL):
    - Reducing mobile verdict text to a lighter gray that drops contrast below 7 fails smoke contrast assertions.
    - Removing the focus outline on `.case-key [data-feature-id]` fails the case-key outline assertion.

- AC-7: Sticky-stage fit at short desktop heights.
  - Positive Tests (expected to PASS):
    - At 1280×650 and 1122×720, the `.stage` bounding box height and bottom remain inside the viewport for all four story cases; `#atlas-canvas` stays inside `.atlas-box`.
    - On desktop / laptop with `≥ 1200×760`, both `#heatmap` and `#density-histogram` fit in the first chart viewport when `.pattern-grid` is scrolled to the top.
  - Negative Tests (expected to FAIL):
    - Adding vertical padding inside `.stage` that pushes the canvas past the viewport fails the smoke `stageFits` / `canvasFits` checks for that viewport.

- AC-8: Local audit artifact documents every defect found and resolved.
  - Positive Tests (expected to PASS):
    - `refinement_findings.md` exists at the repo root after task1 and is updated through task6. Each entry includes: viewport, section / container, screenshot reference (path), defect description, fix description, status (`open` / `fixed`).
    - Final state of the file contains zero entries with status `open`.
  - Negative Tests (expected to FAIL):
    - Closing the work with `refinement_findings.md` still listing one or more `open` entries fails AC-8.
    - Submitting fixes without a corresponding audit entry (no record of what defect the change addresses) fails AC-8.

- AC-9: Minimal text density — the refined page reads as visualization-led, not text-led, in every section.
  - Positive Tests (expected to PASS):
    - For each visible section block (hero, plain-terms, story-arc, thesis, test-rule, each scrolly chapter, patterns sub-slides, takeaway, project-note), the body text region (combined visible `<p>` content excluding headings, eyebrows, and item labels) is either ≤ 4 short sentences or is broken into compact stacked items (labels, key-fact rows, visualization callouts).
    - At desktop (1366×768), laptop-short (1122×720), and mobile (390×844), each section's visualization (or visualization-equivalent: scorecard, key-fact strip, structured rule grid) occupies at least roughly half of the section's on-screen area when the section is the focused viewport — text never visually dominates its visualization.
    - At least three sections show a measurable reduction in prose density compared to the pre-refinement baseline (fewer sentences, shorter paragraphs, or dense prose converted to keyword / label / visualization callouts). The reductions are recorded in `refinement_findings.md` under a "density" category with before / after sentence counts.
  - Negative Tests (expected to FAIL):
    - A section that reverts to a single body paragraph of 60+ words fails AC-9.
    - A section where text crowds out its visualization (visualization region collapses below roughly one-third of the section's on-screen area while prose fills the rest) fails AC-9.
    - Closing the work without any "density" entry in `refinement_findings.md` fails AC-9 (some measurable thinning is required, since this is a refinement, not preservation).

> **Note on AC-9 thresholds**: The "4 sentences", "roughly half", "60 words", and "roughly one-third" figures are directional guardrails for manual review, not hard numerical contracts. They exist to give the reviewer a falsifiable target; minor breaches are acceptable when the section clearly remains visualization-led and uncrowded.

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
A reproducible multi-viewport audit captures screenshots at desktop, wide-short, laptop-short, tablet, and mobile across hero, scrolly story (each of the four cases), patterns midway, takeaway, and project-note. Every defect — clipping, overflow, label collision, sticky-stage cropping, canvas escaping its box, weak focus outline, awkward wrapping, crowded prose — is logged in `refinement_findings.md` with a screenshot reference and resolved in `style.css`, `index.html`, or minimally in `main.js`. Beginner-readability copy is tightened in the hero, plain-terms, test-rule, and any section flagged by the Codex rubric: jargon is replaced with inline plain-language definitions; over-long sentences are split or pruned. Visualization-led minimalism is applied: dense prose is converted to keyword chips, labeled key-fact rows, or visualization callouts where the visualization can carry the meaning. `scripts/smoke_site.js` is extended with geometry-based assertions for the named high-risk containers (overflow, in-container, no horizontal overflow), all with a 1–2 px tolerance.

### Lower Bound (Minimum Acceptable Scope)
A focused audit identifies every defect visible at the five tested viewports in the named high-risk containers; each is fixed; `refinement_findings.md` exists and lists each defect with its fix and at least one "density" entry recording a prose reduction. Existing `node scripts/smoke_site.js` and `node scripts/validate_site_assets.js` still pass. Beginner-readability rewrites cover at minimum the sections where the Codex rubric (task7) flags an unexplained term or an unanswered comprehension point. At least three sections show measurable density reduction (sentence count or paragraph length). No regression of contrast, keyboard interactions, narrative order, or sticky-stage fit.

### Allowed Choices
- Can use: edits to `style.css`, `index.html`, and `main.js`; new geometry-based assertions added to `scripts/smoke_site.js`; inline plain-language definitions in prose; conversion of dense prose into structured keyword / label / callout markup that the existing `style.css` design language already supports (eyebrow + strong + small patterns, finding strips, method strips, takeaway rule grids); new local files only for the audit artifact (`refinement_findings.md`) and audit screenshots.
- Cannot use: visible HTML form controls (`<input>`, `<select>`, `<textarea>`, `<button>`); tooltip-only definitions where inline copy would do (inline plain-language is the user-confirmed default); new external dependencies, CDN scripts, or libraries beyond the vendored D3 in `vendor/d3.v7.min.js`; structural narrative changes that replace the cat / cataracts hook or reorder the four story cases; removal of any of the existing visualizations (atlas canvas, evidence matrix, heatmap, histogram, agreement strip, takeaway scorecard); force-pushing or pushing upstream; video work; visual direction outside the existing white / black futuristic vibe.

> **Note on Deterministic Designs**: The draft constraints (white / black futuristic, no form controls, no chatty prose, beginner audience, preserve existing visualizations) and the existing smoke harness fix substantial parts of the design space. Where the smoke harness asserts specific copy or geometry today, that behavior is locked: changes must preserve those assertions.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
1. Bring the site up locally with `python3 -m http.server 8000` and confirm the baseline by running `node scripts/smoke_site.js` and `node scripts/validate_site_assets.js`. Both must be green before any edits.
2. Capture screenshots through Playwright at the five viewports, scrolled to: top (hero), `#case-url`, `#case-cat`, `.pattern-slide-context`, `.agreement-panel`, `#takeaway`, `#project-note`. Save them under `audit_screenshots/<viewport>/<scroll-anchor>.png` and reference them from `refinement_findings.md` rows.
3. For each captured frame, walk the named high-risk containers and look for: line clipping (text whose bottom is cut by `overflow: hidden`), bounding-box escape (canvas wider than `.atlas-box`, `.feature-card` content overflowing its border), label collision (heatmap tick labels overlapping, agreement story labels overlapping each other, source callout strong text wrapping awkwardly), sticky cropping (`.stage` rendering past viewport bottom at short heights), and density signals (paragraphs longer than ~40 words; sections where text region is visibly larger than the adjacent visualization).
4. Read the hero + plain-terms + test-rule sections cold as a naive reader. List every term that requires prior knowledge. Tighten in place: GPT-2 → "a text-prediction model trained to guess the next word"; "saved moment" → already defined, keep; "highlighted text" → already defined; "trust the note" → make explicit that the page is asking the reader to render a verdict.
5. For each dense-prose row in the audit, decide whether to: prune to fewer sentences, split into a labeled key-fact strip in the existing style (eyebrow + strong + small), or move meaning into the adjacent visualization label. Prefer in-place restructuring over removal; never remove a smoke-tested phrase.
6. Fix CSS in `style.css` first (lowest-risk class of edits). Use precise selectors so changes do not cascade. Re-run smoke after each non-trivial change.
7. Fix copy in `index.html` next. Preserve the smoke-tested phrases (those checked in `getBaseState`): hero H1, `.lede`, `dataScopeItems` count, `.method-strip` keywords, `.takeaway-snapshot` phrases, etc.
8. Only touch `main.js` if a defect requires it (e.g. a label-collision in a D3 chart that needs a layout tweak). Avoid rewriting; prefer minimal, targeted patches.
9. After fixes settle, add geometry assertions to `scripts/smoke_site.js`. Add them in a new helper alongside `getBaseState` that reports per-container bounding boxes; assert `scrollWidth ≤ clientWidth + tolerance` and bbox-in-parent with a 2 px tolerance. Run the harness on all five viewports.
10. Pass the final rendered `index.html` (or a copy with computed copy snippets) into the Codex rubric and resolve any flagged comprehension gap with inline copy.

### Relevant References
- `index.html` — top-level page structure; primary copy edits and density restructuring land here.
- `style.css` — primary container, sticky-stage, and responsive rules.
- `main.js` — D3 chart layout and interaction code; touch only if a defect requires it.
- `scripts/smoke_site.js` — Playwright smoke harness; extension target for new geometry assertions.
- `scripts/validate_site_assets.js` — asset wiring validator; must keep passing.
- `data/processed/features_site.json` — 6,000-row, 7-field compact dataset (read-only for this refinement).
- `data/processed/feature_examples.json` — four-source-example payload used by the scrolly stage (read-only).
- `vendor/d3.v7.min.js` — local D3; do not replace or upgrade.
- `README.md` — current explorable overview; useful for verifying narrative anchors are preserved.

## Dependencies and Sequence

### Milestones
1. Audit Milestone: produce a verified baseline and a complete defect inventory.
   - Phase A: Run `node scripts/smoke_site.js` and `node scripts/validate_site_assets.js` on the unmodified repo; confirm green baseline.
   - Phase B: Capture viewport screenshots at the scroll anchors listed in Feasibility Hints; populate `refinement_findings.md` rows for layout / clipping / overflow defects.
   - Phase C: Read hero / plain-terms / test-rule cold; list unexplained terms.
   - Phase D: Density sweep — for every section block, record sentence count, longest paragraph word count, and a "density" flag if either exceeds the AC-9 guardrails; capture each flagged row in `refinement_findings.md`.

2. Fix Milestone: apply CSS, copy, and minimal JS fixes that resolve each audit entry.
   - Phase A: CSS layout fixes for clipping / overflow / bounding-box escape in named containers (`style.css`).
   - Phase B: Copy tightening, inline plain-language definitions where the cold read flagged jargon, and density-reduction edits where the density sweep flagged a section (`index.html`).
   - Phase C: Sticky-stage and canvas-fit fixes, including `main.js` patches only if CSS cannot resolve the defect.

3. Verification Milestone: assert the new shape and confirm beginner comprehension.
   - Phase A: Extend `scripts/smoke_site.js` with geometry-based assertions for the named high-risk containers, with 1–2 px tolerance, written against the post-fix layout.
   - Phase B: Re-run `node scripts/smoke_site.js` and `node scripts/validate_site_assets.js`; iterate any failure back into the Fix Milestone until both are clean.
   - Phase C: Manual screenshot review at desktop, laptop-short, and mobile against the captured frames; close every open row in `refinement_findings.md`, including density rows (with before / after sentence counts recorded).
   - Phase D: Codex naive-reader rubric (5-question form aligned to AC-2) on the final copy.

Dependencies:
- The Fix Milestone depends on the Audit Milestone's defect inventory.
- The Verification Milestone's geometry-assertion phase depends on the Fix Milestone settling, because the assertions encode the final post-fix shape.
- The Verification Milestone's comprehension-rubric phase depends on the earlier verification phases closing first (the final copy must be stable before comprehension critique).

## Task Breakdown

Each task includes exactly one routing tag: `coding` (Claude) or `analyze` (Codex via `/humanize:ask-codex`).

| Task ID | Description | Target AC | Tag | Depends On |
|---------|-------------|-----------|-----|------------|
| task1 | Start local server; run smoke and asset-validation baselines green; capture audit screenshots at the listed scroll anchors across all five viewports; populate `refinement_findings.md` with one row per observed defect (viewport, container / section, screenshot path, description, status=`open`); add a "jargon" section listing unexplained terms found in a cold read of hero / plain-terms / test-rule; add a "density" section recording per-section sentence counts and flagged sections. | AC-4, AC-8, AC-9 | coding | - |
| task2 | Apply CSS layout fixes to `style.css` that resolve clipping, internal overflow, bounding-box escape, and bad responsive wrapping for each open row attributable to layout. Update `refinement_findings.md` row status as items move to `fixed`. | AC-3, AC-4 | coding | task1 |
| task3 | Apply copy tightenings, inline plain-language definitions, and density-reduction edits in `index.html`. Hero + plain-terms + test-rule must satisfy the five comprehension points (AC-2). At least three flagged sections must show a measurable prose reduction (sentences split, paragraphs shortened, prose moved into structured keyword / label / callout markup). Preserve every smoke-asserted phrase (hero H1, `.lede` mismatch wording, dataset-scope items, methods strip, takeaway snapshot, mobile evidence text). | AC-2, AC-9 | coding | task1 |
| task4 | Apply sticky-stage and canvas-fit fixes; touch `main.js` only when CSS cannot resolve the defect. Keep all existing keyboard interactions intact. | AC-6, AC-7 | coding | task2 |
| task5 | Extend `scripts/smoke_site.js` with geometry-based assertions (overflow, in-container, 1–2 px tolerance) for the named high-risk containers listed in AC-3. Add the assertions in a helper alongside `getBaseState`. | AC-3 | coding | task2, task4 |
| task6 | Re-run `node scripts/smoke_site.js` and `node scripts/validate_site_assets.js`; iterate against task2 – task5 until both are clean. Perform manual screenshot review at desktop / laptop-short / mobile, including a density check (each section's text region does not visually dominate its visualization). Close every row in `refinement_findings.md` (no `open` status remaining), with before / after counts on density rows. | AC-1, AC-4, AC-8, AC-9 | coding | task2, task3, task4, task5 |
| task7 | Codex naive-reader rubric on the final copy: feed the relevant `index.html` excerpts and request explicit YES / NO answers for the five AC-2 comprehension points plus a list of any unexplained terms and an opinion on whether any section feels text-crowded. Fail and loop back to task3 if any answer is NO or if Codex flags a crowded section. | AC-2, AC-9 | analyze | task6 |

## Claude-Codex Deliberation

### Agreements
- Audit-then-patch is the right approach for a mature site; speculative CSS edits would risk smoke regressions.
- Existing `scripts/smoke_site.js` and `scripts/validate_site_assets.js` must remain green throughout.
- The cat / cataracts hook, the URL → Python → Cat → Star Wars case order, and the existing visualization set are core narrative constraints — locked.
- Contrast (≥ 7), keyboard interactions (atlas, case-rail, heatmap, histogram, agreement-strip), and the "no visible form controls" rule are locked floors.
- Geometry assertions belong after fixes settle, not in parallel with them, so the assertions reflect the final risk shape.
- The audit artifact is a local file (`refinement_findings.md`), not a PR body (the draft forbids upstream push).
- Inline plain-language definitions are the default jargon-clarity mechanism.

### Resolved Disagreements
- AC-2 (originally subjective): tightened from "naive student can name what the page is checking" into a concrete five-point comprehension contract verified by a Codex rubric (task7). Rationale: subjective ACs do not converge.
- AC-3 / AC-4 (originally one over-promising AC): split into automated geometry checks for a named container list and manual screenshot review across the whole page. Rationale: smoke cannot prove "zero visible defects" without brittle visual diffing; pairing geometry with manual review is realistic.
- Container coverage (originally missed `.project-note`, header, footer): expanded to include them since the draft scope is the whole current site.
- task5 ordering (originally depending only on task1): now depends on task2 + task4 so assertions are written against the post-fix layout. Rationale: pre-fix assertions would encode the wrong shape.
- AC-8 wording (originally "PR body or refinement_findings.md"): changed to local-artifact-only. Rationale: the draft forbids pushing upstream, so no PR path exists.
- Jargon clarity mechanism (originally an "optional tooltip"): replaced with inline definitions by default (user-confirmed in DEC-1). Rationale: tooltips add interaction surface and a keyboard-trap risk that conflicts with the no-form-controls floor; inline copy is more reliable for a beginner audience.
- Defect scope (DEC-2): whole-page manual review with geometry assertions on the named containers (user-confirmed). Rationale: balances coverage with test maintainability.
- task7 form (DEC-3): structured five-question rubric (user-confirmed). Rationale: structured pass / fail is more convergent than free critique.

### Convergence Status
- Final Status: `converged`
- Rounds executed: 2 (Codex first-pass plus 2 review rounds; round 2 returned "None — plan can converge"). After convergence, the user added a third refinement axis (minimal density). Because the addition is additive — reinforcing an existing draft constraint ("no chatty prose; do not flood the whole screen") — and does not contradict the v2 structure, AC-9 and the related task / path-boundary updates were folded into the converged plan without re-running Codex rounds.

## Pending User Decisions

All decisions have been resolved during plan generation. No `PENDING` items remain.

- DEC-1: Jargon clarity mechanism.
  - Claude Position: Inline plain-language definitions by default; avoid tooltips because they add interaction surface and conflict with the no-form-controls floor.
  - Codex Position: Inline preferred over tooltips for a beginner-facing page.
  - Tradeoff Summary: Tooltips give compact prose but introduce keyboard-trap risk and a new interaction primitive; inline definitions are simpler and easier to verify with a comprehension rubric.
  - Decision Status: User selected "Inline definitions only".

- DEC-2: Defect-scope coverage.
  - Claude Position: Whole-page manual review; geometry assertions only on the named high-risk containers.
  - Codex Position: Same — manual review is appropriate for full-page coverage; geometry should target the highest-risk containers to avoid brittle assertions.
  - Tradeoff Summary: Whole-page geometry checks would be most thorough but slow and brittle; whole-page manual review plus targeted geometry strikes the right balance.
  - Decision Status: User selected "Whole page manual review; geometry assertions on named containers".

- DEC-3: task7 form.
  - Claude Position: Structured five-question rubric aligned to AC-2.
  - Codex Position: Structured rubric — AC-2 already names five concrete comprehension points, so the rubric is the natural form.
  - Tradeoff Summary: Free critique yields nuance but no convergent pass / fail; structured rubric gives a deterministic verification signal.
  - Decision Status: User selected "Structured 5-question rubric matching AC-2".

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific workflow markers such as "AC-", "Milestone", "Phase", "task1", "task2", or similar progress terminology. These belong only in this plan document.
- Use descriptive, domain-appropriate names in code (for example `assertNamedContainersFit`, not `runAC3Checks`).
- Preserve the existing comment style in `main.js` and `style.css`; do not add narrative comments explaining what the diff is for — let the changes speak through naming and structure. The audit log (`refinement_findings.md`) is the place for refinement narration.

### Verification Surface Summary
- Automated: `node scripts/smoke_site.js` (full existing harness plus the new geometry assertions added in task5), `node scripts/validate_site_assets.js`.
- Manual: viewport screenshot review at desktop 1366×768, laptop-short 1122×720, and mobile 390×844, captured during task1 and re-captured after task6; density check at each viewport.
- Comprehension: Codex naive-reader rubric (task7) over the final hero / plain-terms / test-rule copy, including a crowded-section flag.

### Locked Floors (do not regress)
- Hero H1: 'The note says "cats." The sentence says "cataracts."'.
- Case order in `.case-rail`: URL → Python → Cat → Star Wars.
- And / But / Therefore story arc in `.arc-grid`.
- Mobile verdict contrast ratio ≥ 7.
- Atlas keyboard: arrow keys cycle the four story cases, Enter jumps; same for `.case-rail`, `#heatmap` story marks, `#agreement-strip` segments, `#density-histogram` bins.
- No visible form controls anywhere in the page.
- Data-failure status banner ("Could not load local data" plus "Run the local server") still appears when `features_site.json` cannot be fetched.
- Smoke-asserted phrases enumerated in `scripts/smoke_site.js` `getBaseState`: hero lede mismatch wording, dataset scope items, methods strip keywords, takeaway snapshot phrases, mobile evidence cat / cataracts text, and all `findingTopic` / `findingTypical` / `findingNoMatch` exact values.

--- Original Design Draft Start ---

## Here is the pervious prompt for you to reference: 

Here is the final project with DSC106, and here are some useful link for you to get the context:

https://dsc106.com/projects/final_project/

Note that you DONT need to do the video presentation part, you just need to focus on the website
Note that you Don't need to push anything to github upstream

Requirement:

Start with inspecting the repo  you are, especially the proposal /Users/jingwengu/Desktop/KnowUrLLM/proposal.pdf, and also you can take a look at all types of AI internal mechamism on the Internet. You can deviate from the original proposal a bit, but always remember, keep the question small and medium complex, and do good, effective and cool visualizations around it. 
In the ralph loop you are doing, each time you think you are finish, locally preview it to assess if you are doing a fair job which explains things below

content:
have a core topic and explain everything around it well 
try to explain to students not formal AI researchers, design everything with this assumption
Everytime you finish check yourself if you align your work with the grading requirement in https://dsc106.com/projects/final_project/ (one-by-one)

Style:
No over chatty word and comment, only interactive visualizations that explains the topic well and concise writing around it. if there has to be dense language explaination try to design in a way that does not flood the whole screen
If you think you need to and it helps, https://github.com/openai/skills/tree/main/skills/.curated/playwright-interactive download yourself with this skill and get help from it.
For the general style, try to make it white and black with futurisitc vibe.


## Here is the prompt I have for you now:
Try to follow the previous requirement (making a good website) refine the current website especially in 
1. Readability: a naive student/people with no prior background can understand what this visualization is about
2. Frontend design: make the frontend design modern and elegant, make sure there's no places where there's mistakes-- like text be cut in half, image getting out of the box .etc
--- Original Design Draft End ---
