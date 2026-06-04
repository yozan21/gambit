import { motion } from "framer-motion";
import type { MoveEntry, PlayerColor } from "../../types/socket.types";
import {
  PIECE_SYMBOLS,
  PIECE_VALUE,
  type PieceType,
} from "../../types/chess.types";

interface CapturedPiecesProps {
  moves: MoveEntry[];
  perspective: PlayerColor;
  label: string;
}

export default function CapturedPieces({
  moves,
  perspective,
  label,
}: CapturedPiecesProps) {
  // Get captured pieces from perspective
  const capturedByPerspective: Record<string, number> = {};
  let materialPoints = 0;

  moves.forEach((move) => {
    // If move is by opponent and has capture
    if (move.color !== perspective && move.captured) {
      capturedByPerspective[move.captured] =
        (capturedByPerspective[move.captured] || 0) + 1;
      materialPoints += PIECE_VALUE[move.captured] || 0;
    }
  });

  // Piece order: pawn, knight, bishop, rook, queen, king
  const pieceOrder: PieceType[] = ["p", "n", "b", "r", "q", "k"];
  const sortedPieces = pieceOrder.filter((p) => capturedByPerspective[p]);

  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </h3>

      <div className="px-3">
        {sortedPieces.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            No pieces captured yet
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {/* Captured pieces */}
            {sortedPieces.map((piece) => {
              const count = capturedByPerspective[piece];
              return (
                <motion.div
                  key={piece}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-lg sm:text-xl">
                    {PIECE_SYMBOLS[piece]}
                  </span>
                  {count > 1 && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      ×{count}
                    </span>
                  )}
                </motion.div>
              );
            })}

            {/* Material points */}
            {materialPoints > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-auto text-sm font-semibold"
                style={{ color: "var(--gold)" }}
              >
                +{materialPoints}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
