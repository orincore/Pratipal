import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  cost_price?: number;
  sku?: string;
  stock_quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "on_backorder";
  manage_stock: boolean;
  category_id?: mongoose.Types.ObjectId;
  images: string[];
  featured_image?: string;
  is_featured: boolean;
  is_active: boolean;
  homepage_section?: "featured" | "best_sellers" | "new_arrivals" | "on_sale";
  weight?: number;
  dimensions: Record<string, any>;
  tags?: string[];
  highlights?: string[];
  additional_info?: { label: string; value: string }[];
  care_instructions?: string;
  meta_title?: string;
  meta_description?: string;
  is_ebook: boolean;
  ebook_file_url?: string;
  ebook_link?: string;
  created_at: Date;
  updated_at: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    short_description: { type: String },
    price: { type: Number, required: true },
    sale_price: { type: Number },
    cost_price: { type: Number },
    sku: { type: String, unique: true, sparse: true },
    stock_quantity: { type: Number, default: 0 },
    stock_status: { type: String, enum: ["in_stock", "out_of_stock", "on_backorder"], default: "in_stock" },
    manage_stock: { type: Boolean, default: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category" },
    images: { type: [String], default: [] },
    featured_image: { type: String },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    homepage_section: { type: String, enum: ["featured", "best_sellers", "new_arrivals", "on_sale"] },
    weight: { type: Number },
    dimensions: { type: Schema.Types.Mixed, default: {} },
    tags: { type: [String] },
    highlights: { type: [String] },
    additional_info: {
      type: [{ label: String, value: String }],
      default: [],
    },
    care_instructions: { type: String },
    meta_title: { type: String },
    meta_description: { type: String },
    // E-book products: fulfilled by emailing a download link instead of
    // shipping. ebook_file_url wins over ebook_link when both are set (see
    // resolveEbookDownloadUrl in create-order) — a directly uploaded PDF is
    // the more deliberate choice of the two.
    is_ebook: { type: Boolean, default: false },
    ebook_file_url: { type: String },
    ebook_link: { type: String },
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

ProductSchema.index({ category_id: 1 });
ProductSchema.index({ is_active: 1 });
ProductSchema.index({ homepage_section: 1 });

// Always re-register to pick up schema changes (is_ebook etc.) after hot reloads
const ProductModel = (mongoose.models.Product as mongoose.Model<IProduct> | undefined)?.schema?.path("is_ebook")
  ? (mongoose.models.Product as mongoose.Model<IProduct>)
  : (() => { try { return mongoose.model<IProduct>("Product", ProductSchema); } catch { delete mongoose.models.Product; return mongoose.model<IProduct>("Product", ProductSchema); } })();

export default ProductModel;
