import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, default: "" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  role: { type: String, default: "" },
  source: { type: String, default: "trustpilot" }, // trustpilot | google | direct
  verified: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
