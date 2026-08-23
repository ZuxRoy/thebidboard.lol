import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import mongoPlugin from "./plugins/mongo.js";
import listingsRoutes from "./routes/listings.js";
import webhookRoutes from "./routes/webhooks.js";
import ogRoutes from "./routes/og.js";
import { env } from "./config/env.js";

export async function buildApp() {
  const app = Fastify({
    pluginTimeout: 15000,
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport: env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
    },
  });

  await app.register(helmet);
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(mongoPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(listingsRoutes, { prefix: "/api" });
  await app.register(webhookRoutes, { prefix: "/api" });
  await app.register(ogRoutes, { prefix: "/api" });

  return app;
}
