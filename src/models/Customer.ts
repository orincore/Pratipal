import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICustomer extends Document {
  _id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_token_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    _id: { type: String, default: uuidv4 },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    first_name: { type: String },
    last_name: { type: String },
    phone: { type: String },
    avatar_url: { type: String },
    is_verified: { type: Boolean, default: false },
    verification_token: { type: String },
    reset_token: { type: String },
    reset_token_expires: { type: Date },
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

CustomerSchema.index({ email: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
