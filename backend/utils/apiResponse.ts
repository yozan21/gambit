import type { FastifyReply } from "fastify";

export default function sendResponse(
  reply: FastifyReply,
  {
    statusCode = 200,
    message = "Success",
    data = null,
  }: {
    statusCode?: number;
    message?: string;
    data?: any;
  },
) {
  return reply.code(statusCode).send({
    success: true,
    message,
    data,
  });
}
