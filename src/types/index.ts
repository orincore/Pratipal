import type { StaticImageData } from "next/image";

export type ProductCategory = "candles" | "rollon" | "salt";
export type ProductStatus = "active" | "draft";
export type LandingSlug = "essential-oil" | "candles" | "mood-refresher";
export type HomepageSection =
  | "featured"
  | "best_sellers"
  | "new_arrivals"
  | "on_sale"
  | "none";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  image: string;
  status: ProductStatus;
  landingPages: string[];
  homepageSection?: HomepageSection;
  weight?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  visibleOnHomepage: boolean;
}

export interface LandingPageTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface LandingPageSeo {
  title: string;
  description: string;
}

export type SectionType =
  | "hero"
  | "truth"
  | "audience"
  | "learn"
  | "trainer"
  | "benefits"
  | "products"
  | "faq"
  | "cta";

export interface LandingSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: string;
  visible: boolean;
  order: number;
  items?: SectionItem[];
  image?: string | StaticImageData;
}

export interface SectionItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface LandingPage {
  id: string;
  slug: LandingSlug;
  name: string;
  theme: LandingPageTheme;
  seo: LandingPageSeo;
  sections: LandingSection[];
  linkedProducts: string[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image";
  size: string;
  uploadedAt: string;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}

export interface ServiceFrequency {
  label: string;
  value: string;
  price: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description?: string;
  image_url: string;
  base_price: number;
  frequency_options: ServiceFrequency[];
  category: string;
  is_active: boolean;
  display_order: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}
