"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Clock, Award, CheckCircle, Gift, User, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCustomerAuth } from "@/lib/customer-auth-context";

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
  curriculum: {
    title: string;
    description: string;
    topics?: string[];
  }[];
  what_you_receive: string[];
  who_is_this_for: string[];
  bonuses?: string[];
  instructor: {
    name: string;
    title: string;
    bio: string;
  };
}

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    fetchCourse(slug);
  }, [slug]);

  async function fetchCourse(slugValue: string) {
    try {
      const res = await fetch(`/api/courses/${slugValue}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Course not found");
          router.push("/courses");
          return;
        }
        throw new Error("Failed to fetch course");
      }
      const data = await res.json();
      setCourse(data.course);
    } catch (error: any) {
      toast.error(error.message || "Failed to load course");
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  }

  function handleEnroll() {
    if (!customer) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }
    toast.info("Course enrollment coming soon!");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white py-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-400/15 rounded-full blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/courses")}
            className="text-white hover:text-emerald-100 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              {course.category && (
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {course.category}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-emerald-100 mb-6">
                {course.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>{course.level}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              {course.featured_image && (
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={course.featured_image}
                    alt={course.title}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">About This Course</h2>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {course.highlights && course.highlights.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.highlights.map((highlight, idx) => (
                      <div key={`highlight-${idx}`} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.curriculum && course.curriculum.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">Course Curriculum</h2>
                  <div className="space-y-6">
                    {course.curriculum.map((section, idx) => (
                      <div key={`curriculum-${idx}`} className="border-l-4 border-teal-400 pl-6 py-2 bg-gradient-to-r from-teal-50/50 to-transparent rounded-r-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {section.title}
                        </h3>
                        <p className="text-slate-600 mb-3">{section.description}</p>
                        {section.topics && section.topics.length > 0 && (
                          <ul className="space-y-1">
                            {section.topics.map((topic, topicIdx) => (
                              <li key={`topic-${idx}-${topicIdx}`} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-teal-500">•</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.what_you_receive && course.what_you_receive.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">What You Will Receive</h2>
                  <div className="space-y-3">
                    {course.what_you_receive.map((item, idx) => (
                      <div key={`receive-${idx}`} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.bonuses && course.bonuses.length > 0 && (
              <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Gift className="h-6 w-6 text-teal-600" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Special Bonuses</h2>
                  </div>
                  <div className="space-y-3">
                    {course.bonuses.map((bonus, idx) => (
                      <div key={`bonus-${idx}`} className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{bonus}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.who_is_this_for && course.who_is_this_for.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">Who Is This Course For</h2>
                  <div className="space-y-3">
                    {course.who_is_this_for.map((item, idx) => (
                      <div key={`who-${idx}`} className="flex items-start gap-3">
                        <User className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">About the Instructor</h2>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-800">{course.instructor.name}</h3>
                  <p className="text-teal-600 font-medium">{course.instructor.title}</p>
                  <Separator className="my-4" />
                  <p className="text-slate-700 whitespace-pre-line">{course.instructor.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-500 mb-2">Course Investment</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                      {formatPrice(course.price)}
                    </p>
                  </div>

                  <Button
                    onClick={handleEnroll}
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white py-6 text-lg font-semibold mb-4 shadow-lg"
                  >
                    Enroll Now
                  </Button>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Lifetime access to course materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Expert guidance and support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Certificate of completion</span>
                    </div>
                    {course.bonuses && course.bonuses.length > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Exclusive bonus materials</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-2 text-sm">
                    {course.duration && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-medium text-slate-700">{course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Level:</span>
                        <span className="font-medium text-slate-700 capitalize">{course.level}</span>
                      </div>
                    )}
                    {course.category && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-medium text-slate-700">{course.category}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 shadow-lg">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-teal-600" />
                  <h3 className="font-semibold text-slate-800 mb-2">Have Questions?</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Contact us for more information about this course
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-teal-300 text-teal-700 hover:bg-teal-50" 
                    onClick={() => router.push("/contact")}
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
