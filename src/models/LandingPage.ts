import mongoose, { Schema, Document } from "mongoose";

export interface ILandingPage extends Document {
  title: string;
  slug: string;
  content: Record<string, any>;
  theme: Record<string, any>;
  seo_title: string;
  seo_description: string;
  schema_type?: string;     // JSON-LD @type (e.g. WebPage, Article, FAQPage, Custom)
  custom_schema?: string;   // raw custom JSON-LD structured data
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
    schema_type: { type: String, default: "" },
    custom_schema: { type: String, default: "" },
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

// Force re-register on every module load so a schema change always takes effect
// immediately, even in a long-running dev server process (Mongoose otherwise
// caches the first-compiled schema in mongoose.models for the process lifetime).
delete (mongoose.models as any).LandingPage;

export default mongoose.model<ILandingPage>("LandingPage", LandingPageSchema);
