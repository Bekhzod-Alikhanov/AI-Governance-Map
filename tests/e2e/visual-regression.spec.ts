import { expect, test } from "@playwright/test";

test.describe("visual regression baselines", () => {
  test("map SVG remains visually stable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop-only visual baselines");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const mapSvg = page.locator("#main-content svg").first();
    await expect(page.getByLabel("Map color mode")).toBeVisible();
    await expect(mapSvg).toBeVisible();
    await expect(mapSvg).toHaveScreenshot("map-overview-svg.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.04,
      threshold: 0.25,
    });
  });

  test("country embed card remains visually stable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop-only visual baselines");
    await page.setViewportSize({ width: 720, height: 540 });
    await page.goto("/embed/country/USA");
    const card = page.getByRole("main");
    await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();
    await expect(card).toHaveScreenshot("embed-country-usa.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.08,
      threshold: 0.3,
    });
  });
});
