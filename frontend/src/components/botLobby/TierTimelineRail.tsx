// components/botLobby/TierTimelineRail.tsx
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Tier } from "@/utils/tiers";

interface TierTimelineRailProps {
  tier: Tier;
  isActive: boolean;
}

export function TierTimelineRail({ tier, isActive }: TierTimelineRailProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="pointer-events-none absolute top-0 right-0 left-0 h-0.5">
        {/* Base track */}
        <div
          className="absolute inset-0"
          style={{ background: `${tier.theme.primary}18` }}
        />

        {/* Active fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          animate={{
            width: isActive ? "100%" : "0%",
            opacity: isActive ? 1 : 0,
          }}
          transition={{
            width: { duration: 0.6, ease: "easeOut" },
            opacity: { duration: 0.3 },
          }}
          style={{
            background: `linear-gradient(90deg, transparent, ${tier.theme.primary}80, ${tier.theme.primary}40, transparent)`,
          }}
        />

        {/* Leading edge glow dot */}
        <motion.div
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          animate={{
            left: isActive ? "calc(100% - 6px)" : "0%",
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: tier.theme.primary,
            boxShadow: `0 0 6px ${tier.theme.primary}`,
          }}
        />
      </div>
    );
  }

  // Desktop — original vertical rail
  return (
    <motion.div
      className="pointer-events-none absolute top-0 bottom-0 left-4 w-px sm:left-8"
      animate={{ opacity: isActive ? 0.6 : 0.15 }}
      transition={{ duration: 0.6 }}
      style={{
        background: `linear-gradient(to bottom, transparent, ${tier.theme.primary}60, transparent)`,
      }}
    />
  );
}
