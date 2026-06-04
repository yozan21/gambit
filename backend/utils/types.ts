import type { Socket } from "socket.io";
export interface ErrorReply {
  success: false;
  message: string;
  error?: string;
  isOperational?: boolean;
}

export interface LoginBody {
  identifier: string;
  password: string;
}
export interface SignupBody {
  email: string;
  username: string;
  fullName: string;
  confirmPassword?: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  role: string;
  tokenVersion?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshParams {
  id: string;
  role: string;
  tokenVersion: number;
}

export interface UpdateProfileBody {
  username?: string;
  fullName?: string;
}

export interface UpdatePasswordBody {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PlayerColor = "w" | "b";
export type GameMode = "ranked" | "friend" | "bot";
export type Result =
  | "checkmate"
  | "resignation"
  | "stalemate"
  | "draw"
  | "threefold_repetition"
  | "insufficient_material"
  | "timeout"
  | "abandonment";

export interface MoveEntry {
  san: string;
  piece: string;
  color: PlayerColor;
  from: string;
  to: string;
  moveNumber: number;
  captured: string | null;
  promotion: string | null;
}

export interface SocketData {
  userId: string;
  username: string;
  elo: number;
}

export interface ServerToClientEvents {
  gameCreated: (data: { gameId: string; color: PlayerColor }) => void;

  roomCreated: (data: { roomCode: string }) => void;

  gameJoined: (data: {
    gameId: string;
    me: GamePlayer;
    fen: string;
    mode: GameMode;
    opponent: Pick<GamePlayer, "userId" | "username" | "elo" | "color">;
  }) => void;

  gameStart: () => void;

  vsIntro: (data: {
    white: { username: string; elo: number };
    black: { username: string; elo: number };
  }) => void;

  kicked: (data: { message: string }) => void;

  gameRejoined: (data: {
    gameId: string;
    me: GamePlayer;
    fen: string;
    clocks: ClocksType;
    turn: PlayerColor;
    opponent: GamePlayer;
  }) => void;

  promotionRequest: (res: {
    ok: boolean;
    promotionRequired: boolean;
    from: string;
    to: string;
  }) => void;

  playerJoined: (data: {
    opponent: { username: string; rating: number };
  }) => void;

  "opponent:disconnected": (data: { message: string }) => void;

  timerUpdate: (data: ClocksType) => void;

  moveMade: (data: {
    ok: boolean;
    fen: string;
    move: MoveEntry;
    turn: PlayerColor;
    status: "ongoing" | "check" | "ended" | null;
    result: Result | null;
    winner: PlayerColor | null;
    soundType: "move" | "capture" | "castle" | "promote" | "check" | "end";
  }) => void;

  gameOver: (data: {
    result: Result;
    winner: PlayerColor | null;
    message: string;
  }) => void;

  inGame: (data: { message: string; gameId: string; mode: string }) => void;

  error: (data: { message: string }) => void;

  moveError: (data: { message: string }) => void;

  roomError: (data: { message: string }) => void;
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
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  any,
  SocketData
>;

export type QueuedPlayer = {
  socketId: string;
  userId: string;
  username: string;
  elo: number;
  queuedAt: Date;
};

export type GamePlayer = {
  socketId: string;
  userId: string;
  username: string;
  elo: number;
  color: PlayerColor;
};

export type ApplyMoveType = {
  identity: string;
  from: string;
  to: string;
  promotion?: "q" | "r" | "n" | "b" | undefined;
};

export type ClocksType = Record<PlayerColor, number>;

export type TimerUpdateCallback = (clocks: ClocksType) => void;
