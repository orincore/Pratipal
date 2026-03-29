"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Leaf } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  price: number;
  featured_image?: string;
  duration?: string;
  category?: string;
  highlights: string[];
  featured: boolean;
}

export function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses((d.courses || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && courses.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full mb-3">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Learn &amp; Grow</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Healing Courses
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-md">
              Deepen your practice with expert-led programs in holistic healing and spiritual growth.
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 transition"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white hover:border-teal-200 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 flex-shrink-0">
                  {course.featured_image ? (
                    <img
                      src={course.featured_image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-teal-300" />
                    </div>
                  )}
                  {course.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-teal-700">
                      {course.category}
                    </span>
                  )}
                  {course.featured && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-serif font-bold text-base text-stone-800 mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 flex-1">
                    {course.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      {course.duration && (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.duration}</span>
                        </>
                      )}
                    </div>
                    <span className="text-base font-bold text-teal-700">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile view-all */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-md"
          >
            View All Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
