import fp from "fastify-plugin";
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../utils/types.js";
import socketServer from "../socketServer.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server<ClientToServerEvents, ServerToClientEvents>;
  }
}

export default fp(async (app: FastifyInstance) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    app.server, // ✅ Use Fastify's built-in HTTP server directly
    {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    },
  );

  // Pass io to your existing socketServer
  socketServer(io);

  // Make io available throughout Fastify if needed
  app.decorate("io", io);

  // Graceful shutdown
  app.addHook("onClose", async () => {
    io.close();
    console.log("✓ Socket.IO closed");
  });

  console.log("✓ Socket.IO plugin registered");
});
