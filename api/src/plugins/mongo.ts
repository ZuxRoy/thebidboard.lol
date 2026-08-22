import fp from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export default fp(async function mongoPlugin(fastify: FastifyInstance) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);

  fastify.log.info("Connected to MongoDB");

  fastify.addHook("onClose", async () => {
    await mongoose.disconnect();
  });
});
