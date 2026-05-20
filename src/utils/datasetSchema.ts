export const DATASET_SCHEMA_VERSION = "2026.05";
export const DATASET_SCHEMA_ID = "https://global-ai-governance-map.vercel.app/dataset.schema.json";

const DATA_KEYS = [
  "countries",
  "euMembers",
  "frontierLabs",
  "internationalInstruments",
  "internationalParticipation",
  "nationalAIRegulations",
  "subnationalAIRules",
  "infrastructureNodes",
  "dependencyEdges",
  "outOfScopeItems",
  "sourceNotes",
] as const;

const COUNT_TO_DATA_KEY = {
  countries: "countries",
  euMembers: "euMembers",
  frontierLabs: "frontierLabs",
  internationalInstruments: "internationalInstruments",
  internationalParticipationRows: "internationalParticipation",
  nationalAIRegulations: "nationalAIRegulations",
  subnationalAIRules: "subnationalAIRules",
  infrastructureNodes: "infrastructureNodes",
  dependencyEdges: "dependencyEdges",
  outOfScopeItems: "outOfScopeItems",
  sourceNotes: "sourceNotes",
} as const;

export const DATASET_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: DATASET_SCHEMA_ID,
  title: "Global AI Governance Map dataset snapshot",
  description:
    "Self-contained static research snapshot for frontier-AI governance mapping. This dataset is not legal advice.",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "snapshotDate", "schema", "title", "caveat", "counts", "data"],
  properties: {
    schemaVersion: { const: DATASET_SCHEMA_VERSION },
    snapshotDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    schema: {
      type: "object",
      required: ["id", "version", "format"],
      properties: {
        id: { const: DATASET_SCHEMA_ID },
        version: { const: DATASET_SCHEMA_VERSION },
        format: { const: "json-schema-draft-2020-12" },
      },
    },
    title: { type: "string" },
    caveat: { type: "string" },
    counts: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.keys(COUNT_TO_DATA_KEY).map((key) => [key, { type: "integer", minimum: 0 }])
      ),
    },
    data: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(DATA_KEYS.map((key) => [key, { type: "array" }])),
    },
  },
  definitions: {
    verificationMetadata: {
      type: "object",
      properties: {
        sourceKind: { enum: ["official", "secondary", "mixed", "unknown"] },
        verificationStatus: {
          enum: ["verified", "likely_correct", "uncertain", "needs_external_check"],
        },
        confidence: { enum: ["high", "medium", "low"] },
        lastVerified: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        verificationNotes: { type: "string" },
      },
    },
  },
} as const;

type RecordLike = Record<string, unknown>;

function isRecord(value: unknown): value is RecordLike {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getRecord(value: RecordLike, key: string): RecordLike | null {
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

export function validateDatasetSnapshotShape(snapshot: unknown): string[] {
  const issues: string[] = [];

  if (!isRecord(snapshot)) return ["Snapshot must be an object"];

  if (snapshot.schemaVersion !== DATASET_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${DATASET_SCHEMA_VERSION}`);
  }

  const schema = getRecord(snapshot, "schema");
  if (!schema) {
    issues.push("schema metadata is missing");
  } else {
    if (schema.id !== DATASET_SCHEMA_ID) issues.push("schema.id does not match the published schema id");
    if (schema.version !== DATASET_SCHEMA_VERSION) issues.push("schema.version does not match schemaVersion");
    if (schema.format !== "json-schema-draft-2020-12") issues.push("schema.format is not declared");
  }

  const counts = getRecord(snapshot, "counts");
  const data = getRecord(snapshot, "data");

  if (!counts) issues.push("counts object is missing");
  if (!data) issues.push("data object is missing");

  if (counts && data) {
    for (const [countKey, dataKey] of Object.entries(COUNT_TO_DATA_KEY)) {
      const count = counts[countKey];
      const items = data[dataKey];
      if (!Array.isArray(items)) {
        issues.push(`data.${dataKey} must be an array`);
        continue;
      }
      if (typeof count !== "number") {
        issues.push(`counts.${countKey} must be a number`);
        continue;
      }
      const expectedLength =
        countKey === "countries"
          ? items.filter((item) => isRecord(item) && item.iso3 !== "EUU").length
          : items.length;
      if (count !== expectedLength) {
        issues.push(`counts.${countKey} (${count}) does not match data.${dataKey}.length (${expectedLength})`);
      }
    }
  }

  return issues;
}
