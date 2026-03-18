"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Clock, TrendingUp, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  featured_image?: string;
  duration?: string;
  level?: string;
  category?: string;
  highlights: string[];
  featured: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm text-slate-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  const featuredCourses = courses.filter(c => c.featured);
  const regularCourses = courses.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-400/15 rounded-full blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              Transform Your Life Through Sacred Learning
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Discover powerful healing modalities, spiritual practices, and holistic wisdom guided by Dr Aparnaa Singh
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-5 w-5" />
                <span>Expert-Led Training</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Clock className="h-5 w-5" />
                <span>Lifetime Access</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
                <span>Practical Skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                FEATURED
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-4 font-serif">
                Popular Courses
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our most sought-after programs for healing and transformation
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <CourseCard key={course.id || course.slug || index} course={course} router={router} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Courses */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-4 font-serif">
              All Courses
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore our complete range of holistic healing and spiritual development programs
            </p>
          </div>
          {regularCourses.length === 0 && featuredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-teal-500" />
              <p className="text-lg text-slate-700">No courses available at the moment</p>
              <p className="text-sm text-slate-500 mt-2">Check back soon for new offerings</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularCourses.map((course, index) => (
                <CourseCard key={course.id || course.slug || index} course={course} router={router} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <TestimonialsSection />
    </div>
  );
}

function CourseCard({ course, router, featured = false }: { course: Course; router: any; featured?: boolean }) {
  return (
    <Card
      className={`group overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        featured ? "ring-2 ring-emerald-400/50 shadow-emerald-100" : ""
      }`}
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        {course.featured_image ? (
          <img
            src={course.featured_image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-teal-400">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
        {course.category && (
          <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg border-0">
            {course.category}
          </Badge>
        )}
        {featured && (
          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg border-0">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {course.subtitle}
          </p>
        </div>

        {course.highlights && course.highlights.length > 0 && (
          <div className="mb-4 space-y-2">
            {course.highlights.slice(0, 3).map((highlight, idx) => (
              <div key={`highlight-${idx}`} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-emerald-500 mt-1 font-bold">✓</span>
                <span className="line-clamp-1">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
          {course.duration && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="h-4 w-4 text-teal-500" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.level && (
            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
              {course.level}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatPrice(course.price)}
            </p>
          </div>
          <Button
            onClick={() => router.push(`/courses/${course.slug}`)}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Trustpilot Reviews ──────────────────────────────────────────────────────

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
                <div className="flex items-center justify-between mb-3">
                  <StarRow rating={r.rating} />
                  <div className="flex items-center gap-1 opacity-60">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#00b67a">
                      <path d="M12 2l3.09 9.26H24l-7.27 5.27 2.77 8.52L12 19.77l-7.5 5.28 2.77-8.52L0 11.26h8.91z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-500">Trustpilot</span>
                  </div>
                </div>
                {r.title && (
                  <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1">{r.title}</p>
                )}
                <blockquote className="text-sm text-slate-600 leading-relaxed flex-1 mb-4 line-clamp-4">
                  {r.text}
                </blockquote>
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
