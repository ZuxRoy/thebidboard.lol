import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import mongoPlugin from "./plugins/mongo.js";
import listingsRoutes from "./routes/listings.js";
import webhookRoutes from "./routes/webhooks.js";
import presenceRoutes from "./routes/presence.js";
import statsRoutes from "./routes/stats.js";
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
  const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (env.NODE_ENV !== "production") {
    for (const localOrigin of ["http://localhost:5173", "http://127.0.0.1:5173"]) {
      if (!corsOrigins.includes(localOrigin)) corsOrigins.push(localOrigin);
    }
  }
  await app.register(cors, { origin: corsOrigins });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(mongoPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(listingsRoutes, { prefix: "/api" });
  await app.register(webhookRoutes, { prefix: "/api" });
  await app.register(presenceRoutes, { prefix: "/api" });
  await app.register(statsRoutes, { prefix: "/api" });

  return app;
}
