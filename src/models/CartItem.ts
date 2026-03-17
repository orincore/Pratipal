import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem extends Document {
  customer_id?: string;
  session_id?: string;
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    customer_id: { type: String, ref: "Customer" },
    session_id: { type: String },
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_id: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
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

CartItemSchema.index({ customer_id: 1 });
CartItemSchema.index({ session_id: 1 });

export default mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema);
