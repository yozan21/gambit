import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import type { Player } from "../../types/chess.types";

interface VSIntroProps {
  me: Player;
  opponent: Player;
  onComplete: () => void;
}

export default function VSIntro({ me, opponent, onComplete }: VSIntroProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(10, 9, 8, 0.7)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        // After intro animations complete, wait 2s then dismiss
        setTimeout(onComplete, 2000);
      }}
    >
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-49"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201, 168, 76, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Player info container */}
        <div className="relative flex h-48 items-center justify-center">
          {/* Opponent - starts center, moves to top */}
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -180, opacity: 1 }} // Move up to where PlayerInfo will be
            exit={{ y: -220, opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: 1.5, // Show for 1.5s, then move
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute flex flex-col items-center gap-2"
          >
            <motion.h2 className="font-display text-2xl font-bold text-foreground">
              {opponent.username}
            </motion.h2>
            <motion.p className="text-sm" style={{ color: "var(--gold)" }}>
              {opponent.elo} ELO
            </motion.p>
          </motion.div>

          {/* VS Badge - appears first, stays center briefly, then fades */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 200,
            }}
            className="z-10 flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
                boxShadow: "var(--shadow-glow-md)",
              }}
            >
              <Swords className="h-8 w-8" style={{ color: "var(--bg-base)" }} />
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-gradient-gold text-3xl font-bold"
            >
              VS
            </motion.span>
          </motion.div>

          {/* You - starts center, moves to bottom */}
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 180, opacity: 1 }} // Move down to where PlayerInfo will be
            exit={{ y: 220, opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: 1.5, // Show for 1.5s, then move
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute flex flex-col items-center gap-2"
          >
            <motion.h2 className="font-display text-2xl font-bold text-foreground">
              {me.username}
            </motion.h2>
            <motion.p className="text-sm" style={{ color: "var(--gold)" }}>
              {me.elo} ELO
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
