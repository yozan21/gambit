import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Home,
  Award,
  X,
  ChevronsRight,
  Waypoints,
} from "lucide-react";
import type { GameResult, PlayerColor } from "../../types/socket.types";
import { Button } from "../ui/button";

interface GameOverModalProps {
  isOpen: boolean;
  result: GameResult;
  winner: PlayerColor | null;
  myColor: PlayerColor;
  onClose: () => void;
  onHome: () => void;
  onPlayAgain: () => void;
  playAgainLabel: string; // NEW — defaults to "Play Again"
  onRematch?: () => void;
}

export default function GameOverModal({
  isOpen,
  result,
  winner,
  myColor,
  onClose,
  onHome,
  onRematch,
  onPlayAgain,
  playAgainLabel = "Play Again", // NEW
}: GameOverModalProps) {
  const isWin = winner === myColor;
  const isDraw = winner === null && result !== "resignation";
  // const isLoss = !isWin && !isDraw;

  const getTitle = () => {
    if (isWin) return "Victory!";
    if (isDraw) return "Draw";
    return "Defeat";
  };

  const getSubtitle = () => {
    switch (result) {
      case "checkmate":
        return "Checkmate!";
      case "resignation":
        return `${isWin ? "Opponent" : "You"} resigned`;
      case "stalemate":
        return "Stalemate";
      case "draw":
        return "Draw agreed";
      case "threefold_repetition":
        return "Threefold repetition";
      case "insufficient_material":
        return "Insufficient material";
      case "timeout":
        return "Time's up";
      default:
        return "";
    }
  };

  const getIconColor = () => {
    if (isWin) return "#4ade80";
    if (isDraw) return "#eab308";
    return "#ef4444";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-md space-y-6 text-center"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: `${getIconColor()}20`,
              }}
            >
              {isWin ? (
                <Trophy className="h-8 w-8" style={{ color: getIconColor() }} />
              ) : isDraw ? (
                <Award className="h-8 w-8" style={{ color: getIconColor() }} />
              ) : (
                <span className="text-3xl">✕</span>
              )}
            </motion.div>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2
                className="font-display mb-2 text-3xl font-bold"
                style={{ color: getIconColor() }}
              >
                {getTitle()}
              </h2>
              <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
            </motion.div>
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={onPlayAgain}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
                  color: "var(--bg-base)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                {playAgainLabel === "Play Again" ? (
                  <RotateCcw className="h-5 w-5" />
                ) : (
                  <ChevronsRight className="h-5 w-5" />
                )}
                {playAgainLabel}
              </Button>

              <div
                className={`grid gap-3 ${onRematch ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {onRematch && (
                  <button
                    onClick={onRematch}
                    disabled
                    className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold opacity-50 transition-all"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-gold)",
                      color: "var(--gold)",
                    }}
                  >
                    <Award className="h-5 w-5" />
                    Rematch
                  </button>
                )}

                <Button
                  onClick={onHome}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {playAgainLabel === "Play Again" ? (
                    <>
                      <Home className="h-5 w-5" />
                      Home
                    </>
                  ) : (
                    <>
                      <Waypoints className="h-5 w-5" />
                      Back to map
                    </>
                  )}
                </Button>
              </div>
            </motion.div>{" "}
            <p className="text-xs text-muted-foreground">
              Click outside or X to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
