import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from Tiptap
  featured_image?: string;
  category?: string;
  tags: string[];
  author: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  read_time?: number; // minutes
  seo_title?: string;
  seo_description?: string;
  created_at: Date;
  updated_at: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featured_image: { type: String },
    category: { type: String },
    tags: [{ type: String }],
    author: { type: String, default: "Dr. Aparnaa Singh" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    featured: { type: Boolean, default: false },
    read_time: { type: Number },
    seo_title: { type: String },
    seo_description: { type: String },
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

BlogSchema.index({ status: 1 });
BlogSchema.index({ slug: 1 });
BlogSchema.index({ featured: 1 });

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
