import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { disconnectSocket, socket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import {
  promotionCancelled,
  resetBotGame,
  hintRequested,
} from "@/store/bot/botSlice";
import BotBoard from "./BotBoard";
import BotPlayerInfo from "./BotPlayerInfo";
import BotSidebar from "./BotSidebar";
import PromotionModal from "@/components/game/PromotionModal";
import GameOverModal from "@/components/game/GameOverModal";
import type { PromotionPiece } from "@/types/chess.types";

const BotGameLayout = memo(function () {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const gameStatus = useAppSelector((s) => s.botChess.gameStatus);
  const result = useAppSelector((s) => s.botChess.result);
  const pendingPromotion = useAppSelector((s) => s.botChess.pendingPromotion);
  const gameId = useAppSelector((s) => s.botChess.gameId);
  const moves = useAppSelector((s) => s.botChess.moves);
  const level = useAppSelector((s) => s.botChess.level);
  const me = useAppSelector((s) => s.botChess.me);
  const bot = useAppSelector((s) => s.botChess.bot);
  const winner = useAppSelector((s) => s.botChess.winner);
  const isStalled = useAppSelector((s) => s.botChess.isStalled);
  const hintsRemaining = useAppSelector((s) => s.botChess.hintsRemaining);
  const isBotThinking = useAppSelector((s) => s.botChess.isBotThinking);

  const [viewingMoveIndex, setViewingMoveIndex] = useState<number | null>(null);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(false);

  const playerColor = me?.color || "w";

  useEffect(() => {
    if (gameStatus !== "ended" || !result) return;
    const t = setTimeout(() => setGameOverModalOpen(true), 500);
    return () => clearTimeout(t);
  }, [gameStatus, result]);

  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (pendingPromotion && gameId) {
      socket.emit("botMakeMove", {
        gameId,
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: piece,
      });
      dispatch(promotionCancelled());
    }
  };

  const handleMoveClick = (index: number) => {
    if (gameStatus === "ended") setViewingMoveIndex(index);
  };

  const handleNavigate = (direction: "prev" | "next" | "live") => {
    if (direction === "live") {
      setViewingMoveIndex(null);
    } else if (
      direction === "prev" &&
      viewingMoveIndex !== null &&
      viewingMoveIndex > 0
    ) {
      setViewingMoveIndex(viewingMoveIndex - 1);
    } else if (
      direction === "next" &&
      viewingMoveIndex !== null &&
      viewingMoveIndex < moves.length - 1
    ) {
      setViewingMoveIndex(viewingMoveIndex + 1);
    }
  };

  const handleHint = () => {
    if (!gameId || isBotThinking || hintsRemaining < 0) return;
    // If hints are exhausted, gate behind an ad
    if (hintsRemaining === 0) {
      socket.emit("requestAdHint", { gameId });
      return;
    }

    dispatch(hintRequested());
    socket.emit("requestHint", { gameId });
  };

  const handleUndo = () => {
    if (!gameId) return;
    socket.emit("undoMove", { gameId });
    setGameOverModalOpen(false);
  };

  // Toolbar Reset — only reachable during clean active play (gated in
  // BotGameControls), so the game is always guaranteed to still exist
  // server-side here.
  const handleReset = () => {
    setGameOverModalOpen(false);
    if (winner === playerColor) {
      disconnectSocket();
      navigate(`/play/bot?level=${level + 1}&open=true`);
      return;
    }
    if (!gameId) return;
    socket.emit("resetBotGame", { gameId, level });
  };

  // Safe at any time — does NOT tell the server to abandon anything. The
  // game just sits as "in_progress"; coming back to this same URL re-runs
  // continueBotGame via useRestoreBotGame and picks it back up.
  const handleHome = () => {
    setGameOverModalOpen(false);
    disconnectSocket();
    navigate("/play/bot");
    // dispatch(resetBotGame());
  };

  // Called only when player ends the game through checkmate
  const handlePlayAgain = (color: "w" | "b" | "random") => {
    setGameOverModalOpen(false);
    if (gameId) {
      socket.emit("restartBotGame", { gameId, color, level });
      return;
    }
    dispatch(resetBotGame());
  };

  const playAgainLabel = isStalled
    ? "Try Again"
    : winner === playerColor
      ? "Next Level"
      : "Play Again";

  const isViewingHistory = viewingMoveIndex !== null;
  const boardDisabled = gameStatus === "ended" || isViewingHistory;

  return (
    <>
      <div className="flex flex-col px-1 sm:px-2 sm:pt-1 lg:h-screen lg:flex-row lg:overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <div className="grid min-h-0 w-full max-w-7xl grid-cols-1 grid-rows-[1fr_500px] gap-2 sm:gap-4 lg:grid-cols-[1fr_400px] lg:grid-rows-[1fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:h-full lg:flex-1"
            >
              <div className="shrink-0">
                <BotPlayerInfo player={bot} isBot disabled={boardDisabled} />
              </div>

              <div className="relative min-h-0 flex-1">
                <div className="lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center">
                  <div className="relative aspect-square w-full lg:h-full lg:w-auto">
                    <BotBoard disabled={boardDisabled} />
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <BotPlayerInfo player={me} disabled={boardDisabled} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card flex flex-col gap-3 overflow-hidden p-4 sm:p-6 lg:h-full lg:w-100 lg:overflow-hidden"
            >
              <BotSidebar
                moves={moves}
                myColor={me?.color || "w"}
                botColor={bot?.color || "b"}
                gameStatus={gameStatus}
                currentMoveIndex={viewingMoveIndex}
                onMoveClick={handleMoveClick}
                onNavigate={handleNavigate}
                isViewingHistory={isViewingHistory}
                isStalled={isStalled}
                hintsRemaining={hintsRemaining}
                isBotThinking={isBotThinking}
                playAgainLabel={playAgainLabel}
                onHint={handleHint}
                onUndo={handleUndo}
                onReset={handleReset}
                onHome={handleHome}
                onPlayAgain={handlePlayAgain}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={playerColor}
        onSelect={handlePromotionSelect}
      />
      <GameOverModal
        isOpen={gameOverModalOpen}
        result={result || "draw"}
        winner={winner}
        myColor={playerColor}
        playAgainLabel={playAgainLabel}
        onClose={() => setGameOverModalOpen(false)}
        onHome={handleHome}
        onPlayAgain={handleReset}
      />
    </>
  );
});
export default BotGameLayout;
