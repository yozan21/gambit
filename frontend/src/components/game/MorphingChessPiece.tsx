// src/components/game/MorphingChessPiece.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChessPiece {
  name: string;
  icon: string;
}

const pieces: ChessPiece[] = [
  { name: "pawn", icon: "♟" },
  { name: "knight", icon: "♞" },
  { name: "bishop", icon: "♝" },
  { name: "rook", icon: "♜" },
  { name: "queen", icon: "♛" },
  { name: "king", icon: "♚" },
];

const MORPH_INTERVAL = 3000; // 3 seconds per piece

export default function MorphingChessPiece() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pieces.length);
    }, MORPH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const currentPiece = pieces[currentIndex];

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      {/* Animated glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-8 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, var(--gold-light) 0%, transparent 60%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Chess Piece Icon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPiece.name}
          className="relative z-10 text-center select-none"
          initial={{
            opacity: 0,
            scale: 0.5,
            rotateY: -90,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateY: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            scale: 0.5,
            rotateY: 90,
            filter: "blur(8px)",
          }}
          transition={{
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
          }}
        >
          {/* Icon with continuous subtle rotation */}
          <motion.div
            className="text-[140px] leading-none"
            style={{
              color: "var(--gold)",
              textShadow: `
                0 0 30px var(--gold-glow),
                0 0 60px var(--gold-glow),
                0 0 90px var(--gold-subtle),
                0 10px 40px rgba(0, 0, 0, 0.6)
              `,
              filter: "drop-shadow(0 0 20px var(--gold-glow))",
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {currentPiece.icon}
          </motion.div>

          {/* Piece name */}
          <motion.p
            className="text-gold mt-4 text-sm font-medium tracking-widest uppercase"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {currentPiece.name}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Orbiting particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-gold absolute h-2 w-2 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            marginTop: -4,
            marginLeft: -4,
          }}
          animate={{
            x: [
              0,
              Math.cos((i * 2 * Math.PI) / 3) * 100,
              Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 100,
              0,
            ],
            y: [
              0,
              Math.sin((i * 2 * Math.PI) / 3) * 100,
              Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 100,
              0,
            ],
            opacity: [0, 0.6, 0.6, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
