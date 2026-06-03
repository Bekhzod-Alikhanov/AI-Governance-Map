import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const outDir = path.join(root, "public", "data");

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sourceEntries(snapshot) {
  const entries = [];
  for (const [collection, rows] of Object.entries(snapshot.data)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row || typeof row !== "object" || !row.sourceUrl) continue;
      entries.push({
        collection,
        id: row.id,
        name: row.name ?? row.label ?? row.id,
        sourceName: row.sourceName,
        sourceUrl: row.sourceUrl,
        sourceKind: row.sourceKind ?? "",
        verificationStatus: row.verificationStatus ?? "",
        confidence: row.confidence ?? "",
        lastVerified: row.lastVerified ?? "",
        verificationNotes: row.verificationNotes ?? "",
      });
    }
  }
  return entries.sort((a, b) => `${a.collection}:${a.id}`.localeCompare(`${b.collection}:${b.id}`));
}

const server = await createServer({
  root,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const exportDataset = await server.ssrLoadModule("/src/utils/exportDataset.ts");
  const countriesModule = await server.ssrLoadModule("/src/data/countries.ts");
  const releasesModule = await server.ssrLoadModule("/src/data/datasetReleases.ts");
  const obligationsModule = await server.ssrLoadModule("/src/data/governanceObligations.ts");
  const labExposureModule = await server.ssrLoadModule("/src/data/labRegulatoryExposures.ts");
  const summaryModule = await server.ssrLoadModule("/src/utils/getCountryGovernanceSummary.ts");
  const workbenchModule = await server.ssrLoadModule("/src/utils/researchWorkbench.ts");

  const snapshot = exportDataset.buildDatasetSnapshot();
  const countrySummaries = countriesModule.COUNTRIES
    .filter((country) => country.iso3 !== "EUU")
    .map((country) => {
      const summary = summaryModule.getCountryGovernanceSummary(country.iso3);
      return {
        iso3: country.iso3,
        name: country.name,
        region: country.region,
        isEUMember: Boolean(country.isEUMember),
        hasBindingNationalLaw: summary.hasBindingNationalLaw,
        hasAnyAIRule: summary.hasAnyAIRule,
        hasFrontierAIRelevant: summary.hasFrontierAIRelevant,
        nationalEntryCount: summary.nationalRegulations.length,
        internationalParticipationCount: summary.participations.length,
        frontierLabCount: summary.hqLabs.length,
        obligationCount: workbenchModule.getCountryObligations(country.iso3).length,
        implementationMilestoneCount: workbenchModule.getCountryImplementationMilestones(country.iso3).length,
      };
    });

  await mkdir(outDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outDir, "full-dataset.json"), stableJson(snapshot), "utf8"),
    writeFile(
      path.join(outDir, "catalog.json"),
      stableJson({
        title: "Global AI Governance Map public data endpoints",
        snapshotDate: snapshot.snapshotDate,
        schemaVersion: snapshot.schemaVersion,
        caveat: snapshot.caveat,
        endpoints: [
          "/data/full-dataset.json",
          "/data/country-summaries.json",
          "/data/obligation-matrix.json",
          "/data/lab-exposure-matrix.json",
          "/data/source-metadata.json",
          "/data/changelog.json",
        ],
      }),
      "utf8"
    ),
    writeFile(path.join(outDir, "country-summaries.json"), stableJson(countrySummaries), "utf8"),
    writeFile(path.join(outDir, "obligation-matrix.json"), stableJson(obligationsModule.GOVERNANCE_OBLIGATIONS), "utf8"),
    writeFile(path.join(outDir, "lab-exposure-matrix.json"), stableJson(labExposureModule.LAB_REGULATORY_EXPOSURES), "utf8"),
    writeFile(path.join(outDir, "source-metadata.json"), stableJson(sourceEntries(snapshot)), "utf8"),
    writeFile(path.join(outDir, "changelog.json"), stableJson(releasesModule.DATASET_RELEASES), "utf8"),
  ]);
} finally {
  await server.close();
}
