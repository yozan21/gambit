import { PIECE_VALUE, type PieceType } from "../types/chess.types";

export function calculateMaterialScore(pieces: string[]) {
  return pieces.reduce(
    (total, p) => total + (PIECE_VALUE[p as PieceType] ?? 0),
    0,
  );
}
