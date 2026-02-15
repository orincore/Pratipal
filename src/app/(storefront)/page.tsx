import { getProducts } from "@/services/api";
import { HomePageClient } from "@/components/storefront/home-page-client";
import { products as fallbackProducts } from "@/data/products";

export default async function HomePage() {
  const realProducts = await getProducts();
  const productsToShow = realProducts.length > 0 ? realProducts : fallbackProducts;

  return <HomePageClient products={productsToShow} />;
}
