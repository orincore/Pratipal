import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { format, isToday, parseISO } from "date-fns";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily Quotes | Pratipal",
  description: "A collection of daily inspirational quotes to uplift and guide your healing journey.",
};

async function getQuotes() {
  await connectDB();
  const quotes = await Quote.find({ status: "active" })
    .sort({ date: -1 })
    .lean() as any[];
  return quotes.map((q) => ({ ...q, id: q._id.toString() }));
}

export default async function QuotesPage() {
  const quotes = await getQuotes();
  const todayQuote = quotes.find((q) => isToday(parseISO(q.date)));
  const pastQuotes = quotes.filter((q) => !isToday(parseISO(q.date)));

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <div style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: "#6ee7b7" }}>
              Daily Wisdom
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quotes of the Day
            </h1>
            <p className="text-xs text-white/50 mt-1 hidden sm:block">
              One thought a day to guide your healing journey.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 pb-1">
            {[
              { value: `${quotes.length}`, label: "Quotes" },
              { value: "Daily", label: "Updated" },
              { value: "Free", label: "To Read" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center px-4 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-sm font-bold text-white">{value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {quotes.length === 0 && (
          <div className="text-center py-24 text-stone-400">No quotes yet. Check back soon.</div>
        )}

        {/* Today's quote — hero card */}
        {todayQuote && (
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 font-semibold mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Today
            </p>
            <div
              className="relative overflow-hidden rounded-3xl px-8 py-12 sm:px-16 sm:py-16 text-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #065f46 0%, #0f766e 50%, #047857 100%)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

              <span aria-hidden="true" className="absolute top-6 left-8 text-8xl leading-none text-white/10 font-serif select-none">&ldquo;</span>

              <div className="relative">
                <p className="text-2xl sm:text-3xl font-serif text-white leading-relaxed italic">
                  {todayQuote.text}
                </p>
                {todayQuote.author && (
                  <p className="mt-5 text-sm text-emerald-200 font-medium tracking-wide">
                    — {todayQuote.author}
                  </p>
                )}
                <p className="mt-4 text-xs text-white/40 uppercase tracking-widest">
                  {format(parseISO(todayQuote.date), "MMMM d, yyyy")}
                </p>
              </div>

              <span aria-hidden="true" className="absolute bottom-6 right-8 text-8xl leading-none text-white/10 font-serif select-none">&rdquo;</span>
            </div>
          </div>
        )}

        {/* Past quotes grid */}
        {pastQuotes.length > 0 && (
          <>
            {todayQuote && (
              <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-4">
                Previous Quotes
              </p>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {pastQuotes.map((q, i) => {
                // Cycle through a few accent colours for variety
                const accents = [
                  { bg: "from-emerald-600 to-teal-700", pill: "bg-emerald-100 text-emerald-700" },
                  { bg: "from-teal-600 to-cyan-700", pill: "bg-teal-100 text-teal-700" },
                  { bg: "from-slate-700 to-slate-800", pill: "bg-slate-100 text-slate-600" },
                  { bg: "from-stone-700 to-stone-800", pill: "bg-stone-100 text-stone-600" },
                ];
                const accent = accents[i % accents.length];

                return (
                  <div
                    key={q.id}
                    className={`break-inside-avoid rounded-2xl bg-gradient-to-br ${accent.bg} p-6 shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden`}
                  >
                    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                    <span aria-hidden="true" className="absolute top-3 left-4 text-5xl leading-none text-white/10 font-serif select-none">&ldquo;</span>

                    <p className="relative text-base sm:text-lg font-serif text-white leading-relaxed italic pt-3">
                      {q.text}
                    </p>

                    {q.author && (
                      <p className="mt-3 text-xs text-white/60 font-medium">— {q.author}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${accent.pill}`}>
                        {format(parseISO(q.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
