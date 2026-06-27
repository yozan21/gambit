import { StockfishPool } from "@se-oss/stockfish";

class StockfishService {
  private pool: StockfishPool | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 min

  private async getPool(): Promise<StockfishPool> {
    if (!this.pool) {
      this.pool = new StockfishPool(1);
      await this.pool.initialize();

      // Set options once after init
      const engine = await this.pool.acquire();
      await engine.setOptions({ Hash: 16, Threads: 1 });
      this.pool.release(engine);
    }
    this.resetIdleTimer();
    return this.pool;
  }

  private resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(async () => {
      this.pool?.terminate();
      this.pool = null;
    }, this.IDLE_TIMEOUT);
  }

  async getBestMove(fen: string, level: number): Promise<string> {
    const pool = await this.getPool();
    const engine = await pool.acquire();
    try {
      await engine.setOptions({ "Skill Level": this.levelToSkill(level) }); // only skill level per move
      const result = await engine.analyze(fen, this.levelToDepth(level));
      if (!result.bestmove || result.bestmove === "(none)")
        throw new Error("No move available");
      return result.bestmove;
    } finally {
      pool.release(engine);
    }
  }

  async getHintMove(fen: string): Promise<string> {
    const pool = await this.getPool();
    const engine = await pool.acquire();
    try {
      await engine.setOptions({ "Skill Level": 20 }); // only skill level per move
      const result = await engine.analyze(fen, 12);
      if (!result.bestmove || result.bestmove === "(none)")
        throw new Error("No move available");
      return result.bestmove;
    } finally {
      pool.release(engine);
    }
  }

  // Map 1-100 to Stockfish Skill Level 0-20
  private levelToSkill(level: number): number {
    return Math.floor(((level - 1) / 99) * 20);
  }

  // Map 1-100 to depth 1-15
  // Capped at 15 to keep response times reasonable (depth 15 ≈ 1-3s)
  private levelToDepth(level: number): number {
    return Math.max(1, Math.floor(((level - 1) / 99) * 14) + 1);
  }
}

export const stockfishService = new StockfishService();
