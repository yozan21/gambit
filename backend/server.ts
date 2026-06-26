import "dotenv/config";
import Fastify from "fastify";
import { buildApp } from "./app.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

const start = async () => {
  try {
    await buildApp(app);
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(`Server setup failed: ${err}`);
    process.exit(1);
  }
};

start();
