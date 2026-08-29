import mongoose, { Schema, Document } from "mongoose";

// "not_required" = free webinar, the registration itself is the enrolment.
// "pending" = paid webinar, Razorpay order created but not yet verified.
// Only "not_required" and "paid" count as enrolled — see isEnrolled below.
export type InvitationPaymentStatus = "not_required" | "pending" | "paid" | "failed" | "refunded";

export interface IInvitationRequest extends Document {
  landing_page_id?: mongoose.Types.ObjectId;
  landing_page_slug?: string;
  first_name: string;
  email: string;
  whatsapp_number?: string;
  location?: string;
  payment_status: InvitationPaymentStatus;
  amount?: number;
  currency?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  paid_at?: Date;
  refunded_at?: Date;
  /** Gateway's own words for why a payment failed, for the CRM to show. */
  payment_failure_reason?: string;
  created_at: Date;
}

const InvitationRequestSchema = new Schema<IInvitationRequest>(
  {
    landing_page_id: { type: Schema.Types.ObjectId, ref: "LandingPage" },
    landing_page_slug: { type: String },
    first_name: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp_number: { type: String },
    location: { type: String },
    payment_status: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed", "refunded"],
      default: "not_required",
    },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    paid_at: { type: Date },
    refunded_at: { type: Date },
    payment_failure_reason: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    strict: true,
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

InvitationRequestSchema.index({ landing_page_id: 1 });
// Payment verification looks a registrant up by the Razorpay order id.
InvitationRequestSchema.index({ razorpay_order_id: 1 });

// Force re-register to pick up schema changes (safe for dev + prod)
delete (mongoose.models as any).InvitationRequest;

export default mongoose.model<IInvitationRequest>("InvitationRequest", InvitationRequestSchema);
