import fp from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance } from "fastify";

export default fp(async (app: FastifyInstance) => {
  const MONGO_URI = process.env.DATABASE as string;
  const PASSWORD = process.env.DATABASE_PASSWORD as string;

  if (!MONGO_URI) {
    throw new Error("DATABASE environment variable is not defined");
  }

  if (!PASSWORD) {
    throw new Error("DATABASE_PASSWORD environment variable is not defined");
  }

  const uri = MONGO_URI.replace("<PASSWORD>", PASSWORD);

  await mongoose.connect(uri);
  console.log("✓ MongoDB connected successfully");

  app.addHook("onClose", async () => {
    await mongoose.connection.close();
    console.log("✓ MongoDB connection closed");
  });
});
