import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb,
  Undo2,
  RefreshCw,
  ChessKing,
  Dices,
  Waypoints,
  AlertTriangle,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import AdHintButton from "./AdHintButton";

interface BotGameControlsProps {
  gameStatus: string;
  isViewingHistory: boolean;
  isStalled: boolean;
  hintsRemaining: number;
  isBotThinking: boolean;
  playAgainLabel: string;
  onHint: () => void;
  onUndo: () => void;
  onReset: () => void;
  onHome: () => void;
  onPlayAgain: (color: "w" | "b" | "random") => void;
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
  onReset,
  onHome,
  onPlayAgain,
}: BotGameControlsProps) {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const isPlaying = gameStatus === "playing";
  const isEnded = gameStatus === "ended" || isStalled;
  const playerWon = playAgainLabel !== "Play Again";

  const showHintAndRestart = isPlaying && !isViewingHistory;
  const showUndo = (isPlaying || isStalled) && !isViewingHistory;

  const handleRestartClick = () => setShowRestartConfirm(true);

  return (
    <div className="flex flex-col gap-3">
      {/* Secondary actions — auto-flow into a 2-col grid, whichever are
          currently visible. Home is always present so it always claims a
          slot; if it's the only one, it just sits alone in the row. */}
      <div className="grid grid-cols-2 gap-3">
        {showHintAndRestart &&
          (hintsRemaining > 0 ? (
            /* ── Normal hint button ── */
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onHint}
              disabled={isBotThinking}
              className="group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.35)",
                color: "var(--gold)",
              }}
            >
              <Lightbulb className="h-4 w-4" />
              <span>Hint</span>
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: "var(--gold)", color: "var(--bg-base)" }}
              >
                {hintsRemaining}
              </span>
            </motion.button>
          ) : (
            /* ── Ad / earn-a-hint button ── */
            <AdHintButton onHint={onHint} isBotThinking={isBotThinking} />
          ))}

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
            Reset
          </motion.button>
        )}

        {isEnded && playerWon && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 300,
              damping: 28,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
              color: "var(--bg-base)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <ChevronsRight h-4 w-4 />
            Next Level
          </motion.button>
        )}

        {/* Always available — safe to leave, game stays alive server-side. */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          disabled={isBotThinking}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <Waypoints className="h-4 w-4" />
          Back to map
        </motion.button>
      </div>

      {isEnded && (
        <div className="flex flex-col gap-2">
          <p className="text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Play again as
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* White */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onPlayAgain("w")}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--text-secondary)",
              }}
            >
              <ChessKing
                className="h-5 w-5 text-foreground"
                style={{
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
                }}
                strokeWidth={1.5}
              />
              <span className="text-[10px]">White</span>
            </motion.button>

            {/* Random — gold center, primary CTA */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onPlayAgain("random")}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
                border: "none",
                color: "var(--bg-base)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <Dices className="h-5 w-5" />
              <span className="text-[10px]">Random</span>
            </motion.button>

            {/* Black */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onPlayAgain("b")}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--text-secondary)",
              }}
            >
              <ChessKing
                className="h-5 w-5 text-background"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(197, 197, 197, 0.979))",
                }}
                strokeWidth={1.5}
                fill="#666666"
              />
              <span className="text-[10px]">Black</span>
            </motion.button>
          </div>
        </div>
      )}
      {/* Restart confirm modal */}
      <AnimatePresence>
        {showRestartConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRestartConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="glass-card flex w-full max-w-xs flex-col gap-4 p-5"
                style={{
                  border: "1px solid rgba(239,68,68,0.2)",
                  boxShadow: "0 0 24px rgba(239,68,68,0.08)",
                }}
              >
                {/* Icon */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <AlertTriangle
                      className="h-4 w-4"
                      style={{ color: "#ef4444" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Reset this game?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your current progress will be lost.
                    </p>
                  </div>
                </div>

                <div className="divider" />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setShowRestartConfirm(false);
                      onReset();
                    }}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444",
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Yes, reset
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowRestartConfirm(false)}
                    className="flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    Keep playing
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
