import { landingPages } from "@/data/landing-pages";
import { mediaItems } from "@/data/media";
import type {
  Product,
  Category,
  LandingPage,
  MediaItem,
  ProductCategory,
  LandingSlug,
} from "@/types";
import type { Product as EcomProduct, Category as EcomCategory } from "@/lib/ecommerce-types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mapEcomProductToProduct(ecomProduct: EcomProduct): Product {
  return {
    id: ecomProduct.id,
    name: ecomProduct.name,
    slug: ecomProduct.slug,
    shortDescription: ecomProduct.short_description || "",
    price: ecomProduct.sale_price || ecomProduct.price,
    image: ecomProduct.featured_image || ecomProduct.images[0] || "/placeholder.jpg",
    category: (ecomProduct.category?.slug as ProductCategory) || "candles",
    status: ecomProduct.is_active ? "active" : "draft",
    landingPages: [],
  };
}

function mapEcomCategoryToCategory(ecomCategory: EcomCategory): Category {
  return {
    id: ecomCategory.id,
    name: ecomCategory.name,
    slug: ecomCategory.slug,
    description: ecomCategory.description || "",
    image: ecomCategory.image_url || "/placeholder.jpg",
    visibleOnHomepage: ecomCategory.is_active,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/products?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products.map(mapEcomProductToProduct);
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return mapEcomProductToProduct(data.product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return undefined;
  }
}

export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  try {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === category);
    if (!cat) return [];
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/products?categoryId=${cat.id}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products.map(mapEcomProductToProduct);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return [];
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter((p) => ids.includes(p.id));
  } catch (err) {
    console.error("Error fetching products by IDs:", err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/categories`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.categories.map(mapEcomCategoryToCategory);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export async function getVisibleCategories(): Promise<Category[]> {
  return getCategories();
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  try {
    const categories = await getCategories();
    return categories.find((c) => c.slug === slug);
  } catch (err) {
    console.error("Error fetching category:", err);
    return undefined;
  }
}

export async function getLandingPages(): Promise<LandingPage[]> {
  await delay(100);
  return [...landingPages];
}

export async function getLandingPageBySlug(
  slug: LandingSlug
): Promise<LandingPage | undefined> {
  await delay(100);
  return landingPages.find((lp) => lp.slug === slug);
}

export async function updateLandingPage(
  updated: LandingPage
): Promise<LandingPage> {
  await delay(200);
  const idx = landingPages.findIndex((lp) => lp.id === updated.id);
  if (idx !== -1) {
    landingPages[idx] = updated;
  }
  return updated;
}

export async function getMediaItems(): Promise<MediaItem[]> {
  await delay(100);
  return [...mediaItems];
}

export async function updateProduct(updated: Product): Promise<Product> {
  return updated;
}

export async function createProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  return { ...product, id: "" };
}

export async function updateCategory(updated: Category): Promise<Category> {
  return updated;
}

export async function createCategory(
  category: Omit<Category, "id">
): Promise<Category> {
  return { ...category, id: "" };
}

export async function deleteCategory(id: string): Promise<void> {
  return;
}
