"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
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
  Zap,
  Crown,
  Gem,
  Flower,
  Sun,
  Moon,
  Feather,
  Waves,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";
import { BookingSection } from "@/components/booking/booking-section";
import { toast } from "sonner";

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
    const result = selectSectionProducts("featured", (product) => product.status === "active");
    return result;
  }, [selectSectionProducts]);

  return (
    <div className={`bg-white transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <HeroSection />
      <BrandingSection />
      <BookingSection />
      <AboutFounderSection />
      <AboutPratipalSection />
      <ApproachSection />
      <FeaturedProducts products={featuredProducts} />
      <TestimonialsSection />
      <CtaBanner />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center py-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Crown className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Sacred Healing Journey</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
                <span className="block text-white font-bold mb-2">EVERY MOMENT</span>
                <span className="block text-white font-bold text-5xl md:text-6xl lg:text-7xl">"प्रतिपल"</span>
              </h1>

              <h2 className="text-2xl md:text-3xl font-serif text-emerald-100 font-medium">
                Do you need healing?
              </h2>

              <p className="text-lg text-emerald-100 leading-relaxed italic">
                "Healing is not merely cure, it is weaving smile in routine."
              </p>
            </div>

            <div className="space-y-4 text-base text-white/90 leading-relaxed">
              <p>
                At Pratipal, I am your personal healing assistant, to integrate the methodology of ancient healing rituals, into your modern lifestyle in a seamless, natural & progressive manner, without disturbing your routine.
              </p>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <User className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-white/80">
                    - Founder & Chief Executive Officer
                  </p>
                  <p className="font-semibold text-white">
                    Dr. Aparnaa Singh
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
              >
                <Zap className="h-4 w-4" />
                Start Your Journey
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                <Gem className="h-4 w-4" />
                Explore Courses
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center animate-fade-in">
            <div className="relative max-w-lg w-full">
              <div className="relative rounded-2xl border-2 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
                <Image
                  src="/assets/image1.jpg"
                  alt="Dr. Aparnaa Singh - Pratipal Healing"
                  width={640}
                  height={820}
                  className="w-full h-auto object-contain"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent"></div>
              </div>

              {/* Bottom Info Card */}
              <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 leading-relaxed mb-2">
                      With doctorate in Naturopathy & Yoga, qualified practitioner & trainer of Acupressure, Reiki Grand Master, Fertility Coach & a healer of 15 various healing techniques.
                    </p>
                    <Link
                      href="#about"
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      <Sparkles className="h-4 w-4" />
                      Know more
                    </Link>
                  </div>
                </div>
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
    <section className="relative py-12 overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=800&fit=crop"
          alt="Forest"
          fill
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-900/70 to-blue-900/80" />
      </div>

      <div className="relative z-10 container text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg mb-8">
            <Waves className="h-4 w-4 text-emerald-300" />
            <span className="text-emerald-100 text-sm font-medium tracking-wider">Rooted in Ancient Wisdom</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            प्रतिपल
          </h2>
          
          <p className="text-xl text-emerald-200 italic max-w-2xl mx-auto mb-4">
            &ldquo;To nurture, to protect, to heal&rdquo;
          </p>
          
          <p className="text-base text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
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
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-100 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg mb-6">
            <User className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Meet the Visionary</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-peacock mb-4">
            About the Founder
          </h2>
          <div className="w-16 h-0.5 bg-gradient-brand mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div className="relative animate-fade-in">
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/image2.jpg"
                alt="Dr. Aparnaa Singh"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
              
              {/* Professional badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">Healing Expert</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 animate-slide-up">
            <div>
              <h3 className="text-3xl font-serif font-bold text-gradient-peacock mb-2">
                Dr. Aparnaa Singh
              </h3>
              <p className="text-lg text-emerald-600 font-medium mb-4">
                Founder & Chief Executive Officer
              </p>
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Dr. Aparnaa Singh is an <span className="font-semibold text-emerald-600">Integrative Healing & Consciousness Coach</span> and certified Naturopathy Practitioner with over <span className="font-bold text-teal-600">9 years of experience</span> in holistic and energy-based healing.
              </p>

              <p>
                Her work seamlessly blends science, spirituality, and natural therapies to help individuals restore harmony across body, mind, and soul. With doctorate in Naturopathy & Yoga, she is a qualified practitioner & trainer of Acupressure, Reiki Grand Master, and Fertility Coach.
              </p>

              <p>
                As a healer of <span className="font-bold text-blue-600">15 various healing techniques</span>, having treated & trained many, she is on a mission to reform & revolutionise the costly, non-affordable wellness industry.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Key Achievements:
              </h4>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <span>Successful assistance to women in overcoming health & infertility challenges</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                  <span>Empowering <span className="font-semibold">500+ healers</span> in launching spiritual business</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Mentored <span className="font-semibold">1000+ families</span> towards medicine free life</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                <Heart className="h-4 w-4" />
                Learn More
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
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
    <section id="about" className="relative overflow-hidden py-12 md:py-16 bg-[#f4fafc]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-16 w-72 h-72 bg-brand-support/20 blur-3xl rounded-full"></div>
        <div className="absolute right-10 -bottom-10 w-80 h-80 bg-brand-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-brand-support/20 to-transparent"></div>
      </div>

      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-white/80 shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-support" />
              <span className="text-xs font-semibold tracking-[0.28em] text-brand-support uppercase">Our Story</span>
            </div>

            <h2 className="mt-4 text-4xl md:text-5xl font-serif font-semibold text-brand-dark leading-tight">
              Precision wellness with the warmth of traditional medicine
            </h2>

            <p className="mt-4 text-base md:text-lg text-[#2a4a5f] leading-relaxed">
              In an ever-dynamic world, physical and mental well-being often become an afterthought. Pratipal was
              founded to bring integrative healing back to the centre—bridging naturopathy, energy medicine, and modern
              lifestyle design so transformation fits inside busy routines.
            </p>
            <p className="mt-4 text-base md:text-lg text-[#2a4a5f] leading-relaxed">
              Instead of isolated clinics or expensive retreats, we nurture a continuum of care: diagnostics,
              personalised rituals, handcrafted formulations, and guided communities that make healing both structured
              and deeply human.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-brand-primary/5 backdrop-blur hover:-translate-y-1 hover:border-brand-support/40 transition-all"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-support text-white shadow-lg">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-primary">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-2xl shadow-brand-primary/10 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-support">Impact</p>
                  <p className="mt-1 text-2xl font-serif text-brand-primary">From research notes to ritual kits</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-support px-5 py-3 text-sm font-semibold text-white shadow-lg">
                  Clinical empathy
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-brand-cream/60 bg-brand-cream/40 p-3 text-center">
                    <p className="text-3xl font-serif text-brand-primary">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-[#32586b]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-brand-sand/50 bg-gradient-to-br from-brand-cream/70 to-white p-4">
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
    <section className="py-12 md:py-16 bg-white">
      <div className="container">
        <div className="text-center mb-10">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
              <div className="p-6">
                <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">
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
  // Show section even if no products, with a message
  const hasProducts = products.length > 0;

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 to-emerald-50/30 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg mb-6">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Handcrafted Collection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-peacock mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our specially curated featured products, each crafted with intention and infused with positive energy
          </p>
          <div className="w-16 h-0.5 bg-gradient-brand mx-auto mt-4"></div>
        </div>

        {hasProducts ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {products.map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="text-center animate-slide-up">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                Explore All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <ShoppingBag className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon</h3>
            <p className="text-slate-600 mb-6">Our featured products are being carefully curated for you.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-brand hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
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

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (adding) return;
    
    setAdding(true);
    try {
      // Add to local cart first for immediate UI feedback
      addItem(product);
      
      // Show success toast
      toast.success(`${product.name} added to cart!`);
      
      // Then sync with server
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to sync cart with server:', await response.text());
        // Don't remove from local cart as user might be offline
      }
    } catch (error) {
      console.warn('Failed to sync cart with server:', error);
      // Don't remove from local cart as user might be offline
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Add button */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-brand hover:text-white border border-white/30 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-800 leading-tight line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-emerald-600 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gradient-peacock">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-brand hover:shadow-md px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <ShoppingBag className="h-3 w-3" /> 
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}



function TestimonialsSection() {
  const testimonials = [
    {
      name: "Shweta, Jaipur",
      text: "I approached Dr. Aparnaa Singh feeling emotionally drained and energetically imbalanced. Through tailored Reiki energy healing sessions, she guided me through deep release and realignment. Over time, I noticed deep relaxation, emotional release, improved sleep, and renewed inner balance.",
      rating: 5,
      role: "Wellness Seeker",
    },
    {
      name: "Reshma Sharma, Dibrugarh",
      text: "Her consistent support, combined with mental, psychological, and emotional therapy through multiple holistic healing methodologies, helped open my consciousness and restore deep trust in my body. I was able to conceive naturally and deliver a healthy baby.",
      rating: 5,
      role: "New Mother",
    },
    {
      name: "Mithlesh Mittal, Jamnagar",
      text: "The Intention & Ritual Salt Course gave me clear knowledge on creating intention-based salts and building a salt business. As I applied the remedies, I experienced powerful shifts—old blockages cleared, thinking sharpened, and business flow improved.",
      rating: 5,
      role: "Spiritual Entrepreneur",
    },
  ];

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-10 animate-slide-up">
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

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 mb-3 leading-relaxed text-sm italic relative">
                <span className="text-4xl text-emerald-200 absolute -top-2 -left-1 font-serif">"</span>
                <span className="relative z-10">{testimonial.text}</span>
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{testimonial.name}</div>
                  <div className="text-sm text-emerald-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 animate-slide-up">
          
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="relative py-12 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600">
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
