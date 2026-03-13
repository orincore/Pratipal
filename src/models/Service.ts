import mongoose, { Schema, Document } from "mongoose";

export interface IServiceFrequency {
  label: string;
  value: string;
  price: number;
}

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  detailed_description?: string;
  image_url: string;
  base_price: number;
  frequency_options: IServiceFrequency[];
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    detailed_description: { type: String },
    image_url: { type: String, required: true },
    base_price: { type: Number, required: true },
    frequency_options: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    category: { type: String, default: "general" },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
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

ServiceSchema.index({ slug: 1 }, { unique: true });
ServiceSchema.index({ is_active: 1, display_order: 1 });

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
