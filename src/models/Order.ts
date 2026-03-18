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
  tracking_url?: string;
  tracking_status?: string;
  tracking_message?: string;
  tracking_updated_at?: string;
  tracking_history?: Array<{ status: string; message?: string; timestamp: string }>;
  shiprocket_order_id?: number;
  shiprocket_shipment_id?: number;
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
    tracking_url: { type: String },
    tracking_status: { type: String },
    tracking_message: { type: String },
    tracking_updated_at: { type: String },
    tracking_history: [{
      status: { type: String, required: true },
      message: { type: String },
      timestamp: { type: String, required: true },
    }],
    shiprocket_order_id: { type: Number },
    shiprocket_shipment_id: { type: Number },
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

// Always re-register to pick up schema changes (tracking_history etc.) after hot reloads
const OrderModel = (mongoose.models.Order as mongoose.Model<IOrder> | undefined)?.schema?.path("tracking_history")
  ? (mongoose.models.Order as mongoose.Model<IOrder>)
  : (() => { try { return mongoose.model<IOrder>("Order", OrderSchema); } catch { delete mongoose.models.Order; return mongoose.model<IOrder>("Order", OrderSchema); } })();

export default OrderModel;
