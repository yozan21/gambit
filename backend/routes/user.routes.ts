import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  getMe,
  getUser,
  getUsers,
  updatePassword,
  updateProfile,
} from "../controllers/user.controller.js";
import {
  UpdatePasswordBodySchema,
  UpdateProfileBodySchema,
  UserResponseSchema,
} from "../utils/schemas.js";
import { authGuard } from "../guard/auth.gaurd.js";
import { getMatchHistory } from "../controllers/gameRecord.controller.js";
import type { UpdatePasswordBody } from "../utils/types.js";
import ApiError from "../utils/ApiError.js";

const userRoutes = async function (app: FastifyInstance) {
  app.get("/", {
    preHandler: [authGuard],
    handler: getUsers,
  });

  app.get("/:id", {
    schema: {
      response: {
        200: UserResponseSchema,
      },
    },
    handler: getUser,
  });

  app.get("/me", {
    schema: {
      response: {
        200: UserResponseSchema,
      },
    },
    preHandler: [authGuard],
    handler: getMe,
  });

  app.patch("/me/updateProfile", {
    schema: {
      body: UpdateProfileBodySchema,
      response: {
        200: UserResponseSchema,
      },
    },
    preHandler: [authGuard],
    handler: updateProfile,
  });

  app.patch("/me/updatePassword", {
    schema: {
      body: UpdatePasswordBodySchema,
    },
    preValidation: async (
      req: FastifyRequest<{ Body: UpdatePasswordBody }>,
    ) => {
      const { newPassword, confirmPassword } = req.body;
      if (newPassword !== confirmPassword) {
        throw new ApiError("Passwords do not match", 400);
      }
    },
    preHandler: [authGuard],
    handler: updatePassword,
  });

  app.get(
    "/me/matchHistory",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            page: { type: "string" },
            limit: { type: "string" },
          },
        },
      },
      preHandler: [authGuard],
    },
    getMatchHistory,
  );
};

export default userRoutes;
