import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import type { UpdatePasswordBody, UpdateProfileBody } from "../utils/types.js";
import { generateTokens } from "../utils/tokenUtils.js";

export async function getAllUsers() {
  const users = await User.find();
  return users;
}

export async function getOneUser(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError("Unknown user", 400);

  const user = await User.findById(id).select("-__v");
  if (!user) throw new ApiError("User not found!", 404);

  return user;
}

export async function updateOneUserProfile(
  id: string,
  data: UpdateProfileBody,
) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError("Unknown user", 400);

  return await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function updateOneUserPassword(
  id: string,
  data: UpdatePasswordBody,
) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError("Unknown user", 400);

  const user = await User.findById(id).select("+password");
  if (!user) throw new ApiError("User not found!", 404);

  if (!(await user.isCorrectPassword(data.oldPassword)))
    throw new ApiError("Incorrect current password", 400);

  user.password = data.newPassword;
  user.tokenVersion += 1;
  await user.save();

  return generateTokens({
    id: user._id.toString(),
    tokenVersion: user.tokenVersion,
    role: user.role,
  });
}
