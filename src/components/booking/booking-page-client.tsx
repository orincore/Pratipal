"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Calendar, CheckCircle, Clock, Heart,
  Loader2, Mail, MessageCircle, Phone, Sparkles, Star,
  Users, Zap, Leaf, Crown, X, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { ShareButtons } from "@/components/storefront/share-buttons";

interface FrequencyOption {
  label: string;
  value: string;
  price: number;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  base_price: number;
  frequency_options: FrequencyOption[];
  category: string;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  { id: "1", title: "One to One Healing", description: "A deeply personalised session tailored to your unique energy, emotional state, and healing goals.", image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop", base_price: 2500, frequency_options: [{ label: "Single Session", value: "single", price: 2500 }, { label: "3 Sessions", value: "3x", price: 6500 }, { label: "6 Sessions", value: "6x", price: 12000 }], category: "Healing" },
  { id: "2", title: "Need Based Therapy", description: "Targeted healing for specific challenges — anxiety, grief, relationship blocks, fertility, or chronic pain.", image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop", base_price: 3500, frequency_options: [{ label: "Per Session", value: "single", price: 3500 }], category: "Therapy" },
  { id: "3", title: "Group Healing Circle", description: "Join a sacred circle of like-minded souls for collective energy healing and transformation.", image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop", base_price: 999, frequency_options: [{ label: "Per Session", value: "single", price: 999 }], category: "Group" },
  { id: "4", title: "Learning Curve Program", description: "Learn healing techniques for yourself and your family. Reiki, Acupressure, and energy management.", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", base_price: 5000, frequency_options: [{ label: "Full Program", value: "program", price: 5000 }], category: "Learning" },
  { id: "5", title: "Fertility & Wellness Coaching", description: "Holistic support for your fertility journey combining naturopathy, energy healing, and emotional release.", image_url: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=800&h=600&fit=crop", base_price: 4500, frequency_options: [{ label: "Monthly Package", value: "monthly", price: 4500 }], category: "Coaching" },
  { id: "6", title: "Corporate Wellness Session", description: "Stress reduction, energy balancing, and mindfulness sessions for teams of any size.", image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop", base_price: 8000, frequency_options: [{ label: "Per Session", value: "single", price: 8000 }], category: "Corporate" },
];

const steps = [
  { icon: MessageCircle, step: "01", title: "Choose Service", desc: "Select what resonates with your current needs." },
  { icon: Calendar, step: "02", title: "Book a Slot", desc: "Pick a convenient time across time zones." },
  { icon: Heart, step: "03", title: "Receive Healing", desc: "In-person or via video call." },
  { icon: Sparkles, step: "04", title: "Transform", desc: "Integrate with follow-up support." },
];

const highlights = [
  { icon: Star, value: "9+", label: "Years Exp." },
  { icon: Users, value: "1000+", label: "Families" },
  { icon: Crown, value: "500+", label: "Healers" },
  { icon: CheckCircle, value: "15+", label: "Techniques" },
];

const BLUR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDFlZmU4Ii8+PC9zdmc+";

// ── Razorpay types ──────────────────────────────────────────────────────────
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
}

// ── Booking Modal ───────────────────────────────────────────────────────────
function BookingModal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
  const { customer } = useCustomerAuth();
  const safeOptions = service.frequency_options?.length ? service.frequency_options : [{ label: "Single Session", value: "single", price: service.base_price }];
  const [selectedFreq, setSelectedFreq] = useState<FrequencyOption>(safeOptions[0]);
  const [name, setName] = useState(customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Load Razorpay script
  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customer) {
      window.location.href = `/login?redirect=/booking`;
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create booking + Razorpay order
      const createRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          service_id: service.id,
          service_name: service.title,
          service_category: service.category,
          frequency_label: selectedFreq.label,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          amount: selectedFreq.price,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create booking");

      const { booking, razorpay_order_id, razorpay_key_id, amount } = createData;

      // 2. Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway. Please try again.");

      // 3. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount,
          currency: "INR",
          name: "Pratipal",
          description: `${service.title} — ${selectedFreq.label}`,
          order_id: razorpay_order_id,
          prefill: { name: name.trim(), email: email.trim(), contact: phone.trim() },
          theme: { color: "#059669" },
          handler: async (response: RazorpayResponse) => {
            try {
              // 4. Verify payment
              const verifyRes = await fetch("/api/bookings/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: booking.id,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

              // 5. Redirect to WhatsApp
              window.location.href = verifyData.whatsapp_url;
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              resolve();
            },
          },
        });
        rzp.open();
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative h-36 sm:h-44 flex-shrink-0">
          <Image
            src={service.image_url || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop"}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            placeholder="blur"
            blurDataURL={BLUR}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-12">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white bg-emerald-600/80 px-2 py-0.5 rounded-full">
              {service.category}
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-1 leading-tight">{service.title}</h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>

          {/* Frequency selector */}
          {safeOptions.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Choose Plan</p>
              <div className="grid grid-cols-1 gap-2">
                {safeOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedFreq.value === opt.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedFreq.value === opt.value ? "border-emerald-500" : "border-gray-300"
                      }`}>
                        {selectedFreq.value === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{formatPrice(opt.price)}</span>
                    <input
                      type="radio"
                      name="frequency"
                      value={opt.value}
                      checked={selectedFreq.value === opt.value}
                      onChange={() => setSelectedFreq(opt)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Your Details</p>

            {!customer && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>You need to <Link href="/login?redirect=/booking" className="font-semibold underline">log in</Link> to complete your booking.</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Summary + Pay */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">{selectedFreq.label}</p>
                  <p className="text-xl font-bold text-emerald-700">{formatPrice(selectedFreq.price)}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Secure payment</p>
                  <p>via Razorpay</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || !customer}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Pay {formatPrice(selectedFreq.price)} & Book</>
                )}
              </button>
              {!customer && (
                <Link
                  href="/login?redirect=/booking"
                  className="mt-2 w-full flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200"
                >
                  Log in to Book
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export function BookingPageClient() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        const list: ServiceItem[] = d.services?.length ? d.services : FALLBACK_SERVICES;
        setServices(list);
        // Auto-open modal if ?service=id is in URL
        const params = new URLSearchParams(window.location.search);
        const sid = params.get("service");
        if (sid) {
          const match = list.find((s) => s.id === sid);
          if (match) setSelectedService(match);
        }
      })
      .catch(() => setServices(FALLBACK_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const startingPrice = (s: ServiceItem) => s.frequency_options[0]?.price ?? s.base_price;

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="relative flex items-end sm:items-center overflow-hidden" style={{ minHeight: "52vh" }}>
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop" alt="Healing" fill className="object-cover object-center" priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-teal-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
        <div className="relative z-10 container max-w-6xl px-4 sm:px-6 py-16 sm:py-28">
          <div className="max-w-xl space-y-3 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Leaf className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-xs text-white/90 font-medium tracking-wide">Sacred Healing Programs</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
              Begin Your<br /><span className="text-emerald-300">Healing Journey</span>
            </h1>
            <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
              Personalised sessions blending ancient wisdom with modern therapeutic techniques.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
              <a href="#services" className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300">
                <Sparkles className="h-3.5 w-3.5" />Explore Services<ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a href="https://wa.me/917605072424" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border-2 border-white/40 text-white hover:bg-white/10 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300">
                <MessageCircle className="h-3.5 w-3.5" />WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 py-4 sm:py-6">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-6">
            {highlights.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 mb-1 sm:mb-2">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-300" />
                </div>
                <div className="text-lg sm:text-2xl font-serif font-bold text-white">{value}</div>
                <div className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-8 sm:py-14 bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <Heart className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-xs font-medium">What We Offer</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900">Healing Programs</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-base">Each program addresses specific aspects of your wellbeing — body, mind, and soul.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-emerald-600" /></div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="snap-start flex-shrink-0 w-[72vw] sm:w-auto group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative h-36 sm:h-48 flex-shrink-0 overflow-hidden">
                    <Image src={service.image_url || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop"} alt={service.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 33vw" placeholder="blur" blurDataURL={BLUR} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-2 left-2 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-white bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-full">{service.category}</span>
                  </div>
                  <div className="p-3 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-sm sm:text-lg font-serif font-semibold text-gray-900 mb-1 leading-snug group-hover:text-emerald-700 transition-colors">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-3 flex-1">{service.description}</p>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">From</p>
                        <p className="text-base sm:text-xl font-bold text-emerald-700">{formatPrice(startingPrice(service))}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedService(service); }}
                          className="inline-flex items-center gap-1 text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[10px] sm:text-xs font-semibold px-2.5 py-2 rounded-xl transition-all duration-200"
                        >
                          <ArrowRight className="h-3 w-3" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedService(service); }}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200"
                        >
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full">
              <Zap className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-teal-700 text-xs font-medium">Simple Process</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative text-center group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-100">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center justify-center">{step}</div>
                <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-[11px] sm:text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Dr. Aparnaa ── */}
      <section className="py-8 sm:py-14 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="container max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-center">
            <div className="hidden sm:block relative">
              <div className="relative w-full aspect-[4/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/assets/image2.jpg" alt="Dr. Aparnaa Singh" fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" placeholder="blur" blurDataURL={BLUR} />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
              </div>
              <div className="absolute bottom-4 right-4 bg-white rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xs font-semibold text-gray-800">4.9/5 Rating</p>
                <p className="text-[10px] text-gray-500">500+ reviews</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-5 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Crown className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-xs text-white/90 font-medium">Your Healer</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-tight">Dr. Aparnaa Singh</h2>
              <p className="text-emerald-200 font-medium text-sm">Integrative Healing & Consciousness Coach</p>
              <p className="text-white/75 leading-relaxed text-sm">
                With a doctorate in Naturopathy & Yoga and 9+ years of experience, Dr. Aparnaa blends science, spirituality, and natural therapies to restore harmony across body, mind, and soul.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["Reiki Grand Master", "Acupressure Trainer", "Fertility Coach", "15+ Techniques"].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5">
                    <CheckCircle className="h-3 w-3 text-emerald-300 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs text-white/80">{tag}</span>
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300">
                <Heart className="h-4 w-4" />Learn More<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="container max-w-3xl px-4 sm:px-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-emerald-100 text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-xs font-medium">Ready to Begin?</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900">Book Your Session</h2>
            <p className="text-slate-500 max-w-md mx-auto text-xs sm:text-base">Reach out via WhatsApp or email. We respond within 24 hours.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/917605072424" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg">
                <MessageCircle className="h-4 w-4" />WhatsApp Us
              </a>
              <a href="mailto:hello@pratipal.in" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300">
                <Mail className="h-4 w-4" />Email Us
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-500" /><span>Flexible Scheduling</span></div>
              <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-emerald-500" /><span>Online & In-Person</span></div>
              <div className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span>24hr Response</span></div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="font-semibold text-gray-700 mb-3 text-sm text-center">Share Our Booking Page</p>
            <div className="flex justify-center">
              <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/booking`} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking Modal ── */}
      {selectedService && (
        <BookingModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

    </div>
  );
}
