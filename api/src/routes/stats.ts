import type { FastifyInstance } from "fastify";
import { Listing } from "../models/Listing.js";
import { Visitor } from "../models/Visitor.js";
import { getCloudflareTraffic } from "../services/cloudflareAnalytics.js";

const ONLINE_WINDOW_MS = 75_000;

export default async function statsRoutes(fastify: FastifyInstance) {
  fastify.get("/stats", async (_request, reply) => {
    const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);

    const [totals, byCategory, newest, top, onlineNow, cloudflare] = await Promise.all([
      Listing.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, totalListings: { $sum: 1 }, totalVolumeCents: { $sum: "$totalPaid" } } },
      ]),
      Listing.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 }, volumeCents: { $sum: "$totalPaid" } } },
        { $sort: { volumeCents: -1 } },
      ]),
      Listing.findOne({ status: "active" }).sort({ createdAt: -1 }).select("domain createdAt").lean(),
      Listing.findOne({ status: "active" }).sort({ totalPaid: -1 }).select("domain totalPaid").lean(),
      Visitor.countDocuments({ lastSeenAt: { $gte: onlineSince } }),
      getCloudflareTraffic(fastify.log),
    ]);

    const totalListings = totals[0]?.totalListings ?? 0;
    const totalVolumeCents = totals[0]?.totalVolumeCents ?? 0;

    return reply.send({
      totalListings,
      totalVolumeCents,
      totalClicks: cloudflare?.clicks ?? 0,
      clicksSeries: cloudflare?.series ?? [],
      onlineNow,
      newestDomain: newest?.domain ?? null,
      newestAt: newest?.createdAt ?? null,
      topDomain: top?.domain ?? null,
      topAmountCents: top?.totalPaid ?? 0,
      categories: byCategory.map((row) => ({
        category: row._id as string,
        count: row.count as number,
        volumeCents: row.volumeCents as number,
      })),
    });
  });
}
