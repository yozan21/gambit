// src/components/game/Board.tsx
import { memo, useCallback, useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { squareSelected } from "@/store/chess/chessSlice";
import { socket } from "@/services/socket";
import type { PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";

interface BoardProps {
  disabled?: boolean;
}

const Board = memo(function ({ disabled = false }: BoardProps) {
  const dispatch = useAppDispatch();
  const fen = useAppSelector((state) => state.chess.fen);
  const me = useAppSelector((state) => state.chess.me);
  const turn = useAppSelector((state) => state.chess.turn);
  const selectedSquare = useAppSelector((state) => state.chess.selectedSquare);
  const lastMove = useAppSelector((state) => state.chess.lastMove);
  const boardStatus = useAppSelector((state) => state.chess.boardStatus);
  const gameId = useAppSelector((state) => state.chess.gameId);

  // Create chess instance for move validation
  const game = useMemo(() => new Chess(fen), [fen]);

  // Get possible moves for selected piece
  const possibleMoves = useMemo(() => {
    if (!selectedSquare) return [];
    try {
      return game
        .moves({ square: selectedSquare as Square, verbose: true })
        .map((move) => move.to);
    } catch {
      return [];
    }
  }, [selectedSquare, game]);

  // Check if it's player's turn
  const isMyTurn = !disabled && turn === me?.color;

  // ============================================================================
  // CUSTOM SQUARE STYLES
  // ============================================================================
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "var(--board-selected)",
        boxShadow: "inset 0 0 0 3px var(--gold)",
      };
    }

    // Highlight last move (from and to squares)
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "var(--board-last-move)",
      };
      styles[lastMove.to] = {
        backgroundColor: "var(--board-last-move)",
      };
    }

    // Show possible moves for selected piece
    possibleMoves.forEach((square) => {
      const piece = game.get(square as Square);

      if (piece) {
        // Square has enemy piece (capture)
        styles[square] = {
          backgroundColor: "var(--board-capture)",
          boxShadow: "inset 0 0 0 4px var(--board-capture)",
        };
      } else {
        // Empty square (normal move)
        styles[square] = {
          background: `radial-gradient(circle, var(--board-possible) 15%, transparent 20%)`,
        };
      }
    });

    // Highlight king in check
    if (boardStatus === "check") {
      const board = game.board();
      for (const row of board) {
        for (const piece of row) {
          if (piece && piece.type === "k" && piece.color === turn) {
            styles[piece.square] = {
              backgroundColor: "var(--board-check)",
            };
          }
        }
      }
    }

    return styles;
  }, [selectedSquare, lastMove, possibleMoves, boardStatus, game, turn]);

  const notationStyle: React.CSSProperties = {
    fontSize: "clamp(10px, 1.2vw, 13px)",
    fontWeight: "500",
  };

  // ============================================================================
  // MOVE HANDLERS
  // ============================================================================
  const attemptMove = useCallback(
    (from: string, to: string) => {
      if (!gameId) return;

      const piece = game.get(from as Square);

      // Check if it's a pawn promotion
      const isPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && to[1] === "8") ||
          (piece.color === "b" && to[1] === "1"));

      if (isPromotion) {
        // Server will send promotionRequest event
        socket.emit("makeMove", {
          gameId,
          from,
          to,
        });
      } else {
        // Normal move
        socket.emit("makeMove", {
          gameId,
          from,
          to,
        });
      }

      // Deselect after move attempt
      dispatch(squareSelected(null));
    },
    [gameId, dispatch, game],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      if (disabled || !isMyTurn) return;

      const clickedPiece = game.get(square as Square);

      // If clicking on own piece, select it
      if (clickedPiece && clickedPiece.color === me?.color) {
        dispatch(squareSelected(square));
        return;
      }

      // If a piece is selected and clicking on valid move square
      if (selectedSquare && possibleMoves.includes(square as Square)) {
        attemptMove(selectedSquare, square);
      } else {
        // Deselect if clicking elsewhere
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
      if (disabled || !isMyTurn) return false;
      if (!targetSquare) return false;

      const piece = game.get(sourceSquare as Square);
      if (!piece || piece.color !== me?.color) return false;

      // Validate move
      const moves = game.moves({
        square: sourceSquare as Square,
        verbose: true,
      });
      const validMove = moves.find((m) => m.to === targetSquare);
      if (!validMove) return false;

      attemptMove(sourceSquare, targetSquare);
      return true;
    },
    [attemptMove, disabled, game, isMyTurn, me?.color],
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="shadow-board aspect-square w-full overflow-hidden rounded-xs">
      <Chessboard
        options={{
          position: fen,
          onSquareClick: ({ square }: SquareHandlerArgs) =>
            handleSquareClick(square),
          onPieceDrop: handlePieceDrop,
          boardOrientation: me?.color === "w" ? "white" : "black",
          squareStyles: customSquareStyles,
          allowDragging: !disabled && isMyTurn,
          lightSquareStyle: {
            backgroundColor: "var(--board-light)",
          },
          darkSquareStyle: {
            backgroundColor: "var(--board-dark)",
          },
          darkSquareNotationStyle: notationStyle,
          lightSquareNotationStyle: notationStyle,
          alphaNotationStyle: notationStyle,
          numericNotationStyle: notationStyle,
        }}
      />
    </div>
  );
});
export default Board;
