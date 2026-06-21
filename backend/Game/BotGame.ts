import { Chess, type Move, type Square } from "chess.js";
import mongoose from "mongoose";
import type {
  PlayerColor,
  MoveEntry,
  ApplyMoveType,
  GamePlayer,
  Result,
} from "../utils/types.js";
import { GameRecord } from "../models/gameRecord.model.js";
import { User } from "../models/user.model.js";
import { stockfishService } from "../services/stockFish.service.js";

const FREE_HINTS = 3;

export default class BotGame {
  public id: string;
  public chess: Chess;
  public level: number;
  public player: GamePlayer;
  public playerColor: PlayerColor;
  public botColor: PlayerColor;
  public moves: MoveEntry[];
  public history: string[];
  public phase: "active" | "ended";
  public status: "ongoing" | "check" | "ended" | null;
  public result: Result | null;
  public winner: PlayerColor | null;
  public startedAt: Date;
  public hintsUsed: number;
  public hintsAllowed: number;
  public isBotThinking: boolean;
  public lastHintFen: string | null = null;
  public lastHintMove: { from: string; to: string } | null = null;

  constructor(
    id: string,
    player: GamePlayer,
    level: number,
    playerColor: PlayerColor = "w",
  ) {
    this.id = id;
    this.chess = new Chess();
    this.level = level;
    this.player = player;
    this.playerColor = playerColor;
    this.botColor = playerColor === "w" ? "b" : "w";
    this.moves = [];
    this.history = [];
    this.phase = "active";
    this.status = "ongoing";
    this.result = null;
    this.winner = null;
    this.startedAt = new Date();
    this.hintsUsed = 0;
    this.hintsAllowed = FREE_HINTS;
    this.isBotThinking = false;
  }

  isPlayerTurn(): boolean {
    return this.chess.turn() === this.playerColor;
  }

  getFen(): string {
    return this.chess.fen();
  }

  getTurn(): PlayerColor {
    return this.chess.turn();
  }

  getHintsRemaining(): number {
    return Math.max(0, this.hintsAllowed - this.hintsUsed);
  }

  applyMove({ from, to, promotion }: Omit<ApplyMoveType, "identity">) {
    if (!this.isPlayerTurn()) {
      return { ok: false, message: "NOT_YOUR_TURN" };
    }

    if (this.phase === "ended") {
      return { ok: false, message: "GAME_ENDED" };
    }

    const piece = this.chess.get(from as Square);
    const requiresPromotion =
      piece?.type === "p" &&
      ((piece.color === "w" && to.endsWith("8")) ||
        (piece.color === "b" && to.endsWith("1")));

    if (requiresPromotion && !promotion) {
      return { ok: true, promotionRequired: true, from, to };
    }

    let move: Move;
    try {
      move = promotion
        ? this.chess.move({ from, to, promotion })
        : this.chess.move({ from, to });
    } catch {
      return { ok: false, message: "INVALID_MOVE" };
    }

    if (!move) return { ok: false, message: "ILLEGAL_MOVE" };

    const moveEntry = this.toMoveEntry(move);
    this.moves.push(moveEntry);
    this.history.push(this.chess.fen());
    this.updateStatus();

    return {
      ok: true,
      fen: this.chess.fen(),
      move: moveEntry,
      moves: this.moves,
      turn: this.getTurn(),
      status: this.status,
      result: this.result,
      winner: this.winner,
      soundType: this.getSoundType(move),
    };
  }

  async getBotMove(): Promise<{
    ok: boolean;
    fen?: string;
    move?: MoveEntry;
    moves?: MoveEntry[];
    turn?: PlayerColor;
    status?: "ongoing" | "check" | "ended" | null;
    result?: Result | null;
    winner?: PlayerColor | null;
    soundType?: string;
    message?: string;
  }> {
    if (this.phase === "ended") return { ok: false, message: "GAME_ENDED" };
    if (this.isBotThinking) return { ok: false, message: "BOT_THINKING" };

    this.isBotThinking = true;

    try {
      const bestMove = await stockfishService.getBestMove(
        this.chess.fen(),
        this.level,
      );

      // Parse the move (e.g. "e2e4" or "e7e8q" for promotion)
      const from = bestMove.slice(0, 2);
      const to = bestMove.slice(2, 4);
      const promotion = bestMove[4] as "q" | "r" | "n" | "b" | undefined;

      let move: Move;
      try {
        move = promotion
          ? this.chess.move({ from, to, promotion })
          : this.chess.move({ from, to });
      } catch {
        return { ok: false, message: "BOT_INVALID_MOVE" };
      }

      const moveEntry = this.toMoveEntry(move);
      this.moves.push(moveEntry);
      this.history.push(this.chess.fen());
      this.updateStatus();

      return {
        ok: true,
        fen: this.chess.fen(),
        move: moveEntry,
        moves: this.moves,
        turn: this.getTurn(),
        status: this.status,
        result: this.result,
        winner: this.winner,
        soundType: this.getSoundType(move),
      };
    } catch (err) {
      console.error("Bot move error:", err);
      return { ok: false, message: "BOT_ERROR" };
    } finally {
      this.isBotThinking = false;
    }
  }

  async getHint(): Promise<{
    ok: boolean;
    from?: string;
    to?: string;
    hintsRemaining?: number;
    reason?: string;
  }> {
    if (!this.isPlayerTurn()) {
      return { ok: false };
    }
    if (this.isBotThinking) {
      return { ok: false, reason: "already_processing" };
    }

    const currentFen = this.chess.fen();

    // Same position as last hint — return cached, don't decrement
    if (this.lastHintFen === currentFen && this.lastHintMove) {
      return {
        ok: true,
        from: this.lastHintMove.from,
        to: this.lastHintMove.to,
        hintsRemaining: this.getHintsRemaining(),
      };
    }

    if (this.hintsUsed >= this.hintsAllowed) {
      return { ok: false, reason: "ad_required" };
    }
    this.isBotThinking = true;
    try {
      const bestMove = await stockfishService.getBestMove(
        this.chess.fen(),
        this.level,
      );

      this.hintsUsed++;
      this.lastHintFen = currentFen;
      this.lastHintMove = {
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
      };

      return {
        ok: true,
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        hintsRemaining: this.getHintsRemaining(),
      };
    } catch (err) {
      console.error("Bot move error:", err);

      return {
        ok: false,
        reason: "BOT_ERROR",
      };
    } finally {
      this.isBotThinking = false;
    }
  }

  undoMove(): {
    ok: boolean;
    fen?: string;
    moves?: MoveEntry[];
    turn?: PlayerColor;
    message?: string;
  } {
    // Need at least 2 moves to undo (player + bot)
    if (this.moves.length < 2) {
      return { ok: false, message: "NOTHING_TO_UNDO" };
    }

    // Undo bot move then player move
    this.chess.undo();
    this.chess.undo();
    this.moves.splice(-2, 2);
    this.history.splice(-2, 2);

    this.status = this.chess.isCheck() ? "check" : "ongoing";
    this.result = null;
    this.winner = null;
    this.phase = "active";

    return {
      ok: true,
      fen: this.chess.fen(),
      moves: this.moves,
      turn: this.getTurn(),
    };
  }

  restart(): void {
    this.chess = new Chess();
    this.moves = [];
    this.history = [];
    this.phase = "active";
    this.status = "ongoing";
    this.result = null;
    this.winner = null;
    this.hintsUsed = 0;
    this.startedAt = new Date();
    this.isBotThinking = false;
  }

  useAdHint(): void {
    this.hintsAllowed += 1;
  }

  private getSoundType(move: Move) {
    if (this.status === "ended") return "end";
    if (this.chess.isCheck()) return "check";
    if (move.promotion) return "promote";
    if (move.isKingsideCastle() || move.isQueensideCastle()) return "castle";
    if (move.captured) return "capture";
    return "move";
  }

  private toMoveEntry(move: Move): MoveEntry {
    return {
      san: move.san,
      piece: move.piece,
      color: move.color,
      from: move.from,
      to: move.to,
      moveNumber: Math.ceil((this.moves.length + 1) / 2),
      captured: move.captured ?? null,
      promotion: move.promotion ?? null,
    };
  }

  private updateStatus() {
    this.result = null;
    this.winner = null;

    if (this.chess.isCheckmate()) {
      this.status = "ended";
      this.result = "checkmate";
      this.phase = "ended";
      this.winner = this.chess.turn() === "w" ? "b" : "w";
      return;
    }
    if (this.chess.isStalemate()) {
      this.status = "ended";
      this.result = "stalemate";
      this.phase = "ended";
      return;
    }
    if (this.chess.isThreefoldRepetition()) {
      this.status = "ended";
      this.phase = "ended";
      this.result = "threefold_repetition";
      return;
    }
    if (this.chess.isInsufficientMaterial()) {
      this.status = "ended";
      this.phase = "ended";
      this.result = "insufficient_material";
      return;
    }
    if (this.chess.isDraw()) {
      this.status = "ended";
      this.phase = "ended";
      this.result = "draw";
      return;
    }
    if (this.chess.isCheck()) {
      this.status = "check";
      return;
    }
    this.status = "ongoing";
  }

  getDuration(): number {
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  }

  async save(
    status: "in_progress" | "completed" | "abandoned",
    unlockLevel?: boolean,
  ): Promise<void> {
    const isDraw =
      this.result === "draw" ||
      this.result === "stalemate" ||
      this.result === "threefold_repetition" ||
      this.result === "insufficient_material" ||
      !this.result;

    const playerWon = this.winner === this.playerColor;
    const playerLost = this.winner === this.botColor;

    try {
      await GameRecord.findOneAndUpdate(
        { gameId: this.id },
        {
          $set: {
            gameId: this.id,
            whitePlayer:
              this.playerColor === "w"
                ? new mongoose.Types.ObjectId(this.player.userId)
                : null,
            blackPlayer:
              this.playerColor === "b"
                ? new mongoose.Types.ObjectId(this.player.userId)
                : null,
            winner: this.winner,
            result: isDraw ? "Draw" : this.result,
            mode: "bot",
            moves: this.moves,
            history: this.history,
            finalFen: this.getFen(),
            duration: this.getDuration(),
            startedAt: this.startedAt,
            endedAt: new Date(),
            whiteRating: this.player.elo,
            blackRating: 0,
            whiteRatingChange: 0,
            blackRatingChange: 0,
            botLevel: this.level,
            status,
          },
        },
        { upsert: true },
      );

      if (status === "completed") {
        await User.findByIdAndUpdate(this.player.userId, {
          $inc: {
            "stats.botGamesPlayed": 1,
            "stats.botWins": playerWon ? 1 : 0,
            "stats.botLosses": playerLost ? 1 : 0,
          },
          ...(unlockLevel &&
            playerWon && {
              $max: { unlockedBotLevel: this.level + 1 },
            }),
          $push: { games: this.id },
        });
      }
    } catch (err) {
      console.error("Failed to save bot game:", err);
    }
  }
}
