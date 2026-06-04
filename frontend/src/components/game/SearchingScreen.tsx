// src/components/game/SearchingScreen.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MorphingChessPiece from "./MorphingChessPiece";

interface SearchingScreenProps {
  onCancel: () => void;
}

export default function SearchingScreen({ onCancel }: SearchingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  // Fake countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background px-4 sm:justify-center">
      {/* Background subtle glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Morphing 3D Chess Piece */}
        <div className="mb-10">
          <MorphingChessPiece />
        </div>

        {/* Title */}
        <motion.h1
          className="font-display text-gold mb-4 text-center text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Finding Opponent
        </motion.h1>

        {/* Animated dots */}
        <motion.div
          className="mb-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-gold h-2 w-2 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Estimated time */}
        <motion.p
          className="text-text-secondary mb-12 text-center text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Estimated wait time:{" "}
          <span className="text-gold font-semibold">
            {timeLeft > 0 ? `~${timeLeft}s` : "Any moment now..."}
          </span>
        </motion.p>

        {/* Cancel button */}
        <motion.button
          onClick={onCancel}
          className="rounded-lg border-2 border-primary/30 px-8 py-3 font-semibold text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 active:scale-95"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Cancel Search
        </motion.button>
      </div>
    </div>
  );
}
