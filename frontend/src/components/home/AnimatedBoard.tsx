import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chessboard } from "react-chessboard";

const SICILIAN_POSITIONS = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    move: null,
  },
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: { from: "e2", to: "e4" },
  },
  {
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
    move: { from: "c7", to: "c5" },
  },
  {
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    move: { from: "g1", to: "f3" },
  },
  {
    fen: "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    move: { from: "b8", to: "c6" },
  },
  {
    fen: "r1bqkbnr/pp1ppppp/2n5/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
    move: { from: "d2", to: "d4" },
  },
  {
    fen: "r1bqkbnr/pp1ppppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
    move: { from: "c5", to: "d4" },
  },
  {
    fen: "r1bqkbnr/pp1ppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
    move: { from: "f3", to: "d4" },
  },
  {
    fen: "r1bqkbnr/pp2pppp/2np4/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5",
    move: { from: "d7", to: "d6" },
  },
  {
    fen: "r1bqkbnr/pp2pppp/2np4/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 1 5",
    move: { from: "b1", to: "c3" },
  },
];

const AnimatedBoard = function () {
  const [fenIndex, setFenIndex] = useState(0);

  const current = SICILIAN_POSITIONS[fenIndex];
  const lastMove = current.move;
  const highlightSquares = useMemo(
    () => (lastMove ? [lastMove?.from, lastMove?.to] : []),
    [lastMove],
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    highlightSquares.forEach((sq) => {
      if (sq) styles[sq] = { backgroundColor: "var(--board-last-move)" };
    });
    return styles;
  }, [highlightSquares]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFenIndex((prev) => (prev + 1) % SICILIAN_POSITIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="relative flex flex-col gap-6"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-sm blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Board */}
      <motion.div
        className="relative overflow-hidden rounded-xs"
        style={{ border: "1px solid var(--border-gold)" }}
        animate={{
          boxShadow: [
            "0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(201,168,76,0.08)",
            "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(201,168,76,0.18)",
            "0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(201,168,76,0.08)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={fenIndex}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Chessboard
              options={{
                position: current.fen,
                allowDragging: false,
                animationDurationInMs: 1000,
                boardStyle: {
                  //   borderRadius: "4px",
                  width: 400,
                },
                squareStyles,
                darkSquareStyle: {
                  backgroundColor: "var(--board-dark)",
                },
                lightSquareStyle: {
                  backgroundColor: "var(--board-light)",
                },
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs tracking-[0.3em] text-muted-foreground uppercase"
      >
        Sicilian Defense
      </motion.p>
    </motion.div>
  );
};
export default AnimatedBoard;
