export type EmbedRouteKind =
  | "country"
  | "lab"
  | "instrument"
  | "obligation"
  | "exposure"
  | "implementation"
  | "atlas";

export interface EmbedRoute {
  kind: EmbedRouteKind;
  id: string;
}

const EMBED_PREFIX = "/embed/";
const EMBED_KINDS = new Set<EmbedRouteKind>([
  "country",
  "lab",
  "instrument",
  "obligation",
  "exposure",
  "implementation",
  "atlas",
]);

export function parseEmbedRoute(pathname: string): EmbedRoute | null {
  if (!pathname.startsWith(EMBED_PREFIX)) return null;
  const [kind, ...rest] = pathname.slice(EMBED_PREFIX.length).split("/");
  if (!EMBED_KINDS.has(kind as EmbedRouteKind)) return null;
  const id = decodeURIComponent(rest.join("/"));
  if (!id) return null;
  return { kind: kind as EmbedRouteKind, id };
}

export function embedRoute(kind: EmbedRouteKind, id: string): string {
  return `/embed/${kind}/${encodeURIComponent(id)}`;
}
