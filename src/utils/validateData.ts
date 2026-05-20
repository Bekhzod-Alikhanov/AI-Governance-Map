import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
import { INFRASTRUCTURE_NODES, INFRA_BY_ID } from "../data/infrastructure";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
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
    if (inst.bindingStatus === "standard" && inst.instrumentType !== "standard") {
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

export function runDevValidation(): void {
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    const report = validateData();
    if (report.errors.length === 0 && report.warnings.length === 0) {
      // eslint-disable-next-line no-console
      console.info(
        `%c[Data] OK · ${COUNTRIES.length} countries · ${INTERNATIONAL_INSTRUMENTS.length} instruments · ${NATIONAL_AI_REGULATIONS.length} national regs · ${SUBNATIONAL_AI_RULES.length} subnational rules · ${FRONTIER_LABS.length} frontier labs · ${INFRASTRUCTURE_NODES.length} infrastructure nodes · ${DEPENDENCY_EDGES.length} edges · ${INTERNATIONAL_PARTICIPATION.length} participation rows`,
        "color:#1E40AF;font-weight:600"
      );
    } else {
      // eslint-disable-next-line no-console
      console.group("[Data] Validation report");
      report.errors.forEach((e) => console.error("[err]", e));
      report.warnings.forEach((w) => console.warn("[warn]", w));
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }
}
