import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { PaymentIntent } from "../models/PaymentIntent.js";
import { normalizeDomain, isValidSocialUrl, InvalidUrlError } from "../services/domain.js";
import { isCategoryId } from "../services/categories.js";
import { createProduct, createCheckoutSession } from "../services/pocketsflow.js";

const MIN_AMOUNT_CENTS = 100; // $1 minimum

const socialsSchema = z
  .object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  })
  .partial()
  .default({});

const createListingSchema = z.object({
  url: z.string().min(3, "Product URL is required"),
  description: z.string().trim().min(1, "Description is required").max(100, "Description must be 100 characters or fewer"),
  category: z.string().refine(isCategoryId, "Invalid category"),
  socials: socialsSchema,
  amountCents: z.number().int().min(MIN_AMOUNT_CENTS, "Minimum amount is $1"),
});

async function handleCreateListing(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parsed = createListingSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
  }

  const { description, category, socials, amountCents } = parsed.data;

  for (const [platform, value] of Object.entries(socials)) {
    if (value && !isValidSocialUrl(platform as keyof typeof socials, value)) {
      return reply.status(400).send({ error: `That doesn't look like a valid ${platform} link` });
    }
  }

  let domain: string;
  let normalizedUrl: string;
  try {
    const result = normalizeDomain(parsed.data.url);
    domain = result.domain;
    normalizedUrl = result.url;
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return reply.status(400).send({ error: err.message });
    }
    throw err;
  }

  let listing = await Listing.findOne({ domain });
  if (!listing) {
    listing = await Listing.create({
      domain,
      url: normalizedUrl,
      description,
      category,
      socials,
      totalPaid: 0,
      status: "pending",
    });
  }

  const paymentIntent = await PaymentIntent.create({
    listingId: listing._id,
    amount: amountCents,
    status: "pending",
    pendingData: { description, category, socials },
  });

  try {
    const paymentIntentId = paymentIntent._id.toString();
    const productId = await createProduct({
      name: `Board Spot — ${domain}`,
      priceDollars: amountCents / 100,
    });
    const { checkoutId, checkoutUrl } = await createCheckoutSession({
      productId,
      clientReferenceId: paymentIntentId,
      metadata: { paymentIntentId },
    });
    paymentIntent.pocketsflowProductId = productId;
    paymentIntent.pocketsflowCheckoutId = checkoutId;
    await paymentIntent.save();

    return reply.send({ checkoutUrl });
  } catch (err) {
    fastify.log.error(err, "Failed to create Pocketsflow checkout");
    paymentIntent.status = "failed";
    await paymentIntent.save();
    return reply.status(502).send({ error: "Could not start checkout. Please try again shortly." });
  }
}

export default async function listingsRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/listings",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    (request, reply) => handleCreateListing(fastify, request, reply)
  );

  const listQuerySchema = z.object({
    category: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });

  fastify.get("/listings", async (request, reply) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query parameters" });
    }
    const { category, limit } = parsed.data;
    const offset = parsed.data.offset ?? ((parsed.data.page ?? 1) - 1) * limit;
    const page = Math.floor(offset / limit) + 1;

    const filter: Record<string, unknown> = { status: "active" };
    if (category && category !== "all") {
      if (!isCategoryId(category)) {
        return reply.status(400).send({ error: "Invalid category" });
      }
      filter.category = category;
    }

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .sort({ totalPaid: -1, createdAt: 1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    const results = items.map((item, index) => ({
      id: item._id.toString(),
      rank: offset + index + 1,
      domain: item.domain,
      url: item.url,
      description: item.description,
      category: item.category,
      socials: item.socials,
      amountCents: item.totalPaid,
      createdAt: item.createdAt,
    }));

    return reply.send({
      items: results,
      total,
      page,
      limit,
      offset,
    });
  });

  fastify.get("/listings/top", async (_request, reply) => {
    const top = await Listing.findOne({ status: "active" }).sort({ totalPaid: -1 }).lean();
    const topAmountCents = top?.totalPaid ?? 0;
    return reply.send({
      topAmountCents,
      nextAmountCents: topAmountCents + 100,
      topDomain: top?.domain ?? null,
    });
  });

  fastify.get("/ticker", async (_request, reply) => {
    const items = await Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(15)
      .select("domain totalPaid category createdAt")
      .lean();

    return reply.send({
      items: items.map((item) => ({
        domain: item.domain,
        amountCents: item.totalPaid,
        category: item.category,
        createdAt: item.createdAt,
      })),
    });
  });
}
