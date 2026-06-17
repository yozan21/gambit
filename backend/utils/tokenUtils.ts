import jwt from "jsonwebtoken";
import type { JwtPayload, OAuthPayload, TokenPair } from "../utils/types.js";

// Helper to sign tokens asynchronously
const signAsync = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Passing a callback as the 4th argument offloads it to the thread pool
    jwt.sign(payload, secret, { expiresIn: expiresIn as any }, (err, token) => {
      if (err) return reject(err);
      resolve(token!);
    });
  });
};

// Helper to verify tokens asynchronously
const verifyAsync = (token: string, secret: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    // Passing a callback as the 3rd argument makes it asynchronous
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload);
    });
  });
};

// 1. Asynchronous Token Generation
export const generateTokens = async (
  payload: JwtPayload,
): Promise<TokenPair> => {
  // Run both signing operations concurrently using Promise.all
  const [accessToken, refreshToken] = await Promise.all([
    signAsync(
      { id: payload.id, role: payload.role },
      process.env.JWT_ACCESS_SECRET!,
      process.env.JWT_ACCESS_EXPIRES_IN!,
    ),
    signAsync(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      process.env.JWT_REFRESH_EXPIRES_IN!,
    ),
  ]);

  return { accessToken, refreshToken };
};

// 2. Asynchronous Access Token Verification
export const verifyAccessToken = async (token: string): Promise<JwtPayload> => {
  return verifyAsync(token, process.env.JWT_ACCESS_SECRET!);
};

// 3. Asynchronous Refresh Token Verification
export const verifyRefreshToken = async (
  token: string,
): Promise<JwtPayload> => {
  return verifyAsync(token, process.env.JWT_REFRESH_SECRET!);
};

// 4. Asynchronous Google OAuth token generation
export const generateOAuthToken = async (payload: OAuthPayload) => {
  return new Promise((resolve, reject) => {
    // Passing a callback as the 4th argument offloads it to the thread pool
    jwt.sign(
      payload,
      process.env.JWT_OAUTH_SECRET!,
      { expiresIn: "5m" },
      (err, token) => {
        if (err) return reject(err);
        resolve(token!);
      },
    );
  });
};

// 5. Asynchronous OAuth Token Verification
export const verifyOAuthToken = async (
  token: string,
): Promise<OAuthPayload> => {
  return new Promise((resolve, reject) => {
    // Passing a callback as the 3rd argument makes it asynchronous
    jwt.verify(token, process.env.JWT_OAUTH_SECRET!, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as OAuthPayload);
    });
  });
};
