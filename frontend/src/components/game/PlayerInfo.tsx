import { motion } from "framer-motion";
import { useAppSelector } from "../../hooks/dispatch";
import type { Player } from "../../types/chess.types";
import { memo } from "react";

interface PlayerInfoProps {
  player: Player | null;
  isOpponent?: boolean;
  disabled?: boolean;
}

const PlayerInfo = memo(function ({
  player,
  disabled = false,
  // isOpponent = false,
}: PlayerInfoProps) {
  const clocks = useAppSelector((state) => state.chess.clocks);
  const turn = useAppSelector((state) => state.chess.turn);

  if (!player) {
    return (
      <div className="h-20 w-full animate-pulse rounded-sm bg-accent/50" />
    );
  }

  const isPlayersTurn = turn === player.color;
  const timeMs = player.color === "w" ? clocks.w : clocks.b;
  const isLowTime = timeMs < 60000; // < 60 seconds

  // Format time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const deciseconds = Math.floor((ms % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}.${deciseconds}`;
  };

  // Determine colors based on turn and time
  const getTimeColor = () => {
    if (!isPlayersTurn) return "var(--text-muted)"; // Opponent's turn - darker
    if (isLowTime) return "#ef4444"; // Low time - red
    return "var(--gold)"; // Normal - gold
  };

  const getTimeBg = () => {
    if (!isPlayersTurn) return "transparent";
    if (isLowTime) return "rgba(239, 68, 68, 0.1)";
    return "rgba(201, 168, 76, 0.1)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-sm p-1 sm:p-2"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold sm:h-10 sm:w-10"
        style={{
          background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
          color: "var(--bg-base)",
        }}
      >
        {player.username[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground sm:text-base">
          {player.username}
        </div>
        <div className="text-xs text-muted-foreground sm:text-sm">
          {player.elo} ELO
        </div>
      </div>

      {/* Time */}
      <motion.div
        key={`${player.color}-${Math.floor(timeMs / 100)}`}
        initial={{ scale: isPlayersTurn && isLowTime && !disabled ? 1.1 : 1 }}
        animate={{
          scale: isPlayersTurn && isLowTime && !disabled ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: isPlayersTurn && isLowTime && !disabled ? 0.6 : 0,
          repeat: isPlayersTurn && isLowTime && !disabled ? Infinity : 0,
        }}
        className="shrink-0 rounded-sm px-3 py-2 text-right font-mono text-sm font-semibold sm:text-base"
        style={{
          background: getTimeBg(),
          color: getTimeColor(),
          border: `1px solid ${isPlayersTurn && isLowTime ? "#ef4444" : "var(--border-default)"}`,
        }}
      >
        {formatTime(timeMs)}
      </motion.div>
    </motion.div>
  );
});
export default PlayerInfo;
