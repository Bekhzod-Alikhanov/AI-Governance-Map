import type { SourceNote } from "../types";

export const SOURCE_NOTES: SourceNote[] = [
  {
    id: "scope-rule",
    appliesTo: "global",
    note:
      "This map tracks AI-specific governance instruments only. It excludes general privacy, export-control, chip, semiconductor, and cybersecurity instruments unless they are explicitly AI-specific.",
  },
  {
    id: "coe-convention-not-in-force",
    appliesTo: "coe-ai-convention",
    note:
      "Council of Europe Treaty Office status as of 2026-08-17: the Framework Convention on AI was not yet in force, with 20 signatures not followed by ratification and 1 ratification/accession. Entry into force requires five ratifications, including at least three Council of Europe member states.",
  },
  {
    id: "un-coverage",
    appliesTo: "unesco-ethics-rec-2021, unga-78-265, unga-78-311, global-digital-compact, unga-79-325",
    note:
      "Coverage for UNESCO and UNGA instruments is represented via 'covered_by_membership' across UN member states. This does not imply per-country sign-on; it reflects the multilateral nature of those instruments.",
  },
  {
    id: "iso-no-country-rows",
    appliesTo: "iso-iec-42001-2023, iso-iec-23894-2023, iso-iec-38507-2022, iso-iec-22989-2022, iso-iec-42005-2025",
    note:
      "ISO/IEC standards are voluntary international standards. There are no country signatures; participation is via the global standardization system.",
  },
  {
    id: "operational-instruments-no-country-rows",
    appliesTo: "seoul-frontier-ai-safety-commitments, gpai-declarations, nist-genai-profile",
    note:
      "Company commitments, GPAI Council outputs, and NIST technical guidance are shown as governance context. They do not create country-level signature, ratification, or binding-law rows in this dataset.",
  },
  {
    id: "cen-cenelec-standardization-caveat",
    appliesTo: "cen-cenelec-ai-act-standards",
    note:
      "CEN-CENELEC AI Act standards work is standardization infrastructure. It should not be read as a separate national AI law or explicit state endorsement.",
  },
  {
    id: "frontier-model-forum",
    appliesTo: "frontier-model-forum",
    note:
      "The Frontier Model Forum is non-state / industry governance, not an intergovernmental instrument. It is shown for context but has no country-level participation rows.",
  },
  {
    id: "paris-non-signers",
    appliesTo: "paris-statement-2025",
    note:
      "The Paris AI Action Summit Statement on Inclusive and Sustainable AI was notably not signed by the United States or the United Kingdom.",
  },
  {
    id: "release-coverage-status",
    appliesTo: "global",
    note:
      "Release 2026-08-17; coverage through 2026-08-17; status as of 2026-08-17. Treaty and signature status can change quickly. Always verify time-sensitive details against official sources before relying on them.",
  },
];
