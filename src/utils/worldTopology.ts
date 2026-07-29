import { geoEqualEarth, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { numericToAlpha3 } from "./normalizeCountry";

// The world topology is data, not code. Importing the JSON directly made the
// engine parse 107 KB of TopoJSON as JavaScript source on the critical path;
// `?url` emits it as a hashed static asset instead, so it is fetched in
// parallel and read with JSON.parse, which is far cheaper than JS parsing.
import worldTopoUrl from "world-atlas/countries-110m.json?url";

export type CountryFeature = Feature & {
  id?: string | number;
  properties?: { id?: string | number } | null;
};

export interface WorldTopology {
  /** Every country feature, including Antarctica. */
  features: CountryFeature[];
  /** Features used for fitting the projection — Antarctica excluded. */
  fitted: GeoPermissibleObjects;
  /** Projection bounds at scale 1, precomputed for zoom-to-fit maths. */
  baseBounds: [[number, number], [number, number]];
  byIso3: Map<string, CountryFeature>;
}

export function featureIso3(geo: CountryFeature): string | null {
  const numericId = (geo.id as string | number | undefined) ?? geo.properties?.id;
  return numericToAlpha3(numericId);
}

function build(topology: Topology<{ countries: GeometryCollection }>): WorldTopology {
  const collection = feature(topology, topology.objects.countries) as unknown as {
    type: "FeatureCollection";
    features: CountryFeature[];
  };

  const fitted = {
    ...collection,
    features: collection.features.filter((geo) => featureIso3(geo) !== "ATA"),
  } as unknown as GeoPermissibleObjects;

  const baseBounds = geoPath(
    geoEqualEarth().scale(1).center([10, 10]).translate([0, 0])
  ).bounds(fitted);

  const byIso3 = new Map<string, CountryFeature>();
  for (const geo of collection.features) {
    const iso3 = featureIso3(geo);
    if (iso3) byIso3.set(iso3, geo);
  }

  return { features: collection.features, fitted, baseBounds, byIso3 };
}

// Module-level cache: the topology never changes, and several callers want it.
let pending: Promise<WorldTopology> | null = null;

export function loadWorldTopology(): Promise<WorldTopology> {
  pending ??= fetch(worldTopoUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`World topology returned HTTP ${response.status}`);
      return response.json() as Promise<Topology<{ countries: GeometryCollection }>>;
    })
    .then(build)
    .catch((error: unknown) => {
      // Allow a later attempt rather than caching the failure forever.
      pending = null;
      throw error;
    });
  return pending;
}
