import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  featured_image?: string;
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced" | "all";
  category?: string;
  highlights: string[];
  curriculum: {
    title: string;
    description: string;
    topics?: string[];
  }[];
  what_you_receive: string[];
  who_is_this_for: string[];
  bonuses?: string[];
  instructor: {
    name: string;
    title: string;
    bio: string;
  };
  status: "draft" | "published" | "archived";
  featured: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    featured_image: { type: String },
    duration: { type: String },
    level: { 
      type: String, 
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all"
    },
    category: { type: String },
    highlights: [{ type: String }],
    curriculum: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      topics: [{ type: String }]
    }],
    what_you_receive: [{ type: String }],
    who_is_this_for: [{ type: String }],
    bonuses: [{ type: String }],
    instructor: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      bio: { type: String, required: true }
    },
    status: { 
      type: String, 
      enum: ["draft", "published", "archived"],
      default: "draft"
    },
    featured: { type: Boolean, default: false },
    display_order: { type: Number, default: 0 },
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

CourseSchema.index({ status: 1 });
CourseSchema.index({ featured: 1 });
CourseSchema.index({ display_order: 1 });

export default mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
