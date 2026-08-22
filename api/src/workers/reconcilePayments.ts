import cron from "node-cron";
import type { FastifyBaseLogger } from "fastify";
import { PaymentIntent } from "../models/PaymentIntent.js";
import { listOrdersForProduct } from "../services/pocketsflow.js";
import { activatePaymentIntent } from "../services/payments.js";

const GRACE_PERIOD_MS = 5 * 60 * 1000; // give webhooks 5 minutes before we bother reconciling
const ABANDON_AFTER_MS = 24 * 60 * 60 * 1000; // give up on checkouts nobody finished

async function reconcileOnce(logger: FastifyBaseLogger): Promise<void> {
  const now = Date.now();
  const pending = await PaymentIntent.find({
    status: "pending",
    createdAt: { $lte: new Date(now - GRACE_PERIOD_MS) },
    pocketsflowProductId: { $ne: null },
  });

  if (pending.length === 0) return;

  for (const intent of pending) {
    if (intent.createdAt && now - intent.createdAt.getTime() > ABANDON_AFTER_MS) {
      intent.status = "failed";
      await intent.save();
      continue;
    }

    if (!intent.pocketsflowProductId) continue;

    // Every payment intent gets its own dedicated Pocketsflow product, so any
    // completed order for that product id can only belong to this intent.
    const [match] = await listOrdersForProduct(intent.pocketsflowProductId);

    if (match) {
      logger.info({ paymentIntentId: intent._id.toString(), orderId: match.id }, "Reconciled missed webhook payment");
      await activatePaymentIntent(intent._id.toString(), match.id);
    }
  }
}

export function startReconcilePaymentsWorker(logger: FastifyBaseLogger): void {
  cron.schedule("*/5 * * * *", () => {
    reconcileOnce(logger).catch((err) => logger.error(err, "reconcilePayments worker failed"));
  });
}
