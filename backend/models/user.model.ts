import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

/* ================================
   1️⃣ Raw database fields
================================ */
export interface IUser {
  username: string;
  fullName: string;
  email: string;
  password: string;

  role: "user" | "admin";

  elo: number;

  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };

  games: mongoose.Types.ObjectId[];

  changedPasswordAt: Date;
  tokenVersion: number;

  createdAt: Date;
  updatedAt: Date;
}

/* ================================
   2️⃣ Instance methods
================================ */
export interface IUserMethods {
  isCorrectPassword(candidatePassword: string): Promise<boolean>;
}

/* ================================
   3️⃣ Document type (Mongo doc)
================================ */
export type UserDocument = mongoose.HydratedDocument<IUser, IUserMethods>;

/* ================================
   4️⃣ Schema
================================ */
const UserSchema = new Schema<
  IUser,
  Model<IUser, {}, IUserMethods>,
  IUserMethods
>(
  {
    username: {
      type: String,
      required: [true, "Please provide a unique username"],
      unique: true,
      trim: true,
      minlength: 3,
      index: true,
    },

    fullName: {
      type: String,
      trim: true,
      set: (v: string) =>
        v
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" "),
      required: [true, "Fullname is required"],
    },

    email: {
      type: String,
      required: [true, "Please provide a unique email"],
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required!"],
      select: false, // hidden by default
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    elo: {
      type: Number,
      default: 400,
      index: true,
    },

    stats: {
      gamesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },

    games: [
      {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },
    ],
    tokenVersion: {
      type: Number,
      default: 1,
    },
    changedPasswordAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ================================
   5️⃣ Password Hashing Middleware
================================ */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* ================================
   6️⃣ Instance Method
================================ */
UserSchema.methods.isCorrectPassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ================================
   7️⃣ Model Export
================================ */
export const User = mongoose.model<IUser, Model<IUser, {}, IUserMethods>>(
  "User",
  UserSchema,
);
