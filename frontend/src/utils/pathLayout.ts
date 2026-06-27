import type { Tier } from "./tiers";

export interface PathNode {
  level: number;
  x: number;
  y: number;
  tierIndex: number;
}

export const SVG_WIDTH = 480;
export const MOBILE_SVG_WIDTH = 320;
export const NODE_SPACING = 80;
export const CENTER_X = SVG_WIDTH / 2;

const TOP_PADDING = 100;
const WAVE_FREQUENCY = 0.45;
const NODE_RADIUS = 22;
const EDGE_PADDING = 24;
const MAX_AMPLITUDE = CENTER_X - NODE_RADIUS - EDGE_PADDING;
const AMPLITUDE = Math.min(160, MAX_AMPLITUDE);

if (import.meta.env?.DEV && AMPLITUDE > MAX_AMPLITUDE) {
  console.warn(
    `[pathLayout] AMPLITUDE (${AMPLITUDE}) exceeds safe MAX_AMPLITUDE (${MAX_AMPLITUDE}) — nodes will clip.`,
  );
}

export function computePath(
  tiers: Tier[],
  svgWidth = SVG_WIDTH,
  invert = false,
): {
  nodes: PathNode[];
  totalHeight: number;
} {
  const centerX = svgWidth / 2;
  const maxAmplitude = centerX - NODE_RADIUS - EDGE_PADDING;
  const amplitude = Math.min(160, maxAmplitude);

  const nodes: PathNode[] = [];

  tiers.forEach((tier, tierIndex) => {
    const [start, end] = tier.range;
    for (let lv = start; lv <= end; lv++) {
      const levelIndex = nodes.length;
      const y = TOP_PADDING + levelIndex * NODE_SPACING;
      const x = centerX + Math.sin(lv * WAVE_FREQUENCY) * amplitude;
      nodes.push({ level: lv, x, y, tierIndex });
    }
  });

  const totalHeight =
    TOP_PADDING + (nodes.length - 1) * NODE_SPACING + TOP_PADDING;

  if (invert) {
    for (const node of nodes) {
      node.y = totalHeight - node.y;
    }
    nodes.reverse();
  }

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
