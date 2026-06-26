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

const FREE_HINTS = 5;

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
  public status: "ongoing" | "check" | "ended";
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

  // How often to pick a completely random legal move instead of asking
  // Stockfish. Scales from ~90% at level 1 to 0% at level 35+.
  // Above level 35 Stockfish handles everything via skill/depth alone.
  private randomMoveChance(): number {
    if (this.level >= 35) return 0;
    return 0.9 * (1 - (this.level - 1) / 34);
  }

  // Thinking delay in ms
  private thinkingDelay(): number {
    // if (process.env.NODE_ENV === "production") return 0;
    const roll = Math.random();

    // At low levels, humans spend more time on every move.
    // At high levels, the artificial delay is short anyway since
    // Stockfish's own computation fills the gap.
    const levelFactor = Math.max(0, 1 - (this.level - 1) / 50);

    let base: number;

    if (roll < 0.15) {
      // Quick instinct move — "I saw this immediately"
      base = 300 + Math.random() * 400;
    } else if (roll < 0.7) {
      // Normal thinking
      base = 800 + Math.random() * 1200;
    } else if (roll < 0.9) {
      // Longer ponder — "hmm let me think about this"
      base = 2000 + Math.random() * 1500;
    } else {
      // Rare deep think — "this position is tricky"
      base = 3500 + Math.random() * 2000;
    }

    // Scale down the delay as level increases — high levels feel snappier
    // because Stockfish's own depth computation fills the remaining time.
    return Math.round(base * levelFactor + 100);
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
      // Thinking delay — runs before move selection so the "thinking" UI
      // is visible even when we end up picking a random move instantly.
      await new Promise((res) => setTimeout(res, this.thinkingDelay()));

      let bestMoveStr: string;

      if (Math.random() < this.randomMoveChance()) {
        // Pick a random legal move — produces genuine beginner mistakes:
        // hanging pieces, missing tactics, random pawn pushes, etc.
        const legalMoves = this.chess.moves({ verbose: true });
        if (legalMoves.length === 0) {
          return { ok: false, message: "NO_LEGAL_MOVES" };
        }
        const picked =
          legalMoves[Math.floor(Math.random() * legalMoves.length)]!;

        bestMoveStr = picked.promotion
          ? `${picked.from}${picked.to}${picked.promotion}`
          : `${picked.from}${picked.to}`;
      } else {
        // Stockfish — skill and depth already scale with level via
        // levelToSkill/levelToDepth in stockfishService.getBestMove.
        bestMoveStr = await stockfishService.getBestMove(
          this.chess.fen(),
          this.level,
        );
      }

      const from = bestMoveStr.slice(0, 2);
      const to = bestMoveStr.slice(2, 4);
      const promotion = bestMoveStr[4] as "q" | "r" | "n" | "b" | undefined;

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
    try {
      this.isBotThinking = true;
      const bestMove = await stockfishService.getHintMove(this.chess.fen());

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
    this.hintsAllowed = FREE_HINTS;
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
      const record = await GameRecord.findOneAndUpdate(
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
            boardStatus: this.status,
            hintsUsed: this.hintsUsed,
            hintsAllowed: this.hintsAllowed,
          },
        },
        { upsert: true, new: true },
      );

      if (status === "completed" && record) {
        await User.findByIdAndUpdate(this.player.userId, {
          $inc: {
            "stats.botGamesPlayed": 1,
            "stats.botWins": playerWon ? 1 : 0,
            "stats.botLosses": playerLost ? 1 : 0,
          },
          ...(unlockLevel && {
            $max: { unlockedBotLevel: this.level + 1 },
          }),
          ...(playerWon && {
            $addToSet: { completedBotLevels: this.level },
          }),
          $push: { games: record._id },
        });
      }
    } catch (err) {
      console.error("Failed to save bot game:", err);
    }
  }
}
