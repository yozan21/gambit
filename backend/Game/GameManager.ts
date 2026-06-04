import type { GameMode, TimerUpdateCallback } from "../utils/types.js";
import Game from "./Game.js";

class GameManager {
  private games = new Map<string, Game>();

  createGame(timerCallback: TimerUpdateCallback, mode: GameMode): Game {
    const id = crypto.randomUUID();
    const game = new Game(id, timerCallback, mode);
    this.games.set(id, game);
    return game;
  }

  getGame(id: string) {
    return this.games.get(id);
  }

  getGameByUserId(userId: string) {
    for (const game of this.games.values()) {
      if (game.getPlayerByUserId(userId)) {
        return game;
      }
    }
    return null;
  }

  removeGame(id: string) {
    this.games.delete(id);
  }
}

export const gameManager = new GameManager();
