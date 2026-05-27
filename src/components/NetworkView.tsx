import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { COUNTRIES } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import type { GraphEdge, GraphNodeType, NetworkDensity, NetworkPresetId } from "../types";
import { activateOnKeyboard } from "../utils/keyboardActivation";

type NodeKind = GraphNodeType;

interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: NodeKind;
  label: string;
  size: number;
  color: string;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  strength: number;
  relationship: string;
}

const KIND_COLOR: Record<NodeKind, string> = {
  country: "#1D4ED8",
  lab: "#B45309",
  instrument: "#6D28D9",
  national_rule: "#10B981",
  infrastructure: "#0F172A",
};

const NODE_LIST_LIMIT = 80;
const NETWORK_PRESETS: Array<{ id: NetworkPresetId; label: string }> = [
  { id: "all", label: "All" },
  { id: "labs-laws", label: "Labs and laws" },
  { id: "summit-process", label: "Summits" },
  { id: "standards-layer", label: "Standards" },
  { id: "compute-chokepoints", label: "Compute" },
];
const DENSITY_OPTIONS: Array<{ id: NetworkDensity; label: string; minStrength: number }> = [
  { id: "all", label: "All edges", minStrength: 1 },
  { id: "core", label: "Core", minStrength: 3 },
  { id: "sparse", label: "Sparse", minStrength: 4 },
];

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string, kind: NodeKind) => void;
  preset: NetworkPresetId;
  onPresetChange: (preset: NetworkPresetId) => void;
  density: NetworkDensity;
  onDensityChange: (density: NetworkDensity) => void;
  frontierOnly: boolean;
  onFrontierOnlyChange: (frontierOnly: boolean) => void;
}

export function NetworkView({
  selectedNodeId,
  onSelectNode,
  preset,
  onPresetChange,
  density,
  onDensityChange,
  frontierOnly,
  onFrontierOnlyChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const [showNodeList, setShowNodeList] = useState(false);
  const [nodeQuery, setNodeQuery] = useState("");

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDims({ w: Math.max(400, e.contentRect.width), h: Math.max(400, e.contentRect.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => {
    const involvedIds = new Set<string>();
    const minStrength = DENSITY_OPTIONS.find((option) => option.id === density)?.minStrength ?? 1;
    const visibleEdges = DEPENDENCY_EDGES.filter(
      (edge) =>
        edge.strength >= minStrength &&
        edgeMatchesPreset(edge, preset) &&
        (!frontierOnly || edgeHasFrontierRelevance(edge))
    );

    for (const edge of visibleEdges) {
      involvedIds.add(edge.sourceId);
      involvedIds.add(edge.targetId);
    }

    const nodes: SimNode[] = [];
    for (const c of COUNTRIES) {
      if (!involvedIds.has(c.iso3)) continue;
      nodes.push({
        id: c.iso3,
        kind: "country",
        label: c.name,
        size: 8,
        color: KIND_COLOR.country,
      });
    }
    for (const l of FRONTIER_LABS) {
      if (preset !== "all" && !involvedIds.has(l.id)) continue;
      nodes.push({ id: l.id, kind: "lab", label: l.name, size: 4 + l.powerScore * 1.5, color: KIND_COLOR.lab });
    }
    for (const i of INFRASTRUCTURE_NODES) {
      nodes.push({ id: i.id, kind: "infrastructure", label: i.name, size: 4 + i.powerScore * 1.8, color: KIND_COLOR.infrastructure });
    }
    for (const i of INTERNATIONAL_INSTRUMENTS) {
      if (!involvedIds.has(i.id)) continue;
      nodes.push({
        id: i.id,
        kind: "instrument",
        label: i.name,
        size: 4 + (i.powerScore ?? 3) * 1.2,
        color: KIND_COLOR.instrument,
      });
    }
    for (const r of NATIONAL_AI_REGULATIONS) {
      if (!involvedIds.has(r.id)) continue;
      nodes.push({
        id: r.id,
        kind: "national_rule",
        label: r.name,
        size: 6,
        color: KIND_COLOR.national_rule,
      });
    }

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const links: SimLink[] = [];
    for (const edge of visibleEdges) {
      if (!nodeById.has(edge.sourceId) || !nodeById.has(edge.targetId)) continue;
      links.push({
        source: edge.sourceId,
        target: edge.targetId,
        strength: edge.strength,
        relationship: edge.relationship,
      });
    }
    return { nodes, links };
  }, [density, frontierOnly, preset]);

  // Run the simulation synchronously once, then freeze positions.
  // Re-run whenever container size changes meaningfully.
  const layout = useMemo(() => {
    const layoutNodes = nodes.map((n) => ({ ...n }));
    const layoutLinks = links.map((l) => ({ ...l }));
    const sim = forceSimulation<SimNode>(layoutNodes)
      .force("charge", forceManyBody<SimNode>().strength(-260))
      .force(
        "link",
        forceLink<SimNode, SimLink>(layoutLinks)
          .id((d) => d.id)
          .distance((d) => 70 + (5 - d.strength) * 18)
          .strength((d) => 0.2 + d.strength * 0.05)
      )
      .force("center", forceCenter(dims.w / 2, dims.h / 2))
      .force("x", forceX<SimNode>(dims.w / 2).strength(0.05))
      .force("y", forceY<SimNode>(dims.h / 2).strength(0.05))
      .force("collide", forceCollide<SimNode>().radius((d) => d.size + 6))
      .stop();
    for (let i = 0; i < 300; i++) sim.tick();
    return { nodes: layoutNodes, links: layoutLinks };
  }, [nodes, links, dims.w, dims.h]);

  const highlightSet = useMemo(() => {
    if (!selectedNodeId) return null;
    const set = new Set<string>([selectedNodeId]);
    for (const e of layout.links) {
      const src = typeof e.source === "object" ? e.source.id : e.source;
      const tgt = typeof e.target === "object" ? e.target.id : e.target;
      if (src === selectedNodeId) set.add(tgt as string);
      if (tgt === selectedNodeId) set.add(src as string);
    }
    return set;
  }, [selectedNodeId, layout.links]);

  const filteredNodeList = useMemo(() => {
    const query = nodeQuery.trim().toLowerCase();
    return nodes
      .filter((node) => {
        if (!query) return true;
        return (
          node.label.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query) ||
          formatNodeKind(node.kind).includes(query)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [nodes, nodeQuery]);

  const visibleNodeList = filteredNodeList.slice(0, NODE_LIST_LIMIT);

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden bg-canvas-surface">
      <svg
        width={dims.w}
        height={dims.h}
        className="h-full w-full"
        role="group"
        aria-label="Dependency network of countries, frontier labs, AI governance instruments, national rules, and infrastructure nodes"
      >
        <title>AI governance dependency network</title>
        <desc>
          Interactive graph of country, lab, instrument, national rule, and infrastructure nodes.
          Use the node list to select entries without relying on the visual graph.
        </desc>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
          </marker>
        </defs>
        <g>
          {layout.links.map((l, i) => {
            const src = typeof l.source === "object" ? l.source : null;
            const tgt = typeof l.target === "object" ? l.target : null;
            if (!src || !tgt) return null;
            const srcId = src.id;
            const tgtId = tgt.id;
            const isHighlighted =
              highlightSet?.has(srcId) && highlightSet?.has(tgtId);
            const dim = highlightSet && !isHighlighted;
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#94A3B8"
                strokeOpacity={dim ? 0.08 : 0.35}
                strokeWidth={Math.max(0.5, l.strength * 0.5)}
              />
            );
          })}
        </g>
        <g>
          {layout.nodes.map((n) => {
            const selected = selectedNodeId === n.id;
            const isHighlighted = !highlightSet || highlightSet.has(n.id);
            const opacity = isHighlighted ? 1 : 0.25;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                style={{ cursor: "pointer", opacity }}
                onClick={() => onSelectNode(n.id, n.kind)}
                onKeyDown={(event) => activateOnKeyboard(event, () => onSelectNode(n.id, n.kind))}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}, ${formatNodeKind(n.kind)} node - ${getNodeActionLabel(n.kind)}`}
              >
                <circle
                  r={n.size}
                  fill={n.color}
                  stroke="#FFFFFF"
                  strokeWidth={selected ? 3 : 1.5}
                />
                {(n.size > 10 || selected) && (
                  <text
                    x={n.size + 4}
                    y={3}
                    fontSize={11}
                    fontWeight={selected ? 700 : 500}
                    fill="#0F172A"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.label.length > 32 ? n.label.slice(0, 30) + "…" : n.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Accessible node list */}
      <div className="absolute right-4 top-4 z-10 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-canvas-line bg-white/90 p-3 text-xs shadow-panel backdrop-blur">
        <button
          type="button"
          onClick={() => setShowNodeList((open) => !open)}
          className="flex w-full items-center justify-between gap-3 rounded-md border border-canvas-line bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-ink-800 hover:bg-canvas"
          aria-expanded={showNodeList}
          aria-controls="network-node-list"
        >
          <span>Node list</span>
          <span aria-hidden="true">{showNodeList ? "Close" : "Open"}</span>
        </button>

        {showNodeList && (
          <div id="network-node-list" className="mt-3 space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Find node
              <input
                type="search"
                value={nodeQuery}
                onChange={(event) => setNodeQuery(event.target.value)}
                className="mt-1 block w-full rounded-md border border-canvas-line bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-ink-800 outline-none placeholder:text-ink-400 focus:border-accent"
                placeholder="Country, lab, instrument..."
              />
            </label>
            <div className="policy-scroll max-h-72 space-y-1 overflow-y-auto pr-1" role="list">
              {visibleNodeList.map((node) => {
                const selected = selectedNodeId === node.id;
                return (
                  <div key={node.id} role="listitem">
                    <button
                      type="button"
                      onClick={() => onSelectNode(node.id, node.kind)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                        selected
                          ? "bg-accent text-white"
                          : "text-ink-700 hover:bg-canvas"
                      }`}
                      aria-label={`${node.label}, ${formatNodeKind(node.kind)} node - ${getNodeActionLabel(node.kind)}`}
                    >
                      <span className="min-w-0 truncate font-medium">{node.label}</span>
                      <span className={selected ? "shrink-0 text-[10px] text-white/80" : "shrink-0 text-[10px] text-ink-500"}>
                        {formatNodeKind(node.kind)}
                      </span>
                    </button>
                  </div>
                );
              })}
              {filteredNodeList.length > NODE_LIST_LIMIT && (
                <p className="px-2 py-1 text-[10px] text-ink-500">
                  Showing {NODE_LIST_LIMIT} of {filteredNodeList.length}. Refine the search to narrow results.
                </p>
              )}
              {filteredNodeList.length === 0 && (
                <p className="px-2 py-1 text-[10px] text-ink-500">No matching nodes.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 w-[min(620px,calc(100vw-2rem))] rounded-xl border border-canvas-line bg-white/90 p-3 text-xs shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Network preset
          </span>
          <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-canvas-line">
            {NETWORK_PRESETS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPresetChange(option.id)}
                className={clsx(
                  "whitespace-nowrap px-2 py-1 text-[11px] font-medium",
                  preset === option.id ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="inline-flex overflow-hidden rounded-lg border border-canvas-line">
            {DENSITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onDensityChange(option.id)}
                className={clsx(
                  "whitespace-nowrap px-2 py-1 text-[11px] font-medium",
                  density === option.id ? "bg-ink-800 text-white" : "bg-white text-ink-700 hover:bg-canvas"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-700">
            <input
              type="checkbox"
              checked={frontierOnly}
              onChange={(event) => onFrontierOnlyChange(event.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer rounded border-canvas-line text-accent focus:ring-accent"
            />
            Frontier only
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-4 top-4 rounded-xl border border-canvas-line bg-white/90 p-3 text-xs shadow-panel backdrop-blur">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          Node type
        </p>
        <ul className="space-y-1">
          {(Object.entries(KIND_COLOR) as Array<[NodeKind, string]>).map(([k, c]) => (
            <li key={k} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: c }}
              />
              <span className="capitalize text-ink-700">{k.replace(/_/g, " ")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-ink-500">
          Size = power score · Stroke thickness = edge strength · Click a node to highlight its 1-hop neighbours.
        </p>
      </div>
    </div>
  );
}

function formatNodeKind(kind: NodeKind): string {
  return kind.replace(/_/g, " ");
}

function getNodeActionLabel(kind: NodeKind): string {
  if (kind === "country") return "open country details";
  if (kind === "lab") return "open lab details";
  return "highlight related nodes";
}

function edgeMatchesPreset(edge: GraphEdge, preset: NetworkPresetId): boolean {
  if (preset === "all") return true;
  if (preset === "labs-laws") {
    return (
      edge.sourceType === "lab" ||
      edge.targetType === "lab" ||
      edge.sourceType === "national_rule" ||
      edge.targetType === "national_rule"
    );
  }
  if (preset === "compute-chokepoints") {
    return edge.sourceType === "infrastructure" || edge.targetType === "infrastructure";
  }
  if (preset === "summit-process") {
    return isSummitNode(edge.sourceId) || isSummitNode(edge.targetId);
  }
  return isStandardsNode(edge.sourceId) || isStandardsNode(edge.targetId);
}

function edgeHasFrontierRelevance(edge: GraphEdge): boolean {
  return isFrontierNode(edge.sourceType, edge.sourceId) || isFrontierNode(edge.targetType, edge.targetId);
}

function isFrontierNode(kind: GraphNodeType, id: string): boolean {
  if (kind === "lab" || kind === "infrastructure") return true;
  if (kind === "instrument") return INTERNATIONAL_INSTRUMENTS.some((item) => item.id === id && item.frontierAIRelevant);
  if (kind === "national_rule") return NATIONAL_AI_REGULATIONS.some((item) => item.id === id && item.frontierAIRelevant);
  return false;
}

function isSummitNode(id: string): boolean {
  return (
    id.includes("bletchley") ||
    id.includes("seoul") ||
    id.includes("paris") ||
    id.includes("aisi") ||
    id === "intl-network-aisi"
  );
}

function isStandardsNode(id: string): boolean {
  return (
    id.includes("iso-iec") ||
    id.includes("nist") ||
    id.includes("cen-cenelec") ||
    id.includes("hiroshima") ||
    id === "oecd-ai-principles" ||
    id === "eu-ai-act-regional"
  );
}
