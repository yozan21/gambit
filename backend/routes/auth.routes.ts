import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  completeGoogleProfile,
  forgotPassword,
  googleCallback,
  login,
  logout,
  refresh,
  resetPassword,
  signup,
  verifyOtp,
} from "../controllers/auth.controller.js";
import {
  AuthResponseSchema,
  ForgotPasswordBodySchema,
  LoginBodySchema,
  ResetPasswordBodySchema,
  SignupBodySchema,
  VerifyOtpBodySchema,
} from "../utils/schemas.js";
import type { SignupBody } from "../utils/types.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const authRoutes = async function (app: FastifyInstance) {
  app.post("/login", {
    schema: {
      body: LoginBodySchema,
      response: {
        200: AuthResponseSchema,
      },
    },
    handler: login,
  });

  app.post("/signup", {
    schema: {
      body: SignupBodySchema,
      response: {
        201: AuthResponseSchema,
      },
    },

    preValidation: async (req: FastifyRequest<{ Body: SignupBody }>) => {
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        throw new ApiError("Passwords do not match", 400);
      }
    },

    handler: signup,
  });

  app.get("/google/callback", googleCallback);
  app.post("/google/complete", completeGoogleProfile);

  app.post("/refresh", refresh);
  app.post("/logout", logout);

  app.get("/check-username", async (req, reply) => {
    const { username } = req.query as { username: string };

    if (!username || username.length < 3) {
      return reply.send({ available: false });
    }

    const existing = await User.findOne({ username });
    return reply.send({ available: !existing });
  });

  app.post("/check-email", async (req, reply) => {
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email });
    return reply.send({ exists: !!user });
  });

  app.post("/forgot-password", {
    schema: { body: ForgotPasswordBodySchema },
    handler: forgotPassword,
  });
  app.post("/verify-otp", {
    schema: {
      body: VerifyOtpBodySchema,
    },
    handler: verifyOtp,
  });
  app.post("/reset-password", {
    schema: {
      body: ResetPasswordBodySchema,
    },
    handler: resetPassword,
  });
};

export default authRoutes;
