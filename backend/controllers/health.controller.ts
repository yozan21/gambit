import type { FastifyReply, FastifyRequest } from "fastify";

export const health = async (req: FastifyRequest, reply: FastifyReply) => {
  const mem = process.memoryUsage();
  return {
    rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
    heap: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(mem.external / 1024 / 1024)} MB`,
    totalHeapSize: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
    arrayBuffers: `${Math.round(mem.arrayBuffers / 1024 / 1024)} MB`,
  };
};
