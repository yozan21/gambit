import type { FastifyRequest, FastifyReply } from "fastify";
import ApiError from "../utils/ApiError.js";

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.accessJwtVerify(); // verifies token from Authorization header
  } catch {
    throw new ApiError("Unauthorized", 401);
  }
}
