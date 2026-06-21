// utils/tiers.ts

export interface Tier {
  id: string;
  name: string;
  range: [number, number];
  icon: string;
  blurb: string;
  theme: {
    primary: string;
    glow: string;
    particleColor: string;
    nodeSize: number;
    nodeShape: "circle" | "diamond" | "hexagon" | "crown";
    nodeBorder: string;
    bgPattern?: string;
  };
}

export const TIERS: Tier[] = [
  {
    id: "beginner",
    name: "Beginner",
    icon: "🌱",
    range: [1, 12],
    blurb: "The journey begins. Learn the fundamentals.",
    theme: {
      primary: "#4ade80",
      glow: "rgba(74, 222, 128, 0.15)",
      particleColor: "#4ade80",
      nodeSize: 36,
      nodeShape: "circle",
      nodeBorder: "1px solid rgba(74, 222, 128, 0.4)",
    },
  },
  {
    id: "casual",
    name: "Casual",
    icon: "⚔️",
    range: [13, 25],
    blurb: "The path reveals itself. Basic tactics emerge.",
    theme: {
      primary: "#60a5fa",
      glow: "rgba(96, 165, 250, 0.15)",
      particleColor: "#60a5fa",
      nodeSize: 38,
      nodeShape: "circle",
      nodeBorder: "1px solid rgba(96, 165, 250, 0.4)",
    },
  },
  {
    id: "intermediate",
    name: "Intermediate",
    icon: "🛡️",
    range: [26, 38],
    blurb: "The climb steepens. Strategy takes root.",
    theme: {
      primary: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.15)",
      particleColor: "#f59e0b",
      nodeSize: 40,
      nodeShape: "diamond",
      nodeBorder: "1px solid rgba(245, 158, 11, 0.5)",
    },
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "⚡",
    range: [39, 50],
    blurb: "The air thins. Only the strong advance.",
    theme: {
      primary: "#f97316",
      glow: "rgba(249, 115, 22, 0.15)",
      particleColor: "#f97316",
      nodeSize: 42,
      nodeShape: "diamond",
      nodeBorder: "1.5px solid rgba(249, 115, 22, 0.5)",
    },
  },
  {
    id: "expert",
    name: "Expert",
    icon: "👑",
    range: [51, 63],
    blurb: "The summit nears. Masters test their mettle.",
    theme: {
      primary: "#ef4444",
      glow: "rgba(239, 68, 68, 0.15)",
      particleColor: "#ef4444",
      nodeSize: 44,
      nodeShape: "hexagon",
      nodeBorder: "1.5px solid rgba(239, 68, 68, 0.5)",
    },
  },
  {
    id: "master",
    name: "Master",
    icon: "💎",
    range: [64, 75],
    blurb: "Few have come this far. The mountain demands perfection.",
    theme: {
      primary: "#a855f7",
      glow: "rgba(168, 85, 247, 0.15)",
      particleColor: "#a855f7",
      nodeSize: 46,
      nodeShape: "hexagon",
      nodeBorder: "2px solid rgba(168, 85, 247, 0.5)",
    },
  },
  {
    id: "grandmaster",
    name: "Grandmaster",
    icon: "🌟",
    range: [76, 88],
    blurb: "Legendary heights. Among the elite.",
    theme: {
      primary: "#ec4899",
      glow: "rgba(236, 72, 153, 0.15)",
      particleColor: "#ec4899",
      nodeSize: 48,
      nodeShape: "crown",
      nodeBorder: "2px solid rgba(236, 72, 153, 0.5)",
    },
  },
  {
    id: "ultimate",
    name: "Ultimate",
    icon: "🏆",
    range: [89, 100],
    blurb: "The final trial. Twelve gauntlets. Eternal glory.",
    theme: {
      primary: "#c9a84c",
      glow: "rgba(201, 168, 76, 0.3)",
      particleColor: "#e2c46a",
      nodeSize: 52,
      nodeShape: "crown",
      nodeBorder: "2px solid rgba(201, 168, 76, 0.6)",
    },
  },
];

export function tierForLevel(level: number): number {
  for (let i = 0; i < TIERS.length; i++) {
    const [start, end] = TIERS[i].range;
    if (level >= start && level <= end) return i;
  }
  return 0;
}

export function getTierForLevel(level: number): Tier {
  return TIERS[tierForLevel(level)];
}
