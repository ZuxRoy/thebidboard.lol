import type { FastifyInstance, FastifyRequest } from "fastify";
import { verifyWebhookSignature } from "../services/pocketsflow.js";
import { activatePaymentIntent } from "../services/payments.js";

interface RawBodyRequest extends FastifyRequest {
  rawBody?: string;
}

interface PocketsflowOrderCompletedPayload {
  order: { id: string };
  metadata?: { paymentIntentId?: string };
  clientReferenceId?: string | null;
}

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Scoped to this plugin only (Fastify encapsulation) so other routes keep
  // using the default JSON parser; we need the raw string here to verify the
  // HMAC signature Pocketsflow sends.
  fastify.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
    (request as RawBodyRequest).rawBody = body as string;
    try {
      const json = body ? JSON.parse(body as string) : {};
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  fastify.post("/webhooks/pocketsflow", async (request: RawBodyRequest, reply) => {
    const signature = request.headers["x-pocketsflow-signature"] as string | undefined;
    const eventType = request.headers["x-pocketsflow-event"] as string | undefined;
    const rawBody = request.rawBody ?? "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      return reply.status(401).send({ error: "Invalid signature" });
    }

    const payload = request.body as PocketsflowOrderCompletedPayload;
    const paymentIntentId = payload?.clientReferenceId || payload?.metadata?.paymentIntentId;

    if (eventType === "order.completed" && paymentIntentId && payload?.order?.id) {
      await activatePaymentIntent(paymentIntentId, payload.order.id);
    }

    return reply.status(200).send({ received: true });
  });
}
