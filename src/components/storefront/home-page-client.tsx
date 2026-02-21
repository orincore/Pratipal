"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Star, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";

type SectionKey = Extract<HomepageSection, "featured" | "best_sellers" | "new_arrivals" | "on_sale">;
const SECTION_KEYS: SectionKey[] = ["featured", "best_sellers", "new_arrivals", "on_sale"];

interface HomePageClientProps {
  products: Product[];
}

interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  cta: string;
  price?: number;
}

interface HeroBannerProps {
  products: Product[];
}

const HERO_FALLBACK_SLIDES: HeroSlide[] = [
  {
    title: "Most Awaited\nHavan Cups\nBack in Stock",
    subtitle: "Handcrafted with sacred herbs & pure ghee",
    image: "https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=610",
    cta: "Shop Now",
    href: "/candles",
  },
  {
    title: "Healing\nEssential Oil\nRoll-Ons",
    subtitle: "Therapeutic grade oils for everyday wellness",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&h=700&fit=crop",
    cta: "Explore",
    href: "/essential-oil",
  },
  {
    title: "Energy\nIntention\nSalts",
    subtitle: "Cleanse your aura with crystal-infused bath salts",
    image: "https://www.nytarra.in/cdn/shop/files/9_f34914c2-e1fa-453c-af98-4039446e9577.jpg?v=1767872410&width=823",
    cta: "Discover",
    href: "/mood-refresher",
  },
];

export function HomePageClient({ products }: HomePageClientProps) {
  const sectionedProducts = useMemo(() => {
    const record: Record<SectionKey, Product[]> = {
      featured: [],
      best_sellers: [],
      new_arrivals: [],
      on_sale: [],
    };
    products.forEach((product) => {
      const key = product.homepageSection as SectionKey | undefined;
      if (key && SECTION_KEYS.includes(key)) {
        record[key].push(product);
      }
    });
    return record;
  }, [products]);

  const selectSectionProducts = useCallback(
    (key: SectionKey, fallbackPredicate: (product: Product) => boolean) => {
      const assigned = [...sectionedProducts[key]];
      const uniqueAssigned = assigned.filter(
        (product, index, array) => array.findIndex((p) => p.id === product.id) === index
      );

      if (uniqueAssigned.length >= 4) {
        return uniqueAssigned.slice(0, 4);
      }

      const result = [...uniqueAssigned];
      const fallbackPool = products.filter(fallbackPredicate);
      for (const candidate of fallbackPool) {
        if (result.length >= 4) break;
        if (!result.some((item) => item.id === candidate.id)) {
          result.push(candidate);
        }
      }
      return result.slice(0, 4);
    },
    [products, sectionedProducts]
  );

  const featuredProducts = useMemo(
    () => selectSectionProducts("featured", (product) => product.category === "candles"),
    [selectSectionProducts]
  );
  const bestSellers = useMemo(
    () => selectSectionProducts("best_sellers", (product) => product.status === "active"),
    [selectSectionProducts]
  );
  const newArrivals = useMemo(
    () => selectSectionProducts("new_arrivals", () => true),
    [selectSectionProducts]
  );
  const onSaleProducts = useMemo(
    () => selectSectionProducts("on_sale", (product) => product.status === "active"),
    [selectSectionProducts]
  );

  const heroProducts = sectionedProducts.featured;

  return (
    <div className="bg-white">
      <HeroBanner products={heroProducts} />
      <CategoryGrid />
      <BrandingSection />
      {featuredProducts.length > 0 && (
        <ProductSection
          title="Featured Rituals"
          subtitle="Handpicked treasures showcased across the hero experience"
          products={featuredProducts}
          href="/candles"
          bgClass="bg-brand-warm"
        />
      )}
      {newArrivals.length > 0 && (
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh drops from the studio—updated as soon as you mark them in the admin"
          products={newArrivals}
          href="/"
          bgClass="bg-white"
        />
      )}
      <LifestyleSection />
      {bestSellers.length > 0 && (
        <ProductSection
          title="Best Sellers"
          subtitle="Most loved products by our community of healers and wellness seekers"
          products={bestSellers}
          href="/"
          bgClass="bg-white"
        />
      )}
      {onSaleProducts.length > 0 && (
        <ProductSection
          title="On Sale"
          subtitle="Limited-time offers curated through the homepage manager"
          products={onSaleProducts}
          href="/"
          bgClass="bg-brand-warm"
        />
      )}
      <CtaBanner />
    </div>
  );
}

function HeroBanner({ products }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo<HeroSlide[]>(() => {
    if (!products.length) return HERO_FALLBACK_SLIDES;
    return products.slice(0, 3).map((product) => ({
      title: product.name,
      subtitle: product.shortDescription || "Handcrafted rituals for your daily practice",
      image: product.image || "/placeholder.jpg",
      href: `/product/${product.slug}`,
      cta: "Shop Now",
      price: product.price,
    }));
  }, [products]);

  useEffect(() => {
    setCurrentSlide((prev) => {
      if (slides.length === 0) return 0;
      return Math.min(prev, slides.length - 1);
    });
  }, [slides]);

  const slide = slides[currentSlide] ?? HERO_FALLBACK_SLIDES[0];

  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <div className="container">
        <div className="relative flex flex-col md:flex-row items-center min-h-[420px] md:min-h-[520px] py-8 md:py-0">
          <div className="relative z-10 flex-1 max-w-lg md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-primary leading-[1.1] whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="mt-4 text-base md:text-lg text-brand-primary/70 font-sans max-w-sm">
              {slide.subtitle}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-gradient-brand hover:bg-gradient-brand-hover text-white px-8 py-3.5 rounded-full text-sm font-sans font-medium tracking-wide transition-all duration-300 hover:shadow-xl shadow-md"
              >
                {slide.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="text-sm font-sans text-brand-teal hover:text-brand-green underline underline-offset-4 transition-colors"
              >
                View All Products
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-8 bg-gradient-brand"
                      : "w-2 bg-gray-300 hover:bg-brand-teal"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 relative mt-6 md:mt-0 w-full">
            <div className="mx-auto w-full max-w-xl rounded-[32px] bg-white/60 p-3 md:p-5 shadow-2xl shadow-brand-secondary/10">
              <div className="relative w-full aspect-[4/3] md:aspect-[3/2] rounded-[24px] overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/25 to-transparent" />
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hidden md:flex"
          >
            <ChevronLeft className="h-5 w-5 text-brand-secondary" />
          </button>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hidden md:flex"
          >
            <ChevronRight className="h-5 w-5 text-brand-secondary" />
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  const categories = [
    {
      name: "Healing Candles",
      image: "https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=610",
      href: "/candles",
      span: "col-span-2 row-span-2",
    },
    {
      name: "Essential Oils",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop",
      href: "/essential-oil",
      span: "col-span-1",
    },
    {
      name: "Intention Salts",
      image: "https://nathabit.in/_nat/images/lavender_unwind_1_138ba5857f.jpg?format=auto&width=640&quality=75&f=n",
      href: "/mood-refresher",
      span: "col-span-1",
    },
    {
      name: "Gift Boxes",
      image: "https://www.thengacoco.com/cdn/shop/files/Evergreen3_720x.jpg?v=1724998015",
      href: "/",
      span: "col-span-1",
    },
    {
      name: "New Arrivals",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      href: "/",
      span: "col-span-1",
    },
  ];

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-brand-teal mb-3">
            Explore Our World
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-brand">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group relative rounded-xl overflow-hidden ${cat.span}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="text-white font-serif text-lg md:text-xl font-semibold drop-shadow-lg">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-white/80 text-xs font-sans mt-1 group-hover:text-brand-green transition-colors">
                  Shop Now <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandingSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-brand">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/30 blur-3xl" />
      </div>

      <div className="relative z-10 container text-center">
        <p className="text-white/80 text-xs font-sans uppercase tracking-[0.4em] mb-4">
          Rooted in Ancient Wisdom
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-none">
          प्रतिपल
        </h2>
        <p className="text-lg md:text-xl text-white/90 font-serif italic max-w-xl mx-auto mb-3">
          &ldquo;To nurture, to protect, to heal&rdquo;
        </p>
        <p className="text-sm text-white/70 font-sans max-w-md mx-auto leading-relaxed">
          Every product is crafted with sacred intention, pure ingredients, and
          the ancient healing wisdom of Ayurveda and crystal therapy.
        </p>

        <div className="flex items-center justify-center gap-8 mt-10">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-white">100%</div>
            <div className="text-[11px] text-white/70 font-sans uppercase tracking-wider mt-1">Natural</div>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-white">500+</div>
            <div className="text-[11px] text-white/70 font-sans uppercase tracking-wider mt-1">Happy Souls</div>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-white">50+</div>
            <div className="text-[11px] text-white/70 font-sans uppercase tracking-wider mt-1">Products</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  href,
  bgClass,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  href: string;
  bgClass: string;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-14 md:py-20 ${bgClass}`}>
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-xs font-sans uppercase tracking-[0.3em] text-brand-teal mb-3">
            Handcrafted Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-brand mb-3">
            {title}
          </h2>
          <p className="text-sm text-gray-600 font-sans max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={href}
            className="inline-flex items-center gap-2 border-2 border-brand-teal text-brand-teal hover:bg-gradient-brand hover:text-white hover:border-transparent px-8 py-3 rounded-full text-sm font-sans font-medium tracking-wide transition-all duration-300 shadow-md"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductGridCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-brand-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

        <button
          onClick={() => addItem(product)}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-gradient-brand hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>

        {product.status === "active" && (
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-brand text-white text-[10px] font-sans font-medium px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Popular
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3 w-3 fill-brand-gold text-brand-gold"
            />
          ))}
          <span className="text-[10px] text-gray-400 font-sans ml-1">(24)</span>
        </div>

        <h3 className="text-sm font-sans font-medium text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-serif font-bold text-gradient-brand">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-white bg-gradient-brand hover:bg-gradient-brand-hover px-3 py-1.5 rounded-full transition-all duration-300 shadow-md"
          >
            <ShoppingBag className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function LifestyleSection() {
  const items = [
    {
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=700&fit=crop",
      title: "Energy Infused Roll-Ons",
      description: "Therapeutic essential oil blends for everyday healing",
      href: "/essential-oil",
    },
    {
      image: "https://nathabit.in/_nat/images/cinnamon_respite_2_fe9c8f0cd6.jpg?format=auto&width=640&quality=75&f=n",
      title: "Crystal Bath Salts",
      description: "Cleanse your energy with intention-infused bath rituals",
      href: "/mood-refresher",
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[3/2]"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-white/90 text-[10px] font-sans uppercase tracking-[0.3em] mb-2">
                  Featured Collection
                </p>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/70 text-sm font-sans mb-4 max-w-xs">
                  {item.description}
                </p>
                <span className="inline-flex items-center gap-2 text-white text-sm font-sans font-medium group-hover:text-brand-green transition-colors">
                  Explore Collection <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-brand">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/30 blur-3xl" />
      </div>

      <div className="relative z-10 container text-center">
        <p className="text-white/80 text-xs font-sans uppercase tracking-[0.4em] mb-4">
          Begin Your Healing Journey
        </p>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
          Discover the Power of<br />
          <span className="text-white drop-shadow-lg">Intentional Healing</span>
        </h2>
        <p className="text-white/70 text-sm font-sans max-w-md mx-auto mb-8 leading-relaxed">
          Join thousands who have transformed their wellness journey with our
          handcrafted healing products.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/candles"
            className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-brand-teal px-8 py-3.5 rounded-full text-sm font-sans font-semibold tracking-wide transition-all duration-300 hover:shadow-xl shadow-lg"
          >
            Shop Candles <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/essential-oil"
            className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-brand-teal px-8 py-3.5 rounded-full text-sm font-sans font-medium tracking-wide transition-all duration-300"
          >
            Explore Essential Oils
          </Link>
        </div>
      </div>
    </section>
  );
}
