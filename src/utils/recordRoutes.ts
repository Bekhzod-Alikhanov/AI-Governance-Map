import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";

export type RecordRouteKind = "country" | "lab" | "instrument" | "rule" | "obligation" | "exposure";

export interface RecordRoute {
  kind: RecordRouteKind;
  id: string;
}

const ROUTE_PREFIXES: Record<RecordRouteKind, string> = {
  country: "/country/",
  lab: "/lab/",
  instrument: "/instrument/",
  rule: "/rule/",
  obligation: "/obligation/",
  exposure: "/exposure/",
};

export function recordRoute(kind: RecordRouteKind, id: string): string {
  return `${ROUTE_PREFIXES[kind]}${encodeURIComponent(id)}`;
}

export function parseRecordRoute(pathname: string): RecordRoute | null {
  for (const [kind, prefix] of Object.entries(ROUTE_PREFIXES) as Array<[RecordRouteKind, string]>) {
    if (!pathname.startsWith(prefix)) continue;
    const id = decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "");
    const safeId = sanitizeRecordId(id);
    if (!safeId || !recordExists(kind, safeId)) return null;
    return { kind, id: safeId };
  }
  return null;
}

export function recordExists(kind: RecordRouteKind, id: string): boolean {
  if (kind === "country") return Boolean(COUNTRY_BY_ISO3[id]);
  if (kind === "lab") return Boolean(LAB_BY_ID[id]);
  if (kind === "instrument") return Boolean(INSTRUMENT_BY_ID[id]);
  return isSafeRecordId(id);
}

function sanitizeRecordId(id: string): string {
  return id.trim().slice(0, 180);
}

function isSafeRecordId(id: string): boolean {
  return /^[a-z0-9][a-z0-9._:-]{0,179}$/i.test(id);
}
