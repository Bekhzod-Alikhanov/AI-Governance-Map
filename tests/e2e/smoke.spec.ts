import { expect, test } from "@playwright/test";

test.describe("governance map smoke flows", () => {
  test("opens data exports and map details", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "AI Governance Map" })).toBeVisible();
    await expect(page.getByRole("note")).toHaveCount(0);
    await expect(page.getByLabel("Map scope: World overview")).toBeVisible();
    await page.getByLabel("Map color mode").selectOption("gov-ai-readiness");
    await page.getByRole("button", { name: "Legend" }).click();
    await expect(page.getByText(/AI Atlas colors show contextual/)).toBeVisible();
    await page.getByRole("button", { name: "Legend" }).click();

    await page.getByRole("button", { name: "Data", exact: true }).click();
    await expect(page.getByRole("button", { name: "Download dataset JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download filtered JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download citation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Methodology" })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download citation" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^global-ai-governance-map-citation-.*\.txt$/);

    await page.getByRole("button", { name: "Australia - open country details" }).click();
    await expect(page.getByLabel("Map focus")).toHaveValue("results");
    const australiaDrawer = page.getByRole("dialog", { name: "Australia AI governance details" });
    await expect(australiaDrawer).toBeVisible();
    await expect(australiaDrawer.getByText("Research answer")).toBeVisible();
    await expect(australiaDrawer.getByText("AI Atlas context")).toBeVisible();
    await expect(australiaDrawer.getByRole("button", { name: "Copy citation" }).first()).toBeVisible();
    await australiaDrawer.getByRole("button", { name: "Evidence dossier" }).click();
    const countryDossier = page.getByRole("dialog", { name: "Australia evidence dossier" });
    await expect(countryDossier).toBeVisible();
    await expect(countryDossier.getByText("Answer summary")).toBeVisible();
    await expect(countryDossier.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(countryDossier.getByRole("button", { name: "Copy Markdown" })).toBeVisible();
    const dossierDownloadPromise = page.waitForEvent("download");
    await countryDossier.getByRole("button", { name: "Download Markdown" }).click();
    const dossierDownload = await dossierDownloadPromise;
    expect(dossierDownload.suggestedFilename()).toBe("global-ai-governance-map-country-aus-evidence-dossier.md");
    await countryDossier.getByRole("button", { name: "Close evidence dossier" }).click();
    await expect(countryDossier).toBeHidden();
    await australiaDrawer.getByRole("button", { name: "Compare", exact: true }).click();
    await expect(australiaDrawer.getByRole("button", { name: "Pinned" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comparison" })).toBeVisible();
    await expect(page.getByText(/1 pinned item/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Report correction" }).first()).toBeVisible();

    await australiaDrawer.getByRole("button", { name: /Bletchley Declaration/ }).click();
    await australiaDrawer.getByRole("button", { name: "Dossier", exact: true }).click();
    const instrumentDossier = page.getByRole("dialog", { name: /Bletchley Declaration evidence dossier/ });
    await expect(instrumentDossier).toBeVisible();
    await expect(instrumentDossier.getByText("Participation pattern")).toBeVisible();
    await instrumentDossier.getByRole("button", { name: "Close evidence dossier" }).click();
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
    const openAiDrawer = page.getByRole("dialog", { name: "OpenAI frontier-lab details" });
    await expect(openAiDrawer.getByText("Regulatory exposure")).toBeVisible();
    await expect(openAiDrawer.getByRole("button", { name: "Binding" })).toBeVisible();
    await expect(openAiDrawer.getByRole("button", { name: "Standards" })).toBeVisible();
    await expect(openAiDrawer.getByText("Infra", { exact: true }).first()).toBeVisible();
    await openAiDrawer.getByRole("button", { name: "Standards" }).click();
    await expect(openAiDrawer.getByText("ISO/IEC 42001:2023").first()).toBeVisible();
    await openAiDrawer.getByRole("button", { name: "Infrastructure" }).click();
    await expect(openAiDrawer.getByText("Advanced AI chips").first()).toBeVisible();
    await openAiDrawer.getByRole("button", { name: "Evidence dossier" }).click();
    const labDossier = page.getByRole("dialog", { name: "OpenAI evidence dossier" });
    await expect(labDossier).toBeVisible();
    await expect(labDossier.getByText("Regulatory exposure")).toBeVisible();
    await expect(labDossier.getByText("Advanced AI chips").first()).toBeVisible();
    await page.evaluate(() => {
      window.print = () => undefined;
    });
    await labDossier.getByRole("button", { name: "Print / Save as PDF" }).click();
    await labDossier.getByRole("button", { name: "Close evidence dossier" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "OpenAI frontier-lab details" })).toBeHidden();

    await page.getByRole("button", { name: "United States, country node - open country details" }).press("Enter");
    await expect(page.getByRole("dialog", { name: "United States AI governance details" })).toBeVisible();
  });

  test("supports in-page map maximize mode", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Map focus").selectOption("europe");
    await expect(page.getByLabel("Map focus")).toHaveValue("europe");
    await page.getByRole("button", { name: "Zoom map in" }).click();
    await expect(page.getByLabel("Map focus")).toHaveValue("custom");
    await page.getByRole("button", { name: "Reset map view" }).click();
    await expect(page.getByLabel("Map focus")).toHaveValue("world");

    await page.getByRole("button", { name: "Maximize map" }).click();
    await expect(page.getByRole("button", { name: "Exit maximize" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Governance Map" })).toHaveCount(0);
    await expect(page.getByText(/^Sources:/)).toHaveCount(0);
    await page.getByRole("button", { name: "Exit maximize" }).click();
    await expect(page.getByRole("heading", { name: "AI Governance Map" })).toBeVisible();

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
    await expect(page.getByLabel("Map focus")).toHaveValue("results");
    await expect(page.getByLabel(/Map scope: Fitted:/)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Instrument: Council of Europe Framework Convention/)).toBeVisible();

    await page.getByRole("button", { name: "Data", exact: true }).click();
    await page.getByRole("button", { name: "Methodology" }).click();
    await expect(page.getByRole("dialog", { name: "Methodology" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Methodology" })).toBeHidden();

    await page.goto("/");
    await page.getByRole("tab", { name: "Table" }).click();
    await expect(page.getByRole("heading", { name: "Research table" })).toBeVisible();
    await page.getByRole("button", { name: "Instruments" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("global-ai-governance-map-instruments.csv");

    await page.getByRole("button", { name: "Exposure" }).click();
    await expect(page.getByText("EU AI Act", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Strength" }).click();
    const exposureDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const exposureDownload = await exposureDownloadPromise;
    expect(exposureDownload.suggestedFilename()).toBe("global-ai-governance-map-exposure.csv");

    await page.getByRole("button", { name: "Lab intel" }).click();
    await expect(page.getByText("Preparedness Framework").first()).toBeVisible();
    const labIntelDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const labIntelDownload = await labIntelDownloadPromise;
    expect(labIntelDownload.suggestedFilename()).toBe("global-ai-governance-map-lab-intelligence.csv");

    await page.getByRole("button", { name: "Obligations" }).click();
    await expect(page.getByText("Incident reporting").first()).toBeVisible();
    const obligationDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const obligationDownload = await obligationDownloadPromise;
    expect(obligationDownload.suggestedFilename()).toBe("global-ai-governance-map-obligations.csv");

    await page.getByRole("button", { name: "Indicators" }).click();
    await expect(page.getByText("Government AI Readiness Index 2025").first()).toBeVisible();
    const indicatorDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const indicatorDownload = await indicatorDownloadPromise;
    expect(indicatorDownload.suggestedFilename()).toBe("global-ai-governance-map-indicators.csv");
  });

  test("opens stable record URLs and the research workbench", async ({ page }) => {
    await page.goto("/country/USA");

    await expect(page.getByRole("tab", { name: "Workbench" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("h3", { hasText: "United States" })).toBeVisible();
    await expect(page.getByText("Obligations:", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Implementation:", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Open country drawer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Stable URL" })).toHaveAttribute("href", "/country/USA");

    await page.goto("/lab/openai");
    await expect(page.getByRole("heading", { name: "OpenAI", level: 3 })).toBeVisible();
    await expect(page.getByText("Regulatory scenario")).toBeVisible();

    await page.goto("/instrument/eu-ai-act");
    await expect(page.getByRole("heading", { name: /EU AI Act/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Evidence dossier" }).first()).toBeVisible();

    await page.goto("/obligation/ca-sb-53-incident-reporting");
    await expect(page.getByRole("heading", { name: "Incident reporting" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Parent record" })).toBeVisible();

    await page.goto("/exposure/openai--market_access--eu-ai-act-regional");
    await expect(page.getByRole("heading", { name: /OpenAI - EU AI Act/ })).toBeVisible();
    await expect(page.getByText("Exposure record")).toBeVisible();
  });

  test("supports Workbench research questions and standalone embed cards", async ({ page }) => {
    await page.goto("/?lens=workbench");

    await expect(page.getByRole("heading", { name: "Answer concrete AI-governance questions" })).toBeVisible();
    const labBoard = page.locator("section", { has: page.getByRole("heading", { name: "Frontier lab intelligence board" }) });
    await expect(labBoard).toBeVisible();
    await expect(labBoard.getByText("Preparedness Framework").first()).toBeVisible();
    const labBoardDownloadPromise = page.waitForEvent("download");
    await labBoard.getByRole("button", { name: "Export Lab Board CSV" }).click();
    const labBoardDownload = await labBoardDownloadPromise;
    expect(labBoardDownload.suggestedFilename()).toBe("global-ai-governance-map-lab-intelligence.csv");
    await page.getByRole("button", { name: /Who requires incident reporting/ }).click();
    await expect(page).toHaveURL(/wbQuestion=incident-reporting/);
    await expect(page.getByRole("heading", { name: "Incident reporting" }).first()).toBeVisible();
    const comparisonDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export comparison CSV" }).click();
    const comparisonDownload = await comparisonDownloadPromise;
    expect(comparisonDownload.suggestedFilename()).toBe("ai-governance-workbench-comparison.csv");

    await page.goto("/embed/country/USA");
    await expect(page.getByRole("heading", { name: "United States" })).toBeVisible();
    await expect(page.getByText("AI Governance Map embed")).toBeVisible();

    await page.goto("/embed/exposure/openai--market_access--eu-ai-act-regional");
    await expect(page.getByRole("heading", { name: /OpenAI - EU AI Act/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open full record" })).toBeVisible();
  });

  test("supports research corpus routes, exports, briefs, and context map modes", async ({ page }) => {
    await page.goto("/?lens=workbench");

    const corpus = page.locator("section", { has: page.getByRole("heading", { name: /Find institutions/ }) });
    await expect(corpus).toBeVisible();
    await expect(corpus.getByText("European AI Office", { exact: true }).first()).toBeVisible();
    const corpusDownloadPromise = page.waitForEvent("download");
    await corpus.getByRole("button", { name: "Export corpus CSV" }).click();
    const corpusDownload = await corpusDownloadPromise;
    expect(corpusDownload.suggestedFilename()).toBe("global-ai-governance-map-research-corpus.csv");

    await corpus.getByRole("button", { name: "Institution map" }).click();
    await expect(page.getByLabel("Map color mode")).toHaveValue("ai-institutions");
    await expect(page.getByText("Sources:")).toBeVisible();

    await page.goto("/institution/eu-ai-office");
    await expect(page.getByRole("heading", { name: "European AI Office" })).toBeVisible();
    await expect(page.getByText("not a separate national law")).toBeVisible();
    await page.getByRole("button", { name: "Dossier" }).first().click();
    await expect(page.getByRole("dialog", { name: /European AI Office evidence dossier/ })).toBeVisible();
    await page.getByLabel("Close evidence dossier").click();

    await page.getByRole("button", { name: "Brief" }).first().click();
    await expect(page.getByRole("dialog", { name: /European AI Office brief/ })).toBeVisible();
    const briefDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download Markdown" }).click();
    const briefDownload = await briefDownloadPromise;
    expect(briefDownload.suggestedFilename()).toBe("global-ai-governance-map-institution-eu-ai-office-policy-brief.md");
    await page.getByLabel("Close policy brief").click();

    await page.goto("/policy-process/eu-high-risk-ai-guidelines-consultation-2026");
    await expect(page.getByRole("heading", { name: /high-risk AI classification/ })).toBeVisible();
    await expect(page.getByText("deadline", { exact: false }).first()).toBeVisible();

    await page.goto("/standard/iso-iec-42001-ai-management-system");
    await expect(page.getByRole("heading", { name: /ISO\/IEC 42001/ })).toBeVisible();
    await expect(page.getByText("Standards and conformity")).toBeVisible();
  });

  test("keeps map result scope clear while filtering", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Map scope: World overview")).toBeVisible();
    await page.getByRole("button", { name: "Country list" }).click();
    const countryList = page.getByRole("dialog", { name: "Keyboard-accessible country list" });
    await expect(countryList).toBeVisible();
    await countryList.getByRole("button", { name: /Australia/ }).click();
    await expect(page.getByRole("dialog", { name: "Australia AI governance details" })).toBeVisible();
    await expect(page.getByText("Why this country is colored this way")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Reset map view" }).click();

    await page.getByRole("button", { name: /^Instrument/ }).click();
    await page.getByLabel(/Bletchley Declaration/).check();
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Map focus")).toHaveValue("world");
    await expect(page.getByLabel("Map scope: Matches: 29 countries")).toBeVisible();

    await page.getByRole("button", { name: /Zoom to results/ }).click();
    await expect(page.getByLabel("Map focus")).toHaveValue("results");
    await expect(page.getByLabel("Map scope: Fitted: 29 countries")).toBeVisible();

    const mapScope = page.getByRole("status", { name: /Map scope:/ });
    const fittedBefore = await mapScope.getAttribute("aria-label");
    await page.getByRole("button", { name: /^Region/ }).click();
    await page.getByLabel("Europe").check();
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Map focus")).toHaveValue("results");
    await expect(mapScope).not.toHaveAttribute("aria-label", fittedBefore ?? "");
    await expect(mapScope).toHaveAttribute("aria-label", /Map scope: Fitted:/);

    await page.getByLabel("Search countries, acts, instruments").fill("definitely-not-on-the-map");
    await expect(page.getByLabel("Map focus")).toHaveValue("world");
    await expect(page.getByLabel("Map scope: No map matches")).toBeVisible();

    await page.locator("[data-filter-toolbar]").getByRole("button", { name: "Reset" }).click();
    await expect(page.getByLabel("Map scope: World overview")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
