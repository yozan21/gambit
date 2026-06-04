import mongoose, { Schema, Document } from "mongoose";
import type {
  PlayerColor,
  MoveEntry,
  Result,
  GameMode,
} from "../utils/types.js";

export interface IGameRecord extends Document {
  gameId: string;
  whitePlayer: mongoose.Types.ObjectId | null;
  blackPlayer: mongoose.Types.ObjectId | null;
  winner: PlayerColor | null;
  result: Result;
  moves: MoveEntry[];
  mode: GameMode;
  history: string[];
  finalFen: string;
  duration: number;
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
    history: [String],
    finalFen: { type: String, required: true },
    duration: { type: Number, required: true },
    whiteRating: { type: Number, required: true },
    blackRating: { type: Number, required: true },
    whiteRatingChange: { type: Number, required: true },
    blackRatingChange: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

export const GameRecord = mongoose.model<IGameRecord>(
  "GameRecord",
  GameRecordSchema,
);
