// components/botLobby/MapPathLayer.tsx
import { SVG_WIDTH, type PathNode } from "@/utils/pathLayout";
import { getTierForLevel, type Tier } from "@/utils/tiers";
import { PathNodeButton } from "@/components/botLobby/PathNodeButton";

interface TierSection {
  tier: Tier;
  tierIndex: number;
  nodes: PathNode[];
  firstNode: PathNode;
  lastNode: PathNode;
  sectionHeight: number;
}

interface MapPathLayerProps {
  nodes: PathNode[];
  tierSections: TierSection[];
  svgPath: string;
  progressPath: string;
  fullHeight: number;
  unlockedLevel: number;
  panelLevel: number | null;
  onNodeClick: (level: number) => void;
  setNodeRef: (level: number) => (el: HTMLButtonElement | null) => void;
}

export function MapPathLayer({
  nodes,
  tierSections,
  svgPath,
  progressPath,
  fullHeight,
  unlockedLevel,
  panelLevel,
  onNodeClick,
  setNodeRef,
}: MapPathLayerProps) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: SVG_WIDTH, height: fullHeight }}
    >
      <svg
        className="pointer-events-none absolute top-0 left-0"
        width={SVG_WIDTH}
        height={fullHeight}
      >
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
        {progressPath && (
          <>
            <path
              d={progressPath}
              fill="none"
              stroke="var(--gold)"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.35}
              filter="blur(6px)"
            />
            <path
              d={progressPath}
              fill="none"
              stroke="var(--gold-muted)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </>
        )}
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
            top: section.firstNode.y,
            width: SVG_WIDTH,
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
                  top: node.y - section.firstNode.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <PathNodeButton
                  tier={tier}
                  node={node}
                  isLocked={node.level > unlockedLevel}
                  isCompleted={node.level < unlockedLevel}
                  isFrontier={node.level === unlockedLevel}
                  isPanelOpen={node.level === panelLevel}
                  onClick={() => onNodeClick(node.level)}
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
