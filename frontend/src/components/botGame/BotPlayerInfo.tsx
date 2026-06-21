import { motion } from "framer-motion";
import { memo } from "react";
import { Bot } from "lucide-react";
import { useAppSelector } from "@/hooks/dispatch";
import type { BotPlayer } from "@/store/bot/botSlice";

interface BotPlayerInfoProps {
  player: BotPlayer | null;
  isBot?: boolean;
  disabled?: boolean;
}

const BotPlayerInfo = memo(function ({
  player,
  isBot = false,
  disabled = false,
}: BotPlayerInfoProps) {
  const turn = useAppSelector((s) => s.botChess.turn);
  const level = useAppSelector((s) => s.botChess.level);
  const isBotThinking = useAppSelector((s) => s.botChess.isBotThinking);

  if (!player) {
    return (
      <div className="h-20 w-full animate-pulse rounded-sm bg-accent/50" />
    );
  }

  const isActiveTurn = !disabled && turn === player.color;
  const showThinking = isBot && isBotThinking && isActiveTurn;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-sm p-1 sm:p-2"
      style={{
        background: "var(--bg-surface)",
        border: isActiveTurn
          ? "1px solid var(--border-gold)"
          : "1px solid var(--border-default)",
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold sm:h-10 sm:w-10"
        style={{
          background: isBot
            ? "var(--bg-elevated)"
            : "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
          color: isBot ? "var(--gold)" : "var(--bg-base)",
          border: isBot ? "1px solid var(--border-gold)" : undefined,
        }}
      >
        {isBot ? (
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          player.username[0].toUpperCase()
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground sm:text-base">
          {player.username}
        </div>
        <div className="text-xs text-muted-foreground sm:text-sm">
          {isBot ? `Difficulty Level ${level}` : "You"}
        </div>
      </div>

      {showThinking && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="shrink-0 rounded-sm px-3 py-2 text-xs font-medium sm:text-sm"
          style={{
            background: "rgba(201, 168, 76, 0.1)",
            color: "var(--gold)",
            border: "1px solid var(--border-gold)",
          }}
        >
          Thinking…
        </motion.div>
      )}
    </motion.div>
  );
});
export default BotPlayerInfo;
