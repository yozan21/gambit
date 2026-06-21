import { StockfishPool } from "@se-oss/stockfish";

class StockfishService {
  private pool: StockfishPool;

  constructor() {
    this.pool = new StockfishPool(4);
    this.pool
      .initialize()
      .then(() => {
        console.log("Stockfish pool ready");
      })
      .catch((err) => {
        console.error("Stockfish pool init failed:", err);
      });
  }

  async getBestMove(fen: string, level: number): Promise<string> {
    const engine = await this.pool.acquire();

    try {
      const skillLevel = this.levelToSkill(level);
      const depth = this.levelToDepth(level);

      await engine.setOptions({ "Skill Level": skillLevel });

      const result = await engine.analyze(fen, depth);

      if (!result.bestmove || result.bestmove === "(none)") {
        throw new Error("No move available");
      }

      return result.bestmove;
    } finally {
      this.pool.release(engine);
    }
  }

  async getHintMove(fen: string, level: number): Promise<string> {
    // Hints use slightly deeper analysis for better suggestion
    const hintLevel = Math.min(100, level + 10);
    return this.getBestMove(fen, hintLevel);
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
