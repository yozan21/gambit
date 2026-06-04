import type { FastifyReply, FastifyRequest } from "fastify";

export const asyncHandler =
  (handler: (req: FastifyRequest, reply: FastifyReply) => Promise<any>) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await handler(req, reply);
    } catch (error) {
      throw error; // Fastify error handler will catch this
    }
  };
