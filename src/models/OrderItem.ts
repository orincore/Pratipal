import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem extends Document {
  order_id: mongoose.Types.ObjectId;
  product_id?: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
  // Snapshotted from the product at order-creation time (see
  // /api/razorpay/create-order) rather than looked up live, so a later
  // change to the product's ebook file/link never breaks an already-placed
  // order's download.
  is_ebook: boolean;
  ebook_download_url?: string;
  ebook_delivery_status: "pending" | "sent" | "delivered" | "failed";
  ebook_delivered_at?: Date;
  created_at: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    product_id: { type: Schema.Types.ObjectId, ref: "Product" },
    variant_id: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    product_name: { type: String, required: true },
    product_sku: { type: String },
    variant_name: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    is_ebook: { type: Boolean, default: false },
    ebook_download_url: { type: String },
    ebook_delivery_status: { type: String, enum: ["pending", "sent", "delivered", "failed"], default: "pending" },
    ebook_delivered_at: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  {
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

OrderItemSchema.index({ order_id: 1 });

// Always re-register to pick up schema changes (ebook fields etc.) after hot reloads
const OrderItemModel = (mongoose.models.OrderItem as mongoose.Model<IOrderItem> | undefined)?.schema?.path("is_ebook")
  ? (mongoose.models.OrderItem as mongoose.Model<IOrderItem>)
  : (() => { try { return mongoose.model<IOrderItem>("OrderItem", OrderItemSchema); } catch { delete mongoose.models.OrderItem; return mongoose.model<IOrderItem>("OrderItem", OrderItemSchema); } })();

export default OrderItemModel;
