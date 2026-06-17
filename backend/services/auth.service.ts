// import jwt, { type SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import { User, type IUser, type UserDocument } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import type {
  LoginBody,
  RefreshParams,
  SignupBody,
  TokenPair,
} from "../utils/types.js";
import { generateTokens } from "../utils/tokenUtils.js";

// const signToken = (id: string, role: string): string => {
//   const jwtSecret = process.env.JWT_SECRET;
//   if (!jwtSecret)
//     throw new ApiError("Fatal Error JWT Secret is not defined!", 500);
//   return jwt.sign({ id, role }, jwtSecret, {
//     expiresIn:
//       (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "90d",
//   });
// };

const createSendToken = async (
  user: UserDocument,
): Promise<{
  tokens: TokenPair;
  user: object;
}> => {
  const tokens = await generateTokens({
    id: user._id.toString(),
    tokenVersion: user.tokenVersion,
    role: user.role,
  });
  const { password, ...safeUser } = user.toObject();

  return { tokens, user: safeUser };
};

export async function loginService(
  data: LoginBody,
): Promise<{ tokens: TokenPair; user: object }> {
  const { identifier, password } = data;

  const user = (await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password -__v")) as UserDocument | null;

  if (!user || !(await user.isCorrectPassword(password)))
    throw new ApiError("Invalid credentials!", 401);

  user.tokenVersion += 1;
  await user.save();

  return await createSendToken(user);
}

export async function signupService(
  data: SignupBody,
): Promise<{ tokens: TokenPair; user: object }> {
  const user = await User.create({ ...data });

  return await createSendToken(user);
}

export async function refreshService(data: RefreshParams) {
  const user = await User.findById(data.id);
  if (
    !user ||
    user.tokenVersion !== data.tokenVersion ||
    user.role !== data.role
  )
    throw new ApiError("Unauthorized", 403);

  return await createSendToken(user);
}

export async function googleLoginService(
  user: UserDocument,
): Promise<{ tokens: TokenPair; user: object }> {
  user.tokenVersion += 1;
  await user.save();
  return await createSendToken(user);
}

export async function googleSignupService(data: {
  googleId: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
}): Promise<{ tokens: TokenPair; user: object }> {
  const user = await User.create(data);
  return await createSendToken(user);
}
