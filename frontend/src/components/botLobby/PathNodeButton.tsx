// components/botLobby/PathNodeButton.tsx
import { motion } from "framer-motion";
import { Lock, Check, Crown, Star } from "lucide-react";
import type { PathNode } from "@/utils/pathLayout";
import type { Tier } from "@/utils/tiers";

interface PathNodeButtonProps {
  tier: Tier;
  node: PathNode;
  isLocked: boolean;
  isCompleted: boolean;
  isFrontier: boolean;
  isPanelOpen: boolean;
  onClick: () => void;
  nodeRef: (el: HTMLButtonElement | null) => void;
}

const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function getShapeStyle(shape: Tier["theme"]["nodeShape"]): React.CSSProperties {
  switch (shape) {
    case "circle":
      return { borderRadius: "50%" };
    case "diamond":
      return { borderRadius: "12%", transform: "rotate(45deg)" };
    case "hexagon":
      return { clipPath: HEX_CLIP, borderRadius: 0 };
    case "crown":
      return {
        borderRadius: "40% 40% 12% 12%",
        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.15)`,
      };
    default:
      return { borderRadius: "50%" };
  }
}

function getContentRotation(shape: Tier["theme"]["nodeShape"]): string {
  return shape === "diamond" ? "rotate(-45deg)" : "rotate(0deg)";
}

export function PathNodeButton({
  tier,
  node,
  isLocked,
  isCompleted,
  isFrontier,
  isPanelOpen,
  onClick,
  nodeRef,
}: PathNodeButtonProps) {
  const nodeSize = isFrontier ? tier.theme.nodeSize + 8 : tier.theme.nodeSize;
  const innerSize = nodeSize - 4;
  const isBoss = node.level % 25 === 0;
  const isMiniBoss = node.level % 10 === 0;
  const shapeStyle = getShapeStyle(tier.theme.nodeShape);

  return (
    <motion.button
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(node.level * 0.002, 0.4), type: "spring" }}
      onClick={onClick}
      disabled={isLocked}
      className="group relative flex items-center justify-center"
      style={{ width: nodeSize, height: nodeSize }}
      whileHover={isLocked ? {} : { scale: 1.2, zIndex: 10 }}
      whileTap={isLocked ? {} : { scale: 0.9 }}
    >
      {/* Outer glow ring for frontier */}
      {isFrontier && (
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            ...shapeStyle,
            background: `radial-gradient(circle, ${tier.theme.primary}50, transparent 70%)`,
          }}
        />
      )}

      {/* Main node body */}
      <div
        className="relative flex items-center justify-center shadow-lg transition-all"
        style={{
          width: innerSize,
          height: innerSize,
          ...shapeStyle,
          background: isPanelOpen
            ? `linear-gradient(135deg, ${tier.theme.primary}, ${tier.theme.glow})`
            : isLocked
              ? "var(--bg-surface)"
              : isCompleted
                ? `linear-gradient(135deg, ${tier.theme.primary}30, ${tier.theme.primary}10)`
                : `linear-gradient(135deg, ${tier.theme.primary}25, ${tier.theme.glow}40)`,
          border: isFrontier
            ? `2.5px solid ${tier.theme.primary}`
            : isLocked
              ? "1px solid var(--border-subtle)"
              : `1.5px solid ${tier.theme.primary}70`,
          boxShadow: isFrontier
            ? `0 0 24px ${tier.theme.primary}50, 0 0 48px ${tier.theme.primary}25, inset 0 1px 2px rgba(255,255,255,0.1)`
            : isCompleted
              ? `0 0 10px ${tier.theme.primary}25`
              : "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Inner content — counter-rotated for diamond */}
        <div
          className="flex items-center justify-center"
          style={{ transform: getContentRotation(tier.theme.nodeShape) }}
        >
          {isLocked ? (
            <Lock className="h-3.5 w-3.5 opacity-40" />
          ) : isCompleted ? (
            <Check className="h-4 w-4" style={{ color: tier.theme.primary }} />
          ) : isBoss ? (
            <Crown className="h-5 w-5" style={{ color: tier.theme.primary }} />
          ) : isMiniBoss ? (
            <Star className="h-4 w-4" style={{ color: tier.theme.primary }} />
          ) : (
            <span
              className="text-xs font-bold"
              style={{
                color: isFrontier ? tier.theme.primary : "var(--text-primary)",
              }}
            >
              {node.level}
            </span>
          )}
        </div>
      </div>

      {/* Hover tooltip — uses group-hover so it actually works */}
      {!isLocked && (
        <div
          className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 rounded-md px-2.5 py-1 text-[10px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          Level {node.level}
          {isBoss && (
            <span className="ml-1" style={{ color: tier.theme.primary }}>
              — Boss
            </span>
          )}
          {isMiniBoss && !isBoss && (
            <span className="ml-1" style={{ color: tier.theme.primary }}>
              — Elite
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}
