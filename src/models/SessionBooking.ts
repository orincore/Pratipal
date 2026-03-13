import mongoose, { Schema, Document } from "mongoose";

export interface ISessionBooking extends Document {
  booking_number: string;
  customer_id: string;
  service_id: string;
  service_name: string;
  service_category: string;
  frequency_label: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  session_date?: Date;
  session_time?: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  whatsapp_redirect_url?: string;
  created_at: Date;
  updated_at: Date;
}

const SessionBookingSchema = new Schema<ISessionBooking>(
  {
    booking_number: { type: String, required: true, unique: true },
    customer_id: { type: String, required: true },
    service_id: { type: String, required: true },
    service_name: { type: String, required: true },
    service_category: { type: String, required: true },
    frequency_label: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_whatsapp: { type: String },
    session_date: { type: Date },
    session_time: { type: String },
    amount: { type: Number, required: true },
    payment_status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    whatsapp_redirect_url: { type: String },
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

SessionBookingSchema.index({ booking_number: 1 });
SessionBookingSchema.index({ customer_email: 1 });
SessionBookingSchema.index({ payment_status: 1 });

export default mongoose.models.SessionBooking || mongoose.model<ISessionBooking>("SessionBooking", SessionBookingSchema);
