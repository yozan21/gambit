export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  elo: number;
  unlockedBotLevel: number;
  completedBotLevels: number[];
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    botGamesPlayed: number;
    botWins: number;
    botLosses: number;
  };
  games: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestored: boolean;
}
