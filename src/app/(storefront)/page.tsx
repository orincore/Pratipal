import { getProducts } from "@/services/api";
import { HomePageClient } from "@/components/storefront/home-page-client";

export default async function HomePage() {
  try {
    const products = await getProducts();
    return <HomePageClient products={products} />;
  } catch (error) {
    console.error("Failed to fetch products for homepage:", error);
    // Return empty array instead of fallback dummy data
    return <HomePageClient products={[]} />;
  }
}
