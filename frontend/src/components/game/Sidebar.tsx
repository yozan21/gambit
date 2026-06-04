import React from "react";
import CapturedPieces from "./CapturedPieces";
import MoveHistory from "./MoveHistory";
import GameControls from "./GameControls";
import type { MoveEntry, PlayerColor } from "../../types/socket.types";
import type { GameStatus } from "../../types/chess.types";

interface SidebarProps {
  moves: MoveEntry[];
  myColor: PlayerColor;
  opponentColor: PlayerColor;
  gameStatus: GameStatus;
  currentMoveIndex: number | null;
  onMoveClick: (index: number) => void;
  onNavigate: (direction: "prev" | "next" | "live") => void;
  isViewingHistory: boolean;
  onResign: () => void;
  onOfferDraw: () => void;
  onHome: () => void;
  onPlayAgain: () => void;
}

const Sidebar = React.memo(function ({
  moves,
  myColor,
  opponentColor,
  gameStatus,
  currentMoveIndex,
  onMoveClick,
  onNavigate,
  isViewingHistory,
  onResign,
  onOfferDraw,
  onHome,
  onPlayAgain,
}: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {/* Captured Pieces - Fixed height */}
      <div className="shrink-0 space-y-4">
        <CapturedPieces
          moves={moves}
          perspective={opponentColor}
          label="Your Captures"
        />
        <CapturedPieces
          moves={moves}
          perspective={myColor}
          label="Opponent Captures"
        />
      </div>

      <div className="divider shrink-0" />

      {/* Move History - Takes remaining space */}
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

      {/* Game Controls - Fixed height */}
      <div className="shrink-0">
        <GameControls
          gameStatus={gameStatus}
          isViewingHistory={isViewingHistory}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onHome={onHome}
          onPlayAgain={onPlayAgain}
        />
      </div>
    </div>
  );
});

export default Sidebar;
