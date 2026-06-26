import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { squareSelected } from "@/store/bot/botSlice";
import { socket } from "@/services/socket";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { HintPieceAnimation } from "./HintPieceAnimation";

interface BotBoardProps {
  disabled?: boolean;
}

const BotBoard = memo(function ({ disabled = false }: BotBoardProps) {
  const dispatch = useAppDispatch();
  const fen = useAppSelector((s) => s.botChess.fen);
  const me = useAppSelector((s) => s.botChess.me);
  const turn = useAppSelector((s) => s.botChess.turn);
  const selectedSquare = useAppSelector((s) => s.botChess.selectedSquare);
  const lastMove = useAppSelector((s) => s.botChess.lastMove);
  const boardStatus = useAppSelector((s) => s.botChess.boardStatus);
  const gameId = useAppSelector((s) => s.botChess.gameId);
  const isBotThinking = useAppSelector((s) => s.botChess.isBotThinking);
  const hintSquares = useAppSelector((s) => s.botChess.hintSquares);

  const game = useMemo(() => new Chess(fen), [fen]);

  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const [hintCancelSignal, setHintCancelSignal] = useState(0);

  const possibleMoves = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      return game
        .moves({ square: selectedSquare as Square, verbose: true })
        .map((m) => m.to);
    } catch {
      return [];
    }
  }, [selectedSquare, game]);

  // Blocked while the bot is "thinking" too — stops clicking ahead of its reply.
  const isMyTurn = !disabled && !isBotThinking && turn === me?.color;

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "var(--board-selected)",
        boxShadow: "inset 0 0 0 3px var(--gold)",
      };
    }

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "var(--board-last-move)" };
      styles[lastMove.to] = { backgroundColor: "var(--board-last-move)" };
    }

    possibleMoves.forEach((square) => {
      const piece = game.get(square as Square);
      styles[square] = piece
        ? {
            backgroundColor: "var(--board-capture)",
            boxShadow: "inset 0 0 0 4px var(--board-capture)",
          }
        : {
            background: `radial-gradient(circle, var(--board-possible) 15%, transparent 20%)`,
          };
    });

    if (boardStatus === "check") {
      const board = game.board();
      for (const row of board) {
        for (const piece of row) {
          if (piece && piece.type === "k" && piece.color === turn) {
            styles[piece.square] = { backgroundColor: "var(--board-check)" };
          }
        }
      }
    }

    if (hintSquares) {
      styles[hintSquares.from] = {
        ...(styles[hintSquares.from] ?? {}),
        boxShadow: "inset 0 0 0 3px var(--gold-light)",
      };
      styles[hintSquares.to] = {
        ...(styles[hintSquares.to] ?? {}),
        boxShadow: "inset 0 0 0 3px var(--gold-light)",
      };
    }

    return styles;
  }, [
    selectedSquare,
    lastMove,
    possibleMoves,
    boardStatus,
    game,
    turn,
    hintSquares,
  ]);

  const notationStyle: React.CSSProperties = {
    fontSize: "clamp(10px, 1.2vw, 13px)",
    fontWeight: "500",
  };

  const attemptMove = useCallback(
    (from: string, to: string) => {
      if (!gameId) return;
      socket.emit("botMakeMove", { gameId, from, to });
      dispatch(squareSelected(null));
    },
    [gameId, dispatch],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      // Cancel hint animation on any board interaction
      setHintCancelSignal((n) => n + 1);

      if (disabled || !isMyTurn) return;
      const clickedPiece = game.get(square as Square);

      if (clickedPiece && clickedPiece.color === me?.color) {
        dispatch(squareSelected(square));
        return;
      }

      if (selectedSquare && possibleMoves.includes(square as Square)) {
        attemptMove(selectedSquare, square);
      } else {
        dispatch(squareSelected(null));
      }
    },
    [
      disabled,
      isMyTurn,
      game,
      me?.color,
      selectedSquare,
      possibleMoves,
      dispatch,
      attemptMove,
    ],
  );

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      setHintCancelSignal((n) => n + 1);
      if (disabled || !isMyTurn || !targetSquare) return false;
      const piece = game.get(sourceSquare as Square);
      if (!piece || piece.color !== me?.color) return false;
      const moves = game.moves({
        square: sourceSquare as Square,
        verbose: true,
      });
      if (!moves.find((m) => m.to === targetSquare)) return false;
      attemptMove(sourceSquare, targetSquare);
      return true;
    },
    [attemptMove, disabled, game, isMyTurn, me?.color],
  );
  const boardOrientation = me?.color === "w" ? "white" : "black";

  return (
    <div
      ref={boardWrapperRef}
      className="shadow-board relative aspect-square w-full overflow-hidden rounded-xs"
    >
      <Chessboard
        options={{
          position: fen,
          onSquareClick: ({ square }: SquareHandlerArgs) =>
            handleSquareClick(square),
          onPieceDrop: handlePieceDrop,
          boardOrientation,
          squareStyles: customSquareStyles,
          allowDragging: !disabled && isMyTurn,
          lightSquareStyle: { backgroundColor: "var(--board-light)" },
          darkSquareStyle: { backgroundColor: "var(--board-dark)" },
          darkSquareNotationStyle: notationStyle,
          lightSquareNotationStyle: notationStyle,
          alphaNotationStyle: notationStyle,
          numericNotationStyle: notationStyle,
        }}
      />
      <HintPieceAnimation
        boardRef={boardWrapperRef}
        hintSquares={hintSquares}
        orientation={boardOrientation}
        cancelSignal={hintCancelSignal}
      />
    </div>
  );
});
export default BotBoard;
