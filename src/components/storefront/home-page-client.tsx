"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  FlaskConical,
  Heart,
  Leaf,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
  Calendar,
  User,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";
import { BookingSection } from "@/components/booking/booking-section";

type SectionKey = Extract<HomepageSection, "best_sellers" | "new_arrivals" | "on_sale">;
const SECTION_KEYS: SectionKey[] = ["best_sellers", "new_arrivals", "on_sale"];

interface HomePageClientProps {
  products: Product[];
}

export function HomePageClient({ products }: HomePageClientProps) {
  const sectionedProducts = useMemo(() => {
    const record: Record<SectionKey, Product[]> = {
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
    () => selectSectionProducts("best_sellers", (product) => product.category === "candles"),
    [selectSectionProducts]
  );

  return (
    <div className="bg-white">
      <HeroSection />
      <BrandingSection />
      <AboutFounderSection />
      <AboutPratipalSection />
      <ApproachSection />
      <BookingSection />
      <FeaturedProducts products={featuredProducts} />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaBanner />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f5f0] min-h-[85vh] flex items-center py-12">
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
              <span className="block text-[#1e3a5f] font-bold">EVERY MOMENT</span>
              <span className="block text-[#1e3a5f] font-bold">"PRATIPAL"</span>
            </h1>

            <h2 className="text-3xl md:text-4xl font-serif text-[#2d9b9b] font-semibold">
              Do you need healing?
            </h2>

            <p className="text-base md:text-lg text-[#2d9b9b] italic leading-relaxed">
              Healing is not merely cure, it is weaving smile in routine.
            </p>

            <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>
                At Pratipal, I am your personal healing assistant, to integrate the methodology of ancient healing rituals, into your modern lifestyle in a seamless, natural & progressive manner, without disturbing your routine.
              </p>
              <p className="text-sm text-gray-600">
                - Founder & Chief Executive Officer<br />
                Dr. Aparnaa Singh
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2d9b9b] text-white px-8 py-3 rounded-md text-base font-medium transition-all duration-300"
              >
                Start Your Journey
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center">
            <div className="inline-block max-w-xl w-full">
              <div className="rounded-lg border-4 border-[#2d9b9b] shadow-2xl bg-white overflow-hidden">
                <Image
                  src="/assets/image1.jpeg"
                  alt="Dr. Aparnaa Singh - Pratipal Healing"
                  width={640}
                  height={820}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>

              {/* Bottom Info Card */}
              <div className="mt-6 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  With doctorate in Naturopathy & Yoga, qualified practitioner & trainer of Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques, having treated & trained many, she is on a mission to reform & revolutionise the costly, non-affordable wellness industry.
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Making both physical & mental health accessible to everyone with personal attention at a cost that you can afford.
                </p>
                <Link
                  href="#about"
                  className="inline-flex items-center gap-2 bg-[#2d9b9b] hover:bg-[#1e3a5f] text-white px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 mt-4"
                >
                  Know more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandingSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=800&fit=crop"
          alt="Forest"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-dark/70" />
      </div>

      <div className="relative z-10 container text-center">
        <p className="text-brand-support/80 text-xs font-sans uppercase tracking-[0.4em] mb-6">
          Rooted in Ancient Wisdom
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[1.4] overflow-visible" style={{ paddingTop: '0.75rem', paddingBottom: '0.5rem' }}>
          प्रतिपल
        </h2>
        <p className="text-lg md:text-xl text-white/70 font-serif italic max-w-xl mx-auto mb-3">
          &ldquo;To nurture, to protect, to heal&rdquo;
        </p>
        <p className="text-sm text-white/50 font-sans max-w-md mx-auto leading-relaxed">
          Every product is crafted with sacred intention, pure ingredients, and
          the ancient healing wisdom of Ayurveda and crystal therapy.
        </p>

        <div className="flex items-center justify-center gap-8 mt-10">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-brand-support">100%</div>
            <div className="text-[11px] text-white/50 font-sans uppercase tracking-wider mt-1">Natural</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-brand-support">500+</div>
            <div className="text-[11px] text-white/50 font-sans uppercase tracking-wider mt-1">Healers Empowered</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-serif font-bold text-brand-support">1000+</div>
            <div className="text-[11px] text-white/50 font-sans uppercase tracking-wider mt-1">Families Guided</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutFounderSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <User className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Meet the Founder</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            About the Founder
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative">
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/assets/image2.jpg"
                alt="Dr. Aparnaa Singh"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl -rotate-12 blur-xl opacity-50"></div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-gradient-brand mb-2">
                Dr. Aparnaa Singh
              </h3>
              <p className="text-lg text-gray-600 font-medium mb-6">
                Founder & Chief Executive Officer
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Dr. Aparnaa Singh is an Integrative Healing & Consciousness Coach and certified Naturopathy Practitioner with over 9 years of experience in holistic and energy-based healing. Her work seamlessly blends science, spirituality, and natural therapies to help individuals restore harmony across body, mind, and soul.
            </p>

            <p className="text-gray-700 leading-relaxed">
              With doctorate in Naturopathy & Yoga, qualified practitioner & trainer of Acupressure (Ayurvedic & Chinese), Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques, having treated & trained many, she is on a mission to reform & revolutionise the costly, non-affordable wellness industry.
            </p>

            <p className="text-gray-700 leading-relaxed">
              She is deeply committed to self-healing, preventive health, and conscious living, drawing wisdom from the elements of nature to guide transformation. As the founder of Reiki Magic and Pratipal, Dr. Aparnaa creates safe, nurturing spaces where clients can realign their energy, deepen self-awareness, and manifest a more empowered life.
            </p>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 space-y-3">
              <h4 className="font-semibold text-gray-800 mb-3">Key Achievements:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 flex-shrink-0"></div>
                  <span>Successful assistance to women in overcoming health & infertility challenges</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 flex-shrink-0"></div>
                  <span>Empowering 500+ healers in launching spiritual business</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 flex-shrink-0"></div>
                  <span>Mentored 1000+ families towards medicine free life</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPratipalSection() {
  const highlights = [
    {
      icon: Stethoscope,
      title: "Integrative Case Mapping",
      description:
        "Personalised healing roadmaps created after studying lifestyle, medical history, energy patterns, and emotional goals.",
    },
    {
      icon: FlaskConical,
      title: "Therapeutic Formulations",
      description:
        "Small-batch candles, salts, and oils infused with Ayurvedic botanicals and Reiki intentions for targeted relief.",
    },
    {
      icon: Heart,
      title: "Mentored Communities",
      description:
        "Collective circles, retreats, and healer trainings that keep you accountable and emotionally supported.",
    },
    {
      icon: Activity,
      title: "Evidence-led Rituals",
      description:
        "Daily practices blend breathwork, biorythm balancing, and yogic science—easy to adopt yet clinically grounded.",
    },
  ];

  const stats = [
    { label: "Personal healings", value: "10k+" },
    { label: "Modalities mastered", value: "15" },
    { label: "Client retention", value: "92%" },
    { label: "Clinical experience", value: "9+ yrs" },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-20 md:py-28 bg-[#f4fafc]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-16 w-72 h-72 bg-brand-support/20 blur-3xl rounded-full"></div>
        <div className="absolute right-10 -bottom-10 w-80 h-80 bg-brand-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-brand-support/20 to-transparent"></div>
      </div>

      <div className="container relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-white/80 shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-support" />
              <span className="text-xs font-semibold tracking-[0.28em] text-brand-support uppercase">Our Story</span>
            </div>

            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-brand-dark leading-tight">
              Precision wellness with the warmth of traditional medicine
            </h2>

            <p className="mt-6 text-base md:text-lg text-[#2a4a5f] leading-relaxed">
              In an ever-dynamic world, physical and mental well-being often become an afterthought. Pratipal was
              founded to bring integrative healing back to the centre—bridging naturopathy, energy medicine, and modern
              lifestyle design so transformation fits inside busy routines.
            </p>
            <p className="mt-4 text-base md:text-lg text-[#2a4a5f] leading-relaxed">
              Instead of isolated clinics or expensive retreats, we nurture a continuum of care: diagnostics,
              personalised rituals, handcrafted formulations, and guided communities that make healing both structured
              and deeply human.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-brand-primary/5 backdrop-blur hover:-translate-y-1 hover:border-brand-support/40 transition-all"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-support text-white shadow-lg">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-[32px] border border-white/60 bg-white/90 p-10 shadow-2xl shadow-brand-primary/10 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-support">Impact</p>
                  <p className="mt-2 text-2xl font-serif text-brand-primary">From research notes to ritual kits</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-support px-5 py-3 text-sm font-semibold text-white shadow-lg">
                  Clinical empathy
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-brand-cream/60 bg-brand-cream/40 p-4 text-center">
                    <p className="text-3xl font-serif text-brand-primary">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-[#32586b]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-brand-sand/50 bg-gradient-to-br from-brand-cream/70 to-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-support mb-2">Founder’s note</p>
                <p className="text-sm md:text-base leading-relaxed text-[#2a4a5f]">
                  “Six years of study and three years of active clinical practice led me to craft MSME-certified
                  healing tools tailored to individual cases. Growing demand for these rituals made Pratipal inevitable—a
                  platform to serve more families with the same intimacy and scientific sincerity.”
                </p>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-6 hidden h-44 w-44 rounded-full bg-gradient-to-br from-brand-support/40 to-brand-primary/30 blur-2xl md:block"></div>
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-[32px] border border-dashed border-brand-support/50"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApproachSection() {
  const approaches = [
    {
      icon: Sparkles,
      title: "Simple",
      description: "No complexity, no overwhelm — just intuitive tools and easy-to-follow guidance.",
      image: "/assets/approach-simple.jpg",
    },
    {
      icon: Calendar,
      title: "Practical",
      description: "Designed to integrate seamlessly into busy modern lives.",
      image: "/assets/approach-practical.jpg",
    },
    {
      icon: Heart,
      title: "Accessible",
      description: "Affordable, understandable, and available to anyone seeking inner growth.",
      image: "/assets/approach-accessible.jpg",
    },
    {
      icon: Leaf,
      title: "Energy-Driven",
      description: "Every product, session, and course is intentionally charged to support specific emotional and spiritual outcomes.",
      image: "/assets/approach-energy.jpg",
    },
    {
      icon: User,
      title: "Holistic",
      description: "We address the root — not just symptoms — across emotional, mental, physical, and spiritual layers.",
      image: "/assets/approach-holistic.jpg",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <Leaf className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">The Pratipal Way</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            Approach
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We believe healing should be simple, practical, and accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {approaches.map((approach, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-brand-teal/30"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={approach.image}
                  alt={`${approach.title} approach visual`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-teal">
                  <approach.icon className="h-4 w-4" />
                  <span>Pratipal</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-3">
                  {approach.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {approach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <ShoppingBag className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Handcrafted Collection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            Sacred Rituals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of healing products, each crafted with intention and infused with positive energy
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-8 py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300"
          >
            Explore All Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={() => addItem(product)}
          className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-gradient-brand hover:text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gradient-brand leading-tight line-clamp-2 min-h-[2.5rem] mb-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gradient-brand">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-brand hover:shadow-lg px-4 py-2 rounded-full transition-all duration-300"
          >
            <ShoppingBag className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: Leaf,
      title: "Simple",
      description: "No complexity, no overwhelm — just intuitive tools and easy-to-follow guidance.",
    },
    {
      icon: Heart,
      title: "Practical",
      description: "Designed to integrate seamlessly into busy modern lives.",
    },
    {
      icon: Sparkles,
      title: "Accessible",
      description: "Affordable, understandable, and available to anyone seeking inner growth.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-brand mb-6 shadow-xl">
                <benefit.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gradient-brand mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Shweta, Jaipur",
      text: "I approached Dr. Aparnaa Singh feeling emotionally drained and energetically imbalanced, unsure of what was truly affecting my well-being. Through one-to-one, tailored Reiki energy healing sessions, she gently guided me through a process of deep release and realignment. Each session felt thoughtfully customized, and the continuity of care helped me feel supported at every stage. Over time, I noticed deep relaxation, emotional release, improved sleep, and a renewed sense of inner balance. Her intuitive yet grounded approach has made Reiki an essential part of my long-term wellness journey.",
      rating: 5,
    },
    {
      name: "Reshma Sharma, Dibrugarh",
      text: "I underwent one-to-one, tailored healing sessions with daily frequency under the guidance of Dr. Aparnaa Singh. Her consistent support, combined with mental, psychological, and emotional therapy through multiple holistic healing methodologies, helped open my consciousness and restore deep trust in my body. With her guidance, I was able to conceive naturally and later deliver a healthy baby. The transformation has been life-changing, and I will be continuing with her and for life long.",
      rating: 5,
    },
    {
      name: "Mithlesh Mittal, Jamnagar",
      text: "Joining the Intention & Ritual Salt Course with Dr. Aparnaa Singh gave me clear, step-by-step knowledge on creating intention-based salts and building a salt business with confidence. As I applied the remedies and protocols, I experienced powerful shifts—old blockages cleared, my thinking sharpened, and my business flow and finances improved. This course brought clarity, direction, and real results in both my personal and professional life.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            What Our Clients Are Saying
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from our community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-sm italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="font-semibold text-gradient-brand text-sm">{testimonial.name}</div>
            </div>
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
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
          Begin Your Healing Journey Today
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Join thousands who have transformed their lives through our sacred rituals and healing sessions
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#booking"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-brand-teal px-8 py-4 rounded-full text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-xl shadow-lg"
          >
            <Calendar className="h-5 w-5" />
            Book a Session
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-brand-teal px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300"
          >
            Shop Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
