import mongoose, { Schema, Document } from "mongoose";

export interface ISessionBooking extends Document {
  booking_number: string;
  customer_id: string;
  service_id: string;
  service_name: string;
  service_category: string;
  frequency_label: string;
  /** @deprecated use order_type */
  booking_type: "service" | "course";
  /** Canonical type field — use this for filtering */
  order_type: "service" | "course";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  session_date?: Date;
  session_time?: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paid_at?: Date;
  refunded_at?: Date;
  payment_failure_reason?: string;
  whatsapp_redirect_url?: string;
  admin_notes?: string;
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
    booking_type: { type: String, enum: ["service", "course"], default: "service" },
    order_type:   { type: String, enum: ["service", "course"], default: "service" },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_whatsapp: { type: String },
    session_date: { type: Date },
    session_time: { type: String },
    amount: { type: Number, required: true },
    payment_status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    booking_status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    paid_at: { type: Date },
    refunded_at: { type: Date },
    payment_failure_reason: { type: String },
    whatsapp_redirect_url: { type: String },
    admin_notes: { type: String },
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

SessionBookingSchema.index({ customer_email: 1 });
SessionBookingSchema.index({ payment_status: 1 });
// The webhook's only handle on a booking is the gateway order id.
SessionBookingSchema.index({ razorpay_order_id: 1 });
SessionBookingSchema.index({ order_type: 1 });

// Re-register when the cached model predates the payment fields added for the
// Razorpay webhook — otherwise a hot-reloaded dev process silently drops them.
const SessionBookingModel = (mongoose.models.SessionBooking as mongoose.Model<ISessionBooking> | undefined)?.schema?.path("paid_at")
  ? (mongoose.models.SessionBooking as mongoose.Model<ISessionBooking>)
  : (() => {
      try {
        return mongoose.model<ISessionBooking>("SessionBooking", SessionBookingSchema);
      } catch {
        delete mongoose.models.SessionBooking;
        return mongoose.model<ISessionBooking>("SessionBooking", SessionBookingSchema);
      }
    })();

export default SessionBookingModel;
