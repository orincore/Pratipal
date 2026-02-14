"use client";

import React from "react";
import type { LandingTemplateData } from "@/lib/template-types";
import { DEFAULT_TEMPLATE_DATA } from "@/lib/template-types";

// ---------------------------------------------------------------------------
// Helper: merge partial data with defaults
// ---------------------------------------------------------------------------
function mergeTemplate(data?: Partial<LandingTemplateData>): LandingTemplateData {
  if (!data) return DEFAULT_TEMPLATE_DATA;
  return {
    colors: { ...DEFAULT_TEMPLATE_DATA.colors, ...data.colors },
    hero: { ...DEFAULT_TEMPLATE_DATA.hero, ...data.hero },
    marquee: { ...DEFAULT_TEMPLATE_DATA.marquee, ...data.marquee },
    why: { ...DEFAULT_TEMPLATE_DATA.why, ...data.why },
    about: { ...DEFAULT_TEMPLATE_DATA.about, ...data.about },
    logos: { ...DEFAULT_TEMPLATE_DATA.logos, ...data.logos },
    gallery: { ...DEFAULT_TEMPLATE_DATA.gallery, ...data.gallery },
    stats: { ...DEFAULT_TEMPLATE_DATA.stats, ...data.stats },
    testimonials: { ...DEFAULT_TEMPLATE_DATA.testimonials, ...data.testimonials },
    program: { ...DEFAULT_TEMPLATE_DATA.program, ...data.program },
    bonus: { ...DEFAULT_TEMPLATE_DATA.bonus, ...data.bonus },
    footer: { ...DEFAULT_TEMPLATE_DATA.footer, ...data.footer },
  };
}

// ---------------------------------------------------------------------------
// Helper: hex to rgba
// ---------------------------------------------------------------------------
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---------------------------------------------------------------------------
// Marquee Component
// ---------------------------------------------------------------------------
function Marquee({ items, color }: { items: string[]; color: string }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap py-3" style={{ backgroundColor: color }}>
      <div className="inline-flex animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 text-sm font-semibold text-white uppercase tracking-widest">
            {item} <span className="mx-4 opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Template Component
// ---------------------------------------------------------------------------
interface LandingTemplateProps {
  data?: Partial<LandingTemplateData>;
}

export function LandingTemplate({ data }: LandingTemplateProps) {
  const t = mergeTemplate(data);
  const c = t.colors;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bodyBg }}>
      {/* Inject marquee animation + fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}} />

      {t.hero.visible && (
        <section className="relative overflow-hidden" style={{ backgroundColor: c.heroBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {t.hero.badge && (
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: hexToRgba(c.primary, 0.15), color: c.primary }}
                  >
                    {t.hero.badge}
                  </span>
                )}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  {t.hero.headline}{" "}
                  {t.hero.highlightedWord && (
                    <span className="relative inline-block">
                      <span style={{ color: c.secondary }}>{t.hero.highlightedWord}</span>
                      <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                        <path d="M2 8 C50 2, 150 2, 198 8" stroke={c.primary} strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </h1>
                <p className="text-lg text-gray-600 font-body leading-relaxed max-w-lg">
                  {t.hero.subheadline}
                </p>
                {t.hero.bulletPoints.length > 0 && (
                  <ul className="space-y-3">
                    {t.hero.bulletPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 font-body">
                        <span
                          className="mt-1 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: c.primary }}
                        >
                          ✓
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href={t.hero.ctaButtonLink}
                    className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{ backgroundColor: c.primary }}
                  >
                    {t.hero.ctaButtonText}
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
                </div>
                {t.hero.floatingStats.length > 0 && (
                  <div className="flex gap-6 pt-4">
                    {t.hero.floatingStats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl font-bold font-display" style={{ color: c.secondary }}>{stat.value}</div>
                        <div className="text-xs text-gray-500 font-body uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <div
                  className="absolute inset-4 rounded-3xl -rotate-3 opacity-20"
                  style={{ backgroundColor: c.primary }}
                />
                {t.hero.heroImage && (
                  <img
                    src={t.hero.heroImage}
                    alt="Hero"
                    className="relative rounded-3xl shadow-2xl w-full h-auto object-cover max-h-[600px]"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MARQUEE SECTION */}
      {t.marquee.enabled && <Marquee items={t.marquee.items} color={c.secondary} />}

      {/* WHY SECTION */}
      {t.why.visible && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {t.why.title}
              </h2>
              <p className="text-lg text-gray-600 font-body">{t.why.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {t.why.points.map((point, i) => (
                <div
                  key={i}
                  className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {point.image && (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={point.image}
                        alt={point.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{point.title}</h3>
                    <p className="text-gray-600 font-body leading-relaxed">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT SECTION */}
      {t.about.visible && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: hexToRgba(c.primary, 0.04) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl rotate-2 opacity-10"
                  style={{ backgroundColor: c.secondary }}
                />
                {t.about.image && (
                  <img
                    src={t.about.image}
                    alt={t.about.name}
                    className="relative rounded-3xl shadow-xl w-full h-auto object-cover max-h-[500px]"
                  />
                )}
              </div>
              <div className="space-y-6">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: hexToRgba(c.secondary, 0.12), color: c.secondary }}
                >
                  {t.about.title}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">{t.about.name}</h2>
                <p className="text-gray-600 font-body text-lg leading-relaxed">{t.about.description}</p>
                {t.about.credentials.length > 0 && (
                  <ul className="space-y-2">
                    {t.about.credentials.map((cred, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 font-body">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.primary }}
                        />
                        {cred}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LOGO BAR */}
      {t.logos.enabled && t.logos.logos.length > 0 && (
        <section className="py-12 border-y border-gray-100" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
              {t.logos.title}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-60">
              {t.logos.logos.map((logo, i) => (
                <div key={i} className="h-8 flex items-center">
                  {logo.image ? (
                    <img src={logo.image} alt={logo.alt} className="h-full w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-semibold uppercase">
                      {logo.alt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY SECTION */}
      {t.gallery.visible && t.gallery.images.length > 0 && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.gallery.title}</h2>
              <p className="text-lg text-gray-600 font-body">{t.gallery.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {t.gallery.images.map((img, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATS / CTA SECTION */}
      {t.stats.visible && (
        <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: c.darkBg }}>
          {t.stats.backgroundImage && (
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.stats.backgroundImage})` }}
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t.stats.title}</h2>
            <p className="text-lg text-gray-300 font-body mb-12 max-w-2xl mx-auto">{t.stats.subtitle}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {t.stats.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl lg:text-5xl font-bold font-display mb-1" style={{ color: c.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-body uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
            <a
              href={t.stats.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.stats.ctaButtonText}
            </a>
          </div>
        </section>
      )}

      {/* ================================================================
          TESTIMONIALS SECTION
          ================================================================ */}
      {t.testimonials.visible && t.testimonials.items.length > 0 && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-lg text-gray-600 font-body">{t.testimonials.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {t.testimonials.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8 bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-14 w-14 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: c.secondary }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 font-body">{item.name}</div>
                      <div className="text-sm text-gray-500 font-body">{item.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-body leading-relaxed flex-1 italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 20 20" fill={c.primary}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          PROGRAM SECTION
          ================================================================ */}
      {t.program.visible && (
      <section className="py-20 lg:py-28" style={{ backgroundColor: hexToRgba(c.secondary, 0.04) }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t.program.title}
            </h2>
            <p className="text-lg text-gray-600 font-body">{t.program.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.program.points.map((point, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: hexToRgba(c.primary, 0.1) }}
                >
                  {point.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600 font-body text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href={t.program.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.program.ctaButtonText}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </section>
      )}

      {/* ================================================================
          BONUS SECTION
          ================================================================ */}
      {t.bonus.enabled && t.bonus.items.length > 0 && (
        <section className="py-20 lg:py-28" style={{ backgroundColor: c.bodyBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
              {t.bonus.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {t.bonus.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-5 rounded-2xl p-6 bg-white shadow-md border border-gray-100"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-20 w-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="h-20 w-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: hexToRgba(c.accent, 0.1) }}
                    >
                      🎁
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 font-body text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          FOOTER CTA + FOOTER
          ================================================================ */}
      {t.footer.enabled && (
      <footer style={{ backgroundColor: c.darkBg }}>
        {/* CTA Banner */}
        <div className="py-20 lg:py-28 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.footer.cta.title}
            </h2>
            <p className="text-lg text-gray-300 font-body mb-8 max-w-2xl mx-auto">
              {t.footer.cta.subtitle}
            </p>
            <a
              href={t.footer.cta.ctaButtonLink}
              className="inline-flex items-center px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: c.primary }}
            >
              {t.footer.cta.ctaButtonText}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 font-body">{t.footer.copyright}</p>
            <div className="flex gap-6">
              {t.footer.links.map((link, i) => (
                <a key={i} href={link.url} className="text-sm text-gray-400 hover:text-white font-body transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
