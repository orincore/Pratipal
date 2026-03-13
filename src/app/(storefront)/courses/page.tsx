"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Clock, TrendingUp } from "lucide-react";
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
