import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryImage extends Document {
  url: string;
  r2_key?: string;
  caption?: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true },
    r2_key: { type: String },
    caption: { type: String, default: "" },
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

GalleryImageSchema.index({ display_order: 1 });

export default mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);
