import mongoose, { Schema, Document } from "mongoose";

export interface IAuthUser extends Document {
  email: string;
  password_hash: string;
  full_name?: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

const AuthUserSchema = new Schema<IAuthUser>(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String },
    role: { type: String, default: "admin" },
    status: { type: String, default: "active" },
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

AuthUserSchema.index({ email: 1 });

export default mongoose.models.AuthUser || mongoose.model<IAuthUser>("AuthUser", AuthUserSchema);
