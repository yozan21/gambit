import type { FastifyReply, FastifyRequest } from "fastify";
import {
  loginService,
  refreshService,
  signupService,
} from "../services/auth.service.js";
import crypto from "crypto";
import {
  googleLoginService,
  googleSignupService,
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

export const googleCallback = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    // @ts-ignore
    const token =
      await req.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        req,
      );

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${token.token.access_token}` },
      },
    );
    const profile = (await profileRes.json()) as {
      id: string;
      email: string;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
    };

    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.picture;
        await user.save();
      }
      const { tokens } = await googleLoginService(user._id);
      setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
      return reply.redirect(`${clientUrl}/`);
    }
    console.log("Available server decorators:", Object.keys(req.server));
    console.log("Is accessJwt present?:", !!req.server.accessJwt);
    // New user — temp token
    const tempToken = req.server.accessJwt.sign(
      {
        googleId: profile.id,
        email: profile.email,
        fullName: profile.name,
        avatar: profile.picture,
        isGoogleTemp: true,
      },
      { expiresIn: "5m" },
    );

    const base = `${profile.given_name}_${profile.family_name}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    const suffix = crypto.randomInt(1000, 9999);
    const suggestedUsername = `${base}_${suffix}`;

    return reply.redirect(
      `${clientUrl}/complete-profile?token=${tempToken}&username=${suggestedUsername}`,
    );
  } catch (err) {
    console.error("Google OAuth error:", err);
    return reply.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};

export const completeGoogleProfile = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { token, username, fullName } = req.body as {
    token: string;
    username: string;
    fullName: string;
  };

  let payload: any;
  try {
    payload = req.server.accessJwt.verify(token);
  } catch {
    throw new ApiError("Invalid or expired session. Please try again.", 400);
  }

  if (!payload.isGoogleTemp) throw new ApiError("Invalid token", 400);

  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new ApiError("Username already taken", 400);

  const { tokens, user } = await googleSignupService({
    googleId: payload.googleId,
    email: payload.email,
    fullName,
    username,
    avatar: payload.avatar,
  });

  setAuthCookies(reply, tokens.accessToken, tokens.refreshToken);
  return apiResponse(reply, {
    statusCode: 201,
    message: "Account created successfully",
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
    return reply.send({
      success: true,
      message: "If this email exists, an OTP has been sent",
    });
  }

  // Check 60s cooldown
  const existing = await Otp.findOne({ email });
  if (existing) {
    const secondsSinceLastSent =
      (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSent < 120) {
      const retryAfter = Math.ceil(120 - secondsSinceLastSent);
      return reply.status(429).send({
        success: false,
        message: `Please wait ${retryAfter} seconds before requesting another OTP`,
        retryAfter,
      });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    lastSentAt: new Date(),
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
