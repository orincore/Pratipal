"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";

const ICON_STYLES: Record<string, { bg: string; text: string }> = {
  whatsapp:  { bg: "#25D366", text: "#ffffff" },
  facebook:  { bg: "#1877F2", text: "#ffffff" },
  instagram: { bg: "#C13584", text: "#ffffff" },
  x:         { bg: "#000000", text: "#ffffff" },
};

function SocialIcon({ icon }: { icon: string }) {
  if (icon === "whatsapp")
    return (
      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L0 24l6.335-1.508A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.728.888.924-3.638-.234-.374A9.818 9.818 0 1112 21.818z" />
      </svg>
    );
  if (icon === "facebook")
    return (
      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  if (icon === "instagram")
    return (
      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  if (icon === "x")
    return (
      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  return null;
}

interface ThankYouData {
  title: string;
  description: string;
  buttons: { label: string; url: string; icon: string }[];
  from: string;
}

const DEFAULTS: ThankYouData = {
  title: "You're registered!",
  description: "We'll send your access link via email and WhatsApp shortly.",
  buttons: [],
  from: "",
};

export default function ThankYouPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<ThankYouData>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("thankYouData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({
          title: parsed.title || DEFAULTS.title,
          description: parsed.description || DEFAULTS.description,
          buttons: parsed.buttons || [],
          from: parsed.from || "",
        });
        sessionStorage.removeItem("thankYouData");
      }
    } catch {}
  }, []);

  const nextSteps = [
    { icon: <Mail className="h-5 w-5" />,         title: "Check your email",  desc: "Your confirmation and access details are on their way." },
    { icon: <MessageCircle className="h-5 w-5" />, title: "Join WhatsApp Group",   desc: "We'll send your private link via WhatsApp before the session." },
    { icon: <Sparkles className="h-5 w-5" />,      title: "Show up ready",    desc: "Find a quiet space, bring a notebook, and come with intention." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* gradient bar */}
      <div className="h-1.5 flex-shrink-0 bg-gradient-brand" />

      {/* HERO */}
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-emerald-50/60 to-stone-50">
        <div className="max-w-lg w-full mx-auto space-y-6">

          {/* check circle */}
          <div className="flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-200/50 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg bg-gradient-brand">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-emerald-100 text-emerald-700">
              <Sparkles className="h-3 w-3" />
              Seat Confirmed
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            {data.title}
          </h1>

          <p className="text-stone-500 text-base sm:text-lg leading-relaxed">{data.description}</p>

          {data.buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
              {data.buttons.map((btn, i) => {
                const s = ICON_STYLES[btn.icon] || { bg: "#10b981", text: "#ffffff" };
                return (
                  <a
                    key={i}
                    href={btn.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {btn.icon && btn.icon !== "none" && <SocialIcon icon={btn.icon} />}
                    {btn.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* WHAT HAPPENS NEXT */}
      <div className="py-16 px-4 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-10 text-emerald-600">
            What happens next
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {nextSteps.map((step, i) => (
              <div key={i} className="rounded-2xl p-6 text-center space-y-3 border border-emerald-100 bg-white shadow-sm">
                <div className="mx-auto h-11 w-11 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                  {step.icon}
                </div>
                <p className="font-semibold text-sm text-stone-800">{step.title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-14 px-4 text-center bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900">
        <p className="text-2xl sm:text-3xl font-bold mb-2 text-gradient-peacock" style={{ fontFamily: "'Playfair Display', serif" }}>
          See you at the masterclass 🌿
        </p>
        <p className="text-sm mb-6 text-white/50">
          Come with an open mind and your questions ready.
        </p>
        <a href={`/${slug}`} className="text-xs underline underline-offset-4 text-white/40 hover:text-white/70 transition">
          ← Back to page
        </a>
      </div>
    </div>
  );
}
