import { expect, test } from "@playwright/test";

test.describe("visual regression baselines", () => {
  // Tolerances are deliberately tight. At threshold 0.25 / ratio 0.04 this
  // baseline passed after a change recoloured 101 of 167 countries, because
  // grey and light violet sit close enough in the per-pixel colour metric.
  // A visual baseline that tolerates a change of meaning is worse than none.
  // Each project keeps its own viewport (Desktop Chrome / Pixel 7) so the
  // mobile baseline protects the mobile layout rather than a desktop render
  // wearing a mobile user agent.
  test("map SVG remains visually stable", async ({ page }) => {
    await page.goto("/");
    // Target the projection explicitly. "first svg in main" silently captured a
    // control-button icon once the control cluster moved ahead of the map in DOM
    // order for keyboard focus.
    const mapSvg = page.locator("#main-content svg.rsm-svg");
    await expect(page.getByLabel("Map color mode")).toBeVisible();
    await expect(mapSvg).toBeVisible();
    await expect(mapSvg).toHaveScreenshot("map-overview-svg.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
      threshold: 0.1,
    });
  });

  test("country embed card remains visually stable", async ({ page }) => {
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
