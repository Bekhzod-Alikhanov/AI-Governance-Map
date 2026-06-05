export const SUBNATIONAL_RULE_COUNTRY_ISO3S = new Set(["DEU", "FRA", "USA"]);

export const SUBNATIONAL_RULE_IDS_BY_COUNTRY: Record<string, string[]> = {
  DEU: ["de-ai-act-implementation-draft"],
  FRA: ["fr-ai-act-implementation-draft"],
  USA: [
    "us-il-aivia",
    "us-nyc-local-law-144",
    "us-ny-gbs-349a",
    "us-ca-2025-ai-package",
    "us-ca-sb-53-frontier",
  ],
};
