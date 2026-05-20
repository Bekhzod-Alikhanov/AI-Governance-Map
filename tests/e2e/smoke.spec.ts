import { expect, test } from "@playwright/test";

test.describe("governance map smoke flows", () => {
  test("opens data exports and map details", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Global AI Governance Map" })).toBeVisible();
    await expect(page.getByText(/Research dashboard, not legal advice/)).toBeVisible();

    await page.getByRole("button", { name: "Data", exact: true }).click();
    await expect(page.getByRole("button", { name: "Download dataset JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download citation" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download citation" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^global-ai-governance-map-citation-.*\.txt$/);

    await page.getByRole("button", { name: "Canada - open country details" }).press("Enter");
    await expect(page.getByRole("dialog", { name: "Canada AI governance details" })).toBeVisible();
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
});
