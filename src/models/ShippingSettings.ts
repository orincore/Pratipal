import mongoose, { Schema, Document } from "mongoose";

export interface IWeightTier {
  min_weight: number;
  max_weight: number;
  rate: number;
}

export interface IShippingSettings extends Document {
  free_shipping_threshold: number;
  flat_rate: number;
  weight_based_enabled: boolean;
  weight_tiers: IWeightTier[];
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

const WeightTierSchema = new Schema<IWeightTier>({
  min_weight: { type: Number, required: true },
  max_weight: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const ShippingSettingsSchema = new Schema<IShippingSettings>(
  {
    free_shipping_threshold: { type: Number, default: 500 },
    flat_rate: { type: Number, default: 50 },
    weight_based_enabled: { type: Boolean, default: false },
    weight_tiers: { type: [WeightTierSchema], default: [] },
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
