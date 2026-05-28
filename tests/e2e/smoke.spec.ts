import { expect, test } from "@playwright/test";

test.describe("governance map smoke flows", () => {
  test("opens data exports and map details", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Global AI Governance Map" })).toBeVisible();
    await expect(page.getByRole("note")).toHaveCount(0);

    await page.getByRole("button", { name: "Data", exact: true }).click();
    await expect(page.getByRole("button", { name: "Download dataset JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download citation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Methodology" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download citation" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^global-ai-governance-map-citation-.*\.txt$/);

    await page.getByRole("button", { name: "Canada - open country details" }).press("Enter");
    await expect(page.getByRole("dialog", { name: "Canada AI governance details" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Report correction" }).first()).toBeVisible();
  });

  test("supports the network node list and detail drawers", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Network" }).click();
    await page.getByRole("button", { name: "Node list" }).click();
    await page.getByLabel("Find node").fill("OpenAI");
    await page
      .locator("#network-node-list")
      .getByRole("button", { name: "OpenAI, lab node - open lab details" })
      .click();

    await expect(page.getByRole("dialog", { name: "OpenAI frontier-lab details" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "OpenAI frontier-lab details" })).toBeHidden();

    await page.getByRole("button", { name: "United States, country node - open country details" }).press("Enter");
    await expect(page.getByRole("dialog", { name: "United States AI governance details" })).toBeVisible();
  });

  test("supports in-page map maximize mode", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Maximize map" }).click();
    await expect(page.getByRole("button", { name: "Exit maximize" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Global AI Governance Map" })).toHaveCount(0);
    await expect(page.getByText(/^Sources:/)).toHaveCount(0);
    await page.getByRole("button", { name: "Exit maximize" }).click();
    await expect(page.getByRole("heading", { name: "Global AI Governance Map" })).toBeVisible();

    await page.getByRole("tab", { name: "Layers" }).click();
    await page.getByRole("button", { name: "Maximize map" }).click();
    await expect(page.getByRole("button", { name: "Exit maximize" })).toBeVisible();
    await page.getByRole("button", { name: "Exit maximize" }).click();
  });

  test("keeps timeline and tour reachable", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Timeline" }).click();
    await expect(page.getByRole("heading", { name: "Chronology of AI governance" })).toBeVisible();

    await page.getByRole("button", { name: "Take the tour" }).click();
    const walkthrough = page.getByRole("dialog", { name: /Walkthrough/ });
    await expect(walkthrough).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(walkthrough).toContainText(/2 of/);
    await page.getByRole("button", { name: "Exit walkthrough" }).click();
    await expect(walkthrough).toBeHidden();
  });

  test("supports research presets, shareable URLs, methodology, and table export", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Questions" }).click();
    await page.getByRole("button", { name: /Who signed or ratified the Council of Europe AI Convention/ }).click();
    await expect(page).toHaveURL(/coe-ai-convention/);
    await page.reload();
    await expect(page.getByText(/Instrument: Council of Europe Framework Convention/)).toBeVisible();

    await page.getByRole("button", { name: "Data", exact: true }).click();
    await page.getByRole("button", { name: "Methodology" }).click();
    await expect(page.getByRole("dialog", { name: "Methodology" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Methodology" })).toBeHidden();

    await page.getByRole("tab", { name: "Table" }).click();
    await expect(page.getByRole("heading", { name: "Research table" })).toBeVisible();
    await page.getByRole("button", { name: "Instruments" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("global-ai-governance-map-instruments.csv");
  });
});
