// components/botLobby/PathNodeButton.tsx
import { motion } from "framer-motion";
import { Lock, Check, Zap } from "lucide-react";
import type { PathNode } from "@/utils/pathLayout";
import type { Tier } from "@/utils/tiers";

interface PathNodeButtonProps {
  tier: Tier;
  node: PathNode;
  isLocked: boolean;
  isCompleted: boolean;
  isFrontier: boolean;
  isGate: boolean; // first level of tier — always clickable as trial
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
  isGate,
  isPanelOpen,
  onClick,
  nodeRef,
}: PathNodeButtonProps) {
  // Gate nodes are locked sequentially but always clickable as trial entry
  const isAccessible = !isLocked || isGate;
  const isLockedGate = isGate && isLocked && !isCompleted;

  const baseSize = isFrontier
    ? tier.theme.nodeSize + 8
    : isGate
      ? tier.theme.nodeSize + 4
      : tier.theme.nodeSize;

  const nodeSize = baseSize;
  const innerSize = nodeSize - 4;
  const isBoss = node.level % 25 === 0;
  const isMiniBoss = node.level % 10 === 0;
  const shapeStyle = getShapeStyle(tier.theme.nodeShape);

  // --- derived visuals ---
  const bodyBackground = (() => {
    if (isPanelOpen)
      return `linear-gradient(135deg, ${tier.theme.primary}, ${tier.theme.primary}90)`;
    if (isCompleted)
      return `linear-gradient(135deg, ${tier.theme.primary}40, ${tier.theme.primary}20)`;
    if (isLockedGate)
      return `linear-gradient(135deg, ${tier.theme.primary}18, ${tier.theme.primary}08)`;
    if (isFrontier)
      return `linear-gradient(135deg, ${tier.theme.primary}30, ${tier.theme.glow}50)`;
    if (!isLocked)
      return `linear-gradient(135deg, ${tier.theme.primary}20, ${tier.theme.glow}35)`;
    return "var(--bg-surface)";
  })();

  const bodyBorder = (() => {
    if (isFrontier) return `2.5px solid ${tier.theme.primary}`;
    if (isCompleted) return `2px solid ${tier.theme.primary}90`;
    if (isLockedGate) return `1.5px dashed ${tier.theme.primary}60`;
    if (!isLocked) return `1.5px solid ${tier.theme.primary}70`;
    return "1px solid var(--border-subtle)";
  })();

  const bodyBoxShadow = (() => {
    if (isFrontier)
      return `0 0 24px ${tier.theme.primary}50, 0 0 48px ${tier.theme.primary}25, inset 0 1px 2px rgba(255,255,255,0.1)`;
    if (isCompleted)
      return `0 0 12px ${tier.theme.primary}35, inset 0 1px 1px rgba(255,255,255,0.08)`;
    if (isLockedGate) return `0 0 16px ${tier.theme.primary}30`;
    return "0 2px 8px rgba(0,0,0,0.2)";
  })();

  return (
    <motion.button
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(node.level * 0.002, 0.4), type: "spring" }}
      onClick={onClick}
      disabled={!isAccessible}
      className="group relative flex items-center justify-center"
      style={{ width: nodeSize, height: nodeSize }}
      whileHover={isAccessible ? { scale: 1.15, zIndex: 10 } : {}}
      whileTap={isAccessible ? { scale: 0.9 } : {}}
    >
      {/* Frontier pulse ring */}
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

      {/* Gate locked — rotating dashed beacon ring */}
      {isLockedGate && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            ...shapeStyle,
            background: "transparent",
            outline: `2px dashed ${tier.theme.primary}45`,
            outlineOffset: 3,
          }}
        />
      )}

      {/* Completed — static glow halo, no animation to keep it calm */}
      {isCompleted && !isFrontier && (
        <div
          className="absolute inset-0"
          style={{
            ...shapeStyle,
            background: `radial-gradient(circle, ${tier.theme.primary}20, transparent 70%)`,
            transform: "scale(1.3)",
          }}
        />
      )}

      {/* Main node body */}
      <div
        className="relative flex items-center justify-center shadow-lg transition-all duration-200"
        style={{
          width: innerSize,
          height: innerSize,
          ...shapeStyle,
          background: bodyBackground,
          border: bodyBorder,
          boxShadow: bodyBoxShadow,
          opacity: isLocked && !isGate ? 0.4 : 1,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ transform: getContentRotation(tier.theme.nodeShape) }}
        >
          {/* Locked (non-gate) */}
          {isLocked && !isGate && <Lock className="h-3.5 w-3.5 opacity-40" />}

          {/* Completed — permanent check, overrides everything else */}
          {isCompleted && (
            <Check
              className="h-4 w-4 drop-shadow-sm"
              style={{ color: tier.theme.primary }}
              strokeWidth={2.5}
            />
          )}

          {/* Gate locked — always show the Zap "try me" icon */}
          {isLockedGate && (
            <Zap
              className="h-4 w-4"
              style={{ color: tier.theme.primary }}
              strokeWidth={2}
            />
          )}

          {/* Normal unlocked states */}
          {!isLocked &&
            !isCompleted &&
            (isBoss ? (
              <span
                className="text-base"
                style={{ filter: `drop-shadow(0 0 4px ${tier.theme.primary})` }}
              >
                {tier.icon}
              </span>
            ) : isMiniBoss ? (
              <span className="text-xs">{tier.icon}</span>
            ) : isFrontier ? (
              <span
                className="text-xs font-bold"
                style={{ color: tier.theme.primary }}
              >
                {node.level}
              </span>
            ) : (
              <span
                className="text-xs font-bold"
                style={{ color: "var(--text-primary)", opacity: 0.8 }}
              >
                {node.level}
              </span>
            ))}
        </div>
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
            <>
              <span style={{ color: tier.theme.primary }}>
                ⚡ Try {tier.name}
              </span>
              <span className="ml-1 opacity-60">— Gate</span>
            </>
          ) : (
            <>
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
              {isCompleted && <span className="ml-1 opacity-60">✓</span>}
            </>
          )}
        </div>
      )}
    </motion.button>
  );
}
