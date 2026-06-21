import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  MoveEntry,
  PlayerColor,
  GameResult,
} from "../../types/socket.types";
import type {
  BoardStatus,
  SoundType,
  PendingPromotion,
} from "../../types/chess.types";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface BotPlayer {
  username: string;
  color: PlayerColor;
}

export interface BotChessState {
  fen: string;
  turn: PlayerColor;
  boardStatus: BoardStatus;

  gameId: string | null;
  gameStatus: "idle" | "playing" | "ended";
  result: GameResult | null;
  winner: PlayerColor | null;

  me: BotPlayer | null;
  bot: BotPlayer | null;
  level: number;

  moves: MoveEntry[];
  lastMove: { from: string; to: string } | null;
  pendingPromotion: PendingPromotion | null;

  soundType: SoundType;
  selectedSquare: string | null;
  isStalled: boolean;

  hintsRemaining: number;
  hintSquares: { from: string; to: string } | null;
  isBotThinking: boolean; // blocks bot-move waiting AND hint button while a request is in flight

  // An in-progress game was found on the server when starting — ask player to continue or start fresh
  resumePrompt: {
    gameId: string;
    level: number;
    color: PlayerColor;
  } | null;
}

const initialState: BotChessState = {
  fen: INITIAL_FEN,
  turn: "w",
  boardStatus: "ongoing",

  gameId: null,
  gameStatus: "idle",
  result: null,
  winner: null,

  me: null,
  bot: null,
  level: 1,

  moves: [],
  lastMove: null,
  pendingPromotion: null,

  soundType: null,
  selectedSquare: null,
  isStalled: false,

  hintsRemaining: 3,
  hintSquares: null,
  isBotThinking: false,

  resumePrompt: null,
};

function deriveSoundType(move: MoveEntry, status: BoardStatus): SoundType {
  if (status === "ended") return "end";
  if (status === "check") return "check";
  if (move.promotion) return "promote";
  if (move.captured) return "capture";
  if (move.san === "O-O" || move.san === "O-O-O") return "castle";
  return "move";
}

const botChessSlice = createSlice({
  name: "botChess",
  initialState,
  reducers: {
    /* ========= Game Lifecycle ========= */

    botGameCreated: (
      state,
      action: PayloadAction<{
        gameId: string;
        color: PlayerColor;
        level: number;
        hintsRemaining: number;
        username: string;
      }>,
    ) => {
      const { gameId, color, level, hintsRemaining, username } = action.payload;
      state.gameId = gameId;
      state.level = level;
      state.gameStatus = "playing";
      state.fen = INITIAL_FEN;
      state.turn = "w";
      state.boardStatus = "ongoing";
      state.moves = [];
      state.lastMove = null;
      state.pendingPromotion = null;
      state.result = null;
      state.winner = null;
      state.soundType = "start";
      state.selectedSquare = null;
      state.isStalled = false;
      state.hintsRemaining = hintsRemaining;
      state.hintSquares = null;
      state.isBotThinking = color === "b"; // bot moves first if player is black
      state.resumePrompt = null;
      state.me = { username, color };
      state.bot = {
        username: `Bot · Lv ${level}`,
        color: color === "w" ? "b" : "w",
      };
    },

    botGameResumePrompted: (
      state,
      action: PayloadAction<{
        gameId: string;
        level: number;
        color: PlayerColor;
      }>,
    ) => {
      state.resumePrompt = action.payload;
    },

    botGameResumed: (
      state,
      action: PayloadAction<{
        gameId: string;
        fen: string;
        moves: MoveEntry[];
        turn: PlayerColor;
        level: number;
        hintsRemaining: number;
        color: PlayerColor;
        username: string;
      }>,
    ) => {
      const {
        gameId,
        fen,
        moves,
        turn,
        level,
        hintsRemaining,
        color,
        username,
      } = action.payload;
      state.gameId = gameId;
      state.fen = fen;
      state.moves = moves;
      state.turn = turn;
      state.level = level;
      state.hintsRemaining = hintsRemaining;
      state.hintSquares = null;
      state.isStalled = false;
      state.me = { username, color };
      state.bot = {
        username: `Bot · Lv ${level}`,
        color: color === "w" ? "b" : "w",
      };
      state.gameStatus = "playing";
      state.boardStatus = "ongoing";
      state.result = null;
      state.winner = null;
      state.resumePrompt = null;
      state.lastMove =
        moves.length > 0
          ? {
              from: moves[moves.length - 1].from,
              to: moves[moves.length - 1].to,
            }
          : null;
    },

    /* ========= Moves ========= */

    botMoveApplied: (
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
      const { fen, move, moves, turn, status, result, winner } = action.payload;
      state.fen = fen;
      state.turn = turn;
      state.boardStatus = status;
      state.moves = moves;
      state.lastMove = { from: move.from, to: move.to };
      state.selectedSquare = null;
      state.hintSquares = null;
      state.soundType = deriveSoundType(move, status);

      // Player's own move ending the game (i.e. player wins) — final immediately, modal opens
      if (status === "ended") {
        state.gameStatus = "ended";
        state.result = result;
        state.winner = winner;
      }
    },

    botThinking: (state, action: PayloadAction<boolean>) => {
      state.isBotThinking = action.payload;
    },

    /* ========= Bot ends the game (checkmates player, or forces a draw) =========
       Modal opens just like a normal game over. Undo remains available from the
       always-visible controls bar — clicking it there resumes the game and the
       modal closes naturally because gameStatus flips back to "playing". */
    botGameStalled: (
      state,
      action: PayloadAction<{
        result: GameResult;
        winner: PlayerColor | null;
        fen: string;
        move: MoveEntry;
        moves: MoveEntry[];
      }>,
    ) => {
      const { result, winner, fen, move, moves } = action.payload;
      state.fen = fen;
      state.moves = moves;
      state.lastMove = { from: move.from, to: move.to };
      state.boardStatus = "ended";
      state.gameStatus = "ended";
      state.result = result;
      state.isStalled = false;
      state.winner = winner;
      state.soundType = "end";
      state.isBotThinking = false;
    },

    /* ========= Undo ========= */

    undoApplied: (
      state,
      action: PayloadAction<{
        fen: string;
        moves: MoveEntry[];
        turn: PlayerColor;
      }>,
    ) => {
      const { fen, moves, turn } = action.payload;
      state.fen = fen;
      state.moves = moves;
      state.turn = turn;
      state.boardStatus = "ongoing";
      state.gameStatus = "playing"; // closes GameOverModal if it was open
      state.result = null;
      state.winner = null;
      state.isBotThinking = false;
      state.hintSquares = null;
      state.isStalled = false;
      state.soundType = "move";
      state.lastMove =
        moves.length > 0
          ? {
              from: moves[moves.length - 1].from,
              to: moves[moves.length - 1].to,
            }
          : null;
    },

    /* ========= Hints ========= */

    hintRequested: (state) => {
      state.isBotThinking = true;
    },

    hintReceived: (
      state,
      action: PayloadAction<{
        from: string;
        to: string;
        hintsRemaining: number;
      }>,
    ) => {
      state.hintSquares = { from: action.payload.from, to: action.payload.to };
      state.hintsRemaining = action.payload.hintsRemaining;
      state.isBotThinking = false;
    },

    hintDenied: (state) => {
      state.isBotThinking = false;
    },

    hintGranted: (state, action: PayloadAction<{ hintsRemaining: number }>) => {
      state.hintsRemaining = action.payload.hintsRemaining;
    },

    hintCleared: (state) => {
      state.hintSquares = null;
    },

    hintError: (state) => {
      state.isBotThinking = false;
      state.hintSquares = null;
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

    /* ========= UI ========= */

    squareSelected: (state, action: PayloadAction<string | null>) => {
      state.selectedSquare = action.payload;
    },

    soundConsumed: (state) => {
      state.soundType = null;
    },

    resetBotGame: () => initialState,
  },
});

export const {
  botGameCreated,
  botGameResumePrompted,
  botGameResumed,
  botMoveApplied,
  botThinking,
  botGameStalled,
  undoApplied,
  hintRequested,
  hintReceived,
  hintDenied,
  hintGranted,
  hintCleared,
  promotionRequested,
  promotionCancelled,
  squareSelected,
  soundConsumed,
  resetBotGame,
} = botChessSlice.actions;

export default botChessSlice.reducer;
