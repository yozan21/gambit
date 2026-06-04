import type { FastifyReply } from "fastify/types/reply.js";

const isProd = process.env.NODE_ENV === "production";

export const setAuthCookies = (
  res: FastifyReply,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: "none", // CSRF protection
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/", // only sent on refresh endpoint
  });
};

export const clearAuthCookies = (res: FastifyReply) => {
  res.clearCookie("accessToken", {
    path: "/",
  });
  res.clearCookie("refreshToken", {
    path: "/",
  });
};
