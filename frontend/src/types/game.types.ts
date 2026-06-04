export interface PopulatedUser {
  _id: string;
  username: string;
  elo: number;
}
export interface GameRecord {
  _id: string;
  gameId: string;
  whitePlayer: PopulatedUser | null;
  blackPlayer: PopulatedUser | null;
  winner: "w" | "b" | null;
  result: string;
  duration: number;
  whiteRating: number;
  blackRating: number;
  whiteRatingChange: number;
  blackRatingChange: number;
  endedAt: string;
  mode?: "ranked" | "friend" | "bot";
}

export interface GameRecordResponse {
  success: boolean;
  message: string;
  data: {
    games: GameRecord[];
    totalPages: number;
  };
}
