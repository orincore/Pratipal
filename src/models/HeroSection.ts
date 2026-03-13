import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSection extends Document {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  cta_text: string;
  cta_link?: string | null;
  background_type: "default" | "image" | "video" | "none";
  background_image_url?: string | null;
  background_video_url?: string | null;
  card_type: "image" | "video";
  card_image_url?: string | null;
  card_video_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const HeroSectionSchema = new Schema<IHeroSection>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    cta_text: { type: String, default: "Learn More" },
    cta_link: { type: String },
    background_type: {
      type: String,
      enum: ["default", "image", "video", "none"],
      default: "default",
    },
    background_image_url: { type: String },
    background_video_url: { type: String },
    card_type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    card_image_url: { type: String },
    card_video_url: { type: String },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
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

HeroSectionSchema.index({ is_active: 1, display_order: 1 });

export default mongoose.models.HeroSection ||
  mongoose.model<IHeroSection>("HeroSection", HeroSectionSchema);
