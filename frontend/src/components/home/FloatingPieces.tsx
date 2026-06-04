import { motion } from "framer-motion";

const PIECES = [
  { piece: "♟", x: "8%", y: "15%", size: "3rem", delay: 0, duration: 9 },
  { piece: "♜", x: "88%", y: "12%", size: "2.5rem", delay: 1, duration: 11 },
  { piece: "♝", x: "78%", y: "72%", size: "3rem", delay: 2, duration: 10 },
  { piece: "♞", x: "40%", y: "72%", size: "2.5rem", delay: 0.5, duration: 12 },
  { piece: "♛", x: "92%", y: "45%", size: "2rem", delay: 1.5, duration: 8 },
  { piece: "♚", x: "38%", y: "25%", size: "2.5rem", delay: 3, duration: 13 },
];

export default function FloatingPieces() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            left: p.x,
            top: p.y,
            fontSize: p.size,
            color: "var(--gold)",
          }}
          animate={{
            opacity: [0, 0.1, 0.06, 0.1, 0],
            y: [0, -15, 0, -8, 0],
            filter: [
              "drop-shadow(0 0 6px rgba(201,168,76,0.1))",
              "drop-shadow(0 0 16px rgba(201,168,76,0.3))",
              "drop-shadow(0 0 6px rgba(201,168,76,0.1))",
            ],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.piece}
        </motion.span>
      ))}
    </div>
  );
}
