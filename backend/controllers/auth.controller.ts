import type { FastifyReply, FastifyRequest } from "fastify";
import {
  loginService,
  refreshService,
  signupService,
} from "../services/auth.service.js";
import type { LoginBody, SignupBody } from "../utils/types.js";
import apiResponse from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { sendOtpEmail } from "../services/email.service.js";
import ApiError from "../utils/ApiError.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookieUtils.js";

export const login = async (
  req: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) => {
  const { tokens, user } = await loginService(req.body);
  setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
  return apiResponse(reply, {
    statusCode: 200,
    message: "Login successful",
    data: { user },
  });
};

export const signup = async (
  req: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply,
) => {
  delete req.body.confirmPassword;
  const { tokens, user } = await signupService(req.body);
  console.log(tokens);
  setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
  return apiResponse(reply, {
    statusCode: 201,
    message: "Signup successful",
    data: { user },
  });
};

export const refresh = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id, role, tokenVersion } = await req.refreshJwtVerify();
    if (!tokenVersion) throw new ApiError("Unauthorized", 403);
    const { tokens } = await refreshService({ id, role, tokenVersion });
    setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
    return apiResponse(reply, {
      statusCode: 200,
      message: "Tokens refreshed",
    });
  } catch {
    throw new ApiError("Unauthorized", 403);
  }
};

export const logout = async (req: FastifyRequest, reply: FastifyReply) => {
  clearAuthCookies(reply);
  return apiResponse(reply, {
    statusCode: 200,
    message: "Logout successful",
  });
};

// controllers/auth.controller.ts

// Step 1 — request OTP
export async function forgotPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email } = req.body as { email: string };

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists — always return success
    return reply.send({
      success: true,
      message: "If this email exists, an OTP has been sent",
    });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing OTP for this email
  await Otp.deleteMany({ email });

  // Save new OTP
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendOtpEmail(email, otp);

  return reply.send({ success: true, message: "OTP sent to your email" });
}

// Step 2 — verify OTP
export async function verifyOtp(req: FastifyRequest, reply: FastifyReply) {
  const { email, otp } = req.body as { email: string; otp: string };

  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  return reply.send({ success: true, message: "OTP verified" });
}

// Step 3 — reset password
export async function resetPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email, otp, newPassword } = req.body as {
    email: string;
    otp: string;
    newPassword: string;
  };

  // Verify OTP again
  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("User not found", 404);

  user.password = newPassword; // pre-save hook hashes it
  await user.save();

  // Delete used OTP
  await Otp.deleteMany({ email });

  return reply.send({ success: true, message: "Password reset successfully" });
}
