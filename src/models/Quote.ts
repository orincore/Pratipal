import mongoose, { Schema, Document } from "mongoose";

export interface IQuote extends Document {
  text: string;
  author?: string;
  date: string; // YYYY-MM-DD — the day this quote is shown
  status: "active" | "draft";
  created_at: Date;
  updated_at: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    text: { type: String, required: true },
    author: { type: String, default: "" },
    date: { type: String, required: true, unique: true }, // one quote per day
    status: { type: String, enum: ["active", "draft"], default: "active" },
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

QuoteSchema.index({ date: 1 });
QuoteSchema.index({ status: 1 });

export default mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);
