import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../../services/socket";
import { useAppDispatch, useAppSelector } from "../../hooks/dispatch";
import { promotionCancelled, resetGame } from "../../store/chess/chessSlice";
import VSIntro from "./VSIntro";
import Board from "./Board";
import PlayerInfo from "./PlayerInfo";
import Sidebar from "./Sidebar";
import PromotionModal from "./PromotionModal";
import GameOverModal from "./GameOverModal";
import type { PromotionPiece } from "../../types/chess.types";

const GameLayout = memo(function () {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const gameStatus = useAppSelector((state) => state.chess.gameStatus);
  const result = useAppSelector((state) => state.chess.result);
  const pendingPromotion = useAppSelector(
    (state) => state.chess.pendingPromotion,
  );
  const gameId = useAppSelector((state) => state.chess.gameId);
  const moves = useAppSelector((state) => state.chess.moves);
  const opponent = useAppSelector((state) => state.chess.opponent);
  const me = useAppSelector((state) => state.chess.me);
  const gameMode = useAppSelector((state) => state.chess.gameMode);
  const winner = useAppSelector((state) => state.chess.winner);

  const [viewingMoveIndex, setViewingMoveIndex] = useState<number | null>(null);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(false);
  const [showVSIntro, setShowVSIntro] = useState(true);

  useEffect(() => {
    if (gameStatus === "ended" && result) {
      setTimeout(() => setGameOverModalOpen(true), 500);
    }
  }, [gameStatus, result]);

  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (pendingPromotion && gameId) {
      socket.emit("makeMove", {
        gameId: gameId,
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

  const handleResign = () => {
    if (gameId) socket.emit("resign", gameId);
  };
  const handleOfferDraw = () => console.log("Draw offer - coming soon");
  const handleHome = () => {
    dispatch(resetGame());
    navigate("/");
  };
  const handlePlayAgain = () => {
    dispatch(resetGame());
    navigate(`/play/${gameMode}`, { replace: true });
  };

  const isViewingHistory = viewingMoveIndex !== null;
  const boardDisabled = gameStatus === "ended" || isViewingHistory;

  return (
    <>
      <div className="flex flex-col px-1 sm:px-2 sm:pt-1 lg:h-screen lg:flex-row lg:overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <div className="grid min-h-0 w-full max-w-7xl grid-cols-1 grid-rows-[1fr_500px] gap-2 sm:gap-4 lg:grid-cols-[1fr_400px] lg:grid-rows-[1fr]">
            {/* Left: Board */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:h-full lg:flex-1"
            >
              <div className="shrink-0">
                <PlayerInfo player={opponent} disabled={boardDisabled} />
              </div>

              {/* Board fills remaining height on lg, full width on small */}
              <div className="relative min-h-0 flex-1">
                <div className="lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center">
                  <div className="relative aspect-square w-full lg:h-full lg:w-auto">
                    <Board disabled={boardDisabled} />
                    <AnimatePresence>
                      {showVSIntro && me && opponent && (
                        <VSIntro
                          me={me}
                          opponent={opponent}
                          onComplete={() => setShowVSIntro(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <PlayerInfo player={me} disabled={boardDisabled} />
              </div>
            </motion.div>

            {/* Right: Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card flex flex-col gap-3 overflow-hidden p-4 sm:p-6 lg:h-full lg:w-100 lg:overflow-hidden"
            >
              <Sidebar
                moves={moves}
                myColor={me?.color || "w"}
                opponentColor={opponent?.color || "b"}
                gameStatus={gameStatus}
                currentMoveIndex={viewingMoveIndex}
                onMoveClick={handleMoveClick}
                onNavigate={handleNavigate}
                isViewingHistory={isViewingHistory}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
                onHome={handleHome}
                onPlayAgain={handlePlayAgain}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={me?.color || "w"}
        onSelect={handlePromotionSelect}
      />
      <GameOverModal
        isOpen={gameOverModalOpen}
        result={result || "draw"}
        winner={winner}
        myColor={me?.color || "w"}
        onClose={() => setGameOverModalOpen(false)}
        onHome={handleHome}
        onPlayAgain={handlePlayAgain}
        playAgainLabel="Play Again"
      />
    </>
  );
});
export default GameLayout;
