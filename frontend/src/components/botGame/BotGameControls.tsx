import { motion } from "framer-motion";
import { Lightbulb, Undo2, Home, RefreshCw, RotateCcw } from "lucide-react";

interface BotGameControlsProps {
  gameStatus: string;
  isViewingHistory: boolean;
  isStalled: boolean;
  hintsRemaining: number;
  isBotThinking: boolean;
  playAgainLabel: string;
  onHint: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onHome: () => void;
  onPlayAgain: () => void;
}

export default function BotGameControls({
  gameStatus,
  isViewingHistory,
  isStalled,
  hintsRemaining,
  isBotThinking,
  playAgainLabel,
  onHint,
  onUndo,
  onRestart,
  onHome,
  onPlayAgain,
}: BotGameControlsProps) {
  const isPlaying = gameStatus === "playing";
  const isEnded = gameStatus === "ended";

  const showHintAndRestart = isPlaying && !isViewingHistory;
  const showUndo = (isPlaying || isStalled) && !isViewingHistory;

  const handleRestartClick = () => {
    if (
      window.confirm("Restart this level? Your current progress will be lost.")
    ) {
      onRestart();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Secondary actions — auto-flow into a 2-col grid, whichever are
          currently visible. Home is always present so it always claims a
          slot; if it's the only one, it just sits alone in the row. */}
      <div className="grid grid-cols-2 gap-3">
        {showHintAndRestart && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onHint}
            disabled={hintsRemaining <= 0 || isBotThinking}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
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

        {showHintAndRestart && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRestartClick}
            disabled={isBotThinking}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Restart
          </motion.button>
        )}

        {/* Always available — safe to leave, game stays alive server-side. */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <Home className="h-4 w-4" />
          Home
        </motion.button>
      </div>

      {isEnded && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
            color: "var(--bg-base)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <RotateCcw className="h-4 w-4" />
          {playAgainLabel}
        </motion.button>
      )}
    </div>
  );
}
