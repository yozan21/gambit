// components/botLobby/TierTimelineRail.tsx
import { motion } from "framer-motion";
import type { Tier } from "@/utils/tiers";

interface TierTimelineRailProps {
  tier: Tier;
  isActive: boolean;
}

// Replaces the old in-path accent line — same fade behavior, but lives in
// the title layer now, just left of the sticky title block instead of
// crossing the node path.
export function TierTimelineRail({ tier, isActive }: TierTimelineRailProps) {
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
