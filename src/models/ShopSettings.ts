import mongoose, { Schema, Document } from "mongoose";

export interface IShopSettings extends Document {
  gridColumnsDesktop: number;
  gridColumnsTablet: number;
  gridColumnsMobile: number;
  cardBgColor: string;
  cardBorderRadius: number;
  cardShadow: string;
  cardHoverShadow: string;
  cardBorderColor: string;
  cardHoverBorderColor: string;
  cardPadding: number;
  imageAspectRatio: string;
  imageObjectFit: string;
  imageHoverScale: boolean;
  showCategory: boolean;
  categoryColor: string;
  showDiscountBadge: boolean;
  discountBadgeBg: string;
  discountBadgeColor: string;
  productTitleColor: string;
  productTitleSize: number;
  productTitleWeight: number;
  showDescription: boolean;
  descriptionColor: string;
  descriptionSize: number;
  priceColor: string;
  priceSize: number;
  showActions: boolean;
  buttonVariant: "solid" | "outline";
  buttonText: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  buttonHoverBg: string;
  buttonHoverTextColor: string;
  buttonBorderRadius: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  buttonHoverScale: boolean;
  cardAnimation: string;
  cardAnimationDuration: number;
  created_at: Date;
  updated_at: Date;
}

const ShopSettingsSchema = new Schema<IShopSettings>(
  {
    gridColumnsDesktop: { type: Number, default: 4 },
    gridColumnsTablet: { type: Number, default: 3 },
    gridColumnsMobile: { type: Number, default: 2 },
    cardBgColor: { type: String, default: "#ffffff" },
    cardBorderRadius: { type: Number, default: 16 },
    cardShadow: { type: String, default: "sm" },
    cardHoverShadow: { type: String, default: "xl" },
    cardBorderColor: { type: String, default: "#f1f5f9" },
    cardHoverBorderColor: { type: String, default: "#a7f3d0" },
    cardPadding: { type: Number, default: 16 },
    imageAspectRatio: { type: String, default: "3/4" },
    imageObjectFit: { type: String, default: "cover" },
    imageHoverScale: { type: Boolean, default: true },
    showCategory: { type: Boolean, default: true },
    categoryColor: { type: String, default: "#ffffff" },
    showDiscountBadge: { type: Boolean, default: true },
    discountBadgeBg: { type: String, default: "#ef4444" },
    discountBadgeColor: { type: String, default: "#ffffff" },
    productTitleColor: { type: String, default: "#1e293b" },
    productTitleSize: { type: Number, default: 16 },
    productTitleWeight: { type: Number, default: 600 },
    showDescription: { type: Boolean, default: true },
    descriptionColor: { type: String, default: "#64748b" },
    descriptionSize: { type: Number, default: 12 },
    priceColor: { type: String, default: "#047857" },
    priceSize: { type: Number, default: 18 },
    showActions: { type: Boolean, default: true },
    buttonVariant: { type: String, enum: ["solid", "outline"], default: "outline" },
    buttonText: { type: String, default: "Add to Cart" },
    buttonBgColor: { type: String, default: "#059669" },
    buttonTextColor: { type: String, default: "#ffffff" },
    buttonBorderColor: { type: String, default: "#059669" },
    buttonHoverBg: { type: String, default: "#047857" },
    buttonHoverTextColor: { type: String, default: "#ffffff" },
    buttonBorderRadius: { type: Number, default: 8 },
    buttonPaddingX: { type: Number, default: 12 },
    buttonPaddingY: { type: Number, default: 8 },
    buttonHoverScale: { type: Boolean, default: true },
    cardAnimation: { type: String, default: "none" },
    cardAnimationDuration: { type: Number, default: 800 },
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

// Force re-register on module load so schema changes apply immediately
delete (mongoose.models as any).ShopSettings;

export default mongoose.models.ShopSettings ||
  mongoose.model<IShopSettings>("ShopSettings", ShopSettingsSchema);
