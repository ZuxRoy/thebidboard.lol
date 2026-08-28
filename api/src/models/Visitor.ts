import { Schema, model, type InferSchemaType } from "mongoose";

const visitorSchema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true },
    firstSeenAt: { type: Date, required: true, default: () => new Date() },
    lastSeenAt: { type: Date, required: true, default: () => new Date(), index: true },
  },
  { timestamps: false }
);

export type VisitorDoc = InferSchemaType<typeof visitorSchema>;

export const Visitor = model("Visitor", visitorSchema);
