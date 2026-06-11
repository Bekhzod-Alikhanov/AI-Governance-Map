import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { DATASET_RELEASES } from "../data/datasetReleases";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
import { GOVERNANCE_DOMAINS, GOVERNANCE_DOMAIN_BY_ID } from "../data/governanceDomains";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { INFRASTRUCTURE_NODES, INFRA_BY_ID } from "../data/infrastructure";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import { SUBNATIONAL_AI_RULES, SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  INCIDENT_ENFORCEMENT_RECORDS,
  LAB_INTELLIGENCE_PROFILES,
  MODEL_GOVERNANCE_EVIDENCE,
  RECORD_CHANGE_LOG_ENTRIES,
  SAFETY_EVALUATION_RECORDS,
} from "../data/labIntelligence";
import {
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
  RESEARCH_CORPUS_CHANGELOG,
  STANDARDS_CONFORMITY_RECORDS,
} from "../data/researchCorpus";
import { AI_ATLAS_SOURCES, COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS, INDICATOR_SOURCE_BY_ID } from "../data/aiAtlas";
import { hasCyrillic } from "./translateSeedDataToEnglish";
import {
  assessSourceUrl,
  classifyInternationalInstrument,
  classifyNationalEntry,
  classifyParticipation,
  DATA_SNAPSHOT_DATE,
  hasVerificationMetadata,
} from "./governanceTaxonomy";
import type { VerificationMetadata } from "../types";

interface ValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateData(): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sourceMetadataMissing = new Map<string, number>();
  const sourceHostCounts = new Map<string, { sourceKind: string; count: number }>();
  const sourceIssueCounts = new Map<string, number>();
  const indirectParticipationWithoutNote = new Map<string, number>();
  const corpusReferences: Array<{ owner: string; kind: string; id: string }> = [];

  function addCount(map: Map<string, number>, key: string) {
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  function validateDate(label: string, value: string | undefined) {
    if (!value) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      warnings.push(`${label} has non-ISO date: ${value}`);
      return;
    }
    if (value > DATA_SNAPSHOT_DATE) {
      warnings.push(`${label} is after snapshot date ${DATA_SNAPSHOT_DATE}: ${value}`);
    }
  }

  function validateSource(
    recordKind: string,
    id: string,
    item: VerificationMetadata & { sourceName?: string; sourceUrl?: string }
  ) {
    if (!item.sourceName) errors.push(`${recordKind} ${id} missing sourceName`);
    if (!item.sourceUrl) errors.push(`${recordKind} ${id} missing sourceUrl`);

    const assessment = assessSourceUrl(item.sourceUrl);
    for (const issue of assessment.issues) addCount(sourceIssueCounts, issue);
    if (assessment.host && assessment.sourceKind !== "official") {
      const existing = sourceHostCounts.get(assessment.host);
      sourceHostCounts.set(assessment.host, {
        sourceKind: assessment.sourceKind,
        count: (existing?.count ?? 0) + 1,
      });
    }
    if (!hasVerificationMetadata(item)) addCount(sourceMetadataMissing, recordKind);
  }

  // Countries
  for (const c of COUNTRIES) {
    if (!c.iso3 || c.iso3.length !== 3) errors.push(`Country ${c.name} has invalid iso3`);
    if (!c.name) errors.push(`Country ${c.iso3} has no name`);
    if (!c.region) errors.push(`Country ${c.iso3} has no region`);
  }
  const isoSeen = new Set<string>();
  for (const c of COUNTRIES) {
    if (isoSeen.has(c.iso3)) errors.push(`Duplicate country iso3: ${c.iso3}`);
    isoSeen.add(c.iso3);
  }

  // National regulations
  const natIds = new Set<string>();
  for (const reg of NATIONAL_AI_REGULATIONS) {
    if (!reg.id) errors.push("National regulation missing id");
    if (natIds.has(reg.id)) errors.push(`Duplicate national regulation id: ${reg.id}`);
    natIds.add(reg.id);
    if (reg.aiSpecific !== true) errors.push(`National regulation ${reg.id} is not aiSpecific`);
    validateSource("National regulation", reg.id, reg);
    validateDate(`National regulation ${reg.id} dateAdopted`, reg.dateAdopted);
    validateDate(`National regulation ${reg.id} dateInForce`, reg.dateInForce);
    if (reg.countryIso3 && !COUNTRY_BY_ISO3[reg.countryIso3]) {
      errors.push(`National regulation ${reg.id} references unknown country ${reg.countryIso3}`);
    }
    const classification = classifyNationalEntry(reg);
    if (classification.className === "binding_ai_law" && reg.type === "institutional_framework") {
      warnings.push(`National regulation ${reg.id} is binding but typed as institutional framework`);
    }
    if (reg.bindingStatus === "proposed" && reg.dateInForce) {
      warnings.push(`National regulation ${reg.id} is proposed but has dateInForce`);
    }
    if (reg.type === "proposed_law" && reg.bindingStatus !== "proposed") {
      warnings.push(`National regulation ${reg.id} is proposed_law but bindingStatus is ${reg.bindingStatus}`);
    }
  }

  // International instruments
  const instIds = new Set<string>();
  for (const inst of INTERNATIONAL_INSTRUMENTS) {
    if (!inst.id) errors.push("International instrument missing id");
    if (instIds.has(inst.id)) errors.push(`Duplicate instrument id: ${inst.id}`);
    instIds.add(inst.id);
    if (inst.aiSpecific !== true) errors.push(`Instrument ${inst.id} is not aiSpecific`);
    validateSource("International instrument", inst.id, inst);
    validateDate(`Instrument ${inst.id} date`, inst.date);
    classifyInternationalInstrument(inst);
    if (inst.instrumentType === "standard" && inst.bindingStatus !== "standard") {
      warnings.push(`Instrument ${inst.id} is a standard but bindingStatus is ${inst.bindingStatus}`);
    }
    if (inst.bindingStatus === "standard" && !["standard", "roadmap"].includes(inst.instrumentType)) {
      warnings.push(`Instrument ${inst.id} has standard bindingStatus but type is ${inst.instrumentType}`);
    }
  }

  // Participation
  const partIds = new Set<string>();
  for (const p of INTERNATIONAL_PARTICIPATION) {
    if (partIds.has(p.id)) errors.push(`Duplicate participation row: ${p.id}`);
    partIds.add(p.id);
    if (!INSTRUMENT_BY_ID[p.instrumentId])
      errors.push(`Participation references unknown instrument: ${p.instrumentId}`);
    if (p.countryIso3 !== "EUU" && !COUNTRY_BY_ISO3[p.countryIso3])
      errors.push(`Participation references unknown country: ${p.countryIso3}`);
    validateSource("Participation", p.id, p);
    validateDate(`Participation ${p.id} date`, p.date);
    const participationClass = classifyParticipation(p.participationType);
    const instrument = INSTRUMENT_BY_ID[p.instrumentId];
    if (
      p.participationType === "applicable_via_eu" &&
      p.countryIso3 !== "EUU" &&
      !EU_MEMBER_ISO3.includes(p.countryIso3)
    ) {
      errors.push(`Participation ${p.id} marks non-EU country ${p.countryIso3} applicable_via_eu`);
    }
    if (p.participationType === "covered_by_membership" && !p.notes) {
      addCount(indirectParticipationWithoutNote, p.instrumentId);
    }
    if (
      participationClass.impliesBindingByItself &&
      instrument &&
      !["binding_on_parties", "binding_regulation"].includes(instrument.bindingStatus)
    ) {
      warnings.push(
        `Participation ${p.id} implies binding effect but instrument ${instrument.id} is ${instrument.bindingStatus}`
      );
    }
  }

  // Cyrillic check across user-visible string fields
  function checkCyrillic(label: string, value: string | undefined) {
    if (value && hasCyrillic(value)) {
      warnings.push(`Cyrillic text detected in ${label}: "${value.slice(0, 80)}"`);
    }
  }
  for (const c of COUNTRIES) {
    checkCyrillic(`country.name ${c.iso3}`, c.name);
    checkCyrillic(`country.notes ${c.iso3}`, c.notes);
  }
  for (const reg of NATIONAL_AI_REGULATIONS) {
    checkCyrillic(`reg.name ${reg.id}`, reg.name);
    checkCyrillic(`reg.summary ${reg.id}`, reg.summary);
    checkCyrillic(`reg.regulatorOrBody ${reg.id}`, reg.regulatorOrBody);
  }
  for (const inst of INTERNATIONAL_INSTRUMENTS) {
    checkCyrillic(`instrument.name ${inst.id}`, inst.name);
    checkCyrillic(`instrument.summary ${inst.id}`, inst.summary);
    checkCyrillic(`instrument.issuer ${inst.id}`, inst.issuer);
  }

  // Frontier labs
  const labIds = new Set<string>();
  for (const lab of FRONTIER_LABS) {
    if (labIds.has(lab.id)) errors.push(`Duplicate lab id: ${lab.id}`);
    labIds.add(lab.id);
    if (!COUNTRY_BY_ISO3[lab.hqIso3]) errors.push(`Lab ${lab.id} HQ iso3 ${lab.hqIso3} not in country list`);
    validateSource("Frontier lab", lab.id, lab);
    if (lab.powerScore < 1 || lab.powerScore > 5) {
      errors.push(`Lab ${lab.id} powerScore outside 1-5 range`);
    }
  }

  // Lab regulatory exposure
  const labExposureIds = new Set<string>();
  for (const exposure of LAB_REGULATORY_EXPOSURES) {
    if (!exposure.id) errors.push("Lab exposure missing id");
    if (labExposureIds.has(exposure.id)) errors.push(`Duplicate lab exposure id: ${exposure.id}`);
    labExposureIds.add(exposure.id);
    if (!LAB_BY_ID[exposure.labId]) {
      errors.push(`Lab exposure ${exposure.id} references unknown lab ${exposure.labId}`);
    }
    if (exposure.strength < 1 || exposure.strength > 5) {
      errors.push(`Lab exposure ${exposure.id} strength outside 1-5 range`);
    }
    validateSource("Lab exposure", exposure.id, exposure);
    validateDate(`Lab exposure ${exposure.id} lastVerified`, exposure.lastVerified);

    const targetOk =
      exposure.targetType === "national_rule"
        ? !!NATIONAL_REG_BY_ID[exposure.targetId]
        : exposure.targetType === "infrastructure"
          ? !!INFRA_BY_ID[exposure.targetId]
          : !!INSTRUMENT_BY_ID[exposure.targetId];
    if (!targetOk) {
      errors.push(`Lab exposure ${exposure.id} references unknown ${exposure.targetType} target ${exposure.targetId}`);
    }

    if (exposure.legalEffect === "binding" && (exposure.sourceKind !== "official" || exposure.confidence !== "high")) {
      errors.push(`Binding lab exposure ${exposure.id} must use official high-confidence source metadata`);
    }
    if (exposure.directness !== "direct" && !exposure.notes && !exposure.verificationNotes) {
      warnings.push(`Indirect or conditional lab exposure ${exposure.id} lacks a caveat note`);
    }
  }

  // Workbench domains
  // Frontier-lab intelligence evidence
  const labIntelligenceProfileIds = new Set<string>();
  for (const profile of LAB_INTELLIGENCE_PROFILES) {
    if (!profile.id) errors.push("Lab intelligence profile missing id");
    if (labIntelligenceProfileIds.has(profile.id)) errors.push(`Duplicate lab intelligence profile id: ${profile.id}`);
    labIntelligenceProfileIds.add(profile.id);
    if (!LAB_BY_ID[profile.labId]) {
      errors.push(`Lab intelligence profile ${profile.id} references unknown lab ${profile.labId}`);
    }
    for (const office of profile.majorOffices) {
      if (!COUNTRY_BY_ISO3[office.countryIso3] && office.countryIso3 !== "EUU") {
        errors.push(`Lab intelligence profile ${profile.id} references unknown office country ${office.countryIso3}`);
      }
    }
    for (const marketIso3 of profile.deploymentMarketIso3s) {
      if (!COUNTRY_BY_ISO3[marketIso3] && marketIso3 !== "EUU") {
        errors.push(`Lab intelligence profile ${profile.id} references unknown deployment market ${marketIso3}`);
      }
    }
    validateSource("Lab intelligence profile", profile.id, profile);
    validateDate(`Lab intelligence profile ${profile.id} lastVerified`, profile.lastVerified);
    if (!profile.caveat) warnings.push(`Lab intelligence profile ${profile.id} missing caveat`);
  }

  const modelEvidenceIds = new Set<string>();
  for (const evidence of MODEL_GOVERNANCE_EVIDENCE) {
    if (!evidence.id) errors.push("Model governance evidence missing id");
    if (modelEvidenceIds.has(evidence.id)) errors.push(`Duplicate model governance evidence id: ${evidence.id}`);
    modelEvidenceIds.add(evidence.id);
    for (const labId of evidence.labIds) {
      if (!LAB_BY_ID[labId]) errors.push(`Model governance evidence ${evidence.id} references unknown lab ${labId}`);
    }
    for (const domainId of evidence.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) {
        errors.push(`Model governance evidence ${evidence.id} references unknown domain ${domainId}`);
      }
    }
    validateSource("Model governance evidence", evidence.id, evidence);
    validateDate(`Model governance evidence ${evidence.id} lastVerified`, evidence.lastVerified);
    if (!evidence.caveat) errors.push(`Model governance evidence ${evidence.id} missing caveat`);
  }

  const safetyEvaluationIds = new Set<string>();
  for (const evaluation of SAFETY_EVALUATION_RECORDS) {
    if (!evaluation.id) errors.push("Safety evaluation record missing id");
    if (safetyEvaluationIds.has(evaluation.id)) errors.push(`Duplicate safety evaluation record id: ${evaluation.id}`);
    safetyEvaluationIds.add(evaluation.id);
    for (const labId of evaluation.labIds) {
      if (!LAB_BY_ID[labId]) errors.push(`Safety evaluation record ${evaluation.id} references unknown lab ${labId}`);
    }
    for (const domainId of evaluation.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) {
        errors.push(`Safety evaluation record ${evaluation.id} references unknown domain ${domainId}`);
      }
    }
    validateSource("Safety evaluation record", evaluation.id, evaluation);
    validateDate(`Safety evaluation record ${evaluation.id} lastVerified`, evaluation.lastVerified);
    if (!evaluation.caveat) errors.push(`Safety evaluation record ${evaluation.id} missing caveat`);
  }

  const incidentIds = new Set<string>();
  for (const incident of INCIDENT_ENFORCEMENT_RECORDS) {
    if (!incident.id) errors.push("Incident/enforcement record missing id");
    if (incidentIds.has(incident.id)) errors.push(`Duplicate incident/enforcement record id: ${incident.id}`);
    incidentIds.add(incident.id);
    if (incident.countryIso3 && !COUNTRY_BY_ISO3[incident.countryIso3]) {
      errors.push(`Incident/enforcement record ${incident.id} references unknown country ${incident.countryIso3}`);
    }
    for (const labId of incident.labIds) {
      if (!LAB_BY_ID[labId]) errors.push(`Incident/enforcement record ${incident.id} references unknown lab ${labId}`);
    }
    for (const domainId of incident.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) {
        errors.push(`Incident/enforcement record ${incident.id} references unknown domain ${domainId}`);
      }
    }
    validateSource("Incident/enforcement record", incident.id, incident);
    validateDate(`Incident/enforcement record ${incident.id} date`, incident.date);
    validateDate(`Incident/enforcement record ${incident.id} lastVerified`, incident.lastVerified);
    if (!incident.caveat) errors.push(`Incident/enforcement record ${incident.id} missing caveat`);
  }

  const computeDependencyIds = new Set<string>();
  for (const dependency of COMPUTE_DEPENDENCY_RECORDS) {
    if (!dependency.id) errors.push("Compute dependency record missing id");
    if (computeDependencyIds.has(dependency.id)) errors.push(`Duplicate compute dependency record id: ${dependency.id}`);
    computeDependencyIds.add(dependency.id);
    for (const labId of dependency.labIds) {
      if (!LAB_BY_ID[labId]) errors.push(`Compute dependency record ${dependency.id} references unknown lab ${labId}`);
    }
    if (!INFRA_BY_ID[dependency.infrastructureId]) {
      errors.push(`Compute dependency record ${dependency.id} references unknown infrastructure ${dependency.infrastructureId}`);
    }
    if (dependency.strength < 1 || dependency.strength > 5) {
      errors.push(`Compute dependency record ${dependency.id} strength outside 1-5 range`);
    }
    validateSource("Compute dependency record", dependency.id, dependency);
    validateDate(`Compute dependency record ${dependency.id} lastVerified`, dependency.lastVerified);
    if (!dependency.caveat) errors.push(`Compute dependency record ${dependency.id} missing caveat`);
  }

  // Research corpus
  const institutionIds = new Set<string>();
  for (const institution of INSTITUTION_RECORDS) {
    if (!institution.id) errors.push("Institution record missing id");
    if (institutionIds.has(institution.id)) errors.push(`Duplicate institution record id: ${institution.id}`);
    institutionIds.add(institution.id);
    if (institution.countryIso3 && institution.countryIso3 !== "EUU" && !COUNTRY_BY_ISO3[institution.countryIso3]) {
      errors.push(`Institution ${institution.id} references unknown country ${institution.countryIso3}`);
    }
    for (const domainId of institution.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) errors.push(`Institution ${institution.id} references unknown domain ${domainId}`);
    }
    corpusReferences.push(...institution.relatedRecords.map((ref) => ({ owner: `Institution ${institution.id}`, kind: ref.kind, id: ref.id })));
    validateSource("Institution", institution.id, institution);
    validateDate(`Institution ${institution.id} lastVerified`, institution.lastVerified);
    if (!institution.caveat) errors.push(`Institution ${institution.id} missing caveat`);
  }

  const policyProcessIds = new Set<string>();
  for (const process of POLICY_PROCESS_RECORDS) {
    if (!process.id) errors.push("Policy process record missing id");
    if (policyProcessIds.has(process.id)) errors.push(`Duplicate policy process record id: ${process.id}`);
    policyProcessIds.add(process.id);
    if (process.countryIso3 && process.countryIso3 !== "EUU" && !COUNTRY_BY_ISO3[process.countryIso3]) {
      errors.push(`Policy process ${process.id} references unknown country ${process.countryIso3}`);
    }
    for (const domainId of process.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) errors.push(`Policy process ${process.id} references unknown domain ${domainId}`);
    }
    corpusReferences.push(...process.relatedRecords.map((ref) => ({ owner: `Policy process ${process.id}`, kind: ref.kind, id: ref.id })));
    validateSource("Policy process", process.id, process);
    validateDate(`Policy process ${process.id} deadline`, process.deadline);
    validateDate(`Policy process ${process.id} lastVerified`, process.lastVerified);
    if (process.status === "open" && !process.deadline) warnings.push(`Open policy process ${process.id} has no deadline`);
    if (!process.caveat) errors.push(`Policy process ${process.id} missing caveat`);
  }

  const standardsIds = new Set<string>();
  for (const standard of STANDARDS_CONFORMITY_RECORDS) {
    if (!standard.id) errors.push("Standards/conformity record missing id");
    if (standardsIds.has(standard.id)) errors.push(`Duplicate standards/conformity record id: ${standard.id}`);
    standardsIds.add(standard.id);
    if (standard.countryIso3 && standard.countryIso3 !== "EUU" && !COUNTRY_BY_ISO3[standard.countryIso3]) {
      errors.push(`Standards/conformity record ${standard.id} references unknown country ${standard.countryIso3}`);
    }
    for (const domainId of standard.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) errors.push(`Standards/conformity record ${standard.id} references unknown domain ${domainId}`);
    }
    corpusReferences.push(...standard.relatedRecords.map((ref) => ({ owner: `Standards/conformity ${standard.id}`, kind: ref.kind, id: ref.id })));
    validateSource("Standards/conformity", standard.id, standard);
    validateDate(`Standards/conformity ${standard.id} lastVerified`, standard.lastVerified);
    if (!standard.caveat) errors.push(`Standards/conformity record ${standard.id} missing caveat`);
  }

  const publicSectorIds = new Set<string>();
  for (const record of PUBLIC_SECTOR_AI_RECORDS) {
    if (!record.id) errors.push("Public-sector AI record missing id");
    if (publicSectorIds.has(record.id)) errors.push(`Duplicate public-sector AI record id: ${record.id}`);
    publicSectorIds.add(record.id);
    if (record.countryIso3 && record.countryIso3 !== "EUU" && !COUNTRY_BY_ISO3[record.countryIso3]) {
      errors.push(`Public-sector AI record ${record.id} references unknown country ${record.countryIso3}`);
    }
    for (const domainId of record.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) errors.push(`Public-sector AI record ${record.id} references unknown domain ${domainId}`);
    }
    corpusReferences.push(...record.relatedRecords.map((ref) => ({ owner: `Public-sector AI ${record.id}`, kind: ref.kind, id: ref.id })));
    validateSource("Public-sector AI", record.id, record);
    validateDate(`Public-sector AI ${record.id} lastVerified`, record.lastVerified);
    if (!record.caveat) errors.push(`Public-sector AI record ${record.id} missing caveat`);
  }

  for (const ref of corpusReferences) {
    if (
      !corpusReferenceExists(ref.kind, ref.id, {
        institutionIds,
        policyProcessIds,
        standardsIds,
        publicSectorIds,
        incidentIds,
        labExposureIds,
      })
    ) {
      errors.push(`${ref.owner} references unknown ${ref.kind} ${ref.id}`);
    }
  }

  const changelogIds = new Set<string>();
  for (const entry of [...RECORD_CHANGE_LOG_ENTRIES, ...RESEARCH_CORPUS_CHANGELOG]) {
    if (changelogIds.has(entry.id)) errors.push(`Duplicate record changelog id: ${entry.id}`);
    changelogIds.add(entry.id);
    validateDate(`Record changelog ${entry.id} date`, entry.date);
  }

  // Workbench domains
  const domainIds = new Set<string>();
  for (const domain of GOVERNANCE_DOMAINS) {
    if (domainIds.has(domain.id)) errors.push(`Duplicate governance domain id: ${domain.id}`);
    domainIds.add(domain.id);
    if (!domain.label) errors.push(`Governance domain ${domain.id} missing label`);
  }

  // Structured obligations
  const obligationIds = new Set<string>();
  for (const obligation of GOVERNANCE_OBLIGATIONS) {
    if (!obligation.id) errors.push("Governance obligation missing id");
    if (obligationIds.has(obligation.id)) errors.push(`Duplicate governance obligation id: ${obligation.id}`);
    obligationIds.add(obligation.id);
    validateSource("Governance obligation", obligation.id, obligation);
    validateDate(`Governance obligation ${obligation.id} lastVerified`, obligation.lastVerified);
    if (obligation.domains.length === 0) warnings.push(`Governance obligation ${obligation.id} has no domain`);
    for (const domainId of obligation.domains) {
      if (!GOVERNANCE_DOMAIN_BY_ID[domainId]) {
        errors.push(`Governance obligation ${obligation.id} references unknown domain ${domainId}`);
      }
    }
    if (!parentReferenceExists(obligation.parentType, obligation.parentId, labExposureIds)) {
      errors.push(
        `Governance obligation ${obligation.id} references unknown ${obligation.parentType} parent ${obligation.parentId}`
      );
    }
    if (
      obligation.legalEffect === "binding" &&
      (obligation.sourceKind !== "official" || !["high", "medium"].includes(obligation.confidence ?? ""))
    ) {
      errors.push(`Binding governance obligation ${obligation.id} must use official medium/high-confidence source metadata`);
    }
    if (obligation.legalEffect !== "binding" && !obligation.caveat && obligation.directness !== "direct") {
      warnings.push(`Indirect non-binding obligation ${obligation.id} lacks a caveat`);
    }
  }

  // Implementation milestones
  const milestoneIds = new Set<string>();
  for (const milestone of IMPLEMENTATION_MILESTONES) {
    if (!milestone.id) errors.push("Implementation milestone missing id");
    if (milestoneIds.has(milestone.id)) errors.push(`Duplicate implementation milestone id: ${milestone.id}`);
    milestoneIds.add(milestone.id);
    validateSource("Implementation milestone", milestone.id, milestone);
    validateDate(`Implementation milestone ${milestone.id} date`, milestone.date);
    validateDate(`Implementation milestone ${milestone.id} nextDeadline`, milestone.nextDeadline);
    validateDate(`Implementation milestone ${milestone.id} lastVerified`, milestone.lastVerified);
    if (!parentReferenceExists(milestone.parentType, milestone.parentId, labExposureIds)) {
      errors.push(
        `Implementation milestone ${milestone.id} references unknown ${milestone.parentType} parent ${milestone.parentId}`
      );
    }
  }

  // AI Atlas context indicators
  const indicatorSourceIds = new Set<string>();
  for (const source of AI_ATLAS_SOURCES) {
    if (!source.id) errors.push("AI Atlas source missing id");
    if (indicatorSourceIds.has(source.id)) errors.push(`Duplicate AI Atlas source id: ${source.id}`);
    indicatorSourceIds.add(source.id);
    validateSource("AI Atlas source", source.id, source);
    if (!source.methodologyUrl) errors.push(`AI Atlas source ${source.id} missing methodologyUrl`);
    if (!source.caveat) warnings.push(`AI Atlas source ${source.id} missing caveat`);
  }

  const indicatorScoreIds = new Set<string>();
  for (const score of COUNTRY_INDICATOR_SCORES) {
    if (!score.id) errors.push("Country indicator score missing id");
    if (indicatorScoreIds.has(score.id)) errors.push(`Duplicate country indicator score id: ${score.id}`);
    indicatorScoreIds.add(score.id);
    if (!COUNTRY_BY_ISO3[score.countryIso3]) {
      errors.push(`Country indicator score ${score.id} references unknown country ${score.countryIso3}`);
    }
    if (!INDICATOR_SOURCE_BY_ID[score.sourceId]) {
      errors.push(`Country indicator score ${score.id} references unknown indicator source ${score.sourceId}`);
    }
    if (score.score !== undefined && (score.score < 0 || score.score > 1000)) {
      errors.push(`Country indicator score ${score.id} has implausible score ${score.score}`);
    }
    validateSource("Country indicator score", score.id, score);
  }

  const readinessReportIds = new Set<string>();
  for (const report of COUNTRY_READINESS_REPORTS) {
    if (!report.id) errors.push("Country readiness report missing id");
    if (readinessReportIds.has(report.id)) errors.push(`Duplicate country readiness report id: ${report.id}`);
    readinessReportIds.add(report.id);
    if (!COUNTRY_BY_ISO3[report.countryIso3]) {
      errors.push(`Country readiness report ${report.id} references unknown country ${report.countryIso3}`);
    }
    if (!INDICATOR_SOURCE_BY_ID[report.sourceId]) {
      errors.push(`Country readiness report ${report.id} references unknown indicator source ${report.sourceId}`);
    }
    if (!report.caveat) warnings.push(`Country readiness report ${report.id} missing caveat`);
    validateSource("Country readiness report", report.id, report);
  }

  // Dataset releases
  const releaseIds = new Set<string>();
  for (const release of DATASET_RELEASES) {
    if (releaseIds.has(release.id)) errors.push(`Duplicate dataset release id: ${release.id}`);
    releaseIds.add(release.id);
    validateDate(`Dataset release ${release.id} snapshotDate`, release.snapshotDate);
    if (release.status === "published" && release.snapshotDate > DATA_SNAPSHOT_DATE) {
      errors.push(`Published dataset release ${release.id} is after snapshot date ${DATA_SNAPSHOT_DATE}`);
    }
  }

  // Infrastructure
  const infraIds = new Set<string>();
  for (const node of INFRASTRUCTURE_NODES) {
    if (infraIds.has(node.id)) errors.push(`Duplicate infrastructure id: ${node.id}`);
    infraIds.add(node.id);
    validateSource("Infrastructure", node.id, node);
    if (node.powerScore < 1 || node.powerScore > 5) {
      errors.push(`Infrastructure ${node.id} powerScore outside 1-5 range`);
    }
  }

  // Edges
  const edgeIds = new Set<string>();
  for (const edge of DEPENDENCY_EDGES) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge: ${edge.id}`);
    edgeIds.add(edge.id);
    const endpoints: Array<["source" | "target", string, string]> = [
      ["source", edge.sourceType, edge.sourceId],
      ["target", edge.targetType, edge.targetId],
    ];
    for (const [side, kind, id] of endpoints) {
      let ok = false;
      if (kind === "country") ok = !!COUNTRY_BY_ISO3[id];
      else if (kind === "lab") ok = !!LAB_BY_ID[id];
      else if (kind === "instrument") ok = !!INSTRUMENT_BY_ID[id];
      else if (kind === "national_rule") ok = !!NATIONAL_REG_BY_ID[id];
      else if (kind === "infrastructure") ok = !!INFRA_BY_ID[id];
      if (!ok) warnings.push(`Edge ${edge.id} ${side} (${kind}) references unknown id: ${id}`);
    }
  }

  // Subnational
  const subIds = new Set<string>();
  for (const sub of SUBNATIONAL_AI_RULES) {
    if (subIds.has(sub.id)) errors.push(`Duplicate subnational id: ${sub.id}`);
    subIds.add(sub.id);
    if (!COUNTRY_BY_ISO3[sub.countryIso3])
      errors.push(`Subnational ${sub.id} references unknown country ${sub.countryIso3}`);
    validateSource("Subnational", sub.id, sub);
    validateDate(`Subnational ${sub.id} dateAdopted`, sub.dateAdopted);
    validateDate(`Subnational ${sub.id} dateInForce`, sub.dateInForce);
  }

  for (const [kind, count] of sourceMetadataMissing) {
    warnings.push(`${count} ${kind} records lack explicit verification metadata`);
  }
  for (const [host, { sourceKind, count }] of sourceHostCounts) {
    warnings.push(`${count} source URL(s) use ${sourceKind} host ${host}`);
  }
  for (const [issue, count] of sourceIssueCounts) {
    warnings.push(`${count} source URL(s): ${issue}`);
  }
  for (const [instrumentId, count] of indirectParticipationWithoutNote) {
    warnings.push(
      `${count} covered_by_membership participation row(s) for ${instrumentId} lack an explicit caveat note`
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

function parentReferenceExists(parentType: string, parentId: string, labExposureIds: Set<string>): boolean {
  if (parentType === "national_rule") return Boolean(NATIONAL_REG_BY_ID[parentId]);
  if (parentType === "international_instrument") return Boolean(INSTRUMENT_BY_ID[parentId]);
  if (parentType === "subnational_rule") return Boolean(SUBNATIONAL_BY_ID[parentId]);
  if (parentType === "lab_exposure") return labExposureIds.has(parentId);
  return false;
}

function corpusReferenceExists(
  kind: string,
  id: string,
  ids: {
    institutionIds: Set<string>;
    policyProcessIds: Set<string>;
    standardsIds: Set<string>;
    publicSectorIds: Set<string>;
    incidentIds: Set<string>;
    labExposureIds: Set<string>;
  }
): boolean {
  if (kind === "institution") return ids.institutionIds.has(id);
  if (kind === "policy_process") return ids.policyProcessIds.has(id);
  if (kind === "standards_conformity") return ids.standardsIds.has(id);
  if (kind === "public_sector_ai") return ids.publicSectorIds.has(id);
  if (kind === "enforcement") return ids.incidentIds.has(id);
  if (kind === "country") return Boolean(COUNTRY_BY_ISO3[id]);
  if (kind === "lab") return Boolean(LAB_BY_ID[id]);
  if (kind === "instrument" || kind === "international_instrument") return Boolean(INSTRUMENT_BY_ID[id]);
  if (kind === "national_rule") return Boolean(NATIONAL_REG_BY_ID[id]);
  if (kind === "subnational_rule") return Boolean(SUBNATIONAL_BY_ID[id]);
  if (kind === "lab_exposure") return ids.labExposureIds.has(id);
  if (kind === "obligation") return GOVERNANCE_OBLIGATIONS.some((row) => row.id === id);
  if (kind === "implementation") return IMPLEMENTATION_MILESTONES.some((row) => row.id === id);
  return false;
}

export function runDevValidation(): void {
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    const report = validateData();
    if (report.errors.length === 0 && report.warnings.length === 0) {
      console.info(
        `%c[Data] OK · ${COUNTRIES.length} countries · ${INTERNATIONAL_INSTRUMENTS.length} instruments · ${NATIONAL_AI_REGULATIONS.length} national regs · ${SUBNATIONAL_AI_RULES.length} subnational rules · ${FRONTIER_LABS.length} frontier labs · ${LAB_REGULATORY_EXPOSURES.length} lab exposure rows · ${GOVERNANCE_OBLIGATIONS.length} obligations · ${IMPLEMENTATION_MILESTONES.length} implementation milestones · ${INFRASTRUCTURE_NODES.length} infrastructure nodes · ${DEPENDENCY_EDGES.length} edges · ${INTERNATIONAL_PARTICIPATION.length} participation rows`,
        "color:#1E40AF;font-weight:600"
      );
    } else {
      console.group("[Data] Validation report");
      report.errors.forEach((e) => console.error("[err]", e));
      report.warnings.forEach((w) => console.warn("[warn]", w));
      console.groupEnd();
    }
  }
}
