import { DATA_SNAPSHOT_DATE } from "../utils/governanceTaxonomy";

export interface DatasetRelease {
  id: string;
  snapshotDate: string;
  status: "published" | "planned";
  title: string;
  summary: string;
  recordsAdded: string[];
  recordsChanged: string[];
  recordsDowngradedOrRemoved: string[];
  sourceCorrections: string[];
  unresolvedManualReview: string[];
  artifacts: string[];
}

export const DATASET_RELEASES: DatasetRelease[] = [
  {
    id: "2026-05",
    snapshotDate: DATA_SNAPSHOT_DATE,
    status: "published",
    title: "May 2026 research snapshot",
    summary:
      "Baseline public snapshot covering countries, frontier labs, international instruments, national and subnational AI rules, typed lab exposure, source metadata, and evidence dossiers.",
    recordsAdded: [
      "Research presets, Table view, Methodology, correction links, lab exposure workbench, evidence dossiers, and source delta monitor.",
      "AI Atlas context indicators for Oxford Government AI Readiness 2025, CAIDP AI and Democratic Values 2026, UNESCO RAM Global Hub status, and Stanford Global AI Vibrancy Tool public data.",
    ],
    recordsChanged: [
      "High- and medium-priority legal/source records reviewed and softened where official sources did not support strong claims.",
    ],
    recordsDowngradedOrRemoved: [
      "Low-confidence binding claims were excluded from strong binding-law map effects.",
    ],
    sourceCorrections: [
      "Official-source host classification unified and source-audit metadata warnings cleared.",
    ],
    unresolvedManualReview: [
      "Council of Europe Treaty Office blocks scripted delta-monitor fetches and requires browser/manual review for treaty participation changes.",
    ],
    artifacts: [
      "docs/SOURCE_AUDIT_CURRENT.md",
      "docs/SOURCE_DELTA_REPORT.md",
      "docs/SOURCE_VERIFICATION_2026-05-29.md",
      "docs/AI_ATLAS_IMPORT_REVIEW.md",
      "docs/RELEASE_2026-05.md",
    ],
  },
  {
    id: "2026-06",
    snapshotDate: "2026-06-30",
    status: "planned",
    title: "June 2026 planned refresh",
    summary:
      "Planned monthly refresh target for source deltas, treaty status, EU implementation milestones, national enactments, Atlas source families, and frontier-lab model/safety-framework updates.",
    recordsAdded: [
      "Planned: Workbench comparison coverage for obligations and exposure rows, plus stable obligation/exposure routes.",
      "Planned: AI Atlas source-family tracking for EU AI Factories, U.S. NAIRR, and UK public-sector AI procurement guidance.",
    ],
    recordsChanged: [
      "Planned: Implementation tracker expanded for UK, Italy, Slovenia, Germany, France, and Spain using existing source-backed records.",
    ],
    recordsDowngradedOrRemoved: [],
    sourceCorrections: [
      "Source-only Atlas families remain context rows until country-level normalization is reviewed.",
    ],
    unresolvedManualReview: ["Populate after the June refresh is completed."],
    artifacts: [
      "docs/RELEASE_2026-06.md",
      "docs/SOURCE_DELTA_REPORT.md",
      "docs/SOURCE_AUDIT_CURRENT.md",
      "docs/ROADMAP_BACKLOG_LEDGER.md",
    ],
  },
];
