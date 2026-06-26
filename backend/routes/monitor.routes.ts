import type { FastifyInstance } from "fastify";
import { health } from "../controllers/health.controller.js";
import { authGuard } from "../guard/auth.gaurd.js";

const monitorRoutes = async function (app: FastifyInstance) {
  app.get("/health", {
    preHandler: [authGuard],
    handler: health,
  });
};

export default monitorRoutes;
