import type {
  PlayerColor,
  MoveEntry,
  GameResult,
  Opponent,
} from "./socket.types";

// Re-export for convenience
export type { PlayerColor, MoveEntry, GameResult, Opponent };

/* =====================
   Game Mode
===================== */
export type GameMode = "ranked" | "friend" | "bot";

/* =====================
   Status Types
===================== */
export type GameStatus = "idle" | "searching" | "playing" | "ended";

export type BoardStatus = "ongoing" | "check" | "ended";

/* =====================
   Promotion
===================== */
export type PromotionPiece = "q" | "r" | "b" | "n";

export interface PendingPromotion {
  from: string;
  to: string;
}

/* =====================
   Sound
===================== */
export type SoundType =
  | "start"
  | "move"
  | "capture"
  | "castle"
  | "promote"
  | "check"
  | "end"
  | null;

/* =====================
   Player
===================== */
export interface Player {
  userId: string;
  username: string;
  elo: number;
  color: PlayerColor;
  timeLeft: number;
}

/* =====================
   Clocks
===================== */

export type ClocksType = Record<PlayerColor, number>;

/* =====================
   Chess Slice State
===================== */
export interface ChessState {
  // Board
  fen: string;
  turn: PlayerColor;
  boardStatus: BoardStatus;

  // Game info
  gameId: string | null;
  gameMode: GameMode | null;
  gameStatus: GameStatus;
  result: GameResult | null;
  winner: PlayerColor | null;

  // Players
  me: Player | null;
  opponent: Player | null;

  // Move tracking
  moves: MoveEntry[];
  lastMove: { from: string; to: string } | null;
  pendingPromotion: PendingPromotion | null;

  // UI
  soundType: SoundType;
  selectedSquare: string | null;
  clocks: ClocksType;
}

/* =====================
   Piece Types
===================== */
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export const PIECE_VALUE: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_SYMBOLS: Record<PieceType, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

export const PROMOTION_ORDER: PromotionPiece[] = ["q", "r", "n", "b"];

export const PROMOTION_LABELS: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  n: "Knight",
  b: "Bishop",
};
