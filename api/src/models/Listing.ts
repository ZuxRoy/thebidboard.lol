import { Schema, model, type InferSchemaType } from "mongoose";
import { CATEGORY_IDS } from "../services/categories.js";

const socialsSchema = new Schema(
  {
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    linkedin: { type: String, default: null },
    tiktok: { type: String, default: null },
  },
  { _id: false }
);

const listingSchema = new Schema(
  {
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    url: { type: String, required: true },
    description: { type: String, required: true, maxlength: 100 },
    category: { type: String, required: true, enum: CATEGORY_IDS },
    socials: { type: socialsSchema, default: () => ({}) },
    totalPaid: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["pending", "active"], default: "pending", index: true },
    lastPaidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

listingSchema.index({ category: 1, totalPaid: -1 });
listingSchema.index({ status: 1, totalPaid: -1 });

export type ListingDoc = InferSchemaType<typeof listingSchema>;

export const Listing = model("Listing", listingSchema);
