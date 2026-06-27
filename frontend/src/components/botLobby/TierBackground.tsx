// components/botLobby/TierBackground.tsx
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { TIERS } from "@/utils/tiers";
import type { Tier } from "@/utils/tiers";

interface TierBackgroundProps {
  tier: Tier;
  isActive: boolean;
}

interface Particle {
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
  yOffset: number;
}

interface Decoration {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  duration: number; // pre-computed so we never call Math.random during render
}

const tierParticleCache = new Map<string, Particle[]>();
const tierDecorationCache = new Map<string, Decoration[]>();

function getParticles(tierId: string, tierIndex: number): Particle[] {
  if (tierParticleCache.has(tierId)) {
    return tierParticleCache.get(tierId)!;
  }

  const particleCount = 4 + tierIndex * 2;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      width: 3 + Math.random() * 7,
      height: 3 + Math.random() * 7,
      left: `${8 + Math.random() * 84}%`,
      top: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 4,
      delay: i * 0.6,
      yOffset: 15 + Math.random() * 35,
    });
  }

  tierParticleCache.set(tierId, particles);
  return particles;
}

function getDecorations(tierId: string, tierIndex: number): Decoration[] {
  if (tierDecorationCache.has(tierId)) {
    return tierDecorationCache.get(tierId)!;
  }

  const items: Decoration[] = [];
  const count = 3 + tierIndex * 2;
  for (let i = 0; i < count; i++) {
    items.push({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 90,
      size: 20 + Math.random() * 60,
      rotation: Math.random() * 360,
      opacity: 0.03 + Math.random() * 0.05,
      duration: 6 + Math.random() * 4, // pre-computed here, cached forever
    });
  }

  tierDecorationCache.set(tierId, items);
  return items;
}

function TierBackgroundFn({ tier, isActive }: TierBackgroundProps) {
  const { theme } = tier;
  const tierIndex = TIERS.indexOf(tier);

  const particles = useMemo(
    () => getParticles(tier.id, tierIndex),
    [tier.id, tierIndex],
  );

  const decorations = useMemo(
    () => getDecorations(tier.id, tierIndex),
    [tier.id, tierIndex],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep background color wash */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: isActive ? 0.6 : 0.1 }}
        transition={{ duration: 1 }}
        style={{
          background: `linear-gradient(180deg, ${theme.glow}00 0%, ${theme.glow}18 50%, ${theme.glow}00 100%)`,
        }}
      />

      {/* Ambient glow orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          opacity: isActive ? 0.35 : 0.05,
          scale: isActive ? [1, 1.12, 1] : 1,
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: "80%",
          height: "60%",
          background: `radial-gradient(ellipse, ${theme.glow}50 0%, transparent 70%)`,
        }}
      />

      {/* Floating environmental shapes */}
      {decorations.map((d, i) => (
        <motion.div
          key={`d-${i}`}
          className="absolute"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            transform: `rotate(${d.rotation}deg)`,
            background: `linear-gradient(135deg, ${theme.primary}20, transparent)`,
            borderRadius: "30%",
          }}
          animate={
            isActive
              ? {
                  y: [0, -15, 0],
                  rotate: [d.rotation, d.rotation + 5, d.rotation],
                }
              : {}
          }
          transition={{
            duration: d.duration, // ← uses cached pre-computed value, no Math.random here
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: theme.particleColor,
            left: p.left,
            top: p.top,
            boxShadow: `0 0 ${p.width * 2.5}px ${theme.particleColor}50`,
          }}
          animate={{
            y: [0, -p.yOffset, 0],
            opacity: isActive ? [0.3, 0.75, 0.3] : [0.05, 0.15, 0.05],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Bottom fade to next tier */}
      <div
        className="absolute right-0 bottom-0 left-0 h-24"
        style={{
          background: `linear-gradient(to bottom, transparent, ${theme.glow}12)`,
        }}
      />
    </div>
  );
}

export const TierBackground = memo(TierBackgroundFn);
