import mongoose, { Schema, Document } from "mongoose";

export interface IInvitationRequest extends Document {
  landing_page_id?: mongoose.Types.ObjectId;
  landing_page_slug?: string;
  first_name: string;
  email: string;
  whatsapp_number?: string;
  gender?: string;
  created_at: Date;
}

const InvitationRequestSchema = new Schema<IInvitationRequest>(
  {
    landing_page_id: { type: Schema.Types.ObjectId, ref: "LandingPage" },
    landing_page_slug: { type: String },
    first_name: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp_number: { type: String },
    gender: { type: String },
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

InvitationRequestSchema.index({ landing_page_id: 1 });

export default mongoose.models.InvitationRequest || mongoose.model<IInvitationRequest>("InvitationRequest", InvitationRequestSchema);
