// utils/pathLayout.ts
import type { Tier } from "./tiers";

export interface PathNode {
  level: number;
  x: number;
  y: number;
  tierIndex: number;
}

// Widened from 320 — the map now owns the full viewport (no permanent
// sidebar eating space), so there's real room for the path to breathe.
export const SVG_WIDTH = 480;
export const NODE_SPACING = 80;
export const CENTER_X = SVG_WIDTH / 2;

const TOP_PADDING = 100;

// One constant frequency/amplitude for every tier — this IS the "same
// curvature first to last" behavior. No per-tier scaling, so there's
// nothing that can grow unbounded and nothing to clamp.
const WAVE_FREQUENCY = 0.45;

const NODE_RADIUS = 22;
const EDGE_PADDING = 24; // generous gutter — room for glow/milestone dots too
const MAX_AMPLITUDE = CENTER_X - NODE_RADIUS - EDGE_PADDING; // = 194

// Comfortable margin below the true max so even the widest swing has
// visible breathing room from the edges, not just technically-not-clipping.
const AMPLITUDE = Math.min(160, MAX_AMPLITUDE);

if (import.meta.env?.DEV && AMPLITUDE > MAX_AMPLITUDE) {
  console.warn(
    `[pathLayout] AMPLITUDE (${AMPLITUDE}) exceeds safe MAX_AMPLITUDE (${MAX_AMPLITUDE}) — nodes will clip.`,
  );
}

export function computePath(tiers: Tier[]): {
  nodes: PathNode[];
  totalHeight: number;
} {
  const nodes: PathNode[] = [];

  tiers.forEach((tier, tierIndex) => {
    const [start, end] = tier.range;

    for (let lv = start; lv <= end; lv++) {
      const levelIndex = nodes.length;
      const y = TOP_PADDING + levelIndex * NODE_SPACING;
      const x = CENTER_X + Math.sin(lv * WAVE_FREQUENCY) * AMPLITUDE;

      nodes.push({ level: lv, x, y, tierIndex });
    }
  });

  const totalHeight =
    TOP_PADDING + (nodes.length - 1) * NODE_SPACING + TOP_PADDING;

  return { nodes, totalHeight };
}

export function buildSvgPath(nodes: PathNode[]): string {
  if (nodes.length === 0) return "";

  const parts: string[] = new Array(nodes.length);
  parts[0] = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const midY = (prev.y + curr.y) / 2;
    parts[i] = ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  return parts.join("");
}
