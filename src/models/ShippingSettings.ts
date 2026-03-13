import mongoose, { Schema, Document } from "mongoose";

export interface IShippingSettings extends Document {
  free_shipping_threshold: number;
  flat_rate: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

const ShippingSettingsSchema = new Schema<IShippingSettings>(
  {
    free_shipping_threshold: { type: Number, default: 500 },
    flat_rate: { type: Number, default: 50 },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.models.ShippingSettings || mongoose.model<IShippingSettings>("ShippingSettings", ShippingSettingsSchema);
