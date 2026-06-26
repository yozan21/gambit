// components/botLobby/PathNodeButton.tsx
import { memo } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Zap, Crown, Star } from "lucide-react";
import type { PathNode } from "@/utils/pathLayout";
import type { Tier } from "@/utils/tiers";

interface PathNodeButtonProps {
  tier: Tier;
  node: PathNode;
  isLocked: boolean;
  isCompleted: boolean;
  isFrontier: boolean;
  isGate: boolean;
  isPanelOpen: boolean;
  onClick: (level: number) => void;
  nodeRef: (el: HTMLButtonElement | null) => void;
}

type NodeShape = Tier["theme"]["nodeShape"];

function ShapeElement({
  shape,
  size,
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeDasharray,
}: {
  shape: NodeShape;
  size: number;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeDasharray?: string;
}) {
  const half = size / 2;
  const pad = strokeWidth + 1;
  const r = half - pad;

  const common = {
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeDasharray,
    strokeLinejoin: "round" as const,
  };

  switch (shape) {
    case "circle":
      return <circle cx={half} cy={half} r={r} {...common} />;

    case "squircle":
      return (
        <rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={size * 0.22}
          ry={size * 0.22}
          {...common}
        />
      );

    case "diamond":
      return (
        <polygon
          points={`${half},${pad} ${size - pad},${half} ${half},${size - pad} ${pad},${half}`}
          {...common}
        />
      );

    case "pentagon": {
      const points = Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 - 90) * (Math.PI / 180);
        return `${(half + r * Math.cos(a)).toFixed(2)},${(half + r * Math.sin(a)).toFixed(2)}`;
      }).join(" ");
      return <polygon points={points} {...common} />;
    }

    case "hexagon": {
      const points = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        return `${(half + r * Math.cos(a)).toFixed(2)},${(half + r * Math.sin(a)).toFixed(2)}`;
      }).join(" ");
      return <polygon points={points} {...common} />;
    }

    case "octagon": {
      const points = Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 22.5) * (Math.PI / 180);
        return `${(half + r * Math.cos(a)).toFixed(2)},${(half + r * Math.sin(a)).toFixed(2)}`;
      }).join(" ");
      return <polygon points={points} {...common} />;
    }

    case "crown": {
      const d = [
        `M ${pad} ${size - pad}`,
        `L ${pad} ${size * 0.54}`,
        `L ${size * 0.25} ${size * 0.66}`,
        `L ${half} ${pad * 1.5}`,
        `L ${size * 0.75} ${size * 0.66}`,
        `L ${size - pad} ${size * 0.54}`,
        `L ${size - pad} ${size - pad}`,
        "Z",
      ].join(" ");
      return <path d={d} {...common} />;
    }

    case "shield": {
      const d = [
        `M ${half} ${pad}`,
        `L ${size - pad} ${size * 0.22}`,
        `L ${size - pad} ${size * 0.62}`,
        `L ${half} ${size - pad}`,
        `L ${pad} ${size * 0.62}`,
        `L ${pad} ${size * 0.22}`,
        "Z",
      ].join(" ");
      return <path d={d} {...common} />;
    }

    default:
      return <circle cx={half} cy={half} r={r} {...common} />;
  }
}

export const PathNodeButton = memo(
  function PathNodeButton({
    tier,
    node,
    isLocked,
    isCompleted,
    isFrontier,
    isGate,
    isPanelOpen,
    onClick,
    nodeRef,
  }: PathNodeButtonProps) {
    const isLockedGate = isGate && !isCompleted;
    const isAccessible = !isLocked || isGate;

    const nodeSize = isFrontier
      ? tier.theme.nodeSize + 8
      : isLockedGate
        ? tier.theme.nodeSize + 12 // ← bigger locked gate teaser
        : isGate
          ? tier.theme.nodeSize + 4
          : tier.theme.nodeSize + 2;

    const isBoss = node.level % 25 === 0;
    const isMiniBoss = node.level % 10 === 0 && !isBoss;

    // Fill
    const fillColor = isLocked && !isGate ? "#2b2b2b" : tier.theme.primary;
    const fillOpacity = isPanelOpen
      ? 0.85
      : isCompleted
        ? 0.35
        : isLockedGate
          ? 0.1
          : isFrontier
            ? 0.28
            : !isLocked
              ? 0.18
              : 1;

    // Stroke
    const strokeColor =
      isLocked && !isGate ? "var(--border-subtle)" : tier.theme.primary;
    const strokeWidth = isFrontier ? 2.5 : isCompleted ? 2 : 1.5;
    const strokeOpacity = isPanelOpen
      ? 1
      : isCompleted
        ? 0.9
        : isLockedGate
          ? 0.55
          : isFrontier
            ? 1
            : !isLocked
              ? 0.65
              : 1;

    const strokeDasharray = isLockedGate ? "4 3" : undefined;

    const dropShadow = isFrontier
      ? `drop-shadow(0 0 8px ${tier.theme.primary}90)`
      : isPanelOpen
        ? `drop-shadow(0 0 6px ${tier.theme.primary}80)`
        : isCompleted
          ? `drop-shadow(0 0 5px ${tier.theme.primary}55)`
          : "drop-shadow(0 2px 4px rgba(0,0,0,0.35))";

    return (
      <motion.button
        ref={nodeRef}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: isLocked && !isGate ? 0.65 : 1, scale: 1 }}
        transition={{
          delay: Math.min(node.level * 0.002, 0.4),
          type: "spring",
        }}
        onClick={() => onClick(node.level)}
        disabled={!isAccessible}
        className="group relative flex cursor-pointer items-center justify-center"
        style={{ width: nodeSize, height: nodeSize }}
        whileHover={isAccessible ? { scale: 1.15, zIndex: 10 } : {}}
        whileTap={isAccessible ? { scale: 0.9 } : {}}
      >
        {/* Frontier pulse ring */}
        {isFrontier && (
          <motion.svg
            className="pointer-events-none absolute inset-0"
            width={nodeSize}
            height={nodeSize}
            style={{ overflow: "visible" }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0.08, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShapeElement
              shape={tier.theme.nodeShape}
              size={nodeSize}
              fill={tier.theme.primary}
              fillOpacity={0.35}
              stroke="none"
              strokeWidth={0}
              strokeOpacity={0}
            />
          </motion.svg>
        )}

        {/* Main shape */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={nodeSize}
          height={nodeSize}
          style={{ filter: dropShadow, overflow: "visible" }}
        >
          <ShapeElement
            shape={tier.theme.nodeShape}
            size={nodeSize}
            fill={fillColor}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDasharray}
          />
        </svg>

        {/* Content */}
        <div className="pointer-events-none relative z-10 flex items-center justify-center">
          {isLocked && !isGate && (
            <Lock
              className="h-3.5 w-3.5"
              style={{ color: "var(--text-muted)" }}
            />
          )}
          {isCompleted && (
            <Check
              className="h-4 w-4"
              style={{ color: tier.theme.primary }}
              strokeWidth={2.5}
            />
          )}
          {isLockedGate && (
            <Zap className="h-4 w-4" style={{ color: tier.theme.primary }} />
          )}
          {!isLocked &&
            !isCompleted &&
            (isBoss ? (
              <Crown
                className="h-5 w-5"
                style={{ color: tier.theme.primary }}
              />
            ) : isMiniBoss ? (
              <Star className="h-4 w-4" style={{ color: tier.theme.primary }} />
            ) : (
              <span
                className="text-xs leading-none font-bold"
                style={{
                  color:
                    isFrontier || isPanelOpen
                      ? tier.theme.primary
                      : "var(--text-primary)",
                }}
              >
                {node.level}
              </span>
            ))}
        </div>

        {/* Tooltip */}
        {isAccessible && (
          <div
            className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded-md px-2.5 py-1 text-[10px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {isLockedGate ? (
              <span style={{ color: tier.theme.primary }}>
                ⚡ Skip to {tier.name}
              </span>
            ) : (
              <>
                Level {node.level}
                {isBoss && (
                  <span className="ml-1" style={{ color: tier.theme.primary }}>
                    — Boss
                  </span>
                )}
                {isMiniBoss && (
                  <span className="ml-1" style={{ color: tier.theme.primary }}>
                    — Elite
                  </span>
                )}
                {isCompleted && <span className="ml-1 opacity-60">✓</span>}
              </>
            )}
          </div>
        )}
      </motion.button>
    );
  },
  (prev, next) =>
    prev.isLocked === next.isLocked &&
    prev.isCompleted === next.isCompleted &&
    prev.isFrontier === next.isFrontier &&
    prev.isGate === next.isGate &&
    prev.isPanelOpen === next.isPanelOpen &&
    prev.node.level === next.node.level &&
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y,
);
