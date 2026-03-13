import mongoose, { Schema, Document } from "mongoose";

export interface ILandingPage extends Document {
  title: string;
  slug: string;
  content: Record<string, any>;
  theme: Record<string, any>;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published";
  created_at: Date;
  updated_at: Date;
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: Schema.Types.Mixed, default: {} },
    theme: {
      type: Schema.Types.Mixed,
      default: {
        primary: "#0F8A5F",
        secondary: "#0B4F6C",
        accent: "#18A999",
        background: "#FFFFFF",
      },
    },
    seo_title: { type: String, default: "" },
    seo_description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

LandingPageSchema.index({ slug: 1 });
LandingPageSchema.index({ status: 1 });

export default mongoose.models.LandingPage || mongoose.model<ILandingPage>("LandingPage", LandingPageSchema);
