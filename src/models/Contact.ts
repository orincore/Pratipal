import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new" 
    },
    admin_notes: { type: String },
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

ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ created_at: -1 });

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);