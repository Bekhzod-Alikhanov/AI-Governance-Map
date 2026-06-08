import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  COMPUTE_DEPENDENCY_RECORDS_BY_LAB,
  INCIDENT_ENFORCEMENT_RECORDS_BY_LAB,
  LAB_INTELLIGENCE_BY_LAB,
  MODEL_GOVERNANCE_EVIDENCE_BY_LAB,
  SAFETY_EVALUATION_RECORDS_BY_LAB,
} from "../data/labIntelligence";
import { getLabRegulatoryExposures, summarizeLabExposures } from "./labExposure";
import type {
  ComputeDependencyRecord,
  IncidentEnforcementRecord,
  LabIntelligenceProfile,
  ModelGovernanceEvidence,
  SafetyEvaluationRecord,
} from "../types";

export interface LabIntelligenceSummary {
  labId: string;
  labName: string;
  hqCountryName: string;
  profile: LabIntelligenceProfile | null;
  safetyFramework: string;
  modelFamilies: string[];
  deploymentMarkets: string[];
  exposureCounts: ReturnType<typeof summarizeLabExposures>;
  modelGovernanceEvidence: ModelGovernanceEvidence[];
  safetyEvaluationRecords: SafetyEvaluationRecord[];
  incidentEnforcementRecords: IncidentEnforcementRecord[];
  computeDependencyRecords: ComputeDependencyRecord[];
  confidence: string;
}

export interface LabBoardRow {
  labId: string;
  labName: string;
  hq: string;
  safetyFramework: string;
  commitments: number;
  bindingExposure: number;
  conditionalExposure: number;
  modelGovernanceEvidence: number;
  safetyEvaluations: number;
  computeDependencies: number;
  confidence: string;
  caveat: string;
}

export function getLabIntelligenceSummary(labId: string): LabIntelligenceSummary | null {
  const lab = LAB_BY_ID[labId];
  if (!lab) return null;
  const profile = LAB_INTELLIGENCE_BY_LAB[labId] ?? null;
  const exposureCounts = summarizeLabExposures(getLabRegulatoryExposures(labId));
  const modelGovernanceEvidence = MODEL_GOVERNANCE_EVIDENCE_BY_LAB[labId] ?? [];
  const safetyEvaluationRecords = SAFETY_EVALUATION_RECORDS_BY_LAB[labId] ?? [];
  const incidentEnforcementRecords = INCIDENT_ENFORCEMENT_RECORDS_BY_LAB[labId] ?? [];
  const computeDependencyRecords = COMPUTE_DEPENDENCY_RECORDS_BY_LAB[labId] ?? [];

  return {
    labId,
    labName: lab.name,
    hqCountryName: lab.hqCountryName,
    profile,
    safetyFramework: profile?.safetyFrameworkName ?? lab.safetyFramework?.name ?? "Not tracked",
    modelFamilies: profile?.modelFamilies ?? lab.flagshipModels,
    deploymentMarkets: profile?.deploymentMarketIso3s ?? [lab.hqIso3],
    exposureCounts,
    modelGovernanceEvidence,
    safetyEvaluationRecords,
    incidentEnforcementRecords,
    computeDependencyRecords,
    confidence: profile?.confidence ?? lab.confidence ?? "",
  };
}

export function buildLabBoardRows(): LabBoardRow[] {
  return FRONTIER_LABS.map((lab) => {
    const summary = getLabIntelligenceSummary(lab.id);
    const profile = summary?.profile;
    const exposureCounts = summary?.exposureCounts ?? summarizeLabExposures([]);
    return {
      labId: lab.id,
      labName: lab.name,
      hq: lab.hqCountryName,
      safetyFramework: summary?.safetyFramework ?? "Not tracked",
      commitments: profile?.frontierCommitmentIds.length ?? 0,
      bindingExposure: exposureCounts.binding,
      conditionalExposure: exposureCounts.conditional,
      modelGovernanceEvidence: summary?.modelGovernanceEvidence.length ?? 0,
      safetyEvaluations: summary?.safetyEvaluationRecords.length ?? 0,
      computeDependencies: summary?.computeDependencyRecords.length ?? 0,
      confidence: summary?.confidence ?? "",
      caveat: profile?.caveat ?? "Research triage layer; not a legal conclusion.",
    };
  }).sort((a, b) => b.bindingExposure - a.bindingExposure || b.modelGovernanceEvidence - a.modelGovernanceEvidence);
}

export function renderLabBoardCsv(rows = buildLabBoardRows()): string {
  const csvRows = [
    [
      "lab",
      "hq",
      "safety_framework",
      "commitments",
      "binding_exposure",
      "conditional_exposure",
      "model_governance_evidence",
      "safety_evaluations",
      "compute_dependencies",
      "confidence",
      "caveat",
    ],
    ...rows.map((row) => [
      row.labName,
      row.hq,
      row.safetyFramework,
      String(row.commitments),
      String(row.bindingExposure),
      String(row.conditionalExposure),
      String(row.modelGovernanceEvidence),
      String(row.safetyEvaluations),
      String(row.computeDependencies),
      row.confidence,
      row.caveat,
    ]),
  ];
  return csvRows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function getComputeDependencyRecordsForInfrastructure(infrastructureId: string) {
  return COMPUTE_DEPENDENCY_RECORDS.filter((record) => record.infrastructureId === infrastructureId);
}

function csvCell(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
