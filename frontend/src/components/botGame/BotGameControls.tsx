import { motion } from "framer-motion";
import { Lightbulb, Undo2, Home, RotateCcw } from "lucide-react";

interface BotGameControlsProps {
  gameStatus: string;
  isViewingHistory: boolean;
  isStalled: boolean;
  hintsRemaining: number;
  isBotThinking: boolean;
  onHint: () => void;
  onUndo: () => void;
  onHome: () => void;
  onPlayAgain: () => void;
}

export default function BotGameControls({
  gameStatus,
  isViewingHistory,
  isStalled,
  hintsRemaining,
  isBotThinking,
  onHint,
  onUndo,
  onHome,
  onPlayAgain,
}: BotGameControlsProps) {
  const isPlaying = gameStatus === "playing";
  const isEnded = gameStatus === "ended";
  const showHint = isPlaying && !isViewingHistory;
  // Stays available through the stalled window — the only way to act on the
  // "undo/retry instead of finalizing" behavior the server already supports.
  const showUndo = (isPlaying || isStalled) && !isViewingHistory;

  return (
    <div className="flex flex-col gap-3">
      {showHint && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onHint}
          disabled={hintsRemaining <= 0 || isBotThinking}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "rgba(201, 168, 76, 0.1)",
            border: "1px solid var(--border-gold)",
            color: "var(--gold)",
          }}
        >
          <Lightbulb className="h-4 w-4" />
          Hint ({hintsRemaining})
        </motion.button>
      )}

      {showUndo && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onUndo}
          disabled={isBotThinking}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </motion.button>
      )}

      {isEnded && (
        <>
          {isStalled && (
            <p className="text-center text-xs text-muted-foreground">
              Undo the last move to try a different line.
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onHome}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-gold)",
              color: "var(--gold)",
            }}
          >
            <Home className="h-4 w-4" />
            Home
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
              color: "var(--bg-base)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <RotateCcw className="h-4 w-4" />
            {isStalled ? "Restart" : "Play Again"}
          </motion.button>
        </>
      )}
    </div>
  );
}
