// components/botLobby/TierHeader.tsx
import { useLayoutEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";
import type { Tier } from "@/utils/tiers";

interface TierHeaderProps {
  tiers: Tier[];
  mapScrollRef: React.RefObject<HTMLDivElement | null>;
  onTierChange?: (tierIndex: number) => void;
}

const SLIDE_DISTANCE = 56;
const ZONE = 200;
const LABEL_BOX_HEIGHT = 152;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const slide = prefersReducedMotion ? 14 : SLIDE_DISTANCE;

export function TierHeader({
  tiers,
  mapScrollRef,
  onTierChange,
}: TierHeaderProps) {
  const progress = useMotionValue(0);

  const boundariesRef = useRef<number[]>([]);
  const lastReportedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const measure = () => {
    const container = mapScrollRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-tier-boundary]"),
    );

    const containerRect = container.getBoundingClientRect();

    // Boundaries are the STARTS of tiers 1..N (transitions between tiers).
    // Tier 0 starts at 0 implicitly, so we skip the first section.
    boundariesRef.current = sections.slice(1).map((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top - containerRect.top + container.scrollTop;
    });
  };

  const updateProgress = () => {
    const container = mapScrollRef.current;
    if (!container) return;

    const centerLine = container.scrollTop + container.clientHeight / 2;

    let value = 0;
    for (const boundary of boundariesRef.current) {
      value += clamp((centerLine - (boundary - ZONE / 2)) / ZONE, 0, 1);
    }
    progress.set(value);

    const nearest = clamp(Math.round(value), 0, tiers.length - 1);
    if (nearest !== lastReportedRef.current) {
      lastReportedRef.current = nearest;
      onTierChange?.(nearest);
    }
  };

  useLayoutEffect(() => {
    const container = mapScrollRef.current;
    if (!container) return;

    measure();
    updateProgress();

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateProgress();
      });
    };

    const handleResize = () => {
      measure();
      updateProgress();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    container
      .querySelectorAll<HTMLElement>("[data-tier-boundary]")
      .forEach((el) => ro.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers.length]);

  return (
    <div className="relative w-full" style={{ height: LABEL_BOX_HEIGHT }}>
      {tiers.map((tier, index) => (
        <TierLabel
          key={tier.id}
          tier={tier}
          index={index}
          progress={progress}
        />
      ))}
    </div>
  );
}

function TierLabel({
  tier,
  index,
  progress,
}: {
  tier: Tier;
  index: number;
  progress: MotionValue<number>;
}) {
  const delta = useTransform(progress, (p) => clamp(p - index, -1, 1));
  const y = useTransform(delta, (d) => -d * slide);

  // Ghost fix: snap to 0 when nearly invisible so inactive titles fully vanish
  const opacity = useTransform(delta, (d) => {
    const abs = Math.abs(d);
    if (abs >= 0.92) return 0;
    return clamp(1 - abs, 0, 1);
  });

  const scale = useTransform(delta, (d) => 1 - Math.abs(d) * 0.08);
  const blur = useTransform(delta, (d) =>
    prefersReducedMotion ? 0 : Math.abs(d) * 6,
  );
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      style={{ y, opacity, scale, filter }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
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

      <motion.p
        className="max-w-[9rem] text-[10px] leading-relaxed text-muted-foreground sm:max-w-[10rem]"
        style={{ opacity: useTransform(opacity, (o) => o * o) }}
      >
        {tier.blurb}
      </motion.p>
    </motion.div>
  );
}
