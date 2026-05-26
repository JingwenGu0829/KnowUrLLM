const SITE_URL = process.env.SITE_URL || process.argv[2] || "http://localhost:8000/";

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "wide-short", width: 1280, height: 650 },
  { name: "laptop-short", width: 1122, height: 720 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const STORY_CASES = [
  ["#case-url", "URL"],
  ["#case-python", "Python"],
  ["#case-cat", "Cat"],
  ["#case-star-wars", "Star Wars"],
];

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    throw new Error(
      "Playwright is required for viewport smoke tests. Install it or run with NODE_PATH pointing to an existing Playwright install.",
    );
  }
}

function assert(condition, message, issues) {
  if (!condition) issues.push(message);
}

async function getBaseState(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && styles.visibility !== "hidden" && styles.display !== "none";
    };
    const rgb = (value) => (value.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
    const channel = (value) => {
      const scaled = value / 255;
      return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (color) => {
      const [r, g, b] = rgb(color);
      return 0.2126 * channel(r || 0) + 0.7152 * channel(g || 0) + 0.0722 * channel(b || 0);
    };
    const contrast = (foreground, background) => {
      const a = luminance(foreground);
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const projectNoteArticles = Array.from(document.querySelectorAll(".project-note article"));
    const heroChecks = document.querySelector(".hero-checks")?.getBoundingClientRect();
    const heroDemo = document.querySelector(".hero-demo")?.getBoundingClientRect();
    const dataScope = document.querySelector(".data-scope")?.getBoundingClientRect();
    const agreementPanel = document.querySelector(".agreement-panel")?.getBoundingClientRect();

    return {
      h1: document.querySelector("h1")?.textContent.trim(),
      heroLede: document.querySelector(".lede")?.textContent.replace(/\s+/g, " ").trim(),
      heroEvidenceVisible: !heroChecks || heroChecks.bottom <= window.innerHeight + 1,
      heroDemoStartsVisible: !heroDemo || heroDemo.top < window.innerHeight - 16,
      heroTitleHeight: document.querySelector("h1")?.getBoundingClientRect().height || 0,
      scrollMeter: Boolean(document.querySelector(".scroll-meter")),
      plainDefinition: document.body.innerText.toLowerCase().includes("gpt-2 reads text step by step"),
      storyArc: Array.from(document.querySelectorAll(".arc-grid span")).map((node) => node.textContent.trim()).join(" / "),
      controls: Array.from(document.querySelectorAll("button,input,select,textarea")).filter(visible).length,
      horizontalOverflow: documentWidth - window.innerWidth,
      dataLoaded: performance.getEntriesByType("resource").some((entry) => entry.name.includes("features_site.json")),
      dataStatus: document.querySelector("#data-status")?.dataset.state,
      dataStatusText: document.querySelector("#data-status")?.textContent.trim(),
      dataScopeText: document.querySelector(".data-scope")?.innerText.replace(/\s+/g, " ").trim(),
      dataScopeItems: document.querySelectorAll(".data-scope span").length,
      dataScopeHeight: dataScope?.height || 0,
      evidenceMatrixRows: document.querySelectorAll("#evidence-matrix .matrix-row[data-feature-id]").length,
      evidenceMatrixCells: document.querySelectorAll("#evidence-matrix .matrix-cell").length,
      evidenceMatrixText: document.querySelector(".evidence-matrix-panel")?.innerText.replace(/\s+/g, " ").trim(),
      heatmapRows: Array.from(document.querySelectorAll("#heatmap .y-axis .tick text")).map((node) => node.textContent.trim()),
      heatmapCellMetrics: (() => {
        const cells = Array.from(document.querySelectorAll("#heatmap rect[tabindex]")).map((node) => node.getBoundingClientRect());
        return {
          count: cells.length,
          minWidth: cells.length ? Math.min(...cells.map((rect) => rect.width)) : 0,
          minHeight: cells.length ? Math.min(...cells.map((rect) => rect.height)) : 0,
        };
      })(),
      heatmapAnnotation: Array.from(document.querySelectorAll("#heatmap text")).map((node) => node.textContent.trim()).find((text) => text.includes("Largest + story topics.")) || "",
      storyHitTargets: (() => {
        const targets = Array.from(document.querySelectorAll("svg .story-hit-target")).map((node) => node.getBoundingClientRect());
        return {
          count: targets.length,
          minWidth: targets.length ? Math.min(...targets.map((rect) => rect.width)) : 0,
          minHeight: targets.length ? Math.min(...targets.map((rect) => rect.height)) : 0,
        };
      })(),
      caseDotIconWidth: document.querySelector(".case-dot")?.getBoundingClientRect().width || 0,
      heatmapReadingText: document.querySelector("#heatmap")?.closest(".chart-panel")?.querySelector(".chart-reading")?.innerText.replace(/\s+/g, " ").trim(),
      patternHint: document.querySelector(".pattern-hint")?.textContent.trim(),
      readerPathText: document.querySelector(".reader-path")?.innerText.replace(/\s+/g, " ").trim(),
      atlasCaptionDefault: document.querySelector("#atlas-caption")?.textContent.trim(),
      atlasStoryPath: (() => {
        const canvas = document.querySelector("#atlas-canvas");
        const rect = canvas?.getBoundingClientRect();
        const stops = typeof getAtlasStoryPath === "function" ? getAtlasStoryPath() : [];
        return {
          count: stops.length,
          unique: new Set(stops.map((stop) => `${Math.round(stop.px)},${Math.round(stop.py)}`)).size,
          inBounds: Boolean(rect) && stops.every((stop) =>
            stop.px >= 0 && stop.px <= rect.width && stop.py >= 0 && stop.py <= rect.height
          ),
        };
      })(),
      tokenGuide: document.querySelector("#token-guide")?.textContent.trim(),
      sourceCallout: document.querySelector("#source-callout")?.innerText.replace(/\s+/g, " ").trim(),
      exampleHeading: document.querySelector(".feature-card h3:has(#example-count)")?.textContent.replace(/\s+/g, " ").trim(),
      activationWindowLabel: document.querySelector("#activation-window")?.getAttribute("aria-label") || "",
      peakTokenAnimation: getComputedStyle(document.querySelector(".hot-token.peak") || document.documentElement).animationName,
      tokenLegend: Array.from(document.querySelectorAll(".token-legend span")).map((node) => ({
        text: node.textContent.trim(),
        evidence: node.dataset.evidence || "",
      })),
      tokenListRole: document.querySelector("#token-pills")?.getAttribute("role"),
      tokenListLabel: document.querySelector("#token-pills")?.getAttribute("aria-label"),
      mobileStageNote: (() => {
        const node = document.querySelector(".mobile-stage-note");
        const rect = node?.getBoundingClientRect();
        const styles = node ? getComputedStyle(node) : null;
        return {
          text: node?.textContent.trim() || "",
          visible: Boolean(node && rect.width > 0 && rect.height > 0 && styles.display !== "none" && styles.visibility !== "hidden"),
        };
      })(),
      agreementPanelHeight: agreementPanel?.height || 0,
      agreementTakeaway: document.querySelector(".agreement-takeaway")?.innerText.replace(/\s+/g, " ").trim(),
      agreementMarkerLines: document.querySelectorAll("#agreement-strip line.agreement-marker").length,
      agreementMarkerDots: document.querySelectorAll("#agreement-strip circle.agreement-marker").length,
      agreementStoryLabels: Array.from(document.querySelectorAll("#agreement-strip .agreement-story-label")).map((node) => node.textContent.trim()),
      agreementMarkerPositions: Array.from(document.querySelectorAll("#agreement-strip circle.agreement-marker")).map((node) => {
        const cx = Math.round(Number(node.getAttribute("cx")));
        const cy = Math.round(Number(node.getAttribute("cy")));
        return `${cx},${cy}`;
      }),
      oldCopy: /A label is not an explanation|A GPT-2 guess|short guess|Dataset guess|A label for GPT-2|The evidence says|One response\. Three checks\.|One reaction\. Three checks\.|recorded reaction|Text pieces|text clues|Sparse auto|name pattern|measured pattern|word-piece|internal signal|hidden signal|student|Best saved sentence|Source check|What to notice|saved behavior|behavior records|Chart focus|Atlas probe/i.test(document.body.innerText),
      findingTopic: document.querySelector("#finding-topic")?.textContent.trim(),
      findingTypical: document.querySelector("#finding-typical")?.textContent.trim(),
      findingNoMatch: document.querySelector("#finding-no-match")?.textContent.trim(),
      methodText: document.querySelector(".method-strip")?.innerText.replace(/\s+/g, " ").trim(),
      atlasSummaryText: document.querySelector("#atlas-summary")?.textContent.replace(/\s+/g, " ").trim(),
      takeawayRule: document.querySelector(".takeaway-rule")?.innerText.replace(/\s+/g, " ").trim(),
      takeawayProof: document.querySelector(".takeaway-proof")?.innerText.replace(/\s+/g, " ").trim(),
      takeawaySnapshot: document.querySelector(".takeaway-snapshot")?.innerText.replace(/\s+/g, " ").trim(),
      takeawayProofColors: Array.from(document.querySelectorAll(".takeaway-proof div")).map((node) =>
        getComputedStyle(node).getPropertyValue("--case-color").trim()
      ),
      mobileEvidence: Array.from(document.querySelectorAll(".mobile-evidence")).map((node) => {
        const rect = node.getBoundingClientRect();
        const styles = getComputedStyle(node);
        const verdict = node.querySelector("p");
        const verdictStyles = verdict ? getComputedStyle(verdict) : null;
        return {
          text: node.innerText.replace(/\s+/g, " ").trim(),
          visible: rect.width > 0 && rect.height > 0 && styles.display !== "none" && styles.visibility !== "hidden",
          verdictContrast: verdictStyles ? contrast(verdictStyles.color, verdictStyles.backgroundColor) : 0,
        };
      }),
      chapterReceipts: Array.from(document.querySelectorAll(".chapter-receipt")).map((node) => visible(node)),
      projectNoteSentences: projectNoteArticles.map((article) =>
        Array.from(article.querySelectorAll(".note-sentences p")).reduce(
          (total, node) => total + (node.textContent.trim().match(/[.!?](?=\s|$)/g) || []).length,
          0
        )
      ),
      projectNoteRows: projectNoteArticles.map((article) => article.querySelectorAll(".note-sentences p").length),
    };
  });
}

async function checkNoHorizontalOverflow(page, label, issues) {
  const state = await page.evaluate(() => {
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    return {
      overflow: Math.round(documentWidth - window.innerWidth),
      documentWidth: Math.round(documentWidth),
      viewportWidth: Math.round(window.innerWidth),
      scrollX: Math.round(window.scrollX),
    };
  });
  assert(state.overflow <= 2, `${label} has horizontal overflow: ${JSON.stringify(state)}`, issues);
  assert(state.scrollX === 0, `${label} should not leave the page horizontally scrolled: ${JSON.stringify(state)}`, issues);
}

async function checkKeyboardFocusBasics(page, issues) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.activeElement?.blur();
  });
  await page.waitForTimeout(80);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(80);

  const skipState = await page.evaluate(() => {
    const active = document.activeElement;
    const rect = active?.getBoundingClientRect();
    return {
      text: active?.textContent?.trim() || "",
      href: active?.getAttribute?.("href") || "",
      visible: Boolean(rect && rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0),
    };
  });
  assert(skipState.text === "Skip to main content" && skipState.href === "#top", `First keyboard target should be the skip link: ${JSON.stringify(skipState)}`, issues);
  assert(skipState.visible, `Skip link should become visible when focused: ${JSON.stringify(skipState)}`, issues);

  await page.evaluate(() => {
    document.querySelector("#patterns").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(120);
  await page.locator('.case-key [data-feature-id="gpt2-small/7-res-jb/24310"]').focus();
  await page.waitForTimeout(120);
  const caseKeyFocus = await page.evaluate(() => {
    const active = document.activeElement;
    const styles = active ? getComputedStyle(active) : null;
    return {
      label: active?.textContent?.trim() || "",
      outlineStyle: styles?.outlineStyle || "",
      outlineWidth: styles?.outlineWidth || "",
      outlineColor: styles?.outlineColor || "",
      focusText: document.querySelector("#pattern-focus strong")?.textContent.trim() || "",
    };
  });
  assert(caseKeyFocus.label.includes("Cat"), `Case-key focus landed on the wrong element: ${JSON.stringify(caseKeyFocus)}`, issues);
  assert(caseKeyFocus.outlineStyle !== "none" && parseFloat(caseKeyFocus.outlineWidth) >= 2, `Case-key focus outline is not visible enough: ${JSON.stringify(caseKeyFocus)}`, issues);
  assert(caseKeyFocus.focusText.includes("Cat / cataracts"), `Case-key focus should update chart focus: ${JSON.stringify(caseKeyFocus)}`, issues);
  await page.evaluate(() => document.activeElement?.blur());
}

async function scrollCaseToReadingLine(page, selector) {
  await page.evaluate((caseSelector) => {
    const node = document.querySelector(caseSelector);
    if (window.matchMedia("(max-width: 1120px)").matches) {
      node.scrollIntoView({ block: "start" });
      return;
    }
    const rect = node.getBoundingClientRect();
    const center = rect.top + window.scrollY + rect.height / 2;
    window.scrollTo(0, Math.max(0, center - window.innerHeight * 0.52));
  }, selector);
  await page.waitForTimeout(260);
}

async function getCaseState(page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage")?.getBoundingClientRect();
    const canvas = document.querySelector("#atlas-canvas")?.getBoundingClientRect();
    const scoreColors = Array.from(document.querySelectorAll(".evidence-grid > div")).map((node) =>
      getComputedStyle(node).getPropertyValue("--score-color").trim()
    );
    const tokenEvidence = Array.from(document.querySelectorAll("#token-pills .token-pill")).map((node) => ({
      text: node.textContent.trim(),
      evidence: node.dataset.evidence || "",
      visible: getComputedStyle(node).display !== "none",
    }));
    return {
      active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
      stageFits: !stage || (stage.height <= window.innerHeight + 1 && stage.bottom <= window.innerHeight + 1 && stage.top >= -1),
      canvasFits: !canvas || (canvas.height <= window.innerHeight + 1 && canvas.bottom <= window.innerHeight + 1 && canvas.top >= -1),
      scoreColors,
      tokenEvidence,
      sourceCallout: document.querySelector("#source-callout")?.innerText.replace(/\s+/g, " ").trim(),
      stage: stage && { top: Math.round(stage.top), bottom: Math.round(stage.bottom), height: Math.round(stage.height) },
      canvas: canvas && { top: Math.round(canvas.top), bottom: Math.round(canvas.bottom), height: Math.round(canvas.height) },
      stageSwitchClass: document.querySelector(".stage")?.classList.contains("case-switch") || false,
    };
  });
}

async function hoverCaseKeyLink(page, featureId) {
  const locator = page.locator(`.case-key [data-feature-id="${featureId}"]`);
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Case-key link is missing for ${featureId}`);
  await page.mouse.move(box.x + Math.min(18, box.width / 2), box.y + box.height / 2);
}

async function checkChartFocus(page, viewport, issues) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#patterns").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(240);

  const scrollMotion = await page.evaluate(() => ({
    progress: Number(getComputedStyle(document.documentElement).getPropertyValue("--scroll-progress")),
    revealedPatternIntro: document.querySelector(".patterns .section-heading")?.classList.contains("is-visible"),
    revealedFindingStrip: document.querySelector(".finding-strip")?.classList.contains("is-visible"),
  }));
  assert(scrollMotion.progress > 0.15, `Scroll progress meter did not advance: ${scrollMotion.progress}`, issues);
  assert(scrollMotion.revealedPatternIntro || scrollMotion.revealedFindingStrip, `Pattern section reveal did not activate: ${JSON.stringify(scrollMotion)}`, issues);

  if (viewport.width >= 900) {
    const before = await page.locator("#pattern-focus strong").innerText();
    await hoverCaseKeyLink(page, "gpt2-small/7-res-jb/24310");
    await page.waitForTimeout(120);
    const afterHover = await page.locator("#pattern-focus strong").innerText();
    await page.mouse.move(4, 4);
    await page.waitForTimeout(120);

    assert(afterHover.includes("Cat"), `Chart focus did not respond to case-key hover. Before: ${before}; after: ${afterHover}`, issues);
  }

  const checkScrollFocus = async (selector, expectedText) => {
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(4, 4);
    await page.evaluate((targetSelector) => {
      document.documentElement.style.scrollBehavior = "auto";
      document.querySelector(targetSelector)?.scrollIntoView({ block: "start" });
    }, selector);
    await page.waitForTimeout(180);
    const state = await page.evaluate((targetSelector) => {
      const target = document.querySelector(targetSelector);
      const focus = document.querySelector("#pattern-focus");
      const focusRect = focus?.getBoundingClientRect();
      const headerRect = document.querySelector(".site-header")?.getBoundingClientRect();
      const targetRect = target?.getBoundingClientRect();
      return {
        focusText: document.querySelector("#pattern-focus strong")?.textContent.trim() || "",
        active: target?.classList.contains("is-scroll-focus") || false,
        focusVisible: !focusRect || (focusRect.top >= (headerRect?.bottom || 0) - 1 && focusRect.bottom <= window.innerHeight + 1),
        targetClear: !focusRect || !targetRect || targetRect.top >= focusRect.bottom + 8,
        targetTop: Math.round(targetRect?.top || 0),
        focusBottom: Math.round(focusRect?.bottom || 0),
      };
    }, selector);
    assert(state.active && state.focusText.includes(expectedText), `Scroll-driven chart focus failed for ${selector}: ${JSON.stringify(state)}`, issues);
    if (viewport.width >= 900) {
      assert(state.focusVisible, `Sticky chart focus should remain visible while reading ${selector}: ${JSON.stringify(state)}`, issues);
      assert(state.targetClear, `Sticky chart focus should not cover ${selector}: ${JSON.stringify(state)}`, issues);
    }
  };

  await checkScrollFocus(".evidence-matrix-panel", "Trust matrix");
  await page.locator('#evidence-matrix .matrix-row[data-feature-id="gpt2-small/11-res-jb/14962"] .matrix-row-hit').hover();
  await page.waitForTimeout(120);
  const afterMatrixHover = await page.locator("#pattern-focus strong").innerText();
  assert(afterMatrixHover.includes("Star Wars"), `Evidence matrix hover did not update chart focus: ${afterMatrixHover}`, issues);
  await page.mouse.move(4, 4);
  await page.waitForTimeout(80);

  await checkScrollFocus(".pattern-grid", "Topic and rarity charts");
  await page.waitForTimeout(120);
  if (viewport.width >= 1200 && viewport.height >= 760) {
    const chartFit = await page.evaluate(() => {
      const heatmap = document.querySelector("#heatmap")?.getBoundingClientRect();
      const histogram = document.querySelector("#density-histogram")?.getBoundingClientRect();
      return {
        heatmapBottom: Math.round(heatmap?.bottom || 0),
        histogramBottom: Math.round(histogram?.bottom || 0),
        viewportBottom: window.innerHeight,
      };
    });
    assert(
      chartFit.heatmapBottom <= chartFit.viewportBottom + 2 && chartFit.histogramBottom <= chartFit.viewportBottom + 2,
      `Topic and rarity charts should fit in the first desktop chart viewport: ${JSON.stringify(chartFit)}`,
      issues
    );
  }
  const heatmapFocus = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll("#heatmap rect[tabindex][aria-label]"));
    const cell = cells.find((node) => !node.getAttribute("aria-label").includes(": 0 saved moments")) || cells[0];
    cell?.focus();
    return {
      count: cells.length,
      focused: document.activeElement === cell,
      label: cell?.getAttribute("aria-label") || "",
    };
  });
  await page.waitForTimeout(120);
  const heatmapTooltip = await page.locator("#chart-tooltip").innerText();
  const heatmapOpacity = await page.locator("#chart-tooltip").evaluate((node) => Number(getComputedStyle(node).opacity));
  assert(heatmapFocus.count > 0, "Heatmap should expose focusable cells.", issues);
  assert(heatmapFocus.focused, `Heatmap cell did not receive keyboard focus: ${heatmapFocus.label}`, issues);
  assert(heatmapFocus.label.includes("GPT-2 step") && heatmapFocus.label.includes("saved moments"), `Heatmap cell aria-label is unclear: ${heatmapFocus.label}`, issues);
  assert(heatmapOpacity > 0.9 && heatmapTooltip.includes("saved moments") && heatmapTooltip.includes("Darker means a larger share"), `Heatmap focus did not show an interpreted tooltip: ${heatmapTooltip}`, issues);

  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(80);

  await checkScrollFocus(".pattern-grid", "Topic and rarity charts");
  await page.waitForTimeout(120);
  const histogramFocus = await page.evaluate(() => {
    const bins = Array.from(document.querySelectorAll("#density-histogram .hist-hit-targets rect[tabindex][aria-label]"));
    const bin = bins.find((node) => !node.getAttribute("aria-label").endsWith(": 0 saved moments")) || bins[0];
    bin?.focus();
    return {
      count: bins.length,
      focused: document.activeElement === bin,
      label: bin?.getAttribute("aria-label") || "",
    };
  });
  await page.waitForTimeout(120);
  const histogramTooltip = await page.locator("#chart-tooltip").innerText();
  const histogramOpacity = await page.locator("#chart-tooltip").evaluate((node) => Number(getComputedStyle(node).opacity));
  assert(histogramFocus.count > 0, "Histogram should expose focusable bins.", issues);
  assert(histogramFocus.focused, `Histogram bin did not receive keyboard focus: ${histogramFocus.label}`, issues);
  assert(histogramFocus.label.includes("Appearance rate") && histogramFocus.label.includes("saved moments"), `Histogram bin aria-label is unclear: ${histogramFocus.label}`, issues);
  assert(histogramOpacity > 0.9 && histogramTooltip.includes("sampled text") && histogramTooltip.includes("Left is rarer"), `Histogram focus did not show an interpreted tooltip: ${histogramTooltip}`, issues);

  await page.evaluate(() => document.activeElement?.blur());

  await checkScrollFocus(".agreement-panel", "Word-match check");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector(".agreement-panel")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(160);
  const agreementStart = await page.evaluate(() => {
    const focus = document.querySelector("#pattern-focus")?.getBoundingClientRect();
    const heading = document.querySelector(".agreement-panel h3")?.getBoundingClientRect();
    return {
      focusBottom: Math.round(focus?.bottom || 0),
      headingTop: Math.round(heading?.top || 0),
      clear: !focus || !heading || heading.top >= focus.bottom + 8,
    };
  });
  if (viewport.width >= 900) {
    assert(agreementStart.clear, `Sticky chart focus should not cover the agreement chart title: ${JSON.stringify(agreementStart)}`, issues);
  }

  const agreementFocus = await page.evaluate(() => {
    const segment = document.querySelector("#agreement-strip rect[tabindex][aria-label]");
    segment?.focus();
    return {
      count: document.querySelectorAll("#agreement-strip rect[tabindex][aria-label]").length,
      focused: document.activeElement === segment,
      role: segment?.getAttribute("role") || "",
      label: segment?.getAttribute("aria-label") || "",
    };
  });
  await page.waitForTimeout(120);
  const agreementTooltip = await page.locator("#chart-tooltip").innerText();
  const agreementOpacity = await page.locator("#chart-tooltip").evaluate((node) => Number(getComputedStyle(node).opacity));
  assert(agreementFocus.count === 3, `Agreement chart should expose three focusable segments, got ${agreementFocus.count}.`, issues);
  assert(agreementFocus.focused && agreementFocus.role === "img", `Agreement segment did not receive accessible keyboard focus: ${JSON.stringify(agreementFocus)}`, issues);
  assert(agreementFocus.label.includes("warning, not enough"), `Agreement segment aria-label should include interpretation: ${agreementFocus.label}`, issues);
  assert(agreementOpacity > 0.9 && agreementTooltip.includes("Warning, not enough"), `Agreement focus did not show interpreted tooltip: ${agreementTooltip}`, issues);
  await page.evaluate(() => document.activeElement?.blur());

  await page.locator(".pattern-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const storyMarkFocus = await page.evaluate(() => {
    const mark = document.querySelector('#heatmap .story-case-link[data-feature-id="gpt2-small/7-res-jb/24310"]');
    mark?.focus();
    return {
      focused: document.activeElement === mark,
      focusText: document.querySelector("#pattern-focus strong")?.textContent.trim() || "",
      label: mark?.getAttribute("aria-label") || "",
    };
  });
  await page.waitForTimeout(120);
  assert(storyMarkFocus.focused, `Heatmap story mark did not receive keyboard focus: ${JSON.stringify(storyMarkFocus)}`, issues);
  assert(storyMarkFocus.focusText.includes("Cat / cataracts"), `Heatmap story mark focus did not update chart focus: ${JSON.stringify(storyMarkFocus)}`, issues);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(260);
  const storyMarkEnter = await page.evaluate(() => ({
    hash: window.location.hash,
    active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
  }));
  assert(storyMarkEnter.hash === "#case-cat" && storyMarkEnter.active === "Cat", `Heatmap story mark Enter did not jump to cat case: ${JSON.stringify(storyMarkEnter)}`, issues);
  await page.evaluate(() => document.activeElement?.blur());
}

async function checkAtlasProbe(page, issues) {
  await scrollCaseToReadingLine(page, "#case-cat");
  const rect = await page.locator("#atlas-canvas").boundingBox();
  assert(Boolean(rect), "Atlas canvas is missing.", issues);
  if (!rect) return;

  const candidates = [
    [0.5, 0.5],
    [0.64, 0.56],
    [0.44, 0.46],
    [0.72, 0.42],
  ];

  let caption = "";
  for (const [xRatio, yRatio] of candidates) {
    await page.mouse.move(rect.x + rect.width * xRatio, rect.y + rect.height * yRatio);
    await page.waitForTimeout(120);
    caption = await page.locator("#atlas-caption").innerText();
    if (caption.startsWith("Map dot:")) break;
  }

  assert(caption.startsWith("Map dot:"), `Dot-map probe did not update on hover. Caption: ${caption}`, issues);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(120);

  await page.locator("#atlas-canvas").focus();
  await page.waitForTimeout(120);
  const focusCaption = await page.locator("#atlas-caption").innerText();
  assert(focusCaption.includes("Cat / cataracts"), `Atlas keyboard focus did not show the active case. Caption: ${focusCaption}`, issues);

  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(120);
  const nextCaption = await page.locator("#atlas-caption").innerText();
  assert(nextCaption.includes("Star Wars"), `Atlas keyboard arrow did not move between story cases. Caption: ${nextCaption}`, issues);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(260);
  const keyboardJump = await page.evaluate(() => ({
    hash: window.location.hash,
    active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
  }));
  assert(keyboardJump.hash === "#case-star-wars" && keyboardJump.active === "Star Wars", `Atlas keyboard Enter did not jump to selected story case: ${JSON.stringify(keyboardJump)}`, issues);

  const probeCost = await page.evaluate(() => {
    const canvas = document.querySelector("#atlas-canvas");
    const rect = canvas.getBoundingClientRect();
    const start = performance.now();
    for (let index = 0; index < 120; index += 1) {
      const x = rect.left + ((index * 37) % Math.max(1, Math.round(rect.width)));
      const y = rect.top + ((index * 53) % Math.max(1, Math.round(rect.height)));
      canvas.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
    }
    return performance.now() - start;
  });
  assert(probeCost < 90, `Atlas pointer probing is too expensive: ${probeCost.toFixed(1)}ms for 120 moves.`, issues);

  const lookupCost = await page.evaluate(() => {
    const canvas = document.querySelector("#atlas-canvas");
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const start = performance.now();
    let hits = 0;

    for (let index = 0; index < 2400; index += 1) {
      const row = findNearestAtlasRow((index * 37) % width, (index * 53) % height);
      if (row) hits += 1;
    }

    return { elapsed: performance.now() - start, hits };
  });
  assert(lookupCost.hits > 0, `Atlas lookup should find nearby rows during the benchmark: ${JSON.stringify(lookupCost)}`, issues);
  assert(lookupCost.elapsed < 45, `Atlas nearest-point lookup is too expensive: ${lookupCost.elapsed.toFixed(1)}ms for 2400 lookups.`, issues);
}

async function checkHeaderNavigation(page, viewport, issues) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#patterns").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(120);
  await page.locator(".brand").click();
  await page.waitForTimeout(260);
  const topState = await page.evaluate(() => {
    const header = document.querySelector(".site-header").getBoundingClientRect();
    const eyebrow = document.querySelector(".hero .eyebrow").getBoundingClientRect();
    return {
      hash: window.location.hash,
      scrollY: Math.round(window.scrollY),
      headerBottom: Math.round(header.bottom),
      eyebrowTop: Math.round(eyebrow.top),
    };
  });
  assert(topState.hash === "#top", `Brand link should target #top, got ${topState.hash}.`, issues);
  assert(topState.eyebrowTop >= topState.headerBottom + (viewport.width <= 720 ? 4 : 8), `Top anchor hides hero eyebrow under the sticky header: ${JSON.stringify(topState)}`, issues);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector(".hero").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(120);
  const heroDirectState = await page.evaluate(() => {
    const header = document.querySelector(".site-header").getBoundingClientRect();
    const eyebrow = document.querySelector(".hero .eyebrow").getBoundingClientRect();
    return {
      headerBottom: Math.round(header.bottom),
      eyebrowTop: Math.round(eyebrow.top),
    };
  });
  assert(heroDirectState.eyebrowTop >= heroDirectState.headerBottom + (viewport.width <= 720 ? 4 : 8), `Direct hero jump hides the eyebrow under the sticky header: ${JSON.stringify(heroDirectState)}`, issues);

  const targets = [
    { href: "#story", section: "#story" },
    { href: "#patterns", section: "#patterns" },
    { href: "#takeaway", section: "#takeaway" },
  ];

  for (const target of targets) {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    });
    await page.waitForTimeout(80);
    await page.locator(`.site-header nav a[href="${target.href}"]`).click();
    await page.waitForTimeout(360);
    const state = await page.evaluate((expected) => {
      const header = document.querySelector(".site-header").getBoundingClientRect();
      const section = document.querySelector(expected.section).getBoundingClientRect();
      const takeawayLede = document.querySelector(".takeaway-lede")?.getBoundingClientRect();
      const takeawayProof = document.querySelector(".takeaway-proof")?.getBoundingClientRect();
      const takeawaySnapshot = document.querySelector(".takeaway-snapshot")?.getBoundingClientRect();
      const activeHref = document.querySelector(".site-header nav a.is-current")?.getAttribute("href");
      return {
        hash: window.location.hash,
        activeHref,
        targetTop: section.top,
        headerBottom: header.bottom,
        takeawayLedeVisible: !takeawayLede || (takeawayLede.top >= header.bottom && takeawayLede.bottom <= window.innerHeight),
        takeawayProofVisible: !takeawayProof || (takeawayProof.top >= header.bottom && takeawayProof.bottom <= window.innerHeight),
        takeawaySnapshotVisible: !takeawaySnapshot || (takeawaySnapshot.top >= header.bottom && takeawaySnapshot.bottom <= window.innerHeight),
      };
    }, target);
    const expectedTop = state.headerBottom + (viewport.width <= 720 ? 19 : target.href === "#patterns" ? 1 : 19);
    assert(state.hash === target.href, `Header nav ${target.href} should update hash, got ${state.hash}.`, issues);
    assert(state.activeHref === target.href, `Header nav ${target.href} should be active, got ${state.activeHref}.`, issues);
    assert(Math.abs(state.targetTop - expectedTop) <= 3, `Header nav ${target.href} landed at ${state.targetTop}px, expected around ${expectedTop}px.`, issues);
    if (target.href === "#takeaway") {
      assert(state.takeawayLedeVisible, "Takeaway explanation should be visible immediately after jumping to the takeaway section.", issues);
      if (viewport.width >= 900) {
        assert(state.takeawayProofVisible, "Takeaway proof scorecard should fit in the first desktop/laptop takeaway viewport.", issues);
        assert(state.takeawaySnapshotVisible, "Final cat/cataracts proof replay should fit in the first desktop/laptop takeaway viewport.", issues);
      }
    }
  }

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#project-note").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(240);
  const projectNoteState = await page.evaluate(() => {
    const heading = document.querySelector("#project-note h2");
    return {
      activeHref: document.querySelector(".site-header nav a.is-current")?.getAttribute("href"),
      headingFont: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
    };
  });
  assert(projectNoteState.activeHref === "#takeaway", `Project note should keep Takeaway nav active, got ${projectNoteState.activeHref}.`, issues);
  assert(projectNoteState.headingFont <= (viewport.width <= 720 ? 54 : 72), `Project note heading should stay visually secondary: ${JSON.stringify(projectNoteState)}`, issues);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#takeaway").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(240);
  const takeawayActive = await page.evaluate(() => document.querySelector(".site-header nav a.is-current")?.getAttribute("href"));
  assert(takeawayActive === "#takeaway", `Takeaway section should activate Takeaway nav, got ${takeawayActive}.`, issues);
}

async function checkStageRailNavigation(page, viewport, issues) {
  if (viewport.width < 900) return;
  await scrollCaseToReadingLine(page, "#case-url");
  await page.locator('.case-rail [data-feature-id="gpt2-small/7-res-jb/24310"]').focus();
  await page.waitForTimeout(100);
  const focusState = await page.evaluate(() => {
    const item = document.activeElement;
    const styles = item ? getComputedStyle(item) : null;
    return {
      role: item?.getAttribute?.("role") || "",
      label: item?.getAttribute?.("aria-label") || "",
      outlineStyle: styles?.outlineStyle || "",
      outlineWidth: styles?.outlineWidth || "",
    };
  });
  assert(focusState.role === "link" && focusState.label.includes("cat example"), `Stage example rail should expose a focused jump target: ${JSON.stringify(focusState)}`, issues);
  assert(focusState.outlineStyle !== "none" && parseFloat(focusState.outlineWidth) >= 2, `Stage example rail focus outline is not visible enough: ${JSON.stringify(focusState)}`, issues);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(320);
  const afterEnter = await page.evaluate(() => ({
    hash: window.location.hash,
    active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
  }));
  assert(afterEnter.hash === "#case-cat" && afterEnter.active === "Cat", `Stage case rail Enter did not jump to cat case: ${JSON.stringify(afterEnter)}`, issues);
}

async function checkMobileChartNavigation(page, viewport, issues) {
  if (viewport.width >= 900) return;

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector("#patterns").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(180);
  await page.locator('.case-key [data-feature-id="gpt2-small/7-res-jb/24310"]').click();
  await page.waitForTimeout(360);
  const afterCaseKey = await page.evaluate(() => ({
    hash: window.location.hash,
    active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
    caseTop: Math.round(document.querySelector("#case-cat")?.getBoundingClientRect().top || 0),
  }));
  assert(afterCaseKey.hash === "#case-cat" && afterCaseKey.active === "Cat", `Mobile case-key tap did not jump to cat case: ${JSON.stringify(afterCaseKey)}`, issues);
  assert(afterCaseKey.caseTop >= 70 && afterCaseKey.caseTop <= 130, `Mobile case-key jump landed poorly: ${JSON.stringify(afterCaseKey)}`, issues);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelector(".pattern-grid").scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(180);
  await page.locator('#heatmap .story-case-link[data-feature-id="gpt2-small/11-res-jb/14962"]').click({ force: true });
  await page.waitForTimeout(360);
  const afterChartMark = await page.evaluate(() => ({
    hash: window.location.hash,
    active: document.querySelector(".case-rail li.is-active b")?.textContent.trim(),
    caseTop: Math.round(document.querySelector("#case-star-wars")?.getBoundingClientRect().top || 0),
  }));
  assert(afterChartMark.hash === "#case-star-wars" && afterChartMark.active === "Star Wars", `Mobile chart-mark tap did not jump to Star Wars case: ${JSON.stringify(afterChartMark)}`, issues);
  assert(afterChartMark.caseTop >= 70 && afterChartMark.caseTop <= 130, `Mobile chart-mark jump landed poorly: ${JSON.stringify(afterChartMark)}`, issues);
}

async function checkViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const issues = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) issues.push(`console ${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));

  await page.goto(SITE_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#data-status")?.dataset.state === "ready", null, { timeout: 10000 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

  const base = await getBaseState(page);
  assert(base.h1 === 'The note says "cats." The sentence says "cataracts."', `Unexpected hero headline: ${base.h1}`, issues);
  assert(base.heroLede?.includes('short note "cats."') && base.heroLede?.includes("patients after a cataracts procedure") && base.heroLede?.includes("letters c-a-t inside cataracts"), `Hero lede should explain the concrete mismatch in plain language: ${base.heroLede}`, issues);
  assert(base.scrollMeter, "Header scroll progress meter is missing.", issues);
  if (viewport.width >= 900) {
    assert(base.heroEvidenceVisible, "Hero evidence panel should fit in the first desktop/laptop viewport.", issues);
  }
  if (viewport.width <= 720) {
    assert(base.heroDemoStartsVisible, `Mobile hero should show the evidence graphic before the first screen ends. Title height: ${base.heroTitleHeight}`, issues);
    assert(base.heroTitleHeight < viewport.height * 0.32, `Mobile hero headline is too tall for first-glance comprehension: ${base.heroTitleHeight}px.`, issues);
  }
  assert(base.plainDefinition, "Plain-language saved-moment definition is missing.", issues);
  assert(base.storyArc === "And / But / Therefore", `Story arc should read And / But / Therefore, got: ${base.storyArc}`, issues);
  assert(base.controls === 0, `Expected no visible form controls, found ${base.controls}.`, issues);
  assert(base.horizontalOverflow <= 2, `Horizontal overflow: ${base.horizontalOverflow}px.`, issues);
  await checkNoHorizontalOverflow(page, `${viewport.name} initial load`, issues);
  assert(base.dataLoaded, "features_site.json did not load.", issues);
  assert(base.dataStatus === "ready", `Data status should be ready after load. State: ${base.dataStatus}; text: ${base.dataStatusText}`, issues);
  assert(base.dataStatusText?.includes("6,000"), `Data status should report loaded row count. Text: ${base.dataStatusText}`, issues);
  assert(base.dataScopeItems === 3, `Dataset scope should be a three-part fact strip, found ${base.dataScopeItems}.`, issues);
  assert(base.dataScopeText?.includes("6,000 saved moments from GPT-2") && base.dataScopeText?.includes("7 needed fields"), `Dataset scope should be plain-language and performance-aware: ${base.dataScopeText}`, issues);
  assert(base.evidenceMatrixRows === 4 && base.evidenceMatrixCells === 12, `Evidence matrix should show 4 rows and 12 cells, got ${base.evidenceMatrixRows} rows and ${base.evidenceMatrixCells} cells.`, issues);
  assert(base.evidenceMatrixText?.includes("Read one row at a time") && base.evidenceMatrixText?.includes("Red means stop"), `Four-example matrix explanation is missing: ${base.evidenceMatrixText}`, issues);
  assert(base.storyHitTargets.count >= 12, `Story chart marks should expose larger hit targets, got ${JSON.stringify(base.storyHitTargets)}`, issues);
  assert(base.caseDotIconWidth >= 30, `Story-case legend icon does not reserve enough width: ${base.caseDotIconWidth}px`, issues);
  assert(base.heatmapReadingText?.includes("L0-L11") && base.heatmapReadingText?.includes("GPT-2 steps"), `Heatmap reading guide should explain GPT-2 steps for no-prior readers: ${base.heatmapReadingText}`, issues);
  assert(base.patternHint?.includes("Tap, hover, or focus"), `Chart interaction hint is missing: ${base.patternHint}`, issues);
  assert(base.readerPathText?.includes("Read this section in three passes") && base.readerPathText?.includes("A word match can look convincing"), `Broader chart reading path is missing: ${base.readerPathText}`, issues);
  assert(base.atlasCaptionDefault?.includes("colored path connects the four examples") && base.atlasCaptionDefault?.includes("context, not proof"), `Atlas caption should explain the story path without crowding the map panel: ${base.atlasCaptionDefault}`, issues);
  assert(base.atlasCaptionDefault.length <= 132, `Atlas caption should stay short enough to leave room for the map: ${base.atlasCaptionDefault}`, issues);
  assert(base.atlasStoryPath.count === 4 && base.atlasStoryPath.unique === 4 && base.atlasStoryPath.inBounds, `Atlas should draw a four-stop story path inside the canvas: ${JSON.stringify(base.atlasStoryPath)}`, issues);
  assert(base.atlasSummaryText?.includes("not proof that GPT-2 understands those topics"), `Atlas screen-reader summary should not overstate proximity: ${base.atlasSummaryText}`, issues);
  assert(base.atlasSummaryText?.includes("thin line") && base.atlasSummaryText?.includes("four scroll examples"), `Atlas screen-reader summary should explain the four-example path: ${base.atlasSummaryText}`, issues);
  assert(base.atlasSummaryText?.includes("Keyboard users") && base.atlasSummaryText?.includes("arrow keys"), `Atlas screen-reader summary should explain keyboard use: ${base.atlasSummaryText}`, issues);
  assert(base.tokenGuide?.includes("supports the note") && base.tokenGuide?.includes("slow down"), `Token guide is missing or unclear: ${base.tokenGuide}`, issues);
  assert(base.sourceCallout?.toLowerCase().includes("full sentence"), `Full sentence should include a compact reading cue: ${base.sourceCallout}`, issues);
  assert(base.exampleHeading?.includes("Full sentence example") && base.exampleHeading?.includes("of 3 saved"), `Full sentence heading should disclose the shown saved example: ${base.exampleHeading}`, issues);
  assert(base.activationWindowLabel?.includes("Full sentence example"), `Activation window should have a clear accessible label: ${base.activationWindowLabel}`, issues);
  assert(base.peakTokenAnimation.includes("token-peak-pulse") || viewport.width <= 1120, `Peak source token should visibly pulse on desktop/laptop: ${base.peakTokenAnimation}`, issues);
  assert(base.tokenLegend.length === 3, `Token evidence legend should have three entries: ${JSON.stringify(base.tokenLegend)}`, issues);
  assert(base.tokenLegend.some((item) => item.evidence === "supports" && item.text.includes("matches note")), `Token legend missing supporting key: ${JSON.stringify(base.tokenLegend)}`, issues);
  assert(base.tokenLegend.some((item) => item.evidence === "context" && item.text.includes("sentence")), `Token legend missing context key: ${JSON.stringify(base.tokenLegend)}`, issues);
  assert(base.tokenLegend.some((item) => item.evidence === "misleading" && item.text.includes("warning")), `Token legend missing warning key: ${JSON.stringify(base.tokenLegend)}`, issues);
  assert(base.tokenListRole === "list" && base.tokenListLabel === "Highlighted-text labels", `Highlighted-text list should be labeled for accessibility: role=${base.tokenListRole}, label=${base.tokenListLabel}`, issues);
  assert(new Set(base.agreementMarkerPositions).size === 4, `Agreement chart story markers should not overlap: ${base.agreementMarkerPositions.join(" | ")}`, issues);
  assert(!base.oldCopy, "Old confusing copy is visible.", issues);
  assert(base.findingTopic === "42%", `Unexpected topic finding: ${base.findingTopic}`, issues);
  assert(base.findingTypical === "0.038%", `Unexpected typical-rate finding: ${base.findingTypical}`, issues);
  assert(base.findingNoMatch === "58%", `Unexpected no-match finding: ${base.findingNoMatch}`, issues);
  assert(base.agreementTakeaway?.includes("A word match is not enough") && base.agreementTakeaway?.includes("cataracts"), `Agreement chart interpretation cue is missing: ${base.agreementTakeaway}`, issues);
  if (viewport.width >= 900) {
    assert(base.agreementStoryLabels.length >= 2 && base.agreementStoryLabels.join(" ").includes("URL") && base.agreementStoryLabels.join(" ").includes("Python"), `Agreement chart should label story-case marker groups without relying on crowded segment notes: ${base.agreementStoryLabels.join(" | ")}`, issues);
  }
  const methodText = base.methodText?.toLowerCase();
  assert(methodText?.includes("how these numbers are made"), "Methods strip is missing.", issues);
  assert(methodText?.includes("dot map") && methodText?.includes("similar notes") && methodText?.includes("context, not proof"), `Methods strip missing dot-map method: ${base.methodText}`, issues);
  assert(methodText?.includes("match as a warning sign, not the answer"), `Methods strip missing word-match caveat: ${base.methodText}`, issues);
  const takeawayProof = base.takeawayProof?.toLowerCase();
  assert(base.takeawayRule?.includes("Which words or letters light up"), `Takeaway rule should explain highlighted text plainly: ${base.takeawayRule}`, issues);
  assert(takeawayProof?.includes("url") && takeawayProof?.includes("cat") && takeawayProof?.includes("star wars"), `Takeaway proof scorecard is incomplete: ${base.takeawayProof}`, issues);
  assert(takeawayProof?.includes("do not trust yet"), `Takeaway proof should include the cat-case rejection: ${base.takeawayProof}`, issues);
  assert(base.takeawaySnapshot?.includes("c-a-t inside cataracts") && base.takeawaySnapshot?.includes("eye surgery, not pets"), `Takeaway should end with a concrete cat/cataracts proof replay: ${base.takeawaySnapshot}`, issues);
  assert(base.takeawayProofColors.length === 4 && new Set(base.takeawayProofColors).size === 4 && base.takeawayProofColors.includes("#ff4057"), `Takeaway proof cards should carry the four case colors: ${base.takeawayProofColors.join(", ")}`, issues);
  assert(base.mobileEvidence.length === 4, `Expected four mobile evidence panels, found ${base.mobileEvidence.length}.`, issues);
  if (viewport.width < 900) {
    assert(base.mobileEvidence.every((item) => item.visible), "Mobile evidence panels should be visible on mobile.", issues);
    assert(base.chapterReceipts.every((item) => !item), "Narrow story cases should hide duplicate desktop receipts.", issues);
    assert(base.mobileStageNote.visible && base.mobileStageNote.text.includes("After the four examples"), `Mobile stage transition note should be visible: ${JSON.stringify(base.mobileStageNote)}`, issues);
    assert(base.dataScopeHeight <= 170, `Mobile dataset scope strip is too tall: ${base.dataScopeHeight}px.`, issues);
    if (viewport.width <= 720) {
      assert(base.heatmapRows.length >= 5 && base.heatmapRows.length <= 7, `Phone heatmap should show a readable top/story-topic subset, got rows: ${base.heatmapRows.join(", ")}`, issues);
      assert(base.heatmapRows.includes("Grammar") && base.heatmapRows.includes("Code") && base.heatmapRows.includes("Animals"), `Phone heatmap should include abbreviated top/story rows: ${base.heatmapRows.join(", ")}`, issues);
      assert(base.heatmapCellMetrics.minWidth >= 18 && base.heatmapCellMetrics.minHeight >= 42, `Phone heatmap cells are too small: ${JSON.stringify(base.heatmapCellMetrics)}`, issues);
      assert(base.heatmapAnnotation === "Largest + story topics.", `Phone heatmap compact annotation is missing: ${base.heatmapAnnotation}`, issues);
      assert(base.storyHitTargets.minWidth >= 28 && base.storyHitTargets.minHeight >= 28, `Phone story-mark hit targets are too small: ${JSON.stringify(base.storyHitTargets)}`, issues);
    }
    assert(base.agreementPanelHeight <= 580, `Mobile agreement chart panel is too tall: ${base.agreementPanelHeight}px.`, issues);
    if (viewport.width <= 720) {
      assert(base.agreementMarkerLines === 0 && base.agreementMarkerDots === 4, `Phone agreement chart should use four compact dots and no dashed marker lines, got ${base.agreementMarkerDots} dots and ${base.agreementMarkerLines} lines.`, issues);
    }
    assert(base.mobileEvidence.every((item) => item.verdictContrast >= 7), `Mobile verdict contrast is too low: ${base.mobileEvidence.map((item) => item.verdictContrast.toFixed(2)).join(", ")}`, issues);
    assert(base.mobileEvidence.some((item) => item.text.includes("cataracts") && item.text.toLowerCase().includes("do not trust yet")), "Mobile cat evidence should show the cataracts mismatch.", issues);
  } else {
    assert(base.mobileEvidence.every((item) => !item.visible), "Mobile evidence panels should be hidden on desktop/laptop.", issues);
    assert(!base.mobileStageNote.visible, "Mobile stage transition note should be hidden on desktop/laptop.", issues);
  }
  assert(base.projectNoteSentences.length === 2 && base.projectNoteSentences.every((count) => count >= 4), `Project note sentence counts are too low: ${base.projectNoteSentences.join(", ")}`, issues);
  assert(base.projectNoteRows.length === 2 && base.projectNoteRows.every((count) => count >= 4), `Project note should use readable four-row answers: ${base.projectNoteRows.join(", ")}`, issues);

  await checkKeyboardFocusBasics(page, issues);

  const caseStates = [];
  for (const [selector, expected] of STORY_CASES) {
    await scrollCaseToReadingLine(page, selector);
    await checkNoHorizontalOverflow(page, `${viewport.name} ${selector}`, issues);
    const state = await getCaseState(page);
    caseStates.push({ selector, expected, ...state });
    assert(state.active === expected, `${selector} active case expected ${expected}, got ${state.active}.`, issues);
    if (selector === "#case-cat") {
      const colors = state.scoreColors.join(" ");
      assert(colors.includes("#f2ae33") && colors.includes("#ff4057"), `Cat case score meters should expose amber and red score colors, got ${colors}.`, issues);
      assert(state.tokenEvidence.some((item) => item.text === "cat" && item.evidence === "misleading" && item.visible), `Cat highlighted-text pill should visibly mark cat as misleading: ${JSON.stringify(state.tokenEvidence)}`, issues);
      assert(state.sourceCallout.includes("cat appears inside cataracts") && state.sourceCallout.includes("eye-surgery"), `Cat sentence callout should explain the mismatch: ${state.sourceCallout}`, issues);
    }
    if (selector === "#case-url") {
      assert(state.tokenEvidence.some((item) => item.evidence === "supports" && item.visible), `URL highlighted-text pills should visibly include supporting clues: ${JSON.stringify(state.tokenEvidence)}`, issues);
    }
    if (selector === "#case-star-wars") {
      assert(state.tokenEvidence.some((item) => item.evidence === "misleading" && item.visible), `Star Wars highlighted-text pills should visibly expose weak punctuation clues: ${JSON.stringify(state.tokenEvidence)}`, issues);
    }
    if (viewport.width >= 900) {
      assert(state.stageFits, `${selector} sticky stage does not fit: ${JSON.stringify(state.stage)}`, issues);
      assert(state.canvasFits, `${selector} atlas canvas does not fit: ${JSON.stringify(state.canvas)}`, issues);
    }
  }

  if (viewport.width < 900) {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      document.querySelector(".stage").scrollIntoView({ block: "start" });
    });
    await page.waitForTimeout(260);
    const mobileStage = await getCaseState(page);
    const mobileStageNote = await page.evaluate(() => {
      const note = document.querySelector(".mobile-stage-note").getBoundingClientRect();
      const header = document.querySelector(".site-header").getBoundingClientRect();
      return {
        top: note.top,
        bottom: note.bottom,
        headerBottom: header.bottom,
        visible: note.top >= header.bottom - 1 && note.bottom <= window.innerHeight + 1,
      };
    });
    assert(mobileStage.active === "Star Wars", `Mobile stage after all chapters should keep the final case active, got ${mobileStage.active}.`, issues);
    assert(mobileStage.tokenEvidence.some((item) => item.evidence === "misleading"), `Mobile final stage should expose weak Star Wars highlighted-text proof: ${JSON.stringify(mobileStage.tokenEvidence)}`, issues);
    assert(mobileStageNote.visible, `Mobile stage transition note should be visible after scrolling to stage: ${JSON.stringify(mobileStageNote)}`, issues);
  }

  if (viewport.width >= 900) {
    await checkStageRailNavigation(page, viewport, issues);
    await checkAtlasProbe(page, issues);
  }
  await checkHeaderNavigation(page, viewport, issues);
  await checkChartFocus(page, viewport, issues);
  await checkMobileChartNavigation(page, viewport, issues);

  for (const selector of ["#case-cat", ".pattern-slide-context", "#takeaway"]) {
    await page.evaluate((targetSelector) => {
      document.documentElement.style.scrollBehavior = "auto";
      document.querySelector(targetSelector)?.scrollIntoView({ block: "start" });
    }, selector);
    await page.waitForTimeout(160);
    await checkNoHorizontalOverflow(page, `${viewport.name} after scrolling to ${selector}`, issues);
  }

  await page.close();

  return { viewport, base, caseStates, issues };
}

async function checkDataFailureRecovery(browser) {
  const viewport = { name: "data-failure", width: 1024, height: 768 };
  const issues = [];
  const context = await browser.newContext({ viewport });
  await context.route("**/data/processed/features_site.json", (route) => route.abort());
  const page = await context.newPage();

  try {
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#data-status")?.dataset.state === "error", null, { timeout: 5000 });
    const state = await page.evaluate(() => {
      const status = document.querySelector("#data-status");
      const statusRect = status?.getBoundingClientRect();
      const statusStyles = status ? getComputedStyle(status) : null;
      return {
        status: status?.dataset.state || "",
        statusText: status?.textContent.trim() || "",
        title: document.querySelector("#feature-title")?.textContent.trim() || "",
        meta: document.querySelector("#feature-meta")?.textContent.trim() || "",
        visible: Boolean(statusRect && statusRect.width > 0 && statusRect.height > 0 && Number(statusStyles.opacity) > 0.9),
        color: statusStyles?.backgroundColor || "",
      };
    });
    assert(state.status === "error", `Data failure should set error status: ${JSON.stringify(state)}`, issues);
    assert(state.visible && state.statusText.includes("Could not load local data"), `Data failure status should be visible and actionable: ${JSON.stringify(state)}`, issues);
    assert(state.title === "Could not load data." && state.meta.includes("Run the local server"), `Data failure should update the stage copy: ${JSON.stringify(state)}`, issues);
  } catch (error) {
    issues.push(`Data failure recovery check crashed: ${error.message || error}`);
  } finally {
    await context.close();
  }

  return { viewport, base: null, caseStates: [], issues };
}

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      results.push(await checkViewport(browser, viewport));
    }
    results.push(await checkDataFailureRecovery(browser));
  } finally {
    await browser.close();
  }

  const allIssues = results.flatMap((result) => result.issues.map((issue) => `${result.viewport.name}: ${issue}`));

  for (const result of results) {
    console.log(`${result.viewport.name} ${result.viewport.width}x${result.viewport.height}: ${result.issues.length ? "failed" : "passed"}`);
  }

  if (allIssues.length) {
    console.error(`\nSmoke test failed:\n${allIssues.join("\n")}`);
    process.exit(1);
  }

  console.log(`Smoke-tested ${VIEWPORTS.length} viewports plus data-failure recovery at ${SITE_URL}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
