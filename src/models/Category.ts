import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: mongoose.Types.ObjectId;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image_url: { type: String },
    parent_id: { type: Schema.Types.ObjectId, ref: "Category" },
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

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent_id: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
