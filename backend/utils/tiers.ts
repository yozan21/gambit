// utils/tiers.ts (backend) — just the ranges, no UI data
export const TIER_RANGES: [number, number][] = [
  [1, 12],
  [13, 25],
  [26, 38],
  [39, 50],
  [51, 63],
  [64, 75],
  [76, 88],
  [89, 100],
];

export const GATE_LEVELS = new Set(TIER_RANGES.map(([start]) => start));
