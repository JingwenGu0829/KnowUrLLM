const path = require("path");
const fs = require("fs");

const SITE_URL = process.env.SITE_URL || "http://localhost:8080/";
const OUT_ROOT = path.resolve(__dirname, "..", "audit_screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "wide-short", width: 1280, height: 650 },
  { name: "laptop-short", width: 1122, height: 720 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const ANCHORS = [
  { key: "top", selector: "#top", how: "top" },
  { key: "case-url", selector: "#case-url", how: "scroll" },
  { key: "case-cat", selector: "#case-cat", how: "scroll" },
  { key: "patterns-context", selector: ".pattern-slide-context", how: "scroll" },
  { key: "agreement-panel", selector: ".agreement-panel", how: "scroll" },
  { key: "takeaway", selector: "#takeaway", how: "scroll" },
  { key: "project-note", selector: "#project-note", how: "scroll" },
];

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    throw new Error(
      "Playwright is required. Run with NODE_PATH pointing to a Playwright install."
    );
  }
}

async function capture() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });

  for (const viewport of VIEWPORTS) {
    const dir = path.join(OUT_ROOT, viewport.name);
    fs.mkdirSync(dir, { recursive: true });

    const page = await browser.newPage({ viewport });
    await page.goto(SITE_URL, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("#data-status")?.dataset.state === "ready",
      null,
      { timeout: 10000 }
    );
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      // Settle reveal-item animations so screenshots show the final layout.
      document.querySelectorAll(".reveal-item").forEach((el) => {
        el.style.transition = "none";
        el.classList.add("is-visible");
      });
    });

    for (const anchor of ANCHORS) {
      if (anchor.how === "top") {
        await page.evaluate(() => window.scrollTo(0, 0));
      } else {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) el.scrollIntoView({ block: "start" });
        }, anchor.selector);
      }
      await page.waitForTimeout(220);
      const outFile = path.join(dir, `${anchor.key}.png`);
      await page.screenshot({ path: outFile, fullPage: false });
      console.log(`  ${viewport.name}/${anchor.key}.png`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`Captured ${VIEWPORTS.length * ANCHORS.length} screenshots in ${OUT_ROOT}`);
}

capture().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
