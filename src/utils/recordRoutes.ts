import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { SUBNATIONAL_BY_ID } from "../data/subnationalRules";

export type RecordRouteKind = "country" | "lab" | "instrument" | "rule";

export interface RecordRoute {
  kind: RecordRouteKind;
  id: string;
}

const ROUTE_PREFIXES: Record<RecordRouteKind, string> = {
  country: "/country/",
  lab: "/lab/",
  instrument: "/instrument/",
  rule: "/rule/",
};

export function recordRoute(kind: RecordRouteKind, id: string): string {
  return `${ROUTE_PREFIXES[kind]}${encodeURIComponent(id)}`;
}

export function parseRecordRoute(pathname: string): RecordRoute | null {
  for (const [kind, prefix] of Object.entries(ROUTE_PREFIXES) as Array<[RecordRouteKind, string]>) {
    if (!pathname.startsWith(prefix)) continue;
    const id = decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "");
    if (!id || !recordExists(kind, id)) return null;
    return { kind, id };
  }
  return null;
}

export function recordExists(kind: RecordRouteKind, id: string): boolean {
  if (kind === "country") return Boolean(COUNTRY_BY_ISO3[id]);
  if (kind === "lab") return Boolean(LAB_BY_ID[id]);
  if (kind === "instrument") return Boolean(INSTRUMENT_BY_ID[id]);
  return Boolean(NATIONAL_REG_BY_ID[id] || SUBNATIONAL_BY_ID[id]);
}
