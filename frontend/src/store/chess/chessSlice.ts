import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ChessState,
  GameMode,
  SoundType,
  Player,
  PendingPromotion,
  MoveEntry,
  PlayerColor,
  GameResult,
  BoardStatus,
  ClocksType,
} from "../../types/chess.types";
/* =====================
   Helpers
===================== */
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function deriveSoundType(move: MoveEntry, status: BoardStatus): SoundType {
  if (status === "ended") return "end";
  if (status === "check") return "check";
  if (move.promotion) return "promote";
  if (move.captured) return "capture";
  if (move.san === "O-O" || move.san === "O-O-O") return "castle";
  return "move";
}

/* =====================
   Initial State
===================== */
const initialState: ChessState = {
  // Board
  fen: INITIAL_FEN,
  turn: "w",
  boardStatus: "ongoing",

  // Game info
  gameId: null,
  gameMode: null,
  gameStatus: "idle",
  result: null,
  winner: null,

  // Players
  me: null,
  opponent: null,

  // Move tracking
  moves: [],
  lastMove: null,
  pendingPromotion: null,

  // UI
  soundType: null,
  selectedSquare: null,
  clocks: { w: 600000, b: 600000 },
};

/* =====================
   Slice
===================== */
const chessSlice = createSlice({
  name: "chess",
  initialState,
  reducers: {
    /* ========= Matchmaking ========= */

    searchingForOpponent: (
      state,
      action: PayloadAction<{ gameMode: GameMode }>,
    ) => {
      state.gameStatus = "searching";
      state.gameMode = action.payload.gameMode;
    },

    cancelledSearch: (state) => {
      state.gameStatus = "idle";
      state.gameMode = null;
    },

    /* ========= Game Lifecycle ========= */

    gameStarted: (
      state,
      action: PayloadAction<{
        gameId: string;
        gameMode: GameMode;
        me: Player;
        opponent: Player;
        fen: string;
        turn: PlayerColor;
      }>,
    ) => {
      const { gameId, gameMode, me, opponent, fen, turn } = action.payload;

      state.gameId = gameId;
      state.gameMode = gameMode;
      state.gameStatus = "playing";
      state.me = me;
      state.opponent = opponent;
      state.fen = fen;
      state.turn = turn;
      state.boardStatus = "ongoing";
      state.moves = [];
      state.lastMove = null;
      state.pendingPromotion = null;
      state.result = null;
      state.winner = null;
      state.soundType = "start";
      state.selectedSquare = null;
    },

    gameRestored: (
      state,
      action: PayloadAction<{
        gameId: string;
        gameMode: GameMode;
        me: Player;
        opponent: Player;
        fen: string;
        turn: PlayerColor;
        moves?: MoveEntry[];
        clocks: ClocksType;
      }>,
    ) => {
      state.gameId = action.payload.gameId;
      state.gameMode = action.payload.gameMode;
      state.me = action.payload.me;
      state.opponent = action.payload.opponent;
      state.fen = action.payload.fen;
      state.turn = action.payload.turn;
      state.gameStatus = "playing";
      state.moves = action.payload.moves || [];
      state.clocks = action.payload.clocks;
    },

    gameEnded: (
      state,
      action: PayloadAction<{
        result: GameResult;
        winner: PlayerColor | null;
      }>,
    ) => {
      state.gameStatus = "ended";
      state.boardStatus = "ended";
      state.result = action.payload.result;
      state.winner = action.payload.winner;
      state.soundType = "end";
    },

    resetGame: () => initialState,

    /* ========= Move Handling ========= */

    moveApplied: (
      state,
      action: PayloadAction<{
        fen: string;
        move: MoveEntry;
        moves: MoveEntry[];
        turn: PlayerColor;
        status: BoardStatus;
        result: GameResult | null;
        winner: PlayerColor | null;
      }>,
    ) => {
      const { fen, move, turn, status, result, winner, moves } = action.payload;

      state.fen = fen;
      state.turn = turn;
      state.boardStatus = status;
      state.moves = moves;
      state.lastMove = { from: move.from, to: move.to };
      state.selectedSquare = null;
      state.soundType = deriveSoundType(move, status);

      if (status === "ended") {
        state.gameStatus = "ended";
        state.result = result;
        state.winner = winner;
      }
    },

    /* ========= Promotion ========= */

    promotionRequested: (state, action: PayloadAction<PendingPromotion>) => {
      state.pendingPromotion = action.payload;
      state.selectedSquare = null;
    },

    promotionCancelled: (state) => {
      state.pendingPromotion = null;
      state.selectedSquare = null;
    },

    /* ========= Timers ========= */

    timerUpdated: (
      state,
      action: PayloadAction<Record<PlayerColor, number>>,
    ) => {
      state.clocks = action.payload;
    },

    /* ========= UI ========= */

    squareSelected: (state, action: PayloadAction<string | null>) => {
      state.selectedSquare = action.payload;
    },

    soundConsumed: (state) => {
      state.soundType = null;
    },
  },
});

export const {
  searchingForOpponent,
  cancelledSearch,
  gameRestored,
  gameStarted,
  gameEnded,
  resetGame,
  moveApplied,
  promotionRequested,
  promotionCancelled,
  timerUpdated,
  squareSelected,
  soundConsumed,
} = chessSlice.actions;

export default chessSlice.reducer;
