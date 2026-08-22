import { PaymentIntent } from "../models/PaymentIntent.js";
import { Listing } from "../models/Listing.js";

/**
 * Applies a confirmed payment to its listing: bumps totalPaid, activates the
 * listing, and refreshes it with whatever the user submitted alongside this
 * payment. Idempotent — safe to call more than once for the same intent.
 */
export async function activatePaymentIntent(paymentIntentId: string, orderId: string): Promise<void> {
  const paymentIntent = await PaymentIntent.findById(paymentIntentId);
  if (!paymentIntent || paymentIntent.status === "paid") return;

  paymentIntent.status = "paid";
  paymentIntent.pocketsflowOrderId = orderId;
  await paymentIntent.save();

  const listing = await Listing.findById(paymentIntent.listingId);
  if (!listing) return;

  const pendingData = paymentIntent.pendingData;

  listing.totalPaid = (listing.totalPaid ?? 0) + paymentIntent.amount;
  listing.status = "active";
  listing.lastPaidAt = new Date();
  if (pendingData) {
    listing.description = pendingData.description;
    listing.category = pendingData.category as (typeof listing)["category"];
    listing.socials = pendingData.socials ?? {};
  }
  await listing.save();
}
