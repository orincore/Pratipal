import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductMediaGallery } from "@/components/storefront/product-media-gallery";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";

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
  const isOnSale = product.sale_price && product.sale_price < product.price;
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

  return (
    <CustomerAuthProvider>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ProductMediaGallery images={images} name={product.name} />

          <div className="bg-white rounded-3xl shadow-sm border p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                {product.category?.name || "Wellness"}
              </p>
              <h1 className="text-3xl font-semibold text-gray-900 mt-2">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-2">
                {product.short_description || product.meta_description || product.description}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-gray-900">₹{price?.toFixed(2)}</p>
                {isOnSale && (
                  <span className="text-sm line-through text-gray-400">₹{product.price?.toFixed(2)}</span>
                )}
              </div>
              <p className={`text-sm font-semibold ${product.stock_status === "in_stock" ? "text-green-600" : "text-red-500"}`}>
                {product.stock_status?.replace("_", " ") || "In stock"}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              {product.description?.split("\n").map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="space-y-4">
              <AddToCartButton productId={product.id} className="w-full h-12 rounded-full text-base justify-center">
                Add to Cart
              </AddToCartButton>
              <a
                href={`/checkout?product=${product.id}`}
                className="flex w-full h-12 items-center justify-center rounded-full border border-gray-900 text-gray-900 font-semibold"
              >
                Buy Now
              </a>
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Tags:</span> {highlights.join(", ")}
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-3xl border p-6 space-y-3">
            <h2 className="text-lg font-semibold">Why you'll love it</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {highlights.map((highlight: string) => (
                <li key={highlight} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-3xl border p-6 space-y-3">
            <h2 className="text-lg font-semibold">Product specs</h2>
            <dl className="space-y-2 text-sm">
              {specs.map((spec: { label: string; value: string }) => (
                <div key={spec.label} className="flex justify-between border-b border-gray-100 pb-1">
                  <dt className="text-gray-500">{spec.label}</dt>
                  <dd className="font-medium text-gray-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white rounded-3xl border p-6 space-y-3">
            <h2 className="text-lg font-semibold">Shipping & care</h2>
            <p className="text-sm text-gray-600">
              Ships within 48 hours. Free shipping above ₹999. Each product is packed in eco-friendly, shock-proof packaging. Keep away from direct sunlight and store in a cool dry place.
            </p>
            <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
              <li>Free replacements on transit damage</li>
              <li>Track your shipment in real-time</li>
              <li>14-day hassle-free returns</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">How to experience it</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["Set the intention", "Ignite the senses", "Seal the ritual"].map((title: string, idx: number) => (
              <div key={title} className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Step {idx + 1}</p>
                <h3 className="font-semibold text-gray-900 mt-1">{title}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {idx === 0 && "Take a deep breath, set a clear intention, and cleanse your space with gentle sound or breathwork."}
                  {idx === 1 && "Light the wick, let the aroma bloom for 15 minutes, and allow the blend to wrap the senses."}
                  {idx === 2 && "Close with gratitude, journal the feelings, and reuse the jar for crystals or keepsakes."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Frequently asked</h2>
          <div className="space-y-3">
            {[
              {
                question: "Is it safe for daily use?",
                answer:
                  "Yes. We use clean-burning waxes, lead-free cotton wicks, and IFRA-compliant essential oils suitable for daily rituals.",
              },
              {
                question: "Does it come with gifting options?",
                answer:
                  "Every order includes a handwritten intention card and tissue wrap. Add a custom note during checkout for gifting.",
              },
              {
                question: "What if I'm not satisfied?",
                answer:
                  "We offer a 14-day satisfaction guarantee. If it doesn’t resonate, contact our care team for exchange or refund assistance.",
              },
            ].map((faq: { question: string; answer: string }) => (
              <details key={faq.question} className="group rounded-2xl border border-gray-100 p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">{faq.question}</summary>
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        </div>
        <Footer />
      </div>
    </CustomerAuthProvider>
  );
}
