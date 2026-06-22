import React from "react";
import CapturedPieces from "@/components/game/CapturedPieces";
import MoveHistory from "@/components/game/MoveHistory";
import BotGameControls from "./BotGameControls";
import type { MoveEntry, PlayerColor } from "@/types/socket.types";
import type { GameStatus } from "@/types/chess.types";

interface BotSidebarProps {
  moves: MoveEntry[];
  myColor: PlayerColor;
  botColor: PlayerColor;
  gameStatus: GameStatus;
  currentMoveIndex: number | null;
  onMoveClick: (index: number) => void;
  onNavigate: (direction: "prev" | "next" | "live") => void;
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

const BotSidebar = React.memo(function ({
  moves,
  myColor,
  botColor,
  gameStatus,
  currentMoveIndex,
  onMoveClick,
  onNavigate,
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
}: BotSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 space-y-4">
        <CapturedPieces
          moves={moves}
          perspective={botColor}
          label="Your Captures"
        />
        <CapturedPieces
          moves={moves}
          perspective={myColor}
          label="Bot Captures"
        />
      </div>

      <div className="divider shrink-0" />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <h3 className="shrink-0 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:text-sm">
          Move History
        </h3>
        <div className="min-h-0 flex-1 overflow-hidden">
          <MoveHistory
            playerColor={myColor}
            moves={moves}
            gameStatus={gameStatus}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={onMoveClick}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className="divider shrink-0" />

      <div className="shrink-0">
        <BotGameControls
          gameStatus={gameStatus}
          isViewingHistory={isViewingHistory}
          isStalled={isStalled}
          hintsRemaining={hintsRemaining}
          isBotThinking={isBotThinking}
          playAgainLabel={playAgainLabel}
          onHint={onHint}
          onUndo={onUndo}
          onRestart={onRestart}
          onHome={onHome}
          onPlayAgain={onPlayAgain}
        />
      </div>
    </div>
  );
});
export default BotSidebar;
