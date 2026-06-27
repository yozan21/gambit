import { motion, AnimatePresence } from "framer-motion";
import type { Tier } from "@/utils/tiers";

interface MobileTierBarProps {
  tier: Tier | null;
  tierIndex: number;
}

export function MobileTierBar({ tier, tierIndex }: MobileTierBarProps) {
  if (!tier) return null;

  return (
    <div
      className="fixed top-10 right-0 left-0 z-30 flex items-center px-4 py-2"
      style={{
        background: "var(--bg-base)",
        borderBottom: `1px solid ${tier.theme.primary}30`,
        backdropFilter: "blur(12px)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={tierIndex}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <span className="text-xl leading-none">{tier.icon}</span>
          <div className="flex flex-col">
            <span
              className="text-xs leading-none font-bold"
              style={{ color: tier.theme.primary }}
            >
              {tier.name}
            </span>
            <span className="text-[10px] leading-none text-muted-foreground">
              Levels {tier.range[0]}-{tier.range[1]}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={`bar-${tierIndex}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute bottom-0 left-0 h-0.5 origin-right"
        style={{
          width: "100%",
          background: `linear-gradient(270deg, ${tier.theme.primary}, transparent)`,
        }}
      />
    </div>
  );
}
