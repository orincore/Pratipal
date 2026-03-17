import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_name: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded" | "failed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  shipping_address: Record<string, any>;
  billing_address: Record<string, any>;
  notes?: string;
  tracking_number?: string;
  tracking_status?: string;
  shipped_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    order_number: { type: String, required: true, unique: true },
    customer_id: { type: String, ref: "Customer" },
    customer_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "completed", "cancelled", "refunded", "failed"], default: "pending" },
    payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    payment_method: { type: String },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping_cost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    shipping_address: { type: Schema.Types.Mixed, required: true },
    billing_address: { type: Schema.Types.Mixed, required: true },
    notes: { type: String },
    tracking_number: { type: String },
    tracking_status: { type: String },
    shipped_at: { type: Date },
    completed_at: { type: Date },
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

OrderSchema.index({ order_number: 1 });
OrderSchema.index({ customer_id: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ customer_email: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
