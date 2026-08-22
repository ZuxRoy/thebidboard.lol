import fp from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export default fp(async function mongoPlugin(fastify: FastifyInstance) {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
  } catch (err) {
    fastify.log.error({ err }, "MongoDB connection failed");
    throw err;
  }

  fastify.log.info("Connected to MongoDB");

  fastify.addHook("onClose", async () => {
    await mongoose.disconnect();
  });
});
