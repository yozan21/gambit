// components/bot-lobby/TierRailButton.tsx
import { Lock } from "lucide-react";
import type { Tier } from "@/utils/tiers";

interface TierRailButtonProps {
  tier: Tier;
  isActive: boolean;
  isLocked: boolean;
  onClick: () => void;
}

export function TierRailButton({
  tier,
  isActive,
  isLocked,
  onClick,
}: TierRailButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all sm:w-full"
      style={{
        background: isActive ? "var(--gold-subtle)" : "transparent",
        border: isActive
          ? "1px solid var(--border-gold)"
          : "1px solid transparent",
      }}
    >
      <span
        className="text-lg"
        style={{ color: isLocked ? "var(--text-muted)" : "var(--gold)" }}
      >
        {tier.icon}
      </span>
      <div className="hidden sm:block">
        <div
          className="text-sm font-semibold"
          style={{
            color: isLocked ? "var(--text-muted)" : "var(--text-primary)",
          }}
        >
          {tier.name}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {tier.range[0]}–{tier.range[1]}
        </div>
      </div>
      {isLocked && (
        <Lock
          className="h-3 w-3 shrink-0 sm:ml-auto"
          style={{ color: "var(--text-muted)" }}
        />
      )}
    </button>
  );
}
