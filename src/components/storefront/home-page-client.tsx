"use client";

import React, { useCallback, useMemo, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Leaf,
  ShoppingBag,
  Sparkles,
  Calendar,
  User,
  Zap,
  Crown,
  Gem,
  Flower,
  Waves,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartAnimation } from "@/lib/cart-animation-context";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";
import { BookingSection } from "@/components/booking/booking-section";
import { toast } from "sonner";
import { ProductCard } from "@/components/storefront/product-card";

type SectionKey = Extract<HomepageSection, "featured" | "best_sellers" | "new_arrivals" | "on_sale">;
const SECTION_KEYS: SectionKey[] = ["featured", "best_sellers", "new_arrivals", "on_sale"];

interface HomePageClientProps {
  products: Product[];
}

export function HomePageClient({ products }: HomePageClientProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.status === "active");
  }, [products]);

  return (
    <div className={`bg-white transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <HeroSection />
      <BrandingSection />
      <BookingSection />
      <AboutFounderSection />
      <ApproachSection />
      <FeaturedProducts products={featuredProducts} />
      <TestimonialsSection />
      <CtaBanner />
    </div>
  );
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 0,
      image: "/assets/image1.jpg",
      video: null,
      overlayGradient: "from-emerald-950/80 via-emerald-900/60 to-teal-900/50",
      badge: "Sacred Healing Journey",
      badgeIcon: "crown",
      title: "EVERY MOMENT",
      titleHindi: "\"प्रतिपल\"",
      subtitle: "Do you need healing?",
      description: "At Pratipal, I am your personal healing assistant, integrating ancient healing rituals into your modern lifestyle seamlessly.",
      quote: "\"Healing is not merely cure, it is weaving smile in routine.\"",
      cta1: { text: "Start Your Journey", href: "/booking", icon: "zap" },
      cta2: { text: "Explore Courses", href: "/courses", icon: "gem" },
    },
    {
      id: 1,
      image: "/assets/image3.jpeg",
      video: null,
      overlayGradient: "from-slate-950/80 via-blue-950/60 to-indigo-900/50",
      badge: "Meet the Visionary",
      badgeIcon: "user",
      title: "Dr. Aparnaa Singh",
      titleHindi: null,
      subtitle: "Integrative Healing & Consciousness Coach",
      description: "With a doctorate in Naturopathy & Yoga, she is a qualified practitioner & trainer of Acupressure, Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques.",
      quote: "\"9+ years of experience in holistic and energy-based healing\"",
      cta1: { text: "Know More", href: "/about", icon: "heart" },
      cta2: { text: "Book a Session", href: "/booking", icon: "calendar" },
    },
    {
      id: 2,
      image: "/assets/approach-holistic.jpg",
      video: null,
      overlayGradient: "from-teal-950/80 via-emerald-900/60 to-cyan-900/50",
      badge: "Handcrafted with Intention",
      badgeIcon: "sparkles",
      title: "Sacred Healing",
      titleHindi: "Products & Courses",
      subtitle: "Transform Your Mind, Body & Soul",
      description: "Every product is crafted with sacred intention, pure ingredients, and the ancient healing wisdom of Ayurveda and crystal therapy.",
      quote: "\"To nurture, to protect, to heal\"",
      cta1: { text: "Shop Products", href: "/shop", icon: "shopping" },
      cta2: { text: "View Courses", href: "/courses", icon: "gem" },
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop",
      video: null,
      overlayGradient: "from-indigo-950/80 via-purple-900/60 to-violet-900/50",
      badge: "Empowering Healers",
      badgeIcon: "flower",
      title: "500+ Healers",
      titleHindi: "Empowered Worldwide",
      subtitle: "Reform & Revolutionise Wellness",
      description: "Join a growing community of healers on a mission to make holistic wellness affordable, structured, and deeply human for every family.",
      quote: "\"1000+ families guided towards a medicine-free life\"",
      cta1: { text: "Join Community", href: "/courses", icon: "zap" },
      cta2: { text: "Learn More", href: "/about", icon: "heart" },
    },
  ];

  const SLIDE_DURATION = 7000;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, currentSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const getIcon = (icon: string, className: string) => {
    switch (icon) {
      case "crown": return <Crown className={className} />;
      case "user": return <User className={className} />;
      case "sparkles": return <Sparkles className={className} />;
      case "flower": return <Flower className={className} />;
      case "zap": return <Zap className={className} />;
      case "gem": return <Gem className={className} />;
      case "heart": return <Heart className={className} />;
      case "calendar": return <Calendar className={className} />;
      case "shopping": return <ShoppingBag className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <section
      className="hero-slideshow relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "560px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slides ── */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Ken Burns */}
          <div className={`absolute inset-0 ${index === currentSlide ? "hero-ken-burns" : ""}`}>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={index === 0}
              quality={90}
            />
          </div>

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayGradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          {/* Grain / Texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        </div>
      ))}

      {/* ── Content Overlay ── */}
      {/* Mobile: anchor to bottom so text sits above dots; Desktop: vertically centred */}
      <div className="absolute inset-0 z-20 flex items-end sm:items-center pb-20 sm:pb-0">
        <div className="w-full px-5 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div
              key={`content-${currentSlide}`}
              className="hero-slide-content space-y-3 sm:space-y-5"
            >
              {/* Badge */}
              <div className="hero-content-item inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                {getIcon(slides[currentSlide].badgeIcon, "h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-300")}
                <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
                  {slides[currentSlide].badge}
                </span>
              </div>

              {/* Title */}
              <div className="hero-content-item space-y-0.5">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1] drop-shadow-lg">
                  {slides[currentSlide].title}
                </h1>
                {slides[currentSlide].titleHindi && (
                  <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-emerald-200 leading-tight drop-shadow-md">
                    {slides[currentSlide].titleHindi}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <h2 className="hero-content-item text-base sm:text-xl md:text-2xl lg:text-3xl font-serif text-white/90 font-medium">
                {slides[currentSlide].subtitle}
              </h2>

              {/* Quote — hidden on small screens to save space */}
              <p className="hero-content-item hidden sm:block text-sm sm:text-base md:text-lg text-emerald-200/90 italic leading-relaxed">
                {slides[currentSlide].quote}
              </p>

              {/* Description */}
              <p className="hero-content-item text-sm sm:text-base text-white/80 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
                {slides[currentSlide].description}
              </p>

              {/* CTAs */}
              <div className="hero-content-item flex flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href={slides[currentSlide].cta1.href}
                  className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-0.5"
                >
                  {getIcon(slides[currentSlide].cta1.icon, "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110")}
                  <span className="whitespace-nowrap">{slides[currentSlide].cta1.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={slides[currentSlide].cta2.href}
                  className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 hover:border-white/70"
                >
                  {getIcon(slides[currentSlide].cta2.icon, "h-3.5 w-3.5 sm:h-4 sm:w-4")}
                  <span className="whitespace-nowrap">{slides[currentSlide].cta2.text}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Arrows — desktop only ── */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Bottom Navigation Dots & Progress ── */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group relative transition-all duration-300 ${
              index === currentSlide ? "w-10 sm:w-12 h-2.5 sm:h-3" : "w-2.5 sm:w-3 h-2.5 sm:h-3"
            } rounded-full overflow-hidden`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/30 group-hover:bg-white/50"
            }`} />
            {index === currentSlide && !isPaused && (
              <div
                className="absolute inset-0 rounded-full bg-emerald-400 origin-left"
                style={{
                  animation: `hero-progress ${SLIDE_DURATION}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Slide Counter — desktop only ── */}
      <div className="absolute bottom-8 right-8 z-30 hidden md:flex items-center gap-2 text-white/50 text-sm font-mono">
        <span className="text-white font-semibold text-lg">{String(currentSlide + 1).padStart(2, "0")}</span>
        <span className="w-6 h-px bg-white/30" />
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>

    </section>
  );
}

function BrandingSection() {
  return (
    <section className="relative py-8 overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=800&fit=crop"
          alt="Forest"
          fill
          className="object-cover opacity-90"
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzA2NGUzYiIvPjwvc3ZnPg=="
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-900/70 to-blue-900/80" />
      </div>

      <div className="relative z-10 container text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg mb-4">
            <Waves className="h-4 w-4 text-emerald-300" />
            <span className="text-emerald-100 text-sm font-medium tracking-wider">Rooted in Ancient Wisdom</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 leading-tight">
            प्रतिपल
          </h2>
          
          <p className="text-xl text-emerald-200 italic max-w-2xl mx-auto mb-3">
            &ldquo;To nurture, to protect, to heal&rdquo;
          </p>
          
          <p className="text-base text-white/70 max-w-3xl mx-auto leading-relaxed mb-6">
            Every product is crafted with sacred intention, pure ingredients, and the ancient healing wisdom of Ayurveda and crystal therapy.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-gradient-peacock mb-2">100%</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Natural</div>
            </div>
            
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-gradient-peacock mb-2">500+</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Healers Empowered</div>
            </div>
            
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-gradient-peacock mb-2">1000+</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Families Guided</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutFounderSection() {
  return (
    <section className="py-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-100 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg mb-4">
            <User className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Meet the Visionary</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gradient-peacock mb-3">
            About the Founder
          </h2>
          <div className="w-16 h-0.5 bg-gradient-brand mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto">
          {/* Image — compact on mobile */}
          <div className="relative animate-fade-in">
            <div className="relative w-full aspect-[4/3] sm:aspect-[4/4] lg:aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/image2.jpg"
                alt="Dr. Aparnaa Singh"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDFmYWU1Ii8+PC9zdmc+"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">Healing Expert</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3 animate-slide-up">
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gradient-peacock mb-1">
                Dr. Aparnaa Singh
              </h3>
              <p className="text-base text-emerald-600 font-medium">
                Founder & Chief Executive Officer
              </p>
            </div>

            <div className="space-y-3 text-slate-700 leading-relaxed text-sm sm:text-base">
              <p>
                Dr. Aparnaa Singh is an <span className="font-semibold text-emerald-600">Integrative Healing & Consciousness Coach</span> and certified Naturopathy Practitioner with over <span className="font-bold text-teal-600">9 years of experience</span> in holistic and energy-based healing.
              </p>
              <p>
                With a doctorate in Naturopathy & Yoga, she is a qualified practitioner & trainer of Acupressure, Reiki Grand Master, Fertility Coach, and a healer of <span className="font-bold text-blue-600">15 various healing techniques</span>.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Key Achievements
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <span>Assisted women in overcoming health & infertility challenges</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                  <span>Empowered <span className="font-semibold">500+ healers</span> in launching spiritual businesses</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Mentored <span className="font-semibold">1000+ families</span> towards medicine-free life</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
              >
                <Heart className="h-4 w-4" />
                Learn More
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
              >
                <Calendar className="h-4 w-4" />
                Book Session
              </Link>
            </div>
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
    <section className="py-8 md:py-10 bg-white">
      <div className="container">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-3">
            <Leaf className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">The Pratipal Way</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gradient-brand mb-3">
            Approach
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            We believe healing should be simple, practical, and accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {approaches.map((approach, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-brand-teal/30"
            >
              <div className="relative h-44 w-full overflow-hidden rounded-t-3xl">
                <Image
                  src={approach.image}
                  alt={`${approach.title} approach visual`}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-teal">
                  <approach.icon className="h-4 w-4" />
                  <span>Pratipal</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">
                  {approach.title}
                </h3>
                <p className="text-gray-600 leading-relaxed pb-4">
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
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const cols = window.innerWidth < 640 ? 2 : 4;
    const cardW = scrollRef.current.clientWidth / cols;
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardW : cardW, behavior: "smooth" });
  }

  return (
    <section className="py-8 sm:py-10 bg-gradient-to-br from-slate-50 to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full mb-4">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-medium">Handcrafted Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gradient-peacock mb-3">
            Featured Products
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Each product crafted with intention and infused with positive energy
          </p>
        </div>

        {products.length > 0 ? (
          <>
            {/* Carousel */}
            <div className="relative mb-8">
              {/* Left arrow */}
              <button
                onClick={() => scroll("left")}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition"
                aria-label="Scroll left"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
              >
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="snap-start flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(25%-9px)]"
                  >
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scroll("right")}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition"
                aria-label="Scroll right"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-6 py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                Explore All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
              <ShoppingBag className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Coming Soon</h3>
            <p className="text-slate-500 text-sm mb-6">Our featured products are being carefully curated for you.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300"
            >
              <Sparkles className="h-4 w-4" />
              Browse All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


function TestimonialsSection() {
  const testimonials = [
    {
      name: "Shweta",
      location: "Jaipur",
      text: "I approached Dr. Aparnaa Singh feeling emotionally drained and energetically imbalanced. Through tailored Reiki energy healing sessions, she guided me through deep release and realignment. Over time, I noticed deep relaxation, emotional release, improved sleep, and renewed inner balance.",
      role: "Wellness Seeker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shweta&backgroundColor=b6e3f4",
    },
    {
      name: "Reshma Sharma",
      location: "Dibrugarh",
      text: "Her consistent support, combined with mental, psychological, and emotional therapy through multiple holistic healing methodologies, helped open my consciousness and restore deep trust in my body. I was able to conceive naturally and deliver a healthy baby.",
      role: "New Mother",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reshma&backgroundColor=ffd5dc",
    },
    {
      name: "Mithlesh Mittal",
      location: "Jamnagar",
      text: "The Intention & Ritual Salt Course gave me clear knowledge on creating intention-based salts and building a salt business. As I applied the remedies, I experienced powerful shifts—old blockages cleared, thinking sharpened, and business flow improved.",
      role: "Spiritual Entrepreneur",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mithlesh&backgroundColor=c0aede",
    },
  ];

  return (
    <section className="py-8 bg-white relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg mb-6">
            <Heart className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Healing Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-peacock mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real experiences from our healing community
          </p>
          <div className="w-16 h-0.5 bg-gradient-brand mx-auto mt-4"></div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 max-w-6xl lg:mx-auto lg:px-0">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="snap-start flex-shrink-0 w-[300px] sm:w-[340px] bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fade-in flex flex-col"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Author at top */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 leading-tight">{testimonial.name}</div>
                  <div className="text-xs text-slate-400">{testimonial.location}</div>
                  <div className="text-xs text-emerald-600 font-medium">{testimonial.role}</div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-slate-600 leading-relaxed text-sm italic relative">
                <span className="text-4xl text-emerald-200 absolute -top-2 -left-1 font-serif leading-none">"</span>
                <span className="relative z-10 pl-3">{testimonial.text}</span>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="relative py-8 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/30 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 container text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg mb-8">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-white font-medium">Transform Your Life</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Begin Your Healing Journey Today
          </h2>
          
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Join thousands who have transformed their lives through our sacred rituals and healing sessions
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#booking"
              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <Calendar className="h-4 w-4" />
              Book a Session
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
