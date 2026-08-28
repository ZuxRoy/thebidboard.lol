import type { FastifyBaseLogger } from "fastify";
import { Listing } from "../models/Listing.js";
import { InvalidUrlError, normalizeDomain } from "./domain.js";

/**
 * Legacy X listings stored hostname-only (`x.com`). Rewrite them to `x.com/{handle}`
 * so additional profiles do not collide on the unique domain index.
 */
export async function backfillXProfileDomains(log: FastifyBaseLogger): Promise<void> {
  const stale = await Listing.find({ domain: { $in: ["x.com", "twitter.com"] } });
  if (stale.length === 0) return;

  for (const listing of stale) {
    try {
      const result = normalizeDomain(listing.url);
      if (result.domain === listing.domain) continue;

      const conflict = await Listing.findOne({
        domain: result.domain,
        _id: { $ne: listing._id },
      });
      if (conflict) {
        log.warn(
          { listingId: listing._id, domain: result.domain },
          "Skipped X profile domain backfill because target key already exists"
        );
        continue;
      }

      listing.domain = result.domain;
      listing.url = result.url;
      await listing.save();
      log.info({ listingId: listing._id, domain: result.domain }, "Backfilled X profile listing domain");
    } catch (err) {
      if (err instanceof InvalidUrlError) {
        log.warn({ listingId: listing._id, url: listing.url }, "Could not backfill X profile listing: invalid URL");
        continue;
      }
      log.error({ err, listingId: listing._id }, "Could not backfill X profile listing");
    }
  }
}
