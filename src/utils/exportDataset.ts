import { COUNTRIES } from "../data/countries";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { OUT_OF_SCOPE_ITEMS } from "../data/outOfScope";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { SOURCE_NOTES } from "../data/sourceNotes";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { DATASET_SCHEMA_ID, DATASET_SCHEMA_VERSION } from "./datasetSchema";

export { DATASET_SCHEMA_VERSION } from "./datasetSchema";

export function buildDatasetSnapshot() {
  return {
    schemaVersion: DATASET_SCHEMA_VERSION,
    snapshotDate: DATA_SNAPSHOT_DATE,
    schema: {
      id: DATASET_SCHEMA_ID,
      version: DATASET_SCHEMA_VERSION,
      format: "json-schema-draft-2020-12",
    },
    title: "Global AI Governance Map dataset",
    caveat:
      "Research dataset only. It is not legal advice and time-sensitive legal status should be verified against official sources.",
    counts: {
      countries: COUNTRIES.filter((country) => country.iso3 !== "EUU").length,
      euMembers: EU_MEMBER_ISO3.length,
      frontierLabs: FRONTIER_LABS.length,
      internationalInstruments: INTERNATIONAL_INSTRUMENTS.length,
      internationalParticipationRows: INTERNATIONAL_PARTICIPATION.length,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS.length,
      subnationalAIRules: SUBNATIONAL_AI_RULES.length,
      infrastructureNodes: INFRASTRUCTURE_NODES.length,
      dependencyEdges: DEPENDENCY_EDGES.length,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS.length,
      sourceNotes: SOURCE_NOTES.length,
    },
    data: {
      countries: COUNTRIES,
      euMembers: EU_MEMBER_ISO3,
      frontierLabs: FRONTIER_LABS,
      internationalInstruments: INTERNATIONAL_INSTRUMENTS,
      internationalParticipation: INTERNATIONAL_PARTICIPATION,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS,
      subnationalAIRules: SUBNATIONAL_AI_RULES,
      infrastructureNodes: INFRASTRUCTURE_NODES,
      dependencyEdges: DEPENDENCY_EDGES,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS,
      sourceNotes: SOURCE_NOTES,
    },
  };
}

export function buildCitationText(): string {
  return [
    `Global AI Governance Map dataset, snapshot ${DATA_SNAPSHOT_DATE}.`,
    "Coverage: frontier-AI governance actors, instruments, national AI-specific rules, participation rows, labs, infrastructure, and dependency links.",
    "Use with source verification. This dataset is a research aid and is not legal advice.",
    "Repository: https://github.com/bekhzod1990/global-ai-governance-map",
    "Live app: https://global-ai-governance-map.vercel.app/",
  ].join("\n");
}

export function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadDatasetJson(): void {
  downloadTextFile(
    `global-ai-governance-map-${DATA_SNAPSHOT_DATE}.json`,
    toPrettyJson(buildDatasetSnapshot()),
    "application/json;charset=utf-8"
  );
}

export function downloadCitationText(): void {
  downloadTextFile(
    `global-ai-governance-map-citation-${DATA_SNAPSHOT_DATE}.txt`,
    buildCitationText(),
    "text/plain;charset=utf-8"
  );
}
