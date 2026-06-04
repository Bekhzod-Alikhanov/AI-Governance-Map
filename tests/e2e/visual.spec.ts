import { expect, test } from "@playwright/test";

test.describe("visual QA captures", () => {
  test("captures map, workbench, and embed states", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByLabel("Map color mode")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("map-overview.png"), fullPage: false });

    const mapBox = await page.locator("#main-content").boundingBox();
    expect(mapBox?.width ?? 0).toBeGreaterThan(300);
    expect(mapBox?.height ?? 0).toBeGreaterThan(300);

    await page.goto("/?lens=workbench");
    await expect(page.getByRole("heading", { name: "Answer concrete AI-governance questions" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("workbench.png"), fullPage: false });

    await page.goto("/embed/country/USA");
    await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("embed-country.png"), fullPage: false });
  });
});
