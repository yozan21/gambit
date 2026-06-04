import { Chess, type Move, type Square } from "chess.js";
import mongoose from "mongoose";
import type {
  PlayerColor,
  MoveEntry,
  QueuedPlayer,
  ApplyMoveType,
  TimerUpdateCallback,
  ClocksType,
  GamePlayer,
  Result,
  GameMode,
} from "../utils/types.js";
import { GameRecord } from "../models/gameRecord.model.js";
import { User } from "../models/user.model.js";
import { calculateElo, calculateEloDraw } from "../utils/elo.js";

export default class Game {
  public id: string;
  public fen: string;
  public chess: Chess;
  public mode: GameMode;
  public players: Map<PlayerColor, GamePlayer>;
  public startedAt: Date | null;
  public phase: "waiting" | "active" | "ended";
  public status: "ongoing" | "check" | "ended" | null;
  public moves: MoveEntry[];
  public result: Result | null;
  public history: string[];
  public winner: PlayerColor | null;
  public clocks: ClocksType;
  public timerCallback: TimerUpdateCallback;
  public activeTimer: NodeJS.Timeout | null = null;

  constructor(id: string, timerCallback: TimerUpdateCallback, mode: GameMode) {
    this.id = id;
    this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.chess = new Chess();
    this.players = new Map();
    this.startedAt = null;
    this.status = null;
    this.phase = "waiting";
    this.mode = mode;
    this.moves = [];
    this.history = [];
    this.result = null;
    this.winner = null;
    this.timerCallback = timerCallback;
    this.clocks = { w: 600000, b: 600000 }; // 10 minutes
  }

  addPlayer({
    socketId,
    userId,
    username,
    elo,
  }: QueuedPlayer): PlayerColor | null {
    if (this.players.size >= 2) return null;
    const color: PlayerColor = this.players.size === 0 ? "w" : "b";
    this.players.set(color, { socketId, userId, username, elo, color });

    if (this.players.size === 2) {
      this.status = "ongoing";
      this.phase = "active";
      this.startedAt = new Date();
    }

    return color;
  }

  getPlayerByUserId(userId: string): GamePlayer | null {
    for (const player of this.players.values()) {
      if (player.userId === userId) return player;
    }
    return null;
  }

  updateSocketId(userId: string, socketId: string): void {
    const player = this.getPlayerByUserId(userId);
    if (player) player.socketId = socketId;
  }

  getPlayerByColor(color: PlayerColor): GamePlayer | null {
    return this.players.get(color) || null;
  }

  getOpponent(userId: string): GamePlayer | null {
    for (const player of this.players.values()) {
      if (player.userId !== userId) return player;
    }
    return null;
  }

  isPlayerTurn(identity: string): boolean {
    const player = [...this.players.values()].find(
      (p) => p.userId === identity || p.socketId === identity,
    );
    if (!player) return false;
    return player.color === this.chess.turn();
  }

  getFen(): string {
    return this.chess.fen();
  }
  getTurn(): PlayerColor {
    return this.chess.turn();
  }
  getClocks(): ClocksType {
    return this.clocks;
  }

  applyMove({ identity, from, to, promotion }: ApplyMoveType) {
    if (!this.isPlayerTurn(identity))
      return { ok: false, message: "ILLEGAL_MOVE" };
    const piece = this.chess.get(from as Square);
    const requiresPromotion =
      piece?.type === "p" &&
      ((piece.color === "w" && to.endsWith("8")) ||
        (piece.color === "b" && to.endsWith("1")));

    if (requiresPromotion && !promotion) {
      return { ok: true, promotionRequired: true, from, to };
    }

    let move;
    try {
      move = promotion
        ? this.chess.move({ from, to, promotion })
        : this.chess.move({ from, to });
    } catch {
      return { ok: false, message: "INVALID_MOVE" };
    }

    if (!move) return { ok: false, message: "ILLEGAL_MOVE" };

    const moveEntry = this.toMoveEntry(move);
    this.addMoveToHistory(moveEntry);
    this.addFENHistory(this.chess.fen());
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

  private addMoveToHistory(move: MoveEntry): void {
    this.moves.push(move);
  }
  private addFENHistory(fen: string) {
    this.history.push(fen);
  }

  getDuration(): number | void {
    if (this.startedAt)
      return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
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
    } else {
      this.status = "ongoing";
    }
  }

  async endGame(reason: Result, winner?: "w" | "b" | null) {
    const drawResults: Result[] = [
      "draw",
      "stalemate",
      "threefold_repetition",
      "insufficient_material",
    ];

    if (drawResults.includes(reason)) {
      this.winner = null;
    } else if (winner !== undefined) {
      this.winner = winner; // ← use explicitly passed winner
    } else if (reason !== "checkmate") {
      this.winner = this.getTurn() === "w" ? "b" : "w";
    }

    this.phase = "ended";
    this.status = "ended";
    this.result = reason;

    try {
      await this.save();
    } catch (err) {
      console.error("Failed to save game:", err);
    }
  }

  async save(): Promise<void> {
    const white = this.getPlayerByColor("w")!;
    const black = this.getPlayerByColor("b")!;
    const isDraw = !this.winner;

    let whiteRatingChange = 0;
    let blackRatingChange = 0;

    if (this.mode === "ranked") {
      if (isDraw) {
        const { player1Change, player2Change } = calculateEloDraw(
          white.elo,
          black.elo,
        );
        whiteRatingChange = player1Change;
        blackRatingChange = player2Change;
      } else {
        const winner = this.getPlayerByColor(this.winner!)!;
        const loser = this.getPlayerByColor(this.winner === "w" ? "b" : "w")!;
        const { winnerChange, loserChange } = calculateElo(
          winner.elo,
          loser.elo,
        );
        whiteRatingChange = this.winner === "w" ? winnerChange : loserChange;
        blackRatingChange = this.winner === "b" ? winnerChange : loserChange;
      }
    }

    const gameRecord = await GameRecord.create({
      gameId: this.id,
      whitePlayer: new mongoose.Types.ObjectId(white.userId),
      blackPlayer: new mongoose.Types.ObjectId(black.userId),
      winner: this.winner,
      result: this.result!,
      mode: this.mode,
      moves: this.moves,
      finalFen: this.getFen(),
      duration: this.getDuration() ?? 0,
      startedAt: this.startedAt!,
      endedAt: new Date(),
      whiteRating: white.elo,
      blackRating: black.elo,
      whiteRatingChange,
      blackRatingChange,
    });

    const gameRecordId = (gameRecord as any)._id;

    await Promise.all([
      User.findByIdAndUpdate(white.userId, {
        $inc: {
          elo: whiteRatingChange,
          "stats.gamesPlayed": 1,
          "stats.wins": this.winner === "w" ? 1 : 0,
          "stats.losses": this.winner === "b" ? 1 : 0,
          "stats.draws": isDraw ? 1 : 0,
        },
        $push: { games: gameRecordId },
      }),
      User.findByIdAndUpdate(black.userId, {
        $inc: {
          elo: blackRatingChange,
          "stats.gamesPlayed": 1,
          "stats.wins": this.winner === "b" ? 1 : 0,
          "stats.losses": this.winner === "w" ? 1 : 0,
          "stats.draws": isDraw ? 1 : 0,
        },
        $push: { games: gameRecordId },
      }),
    ]);

    console.log(`Game ${this.id} saved successfully`);
  }

  stopGame() {
    if (this.activeTimer) clearInterval(this.activeTimer);
  }

  startTurnTimer() {
    if (this.activeTimer) clearInterval(this.activeTimer);

    const currentTurn = this.getTurn();
    let lastTick = Date.now();

    this.activeTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;

      this.clocks[currentTurn] = Math.max(
        0,
        this.clocks[currentTurn] - elapsed,
      );
      this.timerCallback(this.clocks);

      if (this.clocks[currentTurn] <= 0) {
        clearInterval(this.activeTimer!);
        this.endGame("timeout");
        this.timerCallback(this.clocks);
      }
    }, 100);
  }
}
