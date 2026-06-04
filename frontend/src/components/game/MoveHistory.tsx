import { memo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MoveEntry } from "../../types/socket.types";
import type { GameStatus } from "../../types/chess.types";
import { PIECE_SYMBOLS } from "../../types/chess.types";

interface MoveHistoryProps {
  moves: MoveEntry[];
  gameStatus: GameStatus;
  currentMoveIndex: number | null;
  playerColor: "w" | "b";
  onMoveClick: (index: number) => void;
  onNavigate: (direction: "prev" | "next" | "live") => void;
}

const MoveHistory = memo(function ({
  moves,
  gameStatus,
  currentMoveIndex,
  playerColor,
  onMoveClick,
  onNavigate,
}: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEnded = gameStatus === "ended";
  const isViewingHistory = currentMoveIndex !== null;
  const isPlayerWhite = playerColor === "w";

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground sm:text-sm">
        No moves yet
      </div>
    );
  }

  const moveRows: Array<{
    moveNumber: number;
    white: MoveEntry | null;
    black: MoveEntry | null;
  }> = [];

  moves.forEach((move) => {
    let existingRow = moveRows.find(
      (row) => row.moveNumber === move.moveNumber,
    );
    if (!existingRow) {
      existingRow = { moveNumber: move.moveNumber, white: null, black: null };
      moveRows.push(existingRow);
    }
    if (move.color === "w") existingRow.white = move;
    else existingRow.black = move;
  });

  const renderMoveCell = (
    move: MoveEntry | null,
    index: number,
    isWhite: boolean,
  ) => {
    if (!move) return <span className="px-2 text-muted-foreground">—</span>;

    const isActive = currentMoveIndex === index;

    return (
      <button
        onClick={() => isEnded && onMoveClick(index)}
        disabled={!isEnded}
        className={`flex w-full items-center gap-1 font-mono text-xs sm:text-sm ${
          isEnded ? "cursor-pointer hover:text-foreground" : "cursor-default"
        } ${
          isViewingHistory && isActive
            ? "rounded bg-accent/30 px-1 py-0.5 font-semibold text-primary"
            : isWhite
              ? "text-foreground"
              : "text-muted-foreground"
        }`}
        title={move.san}
      >
        <span>{move.san}</span>
        {move.captured && (
          <span
            className="text-xs opacity-60"
            title={`Captured: ${move.captured}`}
          >
            ×{PIECE_SYMBOLS[move.captured]}
          </span>
        )}
      </button>
    );
  };

  const playerMove = (row: (typeof moveRows)[0]) =>
    isPlayerWhite ? row.white : row.black;
  const opponentMove = (row: (typeof moveRows)[0]) =>
    isPlayerWhite ? row.black : row.white;
  const playerIndex = (row: (typeof moveRows)[0]) => {
    const m = playerMove(row);
    return m ? moves.indexOf(m) : -1;
  };
  const opponentIndex = (row: (typeof moveRows)[0]) => {
    const m = opponentMove(row);
    return m ? moves.indexOf(m) : -1;
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {isEnded && isViewingHistory && (
        <div className="flex shrink-0 items-center gap-2 px-2">
          <button
            onClick={() => onNavigate("prev")}
            disabled={currentMoveIndex === 0}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex-1 text-center text-xs text-muted-foreground">
            {currentMoveIndex !== null && moves.length > 0
              ? `Move ${currentMoveIndex + 1} / ${moves.length}`
              : ""}
          </span>
          <button
            onClick={() => onNavigate("next")}
            disabled={currentMoveIndex === moves.length - 1}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate("live")}
            className="rounded px-2 py-1 text-xs font-medium transition-all"
            style={{
              borderColor: "var(--border-gold)",
              color: "var(--gold)",
              border: "1px solid var(--border-gold)",
            }}
          >
            Live
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-scroll"
      >
        <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
          <thead
            className="sticky top-0 z-10"
            style={{ background: "var(--bg-elevated)" }}
          >
            <tr
              className="border-b text-xs text-muted-foreground"
              style={{ borderColor: "var(--border-default)" }}
            >
              <th className="w-1/2 px-2 py-2 text-left font-semibold">You</th>
              <th className="w-1/2 px-2 py-2 text-left font-semibold">
                Opponent
              </th>
            </tr>
          </thead>
          <tbody>
            {moveRows.map((row, rowIndex) => (
              <motion.tr
                key={`${row.moveNumber}-${rowIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.02 }}
                className="h-8 border-b transition-colors hover:bg-accent/50"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <td
                  className="w-1/2 border-r px-2 py-2"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {renderMoveCell(
                    playerMove(row),
                    playerIndex(row),
                    isPlayerWhite,
                  )}
                </td>
                <td className="w-1/2 px-2 py-2">
                  {renderMoveCell(
                    opponentMove(row),
                    opponentIndex(row),
                    !isPlayerWhite,
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
export default MoveHistory;
