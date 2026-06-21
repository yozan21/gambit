import BotGame from "./BotGame.js";
import type { GamePlayer, PlayerColor } from "../utils/types.js";

class BotGameManager {
  private games = new Map<string, BotGame>();

  createGame(
    player: GamePlayer,
    level: number,
    playerColor: PlayerColor,
  ): BotGame {
    const id = crypto.randomUUID();
    const game = new BotGame(id, player, level, playerColor);
    this.games.set(id, game);
    return game;
  }

  getGame(id: string): BotGame | undefined {
    return this.games.get(id);
  }

  getGameByUserId(userId: string): BotGame | undefined {
    for (const game of this.games.values()) {
      if (game.player.userId === userId) return game;
    }
    return undefined;
  }

  removeGame(id: string): void {
    this.games.delete(id);
  }
}

export const botGameManager = new BotGameManager();
