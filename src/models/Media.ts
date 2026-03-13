import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: "image" },
    size: { type: Number, default: 0 },
    uploaded_at: { type: Date, default: Date.now },
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

export default mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
