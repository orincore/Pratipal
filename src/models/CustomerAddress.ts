import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerAddress extends Document {
  customer_id: string;
  address_type: "shipping" | "billing";
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>(
  {
    customer_id: { type: String, ref: "Customer", required: true },
    address_type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    company: { type: String },
    address_line1: { type: String, required: true },
    address_line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, default: "India" },
    phone: { type: String },
    is_default: { type: Boolean, default: false },
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

CustomerAddressSchema.index({ customer_id: 1 });

export default mongoose.models.CustomerAddress || mongoose.model<ICustomerAddress>("CustomerAddress", CustomerAddressSchema);
