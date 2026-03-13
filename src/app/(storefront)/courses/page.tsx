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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  const featuredCourses = courses.filter(c => c.featured);
  const regularCourses = courses.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f1fbff] via-white to-[#fffaf3]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#def6ff] via-[#d7f4ed] to-[#ffe9cf] text-[#062c30] py-20 border-b border-[#cfe6ef]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
           
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              Transform Your Life Through Sacred Learning
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Discover powerful healing modalities, spiritual practices, and holistic wisdom guided by Dr Aparnaa Singh
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                <BookOpen className="h-5 w-5" />
                <span>Expert-Led Training</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                <Clock className="h-5 w-5" />
                <span>Lifetime Access</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                <TrendingUp className="h-5 w-5" />
                <span>Practical Skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-white text-[#062c30] border-b border-[#e1edf1]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-[#f7d69a] to-[#f6b670] text-[#5c3a00] shadow">
                FEATURED
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#063946] mb-4 font-serif">
                Popular Courses
              </h2>
              <p className="text-[#0a4d54]/70 max-w-2xl mx-auto">
                Our most sought-after programs for healing and transformation
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} router={router} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Courses */}
      <section className="py-16 bg-transparent text-[#062c30]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#063946] mb-4 font-serif">
              All Courses
            </h2>
            <p className="text-[#0a4d54]/70 max-w-2xl mx-auto">
              Explore our complete range of holistic healing and spiritual development programs
            </p>
          </div>
          {regularCourses.length === 0 && featuredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white/80 rounded-3xl shadow-inner">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#6c8c92]" />
              <p className="text-lg text-[#0a4d54]">No courses available at the moment</p>
              <p className="text-sm text-[#0a4d54]/70 mt-2">Check back soon for new offerings</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularCourses.map((course) => (
                <CourseCard key={course.id} course={course} router={router} />
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
      className={`group overflow-hidden border border-[#dfecef] bg-white/90 hover:bg-white shadow-lg transition-all duration-300 ${
        featured ? "ring-2 ring-[#0a9396]/60" : ""
      }`}
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#f0fafc] via-[#fff5e7] to-[#f8f2ff]">
        {course.featured_image ? (
          <img
            src={course.featured_image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#0a9396]/40">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
        {course.category && (
          <Badge className="absolute top-4 left-4 bg-white text-[#062c30] shadow">
            {course.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#062c30] mb-2 group-hover:text-[#0a9396] transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-[#4a6f76] line-clamp-2">
            {course.subtitle}
          </p>
        </div>

        {course.highlights.length > 0 && (
          <div className="mb-4 space-y-1">
            {course.highlights.slice(0, 3).map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-[#4a6f76]">
                <span className="text-[#0a9396] mt-1">✓</span>
                <span className="line-clamp-1">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-[#e1edef]">
          {course.duration && (
            <div className="flex items-center gap-1 text-sm text-[#4a6f76]">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.level && (
            <Badge variant="outline" className="text-xs text-[#0a4d54] border-[#cadfe4]">
              {course.level}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#062c30]">
              {formatPrice(course.price)}
            </p>
          </div>
          <Button
            onClick={() => router.push(`/courses/${course.slug}`)}
            className="bg-gradient-to-r from-[#0a9396] to-[#7ed0c3] text-white font-semibold hover:opacity-90"
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
