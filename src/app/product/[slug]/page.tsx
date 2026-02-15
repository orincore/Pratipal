import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductMediaGallery } from "@/components/storefront/product-media-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductDescriptionTabs } from "@/components/storefront/product-description-tabs";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { formatPrice } from "@/lib/utils";

function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchProduct(slugOrId: string) {
  if (!slugOrId || slugOrId === "undefined") {
    return null;
  }
  const baseUrl = resolveBaseUrl();
  const slugData = await fetchJson(`${baseUrl}/api/products/slug/${slugOrId}`);
  if (slugData?.product) return slugData.product;

  const idData = await fetchJson(`${baseUrl}/api/products/${slugOrId}`);
  return idData?.product ?? null;
}

async function fetchRelatedProducts(categoryId?: string, excludeId?: string) {
  if (!categoryId) return [];
  const baseUrl = resolveBaseUrl();
  const data = await fetchJson(
    `${baseUrl}/api/products?categoryId=${categoryId}&limit=6`
  );
  if (!data?.products) return [];
  return data.products.filter((prod: any) => prod.id !== excludeId).slice(0, 4);
}

interface ProductParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return {};
  }
  return {
    title: `${product.name} | Pratipal` || "Product",
    description: product.meta_description || product.short_description || product.description,
  };
}

export default async function ProductPage({ params }: ProductParams) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  const images = product.images?.length
    ? product.images
    : product.featured_image
    ? [product.featured_image]
    : ["https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80"];
  const price = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const highlights = product.tags?.length ? product.tags : [
    "Hand-poured in small batches",
    "Infused with therapeutic-grade botanicals",
    "Clean-burning, toxin-free wax",
  ];
  const specs = [
    { label: "SKU", value: product.sku || "PTPAL-AROMA" },
    { label: "Category", value: product.category?.name || "Wellness" },
    { label: "Stock", value: `${product.stock_quantity ?? 0} units` },
    { label: "Weight", value: product.weight ? `${product.weight} kg` : "500 g" },
  ];
  const relatedProducts = await fetchRelatedProducts(product.category?.id, product.id);
  const additionalInfo = [
    { label: "Fragrance Family", value: product.tags?.[0] || "Aromatherapy" },
    { label: "Burn Time", value: "Up to 50 hours" },
    { label: "Material", value: "100% soy-coconut wax blend" },
    { label: "Packaging", value: "Gift-ready kraft box" },
  ];
  const productShareUrl = `${resolveBaseUrl()}/product/${product.slug}`;

  return (
    <CustomerAuthProvider>
      <div className="bg-[#fff7f1] min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-gray-400">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span>Home</span>
              <span>/</span>
              <span>{product.category?.name || "Collection"}</span>
            </div>
            <span>Shipping within India</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <ProductMediaGallery images={images} name={product.name} />

            <section className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.4em] text-gray-400">{product.category?.name || "Wellness"}</p>
                <h1 className="text-4xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
                <p className="text-base text-gray-500">
                  {product.short_description || product.meta_description || product.description}
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Why you'll love it</p>
                <ul className="space-y-1 list-disc pl-5">
                  {highlights.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-gray-400 uppercase tracking-[0.3em] text-[11px]">SKU</p>
                  <p className="font-semibold text-gray-900">{product.sku || "PTPAL-AROMA"}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-[0.3em] text-[11px]">Category</p>
                  <p className="font-semibold text-gray-900">{product.category?.name || "Wellness"}</p>
                </div>
              </div>

              <ProductPurchasePanel
                productId={product.id}
                basePrice={price}
                compareAtPrice={product.price}
                stockStatus={product.stock_status}
                variants={product.variants}
                productMeta={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: product.featured_image || images[0],
                  shortDescription: product.short_description,
                  category: (product.category?.slug as any) || "candles",
                }}
                shareUrl={productShareUrl}
              />
            </section>
          </div>

          <ProductDescriptionTabs
            description={product.description}
            additionalInfo={additionalInfo}
            reviewsCount={0}
          />

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="bg-white rounded-[32px] border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Product Specs</h2>
              <dl className="space-y-2 text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between border-b border-gray-100 pb-1">
                    <dt className="text-gray-500">{spec.label}</dt>
                    <dd className="font-medium text-gray-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="bg-white rounded-[32px] border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-white-900">Shipping & returns</h2>
              <ul className="space-y-2 text-sm text-white-600">
                <li>Ships within 48 hours across India</li>
                <li>Free shipping on orders above ₹999</li>
                <li>14-day easy exchanges on unused products</li>
              </ul>
            </div>
            <div className="bg-white rounded-[32px] border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Care instructions</h2>
              <p className="text-sm text-gray-600">
                Trim the wick to 1/4" before each burn, allow the wax to melt edge-to-edge, and keep away from drafts for an even, smoke-free flame.
              </p>
            </div>
          </section>

          {relatedProducts.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">You may also like</p>
                  <h2 className="text-3xl font-semibold text-gray-900 mt-1">Related products</h2>
                </div>
                <Link
                  href="/shop"
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="group rounded-[28px] border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={item.featured_image || item.images?.[0] || images[0]}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {item.category?.name || product.category?.name || "Collection"}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg font-semibold text-[#c2554f]">
                          {formatPrice(item.sale_price && item.sale_price < item.price ? item.sale_price : item.price)}
                        </span>
                        {item.sale_price && item.sale_price < item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </CustomerAuthProvider>
  );
}
