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
import { DailyQuoteSection } from "@/components/storefront/daily-quote-section";
import { CoursesSection } from "@/components/storefront/courses-section";
import { GallerySection } from "@/components/storefront/gallery-section";
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
      <CoursesSection />
      <DailyQuoteSection />
      <AboutFounderSection />
      <RecentBlogsSection />
      <FeaturedProducts products={featuredProducts} />
      <TestimonialsSection />
      <GallerySection />
      <BookingSection />
      <CtaBanner />
    </div>
  );
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const baseSlides = [
    {
      id: 0,
      image: "/assets/slide1.jpg",
      video: null,
      overlayGradient: "from-emerald-950/80 via-emerald-900/60 to-teal-900/50",
      badge: "Sacred Healing Journey",
      badgeIcon: "crown",
      title: "EVERY MOMENT",
      titleHindi: "\"प्रतिपल\"",
      subtitle: "Do you need healing?",
      description: "At Pratipal, I am your personal healing assistant, integrating ancient healing rituals into your modern lifestyle seamlessly.",
      quote: "\"Healing is not merely cure, it is weaving smile in routine.\"",
      cta1: { text: "Explore Courses", href: "/courses", icon: "gem" },
      cta2: { text: "Shop Products", href: "/shop", icon: "shopping" },
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
      cta1: { text: "Join Community", href: "https://whatsapp.com/channel/0029VaEPo8M96H4QcAts5i08", icon: "zap" },
      cta2: { text: "Learn More", href: "/about", icon: "heart" },
    },
  ];

  const desktopVideoSlide = {
    id: 10,
    image: "",
    video: "/Homepage Hero/VIDEO-2026-03-27-17-35-58.mp4",
    overlayGradient: "from-emerald-950/60 via-emerald-900/40 to-teal-900/30",
    badge: "Sacred Healing Journey",
    badgeIcon: "crown",
    title: "EVERY MOMENT",
    titleHindi: "\"प्रतिपल\"",
    subtitle: "Integrating Healing with Routine",
    description: "At Pratipal, I am your personal healing assistant, integrating ancient healing rituals into your modern lifestyle seamlessly.",
    quote: "\"Healing is not merely cure, it is weaving smile in routine.\"",
    cta1: { text: "Start Your Journey", href: "/booking", icon: "zap" },
    cta2: { text: "Explore Courses", href: "/courses", icon: "gem" },
  };

  const mobileVideoSlides = [
    {
      id: 11,
      image: "",
      video: "/Homepage Hero/VIDEO-2026-03-27-17-36-04.mp4",
      overlayGradient: "from-emerald-950/60 via-emerald-900/40 to-teal-900/30",
      badge: "Sacred Healing Journey",
      badgeIcon: "crown",
      title: "EVERY MOMENT",
      titleHindi: "\"प्रतिपल\"",
      subtitle: "Integrating Healing with Routine",
      description: "At Pratipal, I am your personal healing assistant, integrating ancient healing rituals into your modern lifestyle seamlessly.",
      quote: "\"Healing is not merely cure, it is weaving smile in routine.\"",
      cta1: { text: "Start Your Journey", href: "/booking", icon: "zap" },
      cta2: { text: "Explore Courses", href: "/courses", icon: "gem" },
    },
    {
      id: 12,
      image: "",
      video: "/Homepage Hero/VIDEO-2026-03-27-17-36-25.mp4",
      overlayGradient: "from-teal-950/60 via-emerald-900/40 to-cyan-900/30",
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
      id: 13,
      image: "",
      video: "/Homepage Hero/VIDEO-2026-03-27-17-36-31.mp4",
      overlayGradient: "from-indigo-950/60 via-purple-900/40 to-violet-900/30",
      badge: "Empowering Healers",
      badgeIcon: "flower",
      title: "500+ Healers",
      titleHindi: "Empowered Worldwide",
      subtitle: "Reform & Revolutionise Wellness",
      description: "Join a growing community of healers on a mission to make holistic wellness affordable, structured, and deeply human for every family.",
      quote: "\"1000+ families guided towards a medicine-free life\"",
      cta1: { text: "Join Community", href: "https://whatsapp.com/channel/0029VaEPo8M96H4QcAts5i08", icon: "zap" },
      cta2: { text: "Learn More", href: "/about", icon: "heart" },
    },
  ];

  const slides = isMobile
    ? [...baseSlides, ...mobileVideoSlides]
    : [...baseSlides, desktopVideoSlide];

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

  const touchStartX = useRef<number>(0);

  return (
    <section
      className="hero-slideshow relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "560px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
      }}
    >
      {/* ── Slides ── */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image with Ken Burns / Video */}
          <div className={`absolute inset-0 ${!slide.video && index === currentSlide ? "hero-ken-burns" : ""}`}>
            {slide.video ? (
              <video
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={index === 0}
                quality={90}
              />
            )}
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
              {/* Badge — hidden on video slides */}
              {slides[currentSlide].id < 10 && (
              <div className="hero-content-item inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                {getIcon(slides[currentSlide].badgeIcon, "h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-300")}
                <span className="text-xs sm:text-sm font-medium text-white/90 tracking-wide">
                  {slides[currentSlide].badge}
                </span>
              </div>
              )}

              {/* Title — hidden on video slides */}
              {slides[currentSlide].id < 10 && (
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
              )}

              {/* Subtitle — hidden on video slides */}
              {slides[currentSlide].id < 10 && (
              <h2 className="hero-content-item text-base sm:text-xl md:text-2xl lg:text-3xl font-serif text-white/90 font-medium">
                {slides[currentSlide].subtitle}
              </h2>
              )}

              {/* Quote — hidden on video slides and small screens */}
              {slides[currentSlide].id < 10 && (
              <p className="hero-content-item hidden sm:block text-sm sm:text-base md:text-lg text-emerald-200/90 italic leading-relaxed">
                {slides[currentSlide].quote}
              </p>
              )}

              {/* Description — hidden on video slides */}
              {slides[currentSlide].id < 10 && (
              <p className="hero-content-item text-sm sm:text-base text-white/80 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
                {slides[currentSlide].description}
              </p>
              )}
              {/* CTAs — hidden on video slides */}
              {slides[currentSlide].id < 10 && (
              <div className="hero-content-item flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2 w-full max-w-xs sm:max-w-none">
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
              )}
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
                 Spiritual Coach & Energy Practitioner 🪷
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


function RecentBlogsSection() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((d) => setBlogs(d.blogs || []))
      .catch(() => {});
  }, []);

  if (blogs.length === 0) return null;

  function slide(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.clientWidth / (window.innerWidth < 640 ? 1 : 3);
    el.scrollBy({ left: dir === "left" ? -(cardW + 24) : (cardW + 24), behavior: "smooth" });
  }

  return (
    <section className="py-8 md:py-12 bg-[#f5f4ef]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-3">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">From the Journal</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-brand">
              Recent Articles
            </h2>
          </div>
          <Link
            href="/blogs"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => slide("left")}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition"
            aria-label="Previous"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          >
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group snap-start flex-shrink-0 w-[calc(100%-0px)] sm:w-[calc(33.333%-16px)] flex flex-col rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {blog.featured_image ? (
                    <Image
                      src={blog.featured_image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Leaf className="h-10 w-10 text-emerald-400" />
                    </div>
                  )}
                  {blog.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-emerald-700">
                      {blog.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-serif font-bold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 flex-1">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-stone-400">
                    <span>{blog.author || "Pratipal"}</span>
                    {blog.read_time && <span>{blog.read_time} min read</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => slide("right")}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition"
            aria-label="Next"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-5 text-center sm:hidden">
          <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition">
            View all articles <ArrowRight className="h-4 w-4" />
          </Link>
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


// Trustpilot star row
function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const h = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className={h} fill={s <= rating ? "#00b67a" : "#dde1e7"}>
          <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
        </svg>
      ))}
    </div>
  );
}

interface TPReview {
  id: string;
  title: string;
  text: string;
  rating: number;
  date: string;
  consumer: { name: string; countryCode: string; imageUrl: string | null; hasImage: boolean };
  verified: boolean;
}
interface TPData {
  businessName: string;
  trustScore: number;
  totalReviews: number;
  reviews: TPReview[];
}

function TestimonialsSection() {
  const [data, setData] = useState<TPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trustpilot")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const reviews = data?.reviews ?? [];
  const score = data?.trustScore ?? null;
  const total = data?.totalReviews ?? null;
  const scoreLabel = !score ? "" : score >= 4.5 ? "Excellent" : score >= 3.5 ? "Great" : "Good";

  return (
    <section className="py-10 bg-white">
      <div className="container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg mb-3">
              <Heart className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium text-sm">Reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-peacock">
              What Our Clients Say
            </h2>
          </div>

          {/* Trustpilot score badge */}
          <a
            href="https://www.trustpilot.com/review/pratipal.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md hover:border-[#00b67a]/40 transition"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 leading-none">{score !== null ? score.toFixed(1) : "—"}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">{scoreLabel || "Trustpilot"}</div>
            </div>
            <div>
              <StarRow rating={Math.round(score ?? 0)} size="md" />
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="#00b67a">
                  <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
                </svg>
                <span className="text-sm font-bold text-gray-800">Trustpilot</span>
                <span className="text-xs text-gray-400">· {total !== null ? `${total} reviews` : "reviews"}</span>
              </div>
            </div>
          </a>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex gap-4 max-w-6xl mx-auto overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[300px] h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 max-w-6xl lg:mx-auto lg:px-0">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="snap-start flex-shrink-0 w-[280px] sm:w-[310px] bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#00b67a]/30 transition-all duration-300 flex flex-col"
              >
                {/* Stars + TP logo */}
                <div className="flex items-center justify-between mb-3">
                  <StarRow rating={r.rating} />
                  <div className="flex items-center gap-1 opacity-60">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#00b67a">
                      <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-500">Trustpilot</span>
                  </div>
                </div>

                {/* Title */}
                {r.title && (
                  <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{r.title}</p>
                )}

                {/* Review text */}
                <blockquote className="text-sm text-slate-600 leading-relaxed flex-1 mb-4 line-clamp-4">
                  {r.text}
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                  {r.consumer.hasImage && r.consumer.imageUrl ? (
                    <img
                      src={r.consumer.imageUrl}
                      alt={r.consumer.name}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {r.consumer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-tight truncate">{r.consumer.name}</div>
                    <div className="text-xs text-slate-400">
                      {r.consumer.countryCode && `${r.consumer.countryCode} · `}
                      {r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                    </div>
                  </div>
                  {r.verified && (
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-[#00b67a] font-semibold flex-shrink-0">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.54 6.54l-4 4a.75.75 0 01-1.08 0l-2-2a.75.75 0 011.08-1.08L7 9l3.46-3.46a.75.75 0 011.08 1.08z" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* See all button */}
        <div className="text-center mt-6">
          <a
            href="https://www.trustpilot.com/review/pratipal.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#00b67a] text-[#00b67a] text-sm font-semibold hover:bg-[#00b67a] hover:text-white transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
            </svg>
            See all {total !== null ? `${total} ` : ""}reviews on Trustpilot
          </a>
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
