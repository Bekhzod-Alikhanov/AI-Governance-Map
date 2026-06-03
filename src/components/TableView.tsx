import { useMemo, useState } from "react";
import clsx from "clsx";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { DATASET_RELEASES } from "../data/datasetReleases";
import { GOVERNANCE_OBLIGATIONS, OBLIGATION_CATEGORY_LABELS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES, IMPLEMENTATION_STATUS_LABELS } from "../data/implementationMilestones";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import type { FilterState, LabRegulatoryExposure, VerificationMetadata } from "../types";
import { downloadTextFile } from "../utils/exportDataset";
import { filterCountries } from "../utils/filterCountries";
import { DATA_CONFIDENCE_LABELS, SOURCE_KIND_LABELS, VERIFICATION_STATUS_LABELS } from "../utils/getVerificationLabel";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { isConfirmedBindingNationalRegulation } from "../utils/governanceTaxonomy";
import {
  getLabExposureTarget,
  getLabRegulatoryExposures,
  LAB_EXPOSURE_DIRECTNESS_LABELS,
  LAB_EXPOSURE_EFFECT_LABELS,
  LAB_EXPOSURE_KIND_LABELS,
  summarizeLabExposures,
} from "../utils/labExposure";
import {
  domainLabel,
  getRecordDisplayName,
  implementationMatchesFilters,
  obligationEffectLabel,
  obligationMatchesFilters,
} from "../utils/researchWorkbench";

type DatasetKey =
  | "countries"
  | "instruments"
  | "national"
  | "labs"
  | "exposure"
  | "obligations"
  | "implementation"
  | "participation"
  | "sources"
  | "releases";

interface Props {
  filters: FilterState;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
}

interface TableColumn {
  key: string;
  label: string;
}

interface TableRow {
  id: string;
  searchText: string;
  values: Record<string, string | number>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const DATASETS: Array<{ key: DatasetKey; label: string }> = [
  { key: "countries", label: "Countries" },
  { key: "instruments", label: "Instruments" },
  { key: "national", label: "National rules" },
  { key: "labs", label: "Labs" },
  { key: "exposure", label: "Exposure" },
  { key: "obligations", label: "Obligations" },
  { key: "implementation", label: "Implementation" },
  { key: "participation", label: "Participation" },
  { key: "sources", label: "Sources" },
  { key: "releases", label: "Releases" },
];

const COLUMNS: Record<DatasetKey, TableColumn[]> = {
  countries: [
    { key: "name", label: "Country" },
    { key: "iso3", label: "ISO3" },
    { key: "region", label: "Region" },
    { key: "nationalEntries", label: "National entries" },
    { key: "internationalRows", label: "Intl. rows" },
    { key: "bindingLaw", label: "Binding law" },
    { key: "labs", label: "Labs" },
  ],
  instruments: [
    { key: "name", label: "Instrument" },
    { key: "organization", label: "Organization" },
    { key: "type", label: "Type" },
    { key: "effect", label: "Legal effect" },
    { key: "date", label: "Date" },
    { key: "confidence", label: "Confidence" },
    { key: "lastVerified", label: "Last verified" },
  ],
  national: [
    { key: "name", label: "Rule" },
    { key: "jurisdiction", label: "Jurisdiction" },
    { key: "type", label: "Type" },
    { key: "effect", label: "Effect" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "confidence", label: "Confidence" },
  ],
  labs: [
    { key: "name", label: "Lab" },
    { key: "hq", label: "HQ" },
    { key: "models", label: "Models" },
    { key: "power", label: "Power" },
    { key: "fmf", label: "FMF" },
    { key: "exposure", label: "Exposure count" },
    { key: "confidence", label: "Confidence" },
  ],
  exposure: [
    { key: "lab", label: "Lab" },
    { key: "target", label: "Exposure target" },
    { key: "kind", label: "Kind" },
    { key: "effect", label: "Legal effect" },
    { key: "directness", label: "Directness" },
    { key: "strength", label: "Strength" },
    { key: "jurisdiction", label: "Jurisdiction / hook" },
    { key: "confidence", label: "Confidence" },
    { key: "lastVerified", label: "Last verified" },
    { key: "source", label: "Source" },
  ],
  obligations: [
    { key: "category", label: "Obligation" },
    { key: "parent", label: "Parent record" },
    { key: "effect", label: "Legal effect" },
    { key: "directness", label: "Directness" },
    { key: "domains", label: "Domains" },
    { key: "jurisdiction", label: "Jurisdiction / hook" },
    { key: "confidence", label: "Confidence" },
    { key: "lastVerified", label: "Last verified" },
    { key: "source", label: "Source" },
  ],
  implementation: [
    { key: "label", label: "Milestone" },
    { key: "parent", label: "Parent record" },
    { key: "jurisdiction", label: "Jurisdiction" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "nextDeadline", label: "Next deadline" },
    { key: "confidence", label: "Confidence" },
    { key: "source", label: "Source" },
  ],
  participation: [
    { key: "country", label: "Country" },
    { key: "instrument", label: "Instrument" },
    { key: "participation", label: "Participation" },
    { key: "effect", label: "Instrument effect" },
    { key: "organization", label: "Organization" },
    { key: "date", label: "Date" },
    { key: "source", label: "Source" },
  ],
  sources: [
    { key: "record", label: "Record" },
    { key: "kind", label: "Kind" },
    { key: "sourceKind", label: "Source kind" },
    { key: "status", label: "Verification" },
    { key: "confidence", label: "Confidence" },
    { key: "lastVerified", label: "Last verified" },
    { key: "source", label: "Source" },
  ],
  releases: [
    { key: "id", label: "Release" },
    { key: "snapshotDate", label: "Snapshot" },
    { key: "status", label: "Status" },
    { key: "added", label: "Added" },
    { key: "changed", label: "Changed" },
    { key: "unresolved", label: "Manual review" },
  ],
};

export function TableView({ filters, onSelectCountry, onSelectLab, onSelectInstrument }: Props) {
  const [dataset, setDataset] = useState<DatasetKey>("countries");
  const [query, setQuery] = useState(filters.searchQuery);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(
    () => buildRows(dataset, filters, onSelectCountry, onSelectLab, onSelectInstrument),
    [dataset, filters, onSelectCountry, onSelectInstrument, onSelectLab]
  );
  const columns = COLUMNS[dataset];
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => !q || row.searchText.includes(q))
      .sort((a, b) => {
        const av = String(a.values[sortKey] ?? "");
        const bv = String(b.values[sortKey] ?? "");
        const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [rows, query, sortDir, sortKey]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function exportCsv() {
    const header = columns.map((column) => column.label);
    const body = visibleRows.map((row) => columns.map((column) => csvCell(row.values[column.key] ?? "")));
    const csv = [header.map(csvCell).join(","), ...body.map((line) => line.join(","))].join("\n");
    downloadTextFile(`global-ai-governance-map-${dataset}.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas-surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-canvas-line px-5 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-ink-900">Research table</h2>
          <p className="text-xs text-ink-700">
            Showing <span className="font-semibold text-ink-900">{visibleRows.length}</span> of {rows.length} rows.
          </p>
        </div>
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-canvas-line">
          {DATASETS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setDataset(item.key);
                setSortKey(COLUMNS[item.key][0].key);
              }}
              className={clsx(
                "whitespace-nowrap px-2.5 py-1 text-[11px] font-medium transition-colors",
                dataset === item.key ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="min-w-48 flex-1 sm:max-w-xs">
          <span className="sr-only">Filter table</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter rows..."
            className="w-full rounded-lg border border-canvas-line bg-white px-3 py-1.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-canvas-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-canvas"
        >
          Export CSV
        </button>
      </header>

      <div className="policy-scroll flex-1 overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#CBD5E1]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold text-ink-700">
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-canvas"
                  >
                    {column.label}
                    {sortKey === column.key && <span aria-hidden="true">{sortDir === "asc" ? "up" : "down"}</span>}
                  </button>
                </th>
              ))}
              <th scope="col" className="px-3 py-2 font-semibold text-ink-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b border-canvas-line odd:bg-white even:bg-canvas/50">
                {columns.map((column) => (
                  <td key={column.key} className="max-w-sm border-b border-canvas-line px-3 py-2 align-top text-ink-700">
                    {String(row.values[column.key] ?? "")}
                  </td>
                ))}
                <td className="border-b border-canvas-line px-3 py-2 align-top">
                  {row.action && (
                    <button
                      type="button"
                      onClick={row.action.onClick}
                      className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
                    >
                      {row.action.label}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleRows.length === 0 && (
          <p className="px-5 py-6 text-sm text-ink-500">No rows match the current table filter.</p>
        )}
      </div>
    </div>
  );
}

function buildRows(
  dataset: DatasetKey,
  filters: FilterState,
  onSelectCountry: (iso3: string) => void,
  onSelectLab: (labId: string) => void,
  onSelectInstrument: (instrumentId: string) => void
): TableRow[] {
  if (dataset === "countries") {
    return filterCountries(filters)
      .filter((match) => match.matchesFilter)
      .map(({ country }) => {
        const summary = getCountryGovernanceSummary(country.iso3);
        return row(`country:${country.iso3}`, {
          name: country.name,
          iso3: country.iso3,
          region: country.region,
          nationalEntries: summary.nationalRegulations.length,
          internationalRows: summary.participations.length,
          bindingLaw: summary.hasBindingNationalLaw ? "Yes" : "No",
          labs: summary.hqLabs.map((lab) => lab.name).join("; "),
        }, { label: "Open", onClick: () => onSelectCountry(country.iso3) });
      });
  }

  if (dataset === "instruments") {
    return INTERNATIONAL_INSTRUMENTS.filter((instrument) => {
      if (filters.selectedInstrumentIds.length && !filters.selectedInstrumentIds.includes(instrument.id)) return false;
      if (filters.selectedBindingStatuses.length && !filters.selectedBindingStatuses.includes(instrument.bindingStatus)) return false;
      if (filters.selectedOrganizations.length && !filters.selectedOrganizations.includes(instrument.organizationType)) return false;
      if (filters.frontierAIRelevant === "yes" && !instrument.frontierAIRelevant) return false;
      if (filters.frontierAIRelevant === "no" && instrument.frontierAIRelevant) return false;
      return true;
    }).map((instrument) =>
      row(`instrument:${instrument.id}`, {
        name: instrument.name,
        organization: instrument.organizationType,
        type: instrument.instrumentType.replace(/_/g, " "),
        effect: instrument.bindingStatus.replace(/_/g, " "),
        date: instrument.date,
        confidence: confidenceLabel(instrument),
        lastVerified: instrument.lastVerified ?? "",
      }, { label: "Filter", onClick: () => onSelectInstrument(instrument.id) })
    );
  }

  if (dataset === "national") {
    return NATIONAL_AI_REGULATIONS.filter((reg) => {
      const country = reg.countryIso3 ? COUNTRY_BY_ISO3[reg.countryIso3] : null;
      if (filters.selectedRegions.length && country && !filters.selectedRegions.includes(country.region)) return false;
      const isConfirmedBinding = isConfirmedBindingNationalRegulation(reg);
      if (filters.hasBindingNationalLaw === "yes" && !isConfirmedBinding) return false;
      if (filters.hasBindingNationalLaw === "no" && isConfirmedBinding) return false;
      if (filters.hasAnyAIRule === "no") return false;
      if (filters.frontierAIRelevant === "yes" && !reg.frontierAIRelevant) return false;
      if (filters.frontierAIRelevant === "no" && reg.frontierAIRelevant) return false;
      return true;
    }).map((reg) =>
      row(`national:${reg.id}`, {
        name: reg.name,
        jurisdiction: reg.jurisdiction,
        type: reg.type.replace(/_/g, " "),
        effect: reg.bindingStatus,
        status: reg.status,
        date: reg.dateInForce ?? reg.dateAdopted ?? "",
        confidence: confidenceLabel(reg),
      }, reg.countryIso3 ? { label: "Country", onClick: () => onSelectCountry(reg.countryIso3!) } : undefined)
    );
  }

  if (dataset === "labs") {
    return FRONTIER_LABS.filter((lab) => {
      if (filters.selectedLabIds.length && !filters.selectedLabIds.includes(lab.id)) return false;
      return true;
    }).map((lab) =>
      {
        const exposureSummary = summarizeLabExposures(getLabRegulatoryExposures(lab.id));
        return row(`lab:${lab.id}`, {
          name: lab.name,
          hq: lab.hqCountryName,
          models: lab.flagshipModels.join("; "),
          power: lab.powerScore,
          fmf: lab.isFMFMember ? "Yes" : "No",
          exposure: exposureSummary.total,
          confidence: confidenceLabel(lab),
        }, { label: "Open", onClick: () => onSelectLab(lab.id) });
      }
    );
  }

  if (dataset === "exposure") {
    return LAB_REGULATORY_EXPOSURES.filter((exposure) => exposureMatchesFilters(exposure, filters)).map((exposure) => {
      const lab = FRONTIER_LABS.find((item) => item.id === exposure.labId);
      const target = getLabExposureTarget(exposure);
      return row(`exposure:${exposure.id}`, {
        lab: lab?.name ?? exposure.labId,
        target: target.name,
        kind: LAB_EXPOSURE_KIND_LABELS[exposure.exposureKind],
        effect: LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect],
        directness: LAB_EXPOSURE_DIRECTNESS_LABELS[exposure.directness],
        strength: exposure.strength,
        jurisdiction: exposure.jurisdiction ?? "",
        confidence: confidenceLabel(exposure),
        lastVerified: exposure.lastVerified ?? "",
        source: exposure.sourceName,
      }, lab ? { label: "Lab", onClick: () => onSelectLab(lab.id) } : undefined);
    });
  }

  if (dataset === "obligations") {
    return GOVERNANCE_OBLIGATIONS.filter((obligation) => obligationMatchesFilters(obligation, filters)).map((obligation) =>
      row(`obligation:${obligation.id}`, {
        category: OBLIGATION_CATEGORY_LABELS[obligation.category],
        parent: getRecordDisplayName(obligation.parentType, obligation.parentId),
        effect: obligationEffectLabel(obligation.legalEffect),
        directness: obligation.directness,
        domains: obligation.domains.map(domainLabel).join("; "),
        jurisdiction: obligation.jurisdiction ?? "",
        confidence: confidenceLabel(obligation),
        lastVerified: obligation.lastVerified ?? "",
        source: obligation.sourceName,
      }, actionForParent(obligation.parentType, obligation.parentId, onSelectCountry, onSelectLab, onSelectInstrument))
    );
  }

  if (dataset === "implementation") {
    return IMPLEMENTATION_MILESTONES.filter((milestone) => implementationMatchesFilters(milestone, filters)).map((milestone) =>
      row(`implementation:${milestone.id}`, {
        label: milestone.label,
        parent: getRecordDisplayName(milestone.parentType, milestone.parentId),
        jurisdiction: milestone.jurisdiction,
        status: IMPLEMENTATION_STATUS_LABELS[milestone.status],
        date: milestone.date ?? "",
        nextDeadline: milestone.nextDeadline ?? "",
        confidence: confidenceLabel(milestone),
        source: milestone.sourceName,
      }, actionForParent(milestone.parentType, milestone.parentId, onSelectCountry, onSelectLab, onSelectInstrument))
    );
  }

  if (dataset === "participation") {
    return INTERNATIONAL_PARTICIPATION.filter((participation) => {
      const instrument = INSTRUMENT_BY_ID[participation.instrumentId];
      const country = COUNTRY_BY_ISO3[participation.countryIso3];
      if (!instrument) return false;
      if (filters.selectedInstrumentIds.length && !filters.selectedInstrumentIds.includes(participation.instrumentId)) return false;
      if (filters.selectedParticipationTypes.length && !filters.selectedParticipationTypes.includes(participation.participationType)) return false;
      if (filters.selectedBindingStatuses.length && !filters.selectedBindingStatuses.includes(instrument.bindingStatus)) return false;
      if (filters.selectedOrganizations.length && !filters.selectedOrganizations.includes(instrument.organizationType)) return false;
      if (filters.selectedRegions.length && country && !filters.selectedRegions.includes(country.region)) return false;
      return true;
    }).map((participation) => {
      const instrument = INSTRUMENT_BY_ID[participation.instrumentId];
      const country = COUNTRY_BY_ISO3[participation.countryIso3];
      return row(`participation:${participation.id}`, {
        country: country?.name ?? participation.countryIso3,
        instrument: instrument?.name ?? participation.instrumentId,
        participation: participation.participationType.replace(/_/g, " "),
        effect: instrument?.bindingStatus.replace(/_/g, " ") ?? "",
        organization: instrument?.organizationType ?? "",
        date: participation.date ?? "",
        source: participation.sourceName,
      }, country ? { label: "Country", onClick: () => onSelectCountry(country.iso3) } : undefined);
    });
  }

  if (dataset === "sources") return sourceRows();

  return DATASET_RELEASES.map((release) =>
    row(`release:${release.id}`, {
      id: release.id,
      snapshotDate: release.snapshotDate,
      status: release.status,
      added: release.recordsAdded.length,
      changed: release.recordsChanged.length,
      unresolved: release.unresolvedManualReview.length,
    })
  );
}

function sourceRows(): TableRow[] {
  const entries: Array<{ kind: string; id: string; name: string; sourceName: string; sourceUrl: string } & VerificationMetadata> = [
    ...INTERNATIONAL_INSTRUMENTS.map((item) => toSourceEntry("International instrument", item)),
    ...NATIONAL_AI_REGULATIONS.map((item) => toSourceEntry("National rule", item)),
    ...SUBNATIONAL_AI_RULES.map((item) => toSourceEntry("Subnational rule", item)),
    ...FRONTIER_LABS.map((item) => toSourceEntry("Frontier lab", item)),
    ...LAB_REGULATORY_EXPOSURES.map((item) => toLabExposureSourceEntry(item)),
    ...GOVERNANCE_OBLIGATIONS.map((item) => toSourceEntry("Obligation", {
      ...item,
      name: `${OBligationName(item.category)} - ${getRecordDisplayName(item.parentType, item.parentId)}`,
    })),
    ...IMPLEMENTATION_MILESTONES.map((item) => toSourceEntry("Implementation milestone", { ...item, name: item.label })),
    ...INFRASTRUCTURE_NODES.map((item) => toSourceEntry("Infrastructure", item)),
  ];

  return entries.map((entry) =>
    row(`source:${entry.kind}:${entry.id}`, {
      record: entry.name,
      kind: entry.kind,
      sourceKind: entry.sourceKind ? SOURCE_KIND_LABELS[entry.sourceKind] : "",
      status: entry.verificationStatus ? VERIFICATION_STATUS_LABELS[entry.verificationStatus] : "",
      confidence: confidenceLabel(entry),
      lastVerified: entry.lastVerified ?? "",
      source: entry.sourceName,
    })
  );
}

function actionForParent(
  parentType: string,
  parentId: string,
  onSelectCountry: (iso3: string) => void,
  onSelectLab: (labId: string) => void,
  onSelectInstrument: (instrumentId: string) => void
): TableRow["action"] | undefined {
  if (parentType === "international_instrument") {
    return { label: "Instrument", onClick: () => onSelectInstrument(parentId) };
  }
  if (parentType === "lab_exposure") {
    const exposure = LAB_REGULATORY_EXPOSURES.find((row) => row.id === parentId);
    return exposure ? { label: "Lab", onClick: () => onSelectLab(exposure.labId) } : undefined;
  }
  if (parentType === "national_rule") {
    const reg = NATIONAL_AI_REGULATIONS.find((row) => row.id === parentId);
    return reg?.countryIso3 ? { label: "Country", onClick: () => onSelectCountry(reg.countryIso3!) } : undefined;
  }
  if (parentType === "subnational_rule") {
    const rule = SUBNATIONAL_AI_RULES.find((row) => row.id === parentId);
    return rule ? { label: "Country", onClick: () => onSelectCountry(rule.countryIso3) } : undefined;
  }
  return undefined;
}

function toSourceEntry(
  kind: string,
  item: { id: string; name: string; sourceName: string; sourceUrl: string } & VerificationMetadata
) {
  return {
    kind,
    id: item.id,
    name: item.name,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    sourceKind: item.sourceKind,
    verificationStatus: item.verificationStatus,
    confidence: item.confidence,
    lastVerified: item.lastVerified,
    verificationNotes: item.verificationNotes,
  };
}

function toLabExposureSourceEntry(item: LabRegulatoryExposure) {
  const lab = FRONTIER_LABS.find((candidate) => candidate.id === item.labId);
  const target = getLabExposureTarget(item);
  return {
    kind: "Lab exposure",
    id: item.id,
    name: `${lab?.name ?? item.labId} - ${target.name}`,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    sourceKind: item.sourceKind,
    verificationStatus: item.verificationStatus,
    confidence: item.confidence,
    lastVerified: item.lastVerified,
    verificationNotes: item.verificationNotes,
  };
}

function row(id: string, values: Record<string, string | number>, action?: TableRow["action"]): TableRow {
  return {
    id,
    values,
    action,
    searchText: Object.values(values).join(" ").toLowerCase(),
  };
}

function confidenceLabel(item: VerificationMetadata): string {
  return item.confidence ? DATA_CONFIDENCE_LABELS[item.confidence] : "";
}

function OBligationName(category: string): string {
  return OBLIGATION_CATEGORY_LABELS[category as keyof typeof OBLIGATION_CATEGORY_LABELS] ?? category;
}

function exposureMatchesFilters(exposure: LabRegulatoryExposure, filters: FilterState): boolean {
  if (filters.selectedLabIds.length && !filters.selectedLabIds.includes(exposure.labId)) return false;
  if (filters.selectedInstrumentIds.length && !filters.selectedInstrumentIds.includes(exposure.targetId)) {
    return false;
  }
  if (filters.selectedBindingStatuses.length) {
    const target = getLabExposureTarget(exposure);
    const instrument = INSTRUMENT_BY_ID[target.id];
    if (!instrument || !filters.selectedBindingStatuses.includes(instrument.bindingStatus)) return false;
  }
  return true;
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}
