import type { MoveEntry } from "../types/chess.types";

type Captured = {
  white: string[]; // pieces captured FROM white
  black: string[]; // pieces captured FROM black
};

export function getCapturedPieces(moves: MoveEntry[]): Captured {
  const captured: Captured = { white: [], black: [] };

  for (const move of moves) {
    if (!move.captured) continue;

    if (move.color === "w") {
      captured.black.push(move.captured);
    } else {
      captured.white.push(move.captured);
    }
  }

  return captured;
}
