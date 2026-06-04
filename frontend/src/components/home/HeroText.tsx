import { motion } from "framer-motion";
import type { GameMode } from "../../types/chess.types";
import ModeButtons from "../ModeButtons";
import PlayNowAnimated from "../ui/PlayNowAnimated";
import { memo } from "react";

interface HeroTextProps {
  onPlay: (mode: GameMode) => void;
}

const HeroText = memo(function ({ onPlay }: HeroTextProps) {
  return (
    <motion.div
      className="flex flex-col gap-4 sm:gap-8"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs tracking-widest uppercase"
        style={{
          background: "var(--gold-subtle)",
          border: "1px solid var(--border-gold)",
          color: "var(--gold)",
        }}
      >
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full"
          style={{ background: "var(--gold)" }}
        />
        Live Multiplayer
      </motion.div>

      <PlayNowAnimated />

      {/* Mode Buttons */}
      <ModeButtons onPlay={onPlay} />
      {/* Divider */}
      <div className="divider" />

      {/* Headline */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl leading-tight font-bold text-foreground md:text-5xl">
          Master the <br />
          <span className="text-gradient-gold">Art of Chess</span>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Challenge players worldwide, play with friends, or sharpen your skills
          against our Stockfish engine.
        </p>
      </div>
    </motion.div>
  );
});
export default HeroText;
