import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoA11yViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(result.violations).toEqual([]);
}

test.describe("accessibility smoke checks", () => {
  test("geography view has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "AI Governance Map" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("country list map alternative has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Country list" }).click();
    await expect(page.getByRole("dialog", { name: "Keyboard-accessible country list" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("network view has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Network" }).click();
    await page.getByRole("button", { name: "Node list" }).click();

    await expectNoA11yViolations(page);
  });

  test("timeline view has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Timeline" }).click();
    await expect(page.getByRole("heading", { name: "Chronology of AI governance" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("table view has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Table" }).click();
    await expect(page.getByRole("heading", { name: "Research table" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("methodology panel has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Data", exact: true }).click();
    await page.getByRole("button", { name: "Methodology" }).click();
    await expect(page.getByRole("dialog", { name: "Methodology" })).toBeVisible();

    await expectNoA11yViolations(page);
  });

  test("embed card has no automated WCAG A/AA violations", async ({ page }) => {
    await page.goto("/embed/country/USA");
    await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();

    await expectNoA11yViolations(page);
  });
});
