import { motion } from "framer-motion";
import { LogOut, Handshake, Home, RotateCcw } from "lucide-react";

interface GameControlsProps {
  gameStatus: string;
  isViewingHistory: boolean;
  onResign: () => void;
  onOfferDraw: () => void;
  onHome: () => void;
  onPlayAgain: () => void;
}

export default function GameControls({
  gameStatus,
  isViewingHistory,
  onResign,
  onOfferDraw,
  onHome,
  onPlayAgain,
}: GameControlsProps) {
  const isPlaying = gameStatus === "playing";
  const isEnded = gameStatus === "ended";

  return (
    <div className="flex flex-col gap-3">
      {isPlaying && !isViewingHistory && (
        <>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onResign}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-destructive/20 px-4 py-2 text-sm font-medium transition-all hover:bg-destructive/30"
            style={{
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
            }}
          >
            <LogOut className="h-4 w-4" />
            Resign
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onOfferDraw}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              color: "#eab308",
            }}
          >
            <Handshake className="h-4 w-4" />
            Offer Draw
          </motion.button>
        </>
      )}

      {isEnded && (
        <>
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
            Play Again
          </motion.button>
        </>
      )}
    </div>
  );
}
