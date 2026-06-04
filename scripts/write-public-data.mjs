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

function publicUrl(pathname) {
  return `https://global-ai-governance-map.vercel.app${pathname}`;
}

function recordPageIndex(snapshot) {
  const records = [];
  for (const country of snapshot.data.countries.filter((country) => country.iso3 !== "EUU")) {
    records.push({ kind: "country", id: country.iso3, name: country.name, url: publicUrl(`/country/${country.iso3}`) });
  }
  for (const lab of snapshot.data.frontierLabs) {
    records.push({ kind: "lab", id: lab.id, name: lab.name, url: publicUrl(`/lab/${lab.id}`) });
  }
  for (const instrument of snapshot.data.internationalInstruments) {
    records.push({ kind: "instrument", id: instrument.id, name: instrument.name, url: publicUrl(`/instrument/${instrument.id}`) });
  }
  for (const rule of [...snapshot.data.nationalAIRegulations, ...snapshot.data.subnationalAIRules]) {
    records.push({ kind: "rule", id: rule.id, name: rule.name, url: publicUrl(`/rule/${rule.id}`) });
  }
  for (const obligation of snapshot.data.governanceObligations) {
    records.push({ kind: "obligation", id: obligation.id, name: obligation.category, url: publicUrl(`/obligation/${obligation.id}`) });
  }
  for (const exposure of snapshot.data.labRegulatoryExposures) {
    records.push({ kind: "exposure", id: exposure.id, name: `${exposure.labId} -> ${exposure.targetId}`, url: publicUrl(`/exposure/${exposure.id}`) });
  }
  return records.sort((a, b) => `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`));
}

function embedCards(snapshot, countrySummaries) {
  const byCountry = new Map(countrySummaries.map((row) => [row.iso3, row]));
  return {
    countryCards: countrySummaries.map((row) => ({
      kind: "country-card",
      id: row.iso3,
      title: row.name,
      subtitle: row.region,
      summary: `${row.nationalEntryCount} national entries; ${row.internationalParticipationCount} international rows; ${row.obligationCount} obligation rows.`,
      url: publicUrl(`/country/${row.iso3}`),
      embedUrl: publicUrl(`/embed/country/${row.iso3}`),
    })),
    labExposureCards: snapshot.data.labRegulatoryExposures.map((row) => ({
      kind: "lab-exposure-card",
      id: row.id,
      title: row.id,
      subtitle: `${row.legalEffect} / ${row.directness}`,
      summary: row.rationale,
      url: publicUrl(`/exposure/${row.id}`),
      embedUrl: publicUrl(`/embed/exposure/${encodeURIComponent(row.id)}`),
    })),
    treatyParticipationCards: snapshot.data.internationalInstruments.map((instrument) => ({
      kind: "treaty-participation-card",
      id: instrument.id,
      title: instrument.name,
      subtitle: instrument.bindingStatus,
      summary: instrument.summary,
      url: publicUrl(`/instrument/${instrument.id}`),
      embedUrl: publicUrl(`/embed/instrument/${instrument.id}`),
    })),
    obligationCards: snapshot.data.governanceObligations.map((row) => ({
      kind: "obligation-card",
      id: row.id,
      title: row.category,
      subtitle: `${row.legalEffect} / ${row.directness}`,
      summary: row.summary,
      url: publicUrl(`/obligation/${row.id}`),
      embedUrl: publicUrl(`/embed/obligation/${encodeURIComponent(row.id)}`),
    })),
    implementationDeadlineCards: snapshot.data.implementationMilestones.map((row) => ({
      kind: "implementation-deadline-card",
      id: row.id,
      title: row.label,
      subtitle: row.nextDeadline ? `Next deadline: ${row.nextDeadline}` : row.status,
      summary: row.summary,
      url: publicUrl(`/embed/implementation/${encodeURIComponent(row.id)}`),
      embedUrl: publicUrl(`/embed/implementation/${encodeURIComponent(row.id)}`),
    })),
    atlasIndicatorCards: snapshot.data.countryIndicatorScores.map((row) => {
      const country = byCountry.get(row.countryIso3);
      return {
        kind: "atlas-indicator-card",
        id: row.id,
        title: country?.name ?? row.countryIso3,
        subtitle: row.sourceId,
        summary: row.score !== undefined ? `Score ${row.score}${row.rank ? `; rank ${row.rank}` : ""}` : row.scoreLabel ?? "Context indicator",
        url: publicUrl(`/country/${row.countryIso3}`),
        embedUrl: publicUrl(`/embed/atlas/${encodeURIComponent(row.id)}`),
      };
    }),
  };
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
  const aiAtlasModule = await server.ssrLoadModule("/src/data/aiAtlas.ts");
  const summaryModule = await server.ssrLoadModule("/src/utils/getCountryGovernanceSummary.ts");
  const aiAtlasUtils = await server.ssrLoadModule("/src/utils/aiAtlas.ts");
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
        indicatorScoreCount: aiAtlasUtils.getCountryAtlasSummary(country.iso3).scores.length,
        readinessReportCount: aiAtlasUtils.getCountryAtlasSummary(country.iso3).readinessReports.length,
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
          "/data/implementation-tracker.json",
          "/data/ai-atlas-indicators.json",
          "/data/ai-atlas-sources.json",
          "/data/readiness-reports.json",
          "/data/source-metadata.json",
          "/data/changelog.json",
          "/data/record-page-index.json",
          "/data/embed-cards.json",
        ],
      }),
      "utf8"
    ),
    writeFile(path.join(outDir, "country-summaries.json"), stableJson(countrySummaries), "utf8"),
    writeFile(path.join(outDir, "obligation-matrix.json"), stableJson(obligationsModule.GOVERNANCE_OBLIGATIONS), "utf8"),
    writeFile(path.join(outDir, "lab-exposure-matrix.json"), stableJson(labExposureModule.LAB_REGULATORY_EXPOSURES), "utf8"),
    writeFile(path.join(outDir, "implementation-tracker.json"), stableJson(snapshot.data.implementationMilestones), "utf8"),
    writeFile(path.join(outDir, "ai-atlas-indicators.json"), stableJson(aiAtlasModule.COUNTRY_INDICATOR_SCORES), "utf8"),
    writeFile(path.join(outDir, "ai-atlas-sources.json"), stableJson(aiAtlasModule.AI_ATLAS_SOURCES), "utf8"),
    writeFile(path.join(outDir, "readiness-reports.json"), stableJson(aiAtlasModule.COUNTRY_READINESS_REPORTS), "utf8"),
    writeFile(path.join(outDir, "source-metadata.json"), stableJson(sourceEntries(snapshot)), "utf8"),
    writeFile(path.join(outDir, "changelog.json"), stableJson(releasesModule.DATASET_RELEASES), "utf8"),
    writeFile(path.join(outDir, "record-page-index.json"), stableJson(recordPageIndex(snapshot)), "utf8"),
    writeFile(path.join(outDir, "embed-cards.json"), stableJson(embedCards(snapshot, countrySummaries)), "utf8"),
  ]);
} finally {
  await server.close();
}
