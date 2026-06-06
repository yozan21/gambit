// models/otp.model.ts
import mongoose, { Schema } from "mongoose";
interface IOtp {
  email: string;
  otp: string;
  expiresAt: Date;
  lastSentAt: Date; // ← add this
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, required: true, default: Date.now },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>("Otp", OtpSchema);
