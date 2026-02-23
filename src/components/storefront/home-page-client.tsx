"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, Star, ShoppingBag, Sparkles, Heart, Leaf, Calendar, User, MessageSquare, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product, HomepageSection } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SESSION_TYPES } from "@/lib/session-types";

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

  const heroProducts = sectionedProducts.featured;

  return (
    <div className="bg-white">
      <HeroSection products={heroProducts} />
      <BrandingSection />
      <BookingSection />
      <FeaturedProducts products={featuredProducts} />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaBanner />
    </div>
  );
}

function HeroSection({ products }: HeroBannerProps) {
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
              <span className="text-gray-800">EVERY MOMENT</span>
              <br />
              <span className="text-gradient-brand">"PRATIPAL"</span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gray-700 mb-4">
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
                  src={slide.image}
                  alt={slide.title}
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

function BookingSection() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sessionType: "",
    frequency: "",
    healingType: "",
    courseType: "",
    notes: "",
  });
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handleSessionTypeChange = (value: string) => {
    setFormData({
      ...formData,
      sessionType: value,
      frequency: "",
      healingType: "",
      courseType: "",
    });
    setSelectedAmount(0);
  };

  const handleFrequencyChange = (value: string) => {
    setFormData({ ...formData, frequency: value });
    const freq = SESSION_TYPES.one_to_one.frequencies.find((f) => f.value === value);
    setSelectedAmount(freq?.price || 0);
  };

  const handleHealingTypeChange = (value: string) => {
    setFormData({ ...formData, healingType: value });
    const type = SESSION_TYPES.need_based.types.find((t) => t.value === value);
    setSelectedAmount(type?.price || 0);
  };

  const handleCourseTypeChange = (value: string) => {
    setFormData({ ...formData, courseType: value });
    const course = SESSION_TYPES.learning_curve.courses.find((c) => c.value === value);
    setSelectedAmount(course?.price || 0);
  };

  const handleGroupHealingSelect = () => {
    setSelectedAmount(SESSION_TYPES.group_healing.price);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.sessionType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedAmount === 0) {
      toast.error("Please select a session option");
      return;
    }

    setLoading(true);

    try {
      const bookingRes = await fetch("/api/sessions/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: selectedAmount,
        }),
      });

      if (!bookingRes.ok) {
        throw new Error("Failed to create booking");
      }

      const { booking } = await bookingRes.json();

      const paymentRes = await fetch("/api/sessions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: selectedAmount,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const { orderId } = await paymentRes.json();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const whatsappMessage = `Hi! I've booked a session (${booking.booking_number}). Looking forward to connecting!`;
      const whatsappNumber = "919876543210";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedAmount * 100,
        currency: "INR",
        name: "Pratipal Healing",
        description: `Session Booking - ${booking.booking_number}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/sessions/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            window.open(whatsappUrl, "_blank");
            window.location.href = `/booking-success?bookingId=${booking.id}`;
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: {
          color: "#1B7F79",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <Calendar className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Book Your Healing Journey</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn to cure yourself and many. Points of transformation & training courses
          </p>
        </div>

        {!showBookingForm ? (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: "One to One Healing",
                  description: "Personalized healing sessions tailored to your frequency needs - daily, weekly, or custom schedules",
                  icon: Heart,
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  title: "Need Based Healing",
                  description: "Specialized healing including Tarot, EFT, Reiki, Acupressure, and personalized wellness routines",
                  icon: Sparkles,
                  gradient: "from-blue-500 to-teal-500",
                },
                {
                  title: "Group Healing & Training",
                  description: "Collective healing circles, spiritual guidance, and transformative learning courses",
                  icon: Leaf,
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((session, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${session.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${session.gradient} mb-6 shadow-lg`}>
                      <session.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-3">
                      {session.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                      {session.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowBookingForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-green text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Book Your Session Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowBookingForm(false)}
              className="mb-6 text-gray-600 hover:text-brand-teal flex items-center gap-2 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Services
            </button>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-gradient-brand flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Your Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-gradient-brand flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Choose Your Session
                </h3>

                <RadioGroup value={formData.sessionType} onValueChange={handleSessionTypeChange}>
                  <div className="space-y-4">
                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="one_to_one" id="one_to_one" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="one_to_one" className="text-lg font-semibold cursor-pointer">
                            {SESSION_TYPES.one_to_one.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.one_to_one.description}</p>
                          
                          {formData.sessionType === "one_to_one" && (
                            <div className="mt-4 space-y-2">
                              <Label>Select Frequency *</Label>
                              <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Choose frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SESSION_TYPES.one_to_one.frequencies.map((freq) => (
                                    <SelectItem key={freq.value} value={freq.value}>
                                      {freq.label} - ₹{freq.price.toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="need_based" id="need_based" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="need_based" className="text-lg font-semibold cursor-pointer">
                            {SESSION_TYPES.need_based.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.need_based.description}</p>
                          
                          {formData.sessionType === "need_based" && (
                            <div className="mt-4 space-y-2">
                              <Label>Select Healing Type *</Label>
                              <Select value={formData.healingType} onValueChange={handleHealingTypeChange}>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Choose healing type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SESSION_TYPES.need_based.types.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label} - ₹{type.price.toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem 
                          value="group_healing" 
                          id="group_healing" 
                          className="mt-1"
                          onClick={handleGroupHealingSelect}
                        />
                        <div className="flex-1">
                          <Label htmlFor="group_healing" className="text-lg font-semibold cursor-pointer">
                            {SESSION_TYPES.group_healing.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.group_healing.description}</p>
                          <p className="text-brand-teal font-semibold mt-2">₹{SESSION_TYPES.group_healing.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="learning_curve" id="learning_curve" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="learning_curve" className="text-lg font-semibold cursor-pointer">
                            {SESSION_TYPES.learning_curve.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.learning_curve.description}</p>
                          
                          {formData.sessionType === "learning_curve" && (
                            <div className="mt-4 space-y-2">
                              <Label>Select Course *</Label>
                              <Select value={formData.courseType} onValueChange={handleCourseTypeChange}>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Choose course" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SESSION_TYPES.learning_curve.courses.map((course) => (
                                    <SelectItem key={course.value} value={course.value}>
                                      {course.label} - ₹{course.price.toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Share any specific concerns or questions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {selectedAmount > 0 && (
                <div className="bg-gradient-to-r from-brand-teal/10 to-brand-green/10 rounded-xl p-6 border-2 border-brand-teal">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-3xl font-bold text-gradient-brand">
                      ₹{selectedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || selectedAmount === 0}
                className="w-full h-14 text-lg font-semibold"
                variant="cta"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secure payment powered by Razorpay. You'll receive a confirmation email and WhatsApp message after booking.
              </p>
            </form>
          </div>
        )}
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
        <h3 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem] mb-2">
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
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-3">
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
              <div className="font-semibold text-gray-800 text-sm">{testimonial.name}</div>
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
            href="/book-session"
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
