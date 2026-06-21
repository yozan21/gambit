// components/botLobby/TierSectionTitle.tsx
import type { Tier } from "@/utils/tiers";

interface TierSectionTitleProps {
  tier: Tier;
  isActive: boolean;
}

export function TierSectionTitle({ tier, isActive }: TierSectionTitleProps) {
  return (
    <div
      className="pointer-events-none sticky left-8 z-20 flex w-48 flex-col items-center gap-1 text-center transition-all duration-500 ease-out sm:left-12 sm:w-60"
      style={{
        top: "var(--map-center)",
        // Combines the vertical-centering offset with the active/inactive
        // slide-and-shrink in one transform, since we're driving this via
        // JS state now rather than a static Tailwind translate utility.
        transform: `translateY(-50%) translateY(${isActive ? 0 : -16}px) scale(${isActive ? 1 : 0.92})`,
        opacity: isActive ? 1 : 0,
      }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-12 w-12 rounded-full opacity-20 sm:h-14 sm:w-14"
          style={{ background: tier.theme.primary }}
        />
        <span className="relative text-3xl sm:text-4xl">{tier.icon}</span>
      </div>

      <h2 className="font-display text-gradient-gold text-lg font-bold sm:text-xl">
        {tier.name}
      </h2>

      <span className="text-[10px] text-muted-foreground sm:text-xs">
        {tier.range[0]}–{tier.range[1]}
      </span>

      <p className="max-w-40 text-[10px] leading-relaxed text-muted-foreground sm:max-w-48">
        {tier.blurb}
      </p>
    </div>
  );
}
