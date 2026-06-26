import fastifyFormBody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./utils/errorHandler.js";
import ApiError from "./utils/ApiError.js";
import mongoDB from "./plugins/mongoDB.js";
import socket from "./plugins/socket.js";
import ajvErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { Ajv } from "ajv";
import oauth2, { fastifyOauth2 } from "@fastify/oauth2";

async function buildAppRaw(app: FastifyInstance) {
  // Plugins
  // 1. Initialize AJV with allErrors: true (required for ajv-errors)
  const ajv = new Ajv({
    allErrors: true,
    strict: false, // Useful if you use custom keywords like 'errorMessage'
    removeAdditional: false,
  });

  addFormats.default(ajv);
  // 2. Manually register the errors plugin
  ajvErrors.default(ajv);

  // 3. Tell Fastify to use this specific AJV instance
  app.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

  await app.register(cookie);
  await app.register(jwt, {
    namespace: "access",
    secret: process.env.JWT_ACCESS_SECRET!,
    cookie: {
      cookieName: "accessToken", // 👈 The key name used in your cookie store
      signed: false, // Set to true if using signed/encrypted cookies
    },
  });

  await app.register(jwt, {
    namespace: "refresh",
    secret: process.env.JWT_REFRESH_SECRET!,
    cookie: {
      cookieName: "refreshToken", // 👈 The key name used in your cookie store
      signed: false, // Set to true if using signed/encrypted cookies
    },
  });

  await app.register(fastifyFormBody);
  await app.register(cors, {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // Add after cors registration
  await app.register(oauth2, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/v1/auth/google",
    callbackUri: process.env.GOOGLE_CALLBACK_URL!,
  });

  //DATABASE
  await app.register(mongoDB);

  // Socket.IO
  await app.register(socket);

  // Global schema
  app.addSchema({
    $id: "user",
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      fullName: { type: "string" },
      avatar: { type: "string" },
      email: { type: "string" },
      elo: { type: "number" },
      stats: {
        type: "object",
        properties: {
          botGamesPlayed: { type: "number" },
          botWins: { type: "number" },
          botLosses: { type: "number" },
          gamesPlayed: { type: "number" },
          wins: { type: "number" },
          losses: { type: "number" },
          draws: { type: "number" },
        },
      },
      unlockedBotLevel: { type: "number" },
      completedBotLevels: { type: "array" },

      games: { type: "array" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  });

  //health
  app.get("/health", async () => {
    const mem = process.memoryUsage();
    return {
      rss: `${Math.round(mem.rss / 1024 / 1024)} MB`, // total RAM used by process
      heap: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`, // V8 heap
      external: `${Math.round(mem.external / 1024 / 1024)} MB`, // WASM/native (Stockfish lives here)
    };
  });

  // Routes
  await app.register(userRoutes, { prefix: "/api/v1/users" });
  await app.register(authRoutes, { prefix: "/api/v1/auth" });

  // Error handling
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(async (req, reply) => {
    throw new ApiError(`Cannot ${req.method} ${req.url} on this server`, 404);
  });
}

export const buildApp = fp(buildAppRaw);
