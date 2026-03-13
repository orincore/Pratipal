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

export default mongoose.models.OrderItem || mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
