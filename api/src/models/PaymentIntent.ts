import { Schema, model, Types, type InferSchemaType } from "mongoose";

const paymentIntentSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
    pocketsflowProductId: { type: String, default: null, index: true },
    pocketsflowCheckoutId: { type: String, default: null },
    pocketsflowOrderId: { type: String, default: null, index: true },
    // Snapshot of submitted form data, applied to the Listing once payment is confirmed.
    pendingData: {
      description: { type: String, required: true },
      category: { type: String, required: true },
      socials: {
        instagram: { type: String, default: null },
        twitter: { type: String, default: null },
        linkedin: { type: String, default: null },
        tiktok: { type: String, default: null },
      },
    },
  },
  { timestamps: true }
);

export type PaymentIntentDoc = InferSchemaType<typeof paymentIntentSchema> & { _id: Types.ObjectId };

export const PaymentIntent = model("PaymentIntent", paymentIntentSchema);
