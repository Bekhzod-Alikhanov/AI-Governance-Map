import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test, type TestInfo } from "@playwright/test";

/**
 * Pixel baselines are platform-specific. SVG antialiasing across 167 country
 * borders differs between Windows and Linux by roughly 5% of pixels — more than
 * the tolerances below allow, and deliberately so: loosening them far enough to
 * absorb that difference is what let a recolour of 101 countries pass unnoticed.
 *
 * So baselines are stored per platform (see `snapshotPathTemplate`), and a
 * platform with no committed baseline skips rather than silently writing one and
 * reporting success. To add a platform, run the suite there with
 * `--update-snapshots` and commit the result.
 */
function skipWithoutBaseline(testInfo: TestInfo, name: string) {
  const baseline = path.join(
    testInfo.project.testDir,
    "__screenshots__",
    process.platform,
    testInfo.project.name,
    path.basename(testInfo.file),
    name
  );
  test.skip(
    !existsSync(baseline),
    `No ${process.platform} baseline for ${name}. Generate with --update-snapshots and commit.`
  );
}

test.describe("visual regression baselines", () => {
  // Tolerances are deliberately tight. At threshold 0.25 / ratio 0.04 this
  // baseline passed after a change recoloured 101 of 167 countries, because
  // grey and light violet sit close enough in the per-pixel colour metric.
  // A visual baseline that tolerates a change of meaning is worse than none.
  // Each project keeps its own viewport (Desktop Chrome / Pixel 7) so the
  // mobile baseline protects the mobile layout rather than a desktop render
  // wearing a mobile user agent.
  test("map SVG remains visually stable", async ({ page }, testInfo) => {
    skipWithoutBaseline(testInfo, "map-overview-svg.png");
    await page.goto("/");
    // Target the projection explicitly. "first svg in main" silently captured a
    // control-button icon once the control cluster moved ahead of the map in DOM
    // order for keyboard focus.
    const mapSvg = page.locator("#main-content svg.world-map");
    await expect(page.getByLabel("Map color mode")).toBeVisible();
    await expect(mapSvg).toBeVisible();
    await expect(mapSvg).toHaveScreenshot("map-overview-svg.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
    });
  });

  test("country embed card remains visually stable", async ({ page }, testInfo) => {
    skipWithoutBaseline(testInfo, "embed-country-usa.png");
    await page.goto("/embed/country/USA");
    const card = page.getByRole("main");
    await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();
    await expect(card).toHaveScreenshot("embed-country-usa.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
      threshold: 0.15,
    });
  });
});
