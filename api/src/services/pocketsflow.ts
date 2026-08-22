import crypto from "node:crypto";
import { env } from "../config/env.js";

const POCKETSFLOW_API_BASE = "https://api.pocketsflow.com";

interface CreateProductParams {
  name: string;
  priceDollars: number;
}

interface PocketsflowProduct {
  _id?: string;
  id?: string;
}

/**
 * Each payment intent gets its own dedicated, fixed-price Pocketsflow
 * product. Pocketsflow's checkout sessions don't accept a per-request custom
 * amount, so this is how we support the user-entered dollar amount while
 * still getting an exact 1:1 mapping we can reconcile against later.
 */
export async function createProduct({ name, priceDollars }: CreateProductParams): Promise<string> {
  const response = await fetch(`${POCKETSFLOW_API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.POCKETSFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      name,
      price: priceDollars,
      published: true,
      showSales: false,
      showReviews: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pocketsflow product creation failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as PocketsflowProduct;
  const productId = json._id ?? json.id;
  if (!productId) {
    throw new Error("Pocketsflow product creation returned no id");
  }
  return productId;
}

interface CreateCheckoutSessionParams {
  productId: string;
  clientReferenceId: string;
  metadata?: Record<string, string>;
}

interface PocketsflowCheckoutSession {
  id: string;
  url: string;
}

export async function createCheckoutSession({
  productId,
  clientReferenceId,
  metadata,
}: CreateCheckoutSessionParams): Promise<{ checkoutId: string; checkoutUrl: string }> {
  const response = await fetch(`${POCKETSFLOW_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.POCKETSFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      productId,
      successUrl: `${env.APP_BASE_URL}?claimed=1`,
      cancelUrl: env.APP_BASE_URL,
      clientReferenceId,
      metadata,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pocketsflow checkout session creation failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as PocketsflowCheckoutSession;
  return { checkoutId: json.id, checkoutUrl: json.url };
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!signatureHeader) return false;
  const digest = crypto.createHmac("sha256", env.POCKETSFLOW_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signatureHeader, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");
  if (signatureBuffer.length !== digestBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export interface RecentOrder {
  id: string;
  createdAt: string;
}

/**
 * Best-effort fallback used by the reconciliation worker when a webhook
 * never arrives. Since every payment intent has its own dedicated product,
 * finding *any* order for that product id means the intent was paid.
 */
export async function listOrdersForProduct(productId: string): Promise<RecentOrder[]> {
  const url = new URL(`${POCKETSFLOW_API_BASE}/orders`);
  url.searchParams.set("productId", productId);
  url.searchParams.set("pageSize", "5");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.POCKETSFLOW_API_KEY}` },
  });
  if (!response.ok) return [];

  const json = (await response.json()) as {
    orders?: Array<{ _id: string; createdAt: string }>;
  };

  return (json.orders ?? []).map((order) => ({ id: order._id, createdAt: order.createdAt }));
}
