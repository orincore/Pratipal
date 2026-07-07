import mongoose, { Schema, Document } from "mongoose";

// One named occurrence of a (possibly reused) webinar landing page — e.g. "July
// 2026 Batch". Only InvitationRequests submitted within [registration_start,
// registration_end] belong to this occurrence, so a landing page can be reused
// across many separate webinar runs without mixing up their registrant lists.
export interface IInvitationWindow extends Document {
  landing_page_id: mongoose.Types.ObjectId;
  landing_page_slug: string;
  name: string;
  registration_start: Date;
  registration_end: Date;
  webinar_starts_at: Date;
  webinar_timezone: string;
  join_link?: string;
  join_platform?: "zoom" | "google_meet" | "teams" | "other";
  created_at: Date;
  updated_at: Date;
}

const InvitationWindowSchema = new Schema<IInvitationWindow>(
  {
    landing_page_id: { type: Schema.Types.ObjectId, ref: "LandingPage", required: true, index: true },
    landing_page_slug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    registration_start: { type: Date, required: true },
    registration_end: { type: Date, required: true },
    webinar_starts_at: { type: Date, required: true },
    webinar_timezone: { type: String, default: "Asia/Kolkata" },
    join_link: { type: String },
    join_platform: { type: String, enum: ["zoom", "google_meet", "teams", "other"] },
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

delete (mongoose.models as any).InvitationWindow;

export default mongoose.model<IInvitationWindow>("InvitationWindow", InvitationWindowSchema);
