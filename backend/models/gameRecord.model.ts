import mongoose, { Schema, Document } from "mongoose";
import type {
  PlayerColor,
  MoveEntry,
  Result,
  GameMode,
} from "../utils/types.js";

export interface IGameRecord extends Document {
  gameId: string;
  status: "in_progress" | "completed" | "abandoned";
  hintsUsed: number;
  hintsAllowed: number;
  whitePlayer: mongoose.Types.ObjectId | null;
  blackPlayer: mongoose.Types.ObjectId | null;
  winner: PlayerColor | null;
  result: Result;
  moves: MoveEntry[];
  mode: GameMode;
  botLevel: number | null;
  history: string[];
  finalFen: string;
  duration: number;
  boardStatus: "ongoing" | "check" | "ended";
  whiteRating: number;
  blackRating: number;
  whiteRatingChange: number;
  blackRatingChange: number;
  startedAt: Date;
  endedAt: Date;
}

const MoveEntrySchema = new Schema(
  {
    san: String,
    piece: String,
    color: String,
    from: String,
    to: String,
    moveNumber: Number,
    captured: { type: String, default: null },
    promotion: { type: String, default: null },
  },
  { _id: false },
);

const GameRecordSchema = new Schema<IGameRecord>(
  {
    gameId: { type: String, required: true, unique: true },
    whitePlayer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    blackPlayer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    winner: { type: String, enum: ["w", "b", null], default: null },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "completed",
    },
    result: {
      type: String,
      required: true,
      enum: [
        "checkmate",
        "resignation",
        "stalemate",
        "draw",
        "threefold_repetition",
        "insufficient_material",
        "timeout",
        "abandonment",
      ],
    },
    moves: [MoveEntrySchema],
    mode: {
      type: String,
      required: true,
      enum: ["bot", "friend", "ranked"],
    },
    botLevel: { type: Number, default: null },
    history: [String],
    finalFen: { type: String, required: true },
    duration: { type: Number, required: true },
    boardStatus: {
      type: String,
      enum: ["ongoing", "check", "ended"],
      default: "ended",
      required: true,
    },
    whiteRating: { type: Number, required: true },
    blackRating: { type: Number, required: true },
    whiteRatingChange: { type: Number, required: true },
    blackRatingChange: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true, default: Date.now },
    hintsAllowed: { type: Number, default: 5 },
    hintsUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const GameRecord = mongoose.model<IGameRecord>(
  "GameRecord",
  GameRecordSchema,
);
