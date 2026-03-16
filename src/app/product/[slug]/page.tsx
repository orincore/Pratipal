import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductMediaGallery } from "@/components/storefront/product-media-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Package, ShieldCheck, Zap } from "lucide-react";

function resolveBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return "https://www.pratipal.in";
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return "http://localhost:3000";
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchProduct(slugOrId: string) {
  if (!slugOrId || slugOrId === "undefined") return null;
  const baseUrl = resolveBaseUrl();
  const slugData = await fetchJson(`${baseUrl}/api/products/slug/${slugOrId}`);
  if (slugData?.product) return slugData.product;
  const idData = await fetchJson(`${baseUrl}/api/products/${slugOrId}`);
  return idData?.product || null;
}

async function fetchRelatedProducts(categoryId?: string, excludeId?: string) {
  if (!categoryId) return [];
  const baseUrl = resolveBaseUrl();
  const data = await fetchJson(`${baseUrl}/api/products?categoryId=${categoryId}&limit=6`);
  if (!data?.products) return [];
  return data.products.filter((p: any) => p.id !== excludeId).slice(0, 4);
}

interface ProductParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product Not Found | Pratipal" };
  return {
    title: `${product.name} | Pratipal`,
    description: product.meta_description || product.short_description || product.description,
    openGraph: {
      title: `${product.name} | Pratipal`,
      description: product.meta_description || product.short_description,
      images: product.featured_image ? [product.featured_image] : undefined,
    },
  };
}

const trustBadges = [
  { icon: Zap, label: "Fast delivery" },
  { icon: ShieldCheck, label: "100% authentic" },
  { icon: Package, label: "Secure packaging" },
];

export default async function ProductPage({ params }: ProductParams) {
  try {
    const { slug } = await params;
    const product = await fetchProduct(slug);
    if (!product) notFound();

    const images = product.images?.length
      ? product.images
      : product.featured_image
      ? [product.featured_image]
      : [];

    const price = product.sale_price && product.sale_price < product.price
      ? product.sale_price
      : product.price;

    const relatedProducts = await fetchRelatedProducts(product.category?.id, product.id);
    const productShareUrl = `${resolveBaseUrl()}/product/${product.slug}`;

    const specs = [
      product.category?.name && { label: "Category", value: product.category.name },
      product.weight && { label: "Weight", value: `${product.weight} kg` },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
      <CustomerAuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1 pt-[82px] pb-16">
            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest">
                <Link href="/" className="hover:text-gray-700 transition">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-gray-700 transition">Shop</Link>
                {product.category?.name && (
                  <>
                    <span>/</span>
                    <span className="text-gray-500">{product.category.name}</span>
                  </>
                )}
              </nav>
            </div>

            {/* Main product section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                <ProductMediaGallery images={images} name={product.name} />

                <div className="space-y-6">
                  {/* Category + Name */}
                  <div className="space-y-2">
                    {product.category?.name && (
                      <span className="inline-block text-[11px] uppercase tracking-[0.35em] text-emerald-600 font-semibold">
                        {product.category.name}
                      </span>
                    )}
                    <h1
                      className="text-3xl sm:text-4xl text-[#1b244a] leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                    >
                      {product.name}
                    </h1>
                    {product.short_description && (
                      <p className="text-base text-gray-500 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  {product.highlights?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#1b244a] uppercase tracking-wider">
                        Why you'll love it
                      </p>
                      <ul className="space-y-1.5">
                        {product.highlights.map((item: string) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Purchase panel */}
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
                      category: (product.category?.slug as any) || "general",
                    }}
                    shareUrl={productShareUrl}
                  />

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {trustBadges.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-gray-100 p-3 text-center"
                      >
                        <Icon className="h-5 w-5 text-emerald-600" />
                        <span className="text-[10px] text-gray-500 leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            {product.description && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
                  <h2
                    className="text-xl text-[#1b244a] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                  >
                    Description
                  </h2>
                  {(() => {
                    const isPlainText = !/<[a-z][\s\S]*>/i.test(product.description);
                    const html = isPlainText
                      ? product.description.split("\n").map((line: string) => `<p>${line || "&nbsp;"}</p>`).join("")
                      : product.description;
                    return (
                      <div
                        className="prose prose-neutral max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Specs + Care instructions */}
            {(specs.length > 0 || product.care_instructions) && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  {specs.length > 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
                      <h2
                        className="text-lg text-[#1b244a]"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Product Specs
                      </h2>
                      <dl className="space-y-2 text-sm">
                        {specs.map((spec) => (
                          <div key={spec.label} className="flex justify-between border-b border-gray-50 pb-1.5">
                            <dt className="text-gray-400">{spec.label}</dt>
                            <dd className="font-medium text-gray-800">{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
                      <h2
                        className="text-lg text-[#1b244a]"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      >
                        Care Instructions
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.care_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">You may also like</p>
                    <h2
                      className="text-2xl sm:text-3xl text-[#1b244a] mt-1"
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                    >
                      Related Products
                    </h2>
                  </div>
                  <Link href="/shop" className="text-sm font-semibold text-emerald-600 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedProducts.map((item: any) => {
                    const itemPrice = item.sale_price && item.sale_price < item.price
                      ? item.sale_price
                      : item.price;
                    return (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        className="group rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        <div className="relative h-52 w-full overflow-hidden bg-gray-50">
                          {(item.featured_image || item.images?.[0]) ? (
                            <Image
                              src={item.featured_image || item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-1.5">
                          {item.category?.name && (
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                              {item.category.name}
                            </p>
                          )}
                          <h3 className="text-sm font-semibold text-[#1b244a] line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-emerald-600">
                              {formatPrice(itemPrice)}
                            </span>
                            {item.sale_price && item.sale_price < item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </main>
          <Footer />
        </div>
      </CustomerAuthProvider>
    );
  } catch (error) {
    console.error("ProductPage error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <Link href="/shop" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-full hover:opacity-90">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
}
