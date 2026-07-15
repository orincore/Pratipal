import { useEffect, useState } from "react";

export interface ShopSettings {
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
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  gridColumnsDesktop: 4,
  gridColumnsTablet: 3,
  gridColumnsMobile: 2,
  cardBgColor: "#ffffff",
  cardBorderRadius: 16,
  cardShadow: "sm",
  cardHoverShadow: "xl",
  cardBorderColor: "#f1f5f9",
  cardHoverBorderColor: "#a7f3d0",
  cardPadding: 16,
  imageAspectRatio: "3/4",
  imageObjectFit: "cover",
  imageHoverScale: true,
  showCategory: true,
  categoryColor: "#ffffff",
  showDiscountBadge: true,
  discountBadgeBg: "#ef4444",
  discountBadgeColor: "#ffffff",
  productTitleColor: "#1e293b",
  productTitleSize: 16,
  productTitleWeight: 600,
  showDescription: true,
  descriptionColor: "#64748b",
  descriptionSize: 12,
  priceColor: "#047857",
  priceSize: 18,
  showActions: true,
  buttonVariant: "outline",
  buttonText: "Add to Cart",
  buttonBgColor: "#059669",
  buttonTextColor: "#ffffff",
  buttonBorderColor: "#059669",
  buttonHoverBg: "#047857",
  buttonHoverTextColor: "#ffffff",
  buttonBorderRadius: 8,
  buttonPaddingX: 12,
  buttonPaddingY: 8,
  buttonHoverScale: true,
  cardAnimation: "none",
  cardAnimationDuration: 800,
};

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/shop-settings");
        if (res.ok) {
          const data = await res.json();
          // Merge loaded data with defaults
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error("Failed to load shop settings:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { settings, loading };
}
