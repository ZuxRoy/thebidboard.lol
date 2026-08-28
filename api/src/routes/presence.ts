import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Visitor } from "../models/Visitor.js";
import { getCloudflareTraffic } from "../services/cloudflareAnalytics.js";

const ONLINE_WINDOW_MS = 75_000;

const heartbeatSchema = z.object({
  visitorId: z.string().trim().min(8).max(128),
});

export default async function presenceRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/presence/heartbeat",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = heartbeatSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Invalid visitor id" });
      }

      const now = new Date();
      await Visitor.updateOne(
        { visitorId: parsed.data.visitorId },
        { $set: { lastSeenAt: now }, $setOnInsert: { firstSeenAt: now } },
        { upsert: true }
      );

      return reply.send({ ok: true });
    }
  );

  fastify.get("/presence/stats", async (_request, reply) => {
    const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);
    const [onlineNow, cloudflare] = await Promise.all([
      Visitor.countDocuments({ lastSeenAt: { $gte: onlineSince } }),
      getCloudflareTraffic(fastify.log),
    ]);

    return reply.send({
      onlineNow,
      totalClicks: cloudflare?.clicks ?? 0,
    });
  });
}
