import type { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllUsers,
  getOneUser,
  updateOneUserPassword,
  updateOneUserProfile,
} from "../services/user.service.js";
import sendResponse from "../utils/apiResponse.js";
import type { UpdatePasswordBody, UpdateProfileBody } from "../utils/types.js";
import { setAuthCookies } from "../utils/cookieUtils.js";

export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  const res = await getAllUsers();

  sendResponse(reply, {
    statusCode: 200,
    message: "Users fetched successfully",
    data: {
      users: res,
    },
  });
};

export const getUser = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = req.params;
  const res = await getOneUser(id);

  sendResponse(reply, {
    statusCode: 200,
    message: "User fetched successfully",
    data: {
      user: res,
    },
  });
};

export const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
  const res = await getOneUser(req.user.id);
  sendResponse(reply, {
    statusCode: 200,
    message: "User Profile fetched successfully",
    data: {
      user: res,
    },
  });
};

export const updateProfile = async (
  req: FastifyRequest<{ Body: UpdateProfileBody }>,
  reply: FastifyReply,
) => {
  const updatedUser = await updateOneUserProfile(req.user.id, req.body);
  sendResponse(reply, {
    statusCode: 200,
    message: "Profile updated successfully",
    data: {
      user: updatedUser,
    },
  });
};

export const updatePassword = async (
  req: FastifyRequest<{ Body: UpdatePasswordBody }>,
  reply: FastifyReply,
) => {
  console.log(req.body);
  const { accessToken, refreshToken } = await updateOneUserPassword(
    req.user.id,
    req.body,
  );
  setAuthCookies(reply, accessToken, refreshToken);
  sendResponse(reply, {
    statusCode: 200,
    message: "Password updated successfully",
  });
};
