"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle,
  Send, Loader2, ArrowRight,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSI3MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFiMjQ0YSIvPjwvc3ZnPg==";

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({ type: "success", message: "Your message has been sent. We'll be in touch shortly." });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setSubmitStatus({ type: "error", message: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setSubmitStatus({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Hero ── */}
      {/* Mobile: shorter, less padding. Desktop: unchanged 52vh */}
      <section className="relative overflow-hidden" style={{ minHeight: "clamp(260px, 40vw, 52vh)" }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&h=900&fit=crop"
            alt="Contact Pratipal"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(105deg, rgba(27,36,74,0.96) 0%, rgba(27,36,74,0.82) 55%, rgba(27,36,74,0.45) 100%)" }}
          />
        </div>

        <div className="relative z-10 flex items-center" style={{ minHeight: "clamp(260px, 40vw, 52vh)" }}>
          {/* Mobile: tighter padding + smaller text. Desktop: unchanged */}
          <div className="container max-w-6xl px-5 sm:px-8 py-14 sm:py-32">
            <div className="max-w-lg">
              <p
                className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-2 sm:mb-4"
                style={{ color: "#d97745" }}
              >
                Get in Touch
              </p>

              <h1
                className="text-2xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-3 sm:mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                We're Here<br />
                <span style={{ color: "#d97745" }}>to Help You</span>
              </h1>

              {/* Hide long subline on mobile — saves vertical space */}
              <p
                className="hidden sm:block text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}
              >
                Whether you have a question about our services, want to book a session, or simply want to connect — reach out and we'll respond within 24 hours.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-0">
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: "#d97745", color: "#fff" }}
                >
                  Send a Message <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a
                  href="https://wa.me/917605072424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: "#25D366", color: "#fff" }}
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Info strip ── */}
      {/* Mobile: 2-col grid, smaller padding. Desktop: 4-col with dividers */}
      <div style={{ background: "#232d5f" }}>
        <div className="container max-w-6xl px-5 sm:px-8">
          {/* Mobile: 2×2 grid, no dividers. Desktop: 4-col with dividers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            {[
              { icon: Mail,          label: "Email",    value: "hello@pratipal.in",   note: "24-hour response" },
              { icon: Phone,         label: "Phone",    value: "+91 98765 43210",     note: "Mon–Sat, 9am–6pm" },
              { icon: WhatsAppIcon,  label: "WhatsApp", value: "+91 76050 72424",     note: "Quick replies" },
              { icon: MapPin,        label: "Location", value: "Mumbai, MH",          note: "India" },
            ].map(({ icon: Icon, label, value, note }, i) => (
              <div
                key={label}
                className="flex items-start gap-2.5 sm:gap-3 px-3 sm:px-5 py-3.5 sm:py-6"
                style={{
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                }}
              >
                <div
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(217,119,69,0.18)" }}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#d97745" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-snug truncate">{value}</p>
                  <p className="text-[10px] sm:text-xs mt-0.5 hidden sm:block" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}>{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <section id="contact-form" style={{ background: "#ffffff" }} className="py-8 sm:py-20">
        <div className="container max-w-6xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-10 lg:gap-14 items-start">

            {/* ── Form (3 cols on desktop, full width on mobile) ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(35,45,95,0.08)" }}>

                <div className="px-5 sm:px-7 py-4 sm:py-5 border-b" style={{ borderColor: "rgba(35,45,95,0.08)" }}>
                  <h2
                    className="text-lg sm:text-xl font-bold"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#1b244a" }}
                  >
                    Send Us a Message
                  </h2>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: "rgba(35,45,95,0.5)", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}>
                    Fill in the form and we'll get back to you within one business day.
                  </p>
                </div>

                <div className="px-5 sm:px-7 py-5 sm:py-7">
                  {submitStatus.type && (
                    <div
                      className="mb-4 sm:mb-6 flex items-start gap-3 rounded-xl p-3 sm:p-4 text-sm"
                      style={{
                        background: submitStatus.type === "success" ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                        border: `1px solid ${submitStatus.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                        color: submitStatus.type === "success" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {submitStatus.type === "success"
                        ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        : <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <span className="text-xs sm:text-sm">{submitStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                      <Field label="Full Name" required>
                        <Input id="name" name="name" type="text" value={formData.name}
                          onChange={handleChange} required placeholder="Your name"
                          className="h-10 sm:h-11 rounded-lg border-0 bg-gray-50 text-[#1b244a] placeholder:text-[#232d5f]/30 focus-visible:ring-1 focus-visible:ring-[#d97745] text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }} />
                      </Field>
                      <Field label="Email" required>
                        <Input id="email" name="email" type="email" value={formData.email}
                          onChange={handleChange} required placeholder="your@email.com"
                          className="h-10 sm:h-11 rounded-lg border-0 bg-gray-50 text-[#1b244a] placeholder:text-[#232d5f]/30 focus-visible:ring-1 focus-visible:ring-[#d97745] text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                      <Field label="Phone">
                        <Input id="phone" name="phone" type="tel" value={formData.phone}
                          onChange={handleChange} placeholder="+91 98765 43210"
                          className="h-10 sm:h-11 rounded-lg border-0 bg-gray-50 text-[#1b244a] placeholder:text-[#232d5f]/30 focus-visible:ring-1 focus-visible:ring-[#d97745] text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }} />
                      </Field>
                      <Field label="Subject" required>
                        <Input id="subject" name="subject" type="text" value={formData.subject}
                          onChange={handleChange} required placeholder="How can we help?"
                          className="h-10 sm:h-11 rounded-lg border-0 bg-gray-50 text-[#1b244a] placeholder:text-[#232d5f]/30 focus-visible:ring-1 focus-visible:ring-[#d97745] text-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }} />
                      </Field>
                    </div>

                    <Field label="Message" required>
                      <Textarea id="message" name="message" value={formData.message}
                        onChange={handleChange} required
                        placeholder="Tell us more about your inquiry…"
                        rows={4}
                        className="rounded-lg border-0 bg-gray-50 text-[#1b244a] placeholder:text-[#232d5f]/30 focus-visible:ring-1 focus-visible:ring-[#d97745] resize-none text-sm"
                        style={{ fontFamily: "'Poppins', sans-serif" }} />
                    </Field>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 h-10 sm:h-12 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                      style={{ background: "#232d5f", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.03em" }}
                    >
                      {isSubmitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                        : <><Send className="h-4 w-4" /> Send Message</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            {/* On mobile: compact horizontal cards instead of full sidebar */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">

              {/* Mobile: quick-contact row (hidden on desktop, shown inline) */}
              <div className="lg:hidden grid grid-cols-2 gap-3">
                {[
                  { icon: Clock,        label: "Hours",    value: "Mon–Fri 9am–6pm · Sat 10am–4pm" },
                  { icon: WhatsAppIcon, label: "WhatsApp", value: "+91 76050 72424", href: "https://wa.me/917605072424" },
                ].map(({ icon: Icon, label, value, href }) => {
                  const El = href ? "a" : "div";
                  return (
                    <El
                      key={label}
                      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-start gap-2.5 bg-white rounded-xl p-3 border"
                      style={{ borderColor: "rgba(35,45,95,0.08)" }}
                    >
                      <div className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: label === "WhatsApp" ? "rgba(37,211,102,0.15)" : "rgba(217,119,69,0.12)" }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: label === "WhatsApp" ? "#25D366" : "#d97745" }} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(35,45,95,0.4)" }}>{label}</p>
                        <p className="text-[11px] font-medium leading-snug mt-0.5" style={{ color: "#1b244a" }}>{value}</p>
                      </div>
                    </El>
                  );
                })}
              </div>

              {/* Desktop sidebar — hidden on mobile */}
              <div className="hidden lg:block space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: "#d97745" }}>
                    Our Details
                  </p>
                  <h2
                    className="text-2xl sm:text-3xl font-bold leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#1b244a" }}
                  >
                    Let's Start a Conversation
                  </h2>
                  <p
                    className="mt-2 text-base leading-relaxed"
                    style={{ fontFamily: "'Crimson Text', serif", fontStyle: "italic", color: "rgba(35,45,95,0.6)" }}
                  >
                    We believe every question deserves a thoughtful answer. Reach out through any channel that works for you.
                  </p>
                </div>

                <div className="h-px" style={{ background: "rgba(35,45,95,0.1)" }} />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" style={{ color: "#d97745" }} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: "#232d5f" }}>Business Hours</p>
                  </div>
                  <div className="space-y-1">
                    {[
                      { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
                      { day: "Saturday",        hours: "10:00 AM – 4:00 PM" },
                      { day: "Sunday",          hours: "Closed" },
                    ].map(({ day, hours }) => (
                      <div key={day} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "rgba(35,45,95,0.07)" }}>
                        <span className="text-sm" style={{ color: "rgba(35,45,95,0.65)" }}>{day}</span>
                        <span className="text-sm font-semibold" style={{ color: hours === "Closed" ? "#ef4444" : "#232d5f" }}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px" style={{ background: "rgba(35,45,95,0.1)" }} />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "#232d5f" }}>
                    Common Questions
                  </p>
                  <div className="space-y-4">
                    {[
                      { q: "How soon will I get a response?",     a: "We typically respond within 24 hours on business days." },
                      { q: "Can I book a session via this form?", a: "Yes — mention your preferred service and we'll reach out to schedule." },
                      { q: "Do you offer online sessions?",       a: "All our healing programs are available via video call worldwide." },
                    ].map(({ q, a }) => (
                      <div key={q}>
                        <p className="text-sm font-semibold mb-1" style={{ color: "#1b244a" }}>{q}</p>
                        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Crimson Text', serif", color: "rgba(35,45,95,0.6)" }}>{a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="https://wa.me/917605072424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:opacity-90 group"
                  style={{ background: "#25D366" }}
                >
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <WhatsAppIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Chat on WhatsApp</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}>
                      Fastest way to reach us
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/60 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <label
        className="block text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-semibold"
        style={{ color: "rgba(35,45,95,0.55)", fontFamily: "'Poppins', sans-serif" }}
      >
        {label}{required && <span className="ml-0.5" style={{ color: "#d97745" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
