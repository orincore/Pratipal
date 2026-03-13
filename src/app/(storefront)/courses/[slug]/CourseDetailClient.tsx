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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-brand-dark via-brand-secondary to-brand-accent text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/courses")}
            className="text-white hover:text-brand-support mb-6"
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
              <p className="text-xl text-brand-support/90 mb-6">
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
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {course.highlights.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.curriculum.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                  <div className="space-y-6">
                    {course.curriculum.map((section, idx) => (
                      <div key={idx} className="border-l-4 border-brand-secondary pl-6 py-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{section.description}</p>
                        {section.topics && section.topics.length > 0 && (
                          <ul className="space-y-1">
                            {section.topics.map((topic, topicIdx) => (
                              <li key={topicIdx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-brand-secondary">•</span>
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

            {course.what_you_receive.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Will Receive</h2>
                  <div className="space-y-3">
                    {course.what_you_receive.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.bonuses && course.bonuses.length > 0 && (
              <Card className="border-2 border-brand-cta/20 bg-gradient-to-br from-brand-cta/5 to-transparent">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Gift className="h-6 w-6 text-brand-cta" />
                    <h2 className="text-2xl font-bold text-gray-900">Special Bonuses</h2>
                  </div>
                  <div className="space-y-3">
                    {course.bonuses.map((bonus, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-brand-cta flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{bonus}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {course.who_is_this_for.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Is This Course For</h2>
                  <div className="space-y-3">
                    {course.who_is_this_for.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <User className="h-5 w-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Instructor</h2>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">{course.instructor.name}</h3>
                  <p className="text-brand-secondary font-medium">{course.instructor.title}</p>
                  <Separator className="my-4" />
                  <p className="text-gray-700 whitespace-pre-line">{course.instructor.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Course Investment</p>
                    <p className="text-4xl font-bold text-gray-900 mb-4">
                      {formatPrice(course.price)}
                    </p>
                  </div>

                  <Button
                    onClick={handleEnroll}
                    className="w-full bg-brand-secondary hover:bg-brand-accent text-white py-6 text-lg font-semibold mb-4"
                  >
                    Enroll Now
                  </Button>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Lifetime access to course materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Expert guidance and support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    {course.bonuses && course.bonuses.length > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Exclusive bonus materials</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-2 text-sm">
                    {course.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level:</span>
                        <span className="font-medium capitalize">{course.level}</span>
                      </div>
                    )}
                    {course.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{course.category}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 border-brand-secondary/20">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-brand-secondary" />
                  <h3 className="font-semibold text-gray-900 mb-2">Have Questions?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact us for more information about this course
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/contact")}>
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
