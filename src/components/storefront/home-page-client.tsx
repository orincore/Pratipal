"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Star, ShoppingBag, Sparkles, Heart, Leaf, Calendar, User, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";
import { BookingSection } from "@/components/booking/booking-section";

type SectionKey = Extract<HomepageSection, "best_sellers" | "new_arrivals" | "on_sale">;
const SECTION_KEYS: SectionKey[] = ["best_sellers", "new_arrivals", "on_sale"];

interface HomePageClientProps {
  products: Product[];
}

interface HeroSection {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string;
  cta_link: string | null;
  background_type: string;
  background_image_url: string | null;
  background_video_url: string | null;
  card_type: string;
  card_image_url: string | null;
  card_video_url: string | null;
  display_order: number;
  is_active: boolean;
}

export function HomePageClient({ products }: HomePageClientProps) {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);

  useEffect(() => {
    const fetchHeroSections = async () => {
      try {
        const res = await fetch("/api/hero-sections");
        if (res.ok) {
          const data = await res.json();
          setHeroSections(data.heroSections || []);
        }
      } catch (error) {
        console.error("Failed to fetch hero sections:", error);
      } finally {
        setLoadingHero(false);
      }
    };
    fetchHeroSections();
  }, []);

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
      <HeroSection heroSections={heroSections} loading={loadingHero} />
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

function HeroSection({ heroSections, loading }: { heroSections: HeroSection[]; loading: boolean }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSections.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSections.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSections.length]);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 min-h-[90vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-teal" />
      </section>
    );
  }

  if (heroSections.length === 0) {
    return <DefaultHeroSection />;
  }

  const currentHero = heroSections[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 min-h-[90vh] flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {currentHero.background_type === 'image' && currentHero.background_image_url && (
          <Image
            src={currentHero.background_image_url}
            alt="Background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {currentHero.background_type === 'video' && currentHero.background_video_url && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={currentHero.background_video_url} type="video/mp4" />
          </video>
        )}
        {currentHero.background_type === 'default' && (
          <>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </>
        )}
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 text-brand-teal" />
              <span className="text-sm font-medium text-gradient-brand">Ancient Wisdom, Modern Healing</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight text-gradient-brand whitespace-pre-line">
              {currentHero.title}
            </h1>

            {currentHero.subtitle && (
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gradient-brand">
                {currentHero.subtitle}
              </h2>
            )}

            {currentHero.description && (
              <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
                {currentHero.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                href={currentHero.cta_link || "/shop"}
                className="group inline-flex items-center gap-2 bg-gradient-brand hover:shadow-2xl text-white px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 shadow-xl"
              >
                {currentHero.cta_text}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-brand border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">1000+ Families</div>
                  <div className="text-gray-500">Medicine Free Life</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image/Video */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl rotate-12 animate-float shadow-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl -rotate-12 animate-float-delayed shadow-2xl"></div>
              
              {/* Main Media */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                {currentHero.card_type === 'video' && currentHero.card_video_url ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={currentHero.card_video_url} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={currentHero.card_image_url || "/placeholder.jpg"}
                    alt={currentHero.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-800">4.9</span>
                </div>
                <div className="text-xs text-gray-600">500+ Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {heroSections.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {heroSections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-brand-teal" : "w-2 bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DefaultHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 min-h-[90vh] flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 text-brand-teal" />
              <span className="text-sm font-medium text-gradient-brand">Ancient Wisdom, Modern Healing</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
              <span className="text-gradient-brand">EVERY MOMENT</span>
              <br />
              <span className="text-gradient-brand">"PRATIPAL"</span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gradient-brand mb-4">
              Do you need healing?
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              Healing is not merely cure, it is weaving smile in routine. At Pratipal, I am your personal healing assistant, to integrate the methodology of ancient healing rituals, into your modern lifestyle in a seamless, natural & progressive manner, without disturbing your routine.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 bg-gradient-brand hover:shadow-2xl text-white px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 shadow-xl"
              >
                Explore Products
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all duration-300 shadow-lg border-2 border-gray-200"
              >
                <Calendar className="h-5 w-5" />
                Book a Session
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-brand border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">1000+ Families</div>
                  <div className="text-gray-500">Medicine Free Life</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl rotate-12 animate-float shadow-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl -rotate-12 animate-float-delayed shadow-2xl"></div>
              
              {/* Main Image */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://worldofoorja.com/cdn/shop/files/DSC0725.jpg?v=1758892916&width=610"
                  alt="Pratipal Healing"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-800">4.9</span>
                </div>
                <div className="text-xs text-gray-600">500+ Reviews</div>
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
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop"
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
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Our Story</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            About Pratipal
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
          <p>
            In an ever-evolving and hyper-dynamic world, one vital aspect that has quietly receded to the background—both in thought and action—is our physical and mental well-being. The modern individual, perpetually short on time, finds quick fixes in near-perfect allopathic medicines, while the ancient wisdom of practices like meditation gathers dust, dismissed for lack of time—even for sleep itself. This, perhaps, is the unintended consequence of modern life.
          </p>

          <p>
            The irony runs deep: we understand the need for change, we've heard echoes of the solution—through our elders, in books, or across the internet—but a truly holistic, accessible, and enduring approach remains elusive. What we do find are fragments: an acupressure center here, an Ayurveda clinic there, a naturopathy retreat somewhere—all existing in isolation and often beyond the reach of ordinary affordability.
          </p>

          <p>
            And so, the cynical question returns, "What's new about this? I already know all this. Why pay for it?" But do we really use what we "already know"? Or does our pata hai gyaan—our so-called knowledge—remain just another unlit lamp in the chaos of modern living?
          </p>

          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 rounded-3xl p-8 my-8">
            <p className="text-gray-800 font-medium">
              Before founding Pratipal, I spent six years immersed in diverse courses of study, followed by three years of practical experience—treating patients and mentoring aspiring healers. During this time, I registered my MSME and began producing healing candles and salts tailored to specific ailments, crafted in response to user needs. The growing and sustained demand for these products and related services eventually compelled me to take the next step—launching this platform to reach and serve many more.
            </p>
          </div>

          <p>
            At Pratipal, our vision is to nurture a community of healers and seekers alike. We aim to provide structured training for those aspiring to become healers, offer collective and individual treatments, organize retreat-based healing camps, and extend personalized guidance for day-to-day challenges. Our approach emphasizes simplicity—introducing daily rituals that can be seamlessly integrated into one's existing lifestyle, without disrupting its rhythm, yet gently transforming it from within.
          </p>
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
    },
    {
      icon: Calendar,
      title: "Practical",
      description: "Designed to integrate seamlessly into busy modern lives.",
    },
    {
      icon: Heart,
      title: "Accessible",
      description: "Affordable, understandable, and available to anyone seeking inner growth.",
    },
    {
      icon: Leaf,
      title: "Energy-Driven",
      description: "Every product, session, and course is intentionally charged to support specific emotional and spiritual outcomes.",
    },
    {
      icon: User,
      title: "Holistic",
      description: "We address the root — not just symptoms — across emotional, mental, physical, and spiritual layers.",
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
              className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-brand-teal/30"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <approach.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-3">
                {approach.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {approach.description}
              </p>
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
