import { GATE_LEVELS, getTierForLevel, TIERS, type Tier } from "@/utils/tiers";
import { PathNodeButton } from "@/components/botLobby/PathNodeButton";
import { useMemo } from "react";
import type { PathNode } from "@/utils/pathLayout";

interface TierSection {
  tier: Tier;
  tierIndex: number;
  nodes: PathNode[];
  firstNode: PathNode;
  lastNode: PathNode;
  sectionHeight: number;
  minY: number;
}

interface MapPathLayerProps {
  nodes: PathNode[];
  tierSections: TierSection[];
  svgPath: string;
  fullHeight: number;
  svgWidth: number;
  unlockedLevel: number;
  completedLevels: number[];
  panelLevel: number | null;
  onNodeClick: (level: number) => void;
  setNodeRef: (level: number) => (el: HTMLButtonElement | null) => void;
}

function buildSegmentPath(from: PathNode, to: PathNode): string {
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

function getTierBridges(nodes: PathNode[]) {
  const bridges: Array<{
    from: PathNode;
    to: PathNode;
    fromColor: string;
    toColor: string;
    id: string;
  }> = [];

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    if (prev.tierIndex !== curr.tierIndex) {
      bridges.push({
        from: prev,
        to: curr,
        fromColor: TIERS[prev.tierIndex].theme.primary,
        toColor: TIERS[curr.tierIndex].theme.primary,
        id: `bridge-${prev.tierIndex}-${curr.tierIndex}`,
      });
    }
  }

  return bridges;
}

function getProgressSegments(nodes: PathNode[], unlockedLevel: number) {
  const completedNodes = nodes.filter((n) => n.level <= unlockedLevel);
  if (completedNodes.length < 2) return [];

  const segments: { path: string; color: string }[] = [];

  for (let i = 1; i < completedNodes.length; i++) {
    const prev = completedNodes[i - 1];
    const curr = completedNodes[i];
    const midY = (prev.y + curr.y) / 2;
    segments.push({
      path: `M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`,
      color: TIERS[curr.tierIndex].theme.primary,
    });
  }

  return segments;
}

export function MapPathLayer({
  nodes,
  tierSections,
  svgPath,
  fullHeight,
  svgWidth,
  unlockedLevel,
  completedLevels,
  panelLevel,
  onNodeClick,
  setNodeRef,
}: MapPathLayerProps) {
  const bridges = useMemo(() => getTierBridges(nodes), [nodes]);
  const progressSegments = useMemo(
    () => getProgressSegments(nodes, unlockedLevel),
    [nodes, unlockedLevel],
  );

  return (
    <div
      className="relative mx-auto"
      style={{ width: svgWidth, height: fullHeight }}
    >
      <svg
        className="pointer-events-none absolute top-0 left-0"
        width={svgWidth}
        height={fullHeight}
      >
        <defs>
          {bridges.map(({ id, from, to, fromColor, toColor }) => (
            <linearGradient
              key={id}
              id={id}
              gradientUnits="userSpaceOnUse"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            >
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          ))}
        </defs>

        <path
          d={svgPath}
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={svgPath}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d={svgPath}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="4 8"
        />

        {progressSegments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill="none"
            stroke={seg.color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}

        {bridges.map(({ id, from, to }) => (
          <path
            key={id}
            d={buildSegmentPath(from, to)}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}

        {nodes
          .filter((_, i) => i % 10 === 9)
          .map((node) => (
            <circle
              key={node.level}
              cx={node.x}
              cy={node.y}
              r={5}
              fill="var(--gold)"
              opacity={0.5}
            />
          ))}
      </svg>

      {tierSections.map((section) => (
        <div
          key={section.tier.id}
          className="absolute left-0"
          style={{
            top: section.minY,
            width: svgWidth,
            height: section.sectionHeight,
          }}
        >
          {section.nodes.map((node) => {
            const tier = getTierForLevel(node.level);
            return (
              <div
                key={node.level}
                className="absolute"
                style={{
                  left: node.x,
                  top: node.y - section.minY,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <PathNodeButton
                  tier={tier}
                  node={node}
                  isLocked={
                    node.level > unlockedLevel && !GATE_LEVELS.has(node.level)
                  }
                  isCompleted={completedLevels.includes(node.level)}
                  isFrontier={node.level === unlockedLevel}
                  isGate={
                    GATE_LEVELS.has(node.level) && node.level > unlockedLevel
                  }
                  isPanelOpen={node.level === panelLevel}
                  onClick={onNodeClick}
                  nodeRef={setNodeRef(node.level)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
