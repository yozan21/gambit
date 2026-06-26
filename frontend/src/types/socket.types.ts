import type { BoardStatus, GameMode, PieceType } from "./chess.types";

export type PlayerColor = "w" | "b";

export interface MoveEntry {
  san: string;
  piece: PieceType;
  color: PlayerColor;
  from: string;
  to: string;
  moveNumber: number;
  captured: PieceType | null;
  promotion: string | null;
}

export type GameResult =
  | "checkmate"
  | "resignation"
  | "stalemate"
  | "draw"
  | "threefold_repetition"
  | "insufficient_material"
  | "timeout"
  | "abandonment";

export interface Opponent {
  userId: string;
  username: string;
  elo: number;
  color: PlayerColor;
}

export interface SocketPlayer extends Opponent {
  socketId?: string;
}

export interface ServerToClientEvents {
  roomCreated: (data: { roomCode: string }) => void;

  gameCreated: (data: { gameId: string; color: PlayerColor }) => void;

  gameJoined: (data: {
    gameId: string;
    me: SocketPlayer;
    fen: string;
    mode: GameMode;
    opponent: Opponent;
  }) => void;

  gameStart: () => void;
  kicked: (data: { message: string }) => void;

  gameRejoined: (data: {
    gameId: string;
    me: SocketPlayer;
    fen: string;
    clocks: Record<PlayerColor, number>;
    turn: PlayerColor;
    opponent: SocketPlayer;
  }) => void;

  promotionRequest: (data: {
    ok: boolean;
    promotionRequired: boolean;
    from: string;
    to: string;
  }) => void;

  timerUpdate: (data: Record<PlayerColor, number>) => void;

  "opponent:disconnected": (data: { message: string }) => void;

  moveMade: (data: {
    ok: boolean;
    fen: string;
    move: MoveEntry;
    moves: MoveEntry[];
    turn: PlayerColor;
    status: BoardStatus;
    result: GameResult | null;
    winner: PlayerColor | null;
    soundType: "move" | "capture" | "castle" | "promote" | "check" | "end";
  }) => void;

  gameOver: (data: {
    result: GameResult;
    winner: PlayerColor | null;
    message: string;
  }) => void;

  inGame: (data: { gameId: string; message: string; mode: string }) => void;

  error: (data: { message: string }) => void;
  moveError: (data: { message: string }) => void;
  roomError: (data: { message: string }) => void;

  // Bot Game Events
  botGameCreated: (data: {
    gameId: string;
    color: PlayerColor;
    level: number;
    hintsRemaining: number;
  }) => void;

  botGameResume: (data: {
    gameId: string;
    fen: string;
    moves: MoveEntry[];
    turn: PlayerColor;
    level: number;
    hintsRemaining: number;
    color: PlayerColor;
    status: BoardStatus;
  }) => void;

  botMoveMade: (data: {
    ok: boolean;
    fen: string;
    move: MoveEntry;
    moves: MoveEntry[];
    turn: PlayerColor;
    status: BoardStatus;
    result: GameResult | null;
    winner: PlayerColor | null;
    soundType: "move" | "capture" | "castle" | "promote" | "check" | "end";
  }) => void;

  botMove: (data: {
    ok: boolean;
    fen: string;
    move: MoveEntry;
    moves: MoveEntry[];
    turn: PlayerColor;
    status: BoardStatus;
    result: GameResult | null;
    winner: PlayerColor | null;
    soundType: "move" | "capture" | "castle" | "promote" | "check" | "end";
  }) => void;

  hintResponse: (data: {
    from: string;
    to: string;
    hintsRemaining: number;
  }) => void;

  hintDenied: (data: { reason: string }) => void;

  hintGranted: (data: { hintsRemaining: number }) => void;

  adSessionReady: (data: { gameId: string; adToken: string }) => void;

  undoConfirmed: (data: {
    fen: string;
    moves: MoveEntry[];
    turn: PlayerColor;
  }) => void;

  botGameStalled: (data: {
    result: GameResult;
    winner: PlayerColor | null;
    fen: string;
    move: MoveEntry;
    moves: MoveEntry[];
  }) => void;

  botGameOver: (data: {
    result: GameResult;
    winner: PlayerColor | null;
    message: string;
    levelCompleted?: number;
  }) => void;

  botGameRestored: (data: {
    gameId: string;
    fen: string;
    moves: MoveEntry[];
    turn: PlayerColor;
    level: number;
    hintsRemaining: number;
    color: PlayerColor;
    username: string;
    status: BoardStatus;
  }) => void;
}

export interface ClientToServerEvents {
  startGameRanked: () => void;

  createRoom: () => void;

  joinRoom: (data: { roomCode: string }) => void;
  cancelRoom: () => void;

  makeMove: (data: {
    gameId: string;
    from: string;
    to: string;
    promotion?: "q" | "r" | "n" | "b";
  }) => void;
  resign: (gameId: string) => void;
  restoreGame: (gameId: string) => void;

  // Bot Game Events
  startBotGame: (data: { level: number; color: "w" | "b" | "random" }) => void;

  botMakeMove: (data: {
    gameId: string;
    from: string;
    to: string;
    promotion?: "q" | "r" | "n" | "b";
  }) => void;

  requestHint: (data: { gameId: string }) => void;

  requestAdHint: (date: { gameId: string }) => void;

  grantAdHint: (data: { gameId: string; adToken?: string }) => void;

  undoMove: (data: { gameId: string }) => void;

  restartBotGame: (data: {
    gameId: string;
    color: "w" | "b" | "random";
    level: number;
  }) => void;
  resetBotGame: (data: { gameId: string; level: number }) => void;
  continueBotGame: (data: { gameId: string }) => void;
  restoreBotGame: (data: { gameId: string }) => void;
}
