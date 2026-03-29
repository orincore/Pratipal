"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, BookOpen, Clock, Award, CheckCircle, Gift,
  User, ArrowLeft, X, AlertCircle, Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import Image from "next/image";
import Link from "next/link";
import { TrustpilotSection } from "@/components/storefront/trustpilot-section";

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
  curriculum: { title: string; description: string; topics?: string[] }[];
  what_you_receive: string[];
  who_is_this_for: string[];
  bonuses?: string[];
  instructor: { name: string; title: string; bio: string };
}

// ── Enroll Modal ─────────────────────────────────────────────────────────────
function EnrollModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { customer } = useCustomerAuth();
  const [name, setName] = useState(customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!customer) { window.location.href = `/login?redirect=/courses/${course.slug}`; return; }
    if (!name.trim() || !email.trim() || !phone.trim()) { setError("Please fill in all fields."); return; }
    setSubmitting(true);
    try {
      const createRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          service_id: course.id,
          service_name: course.title,
          service_category: course.category || "Course",
          frequency_label: "Full Course",
          booking_type: "course",
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          amount: course.price,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create order");

      const { booking, razorpay_order_id, razorpay_key_id, amount } = createData;
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway. Please try again.");

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as any).Razorpay({
          key: razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount,
          currency: "INR",
          name: "Pratipal",
          description: course.title,
          order_id: razorpay_order_id,
          prefill: { name: name.trim(), email: email.trim(), contact: phone.trim() },
          theme: { color: "#0d9488" },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/bookings/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: booking.id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
              window.location.href = verifyData.whatsapp_url;
              resolve();
            } catch (err: any) { reject(err); }
          },
          modal: { ondismiss: () => { setSubmitting(false); resolve(); } },
        });
        rzp.open();
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div ref={overlayRef} onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-5 flex-shrink-0">
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">{course.category || "Course"}</p>
          <h2 className="text-lg font-bold text-white leading-tight pr-8">{course.title}</h2>
          <p className="text-2xl font-bold text-emerald-200 mt-2">{formatPrice(course.price)}</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Your Details</p>

            {!customer && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>You need to <Link href={`/login?redirect=/courses/${course.slug}`} className="font-semibold underline">log in</Link> to enroll.</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone / WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-gray-50" />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <button type="submit" disabled={submitting || !customer}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200">
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                  : <><Sparkles className="h-4 w-4" />Pay {formatPrice(course.price)} & Enroll</>}
              </button>
              {!customer && (
                <Link href={`/login?redirect=/courses/${course.slug}`}
                  className="w-full flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-2.5 rounded-xl text-sm transition-all duration-200">
                  Log in to Enroll
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CourseDetailClient({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const router = useRouter();
  const { customer } = useCustomerAuth();

  useEffect(() => { fetchCourse(slug); }, [slug]);

  async function fetchCourse(slugValue: string) {
    try {
      const res = await fetch(`/api/courses/${slugValue}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) { toast.error("Course not found"); router.push("/courses"); return; }
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

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-400/15 rounded-full blur-xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button variant="ghost" onClick={() => router.push("/courses")} className="text-white hover:text-emerald-100 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              {course.category && <Badge className="mb-4 bg-white/20 text-white border-white/30">{course.category}</Badge>}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-emerald-100 mb-6">{course.subtitle}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {course.duration && <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{course.duration}</span></div>}
                {course.level && <div className="flex items-center gap-2"><Award className="h-5 w-5" /><span>{course.level}</span></div>}
              </div>
            </div>
            <div>
              {course.featured_image && (
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src={course.featured_image} alt={course.title} className="w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">About This Course</h2>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {(course.highlights?.length ?? 0) > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{h}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(course.curriculum?.length ?? 0) > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">Course Curriculum</h2>
                  <div className="space-y-6">
                    {course.curriculum.map((section, i) => (
                      <div key={i} className="border-l-4 border-teal-400 pl-6 py-2 bg-gradient-to-r from-teal-50/50 to-transparent rounded-r-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{section.title}</h3>
                        <p className="text-slate-600 mb-3">{section.description}</p>
                        {(section.topics?.length ?? 0) > 0 && (
                          <ul className="space-y-1">
                            {section.topics?.map((t, j) => (
                              <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-teal-500">•</span><span>{t}</span>
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

            {(course.what_you_receive?.length ?? 0) > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">What You Will Receive</h2>
                  <div className="space-y-3">
                    {course.what_you_receive.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(course.bonuses?.length ?? 0) > 0 && (
              <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Gift className="h-6 w-6 text-teal-600" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Special Bonuses</h2>
                  </div>
                  <div className="space-y-3">
                    {course.bonuses?.map((b, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Gift className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{b}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(course.who_is_this_for?.length ?? 0) > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">Who Is This Course For</h2>
                  <div className="space-y-3">
                    {course.who_is_this_for.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
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

          {/* Sticky sidebar */}
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
                    onClick={() => setShowEnroll(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white py-6 text-lg font-semibold mb-4 shadow-lg"
                  >
                    Enroll Now
                  </Button>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Lifetime access to course materials</span></div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Expert guidance and support</span></div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Certificate of completion</span></div>
                    {(course.bonuses?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Exclusive bonus materials</span></div>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-2 text-sm">
                    {course.duration && <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span className="font-medium text-slate-700">{course.duration}</span></div>}
                    {course.level && <div className="flex justify-between"><span className="text-slate-500">Level:</span><span className="font-medium text-slate-700 capitalize">{course.level}</span></div>}
                    {course.category && <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium text-slate-700">{course.category}</span></div>}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 shadow-lg">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-teal-600" />
                  <h3 className="font-semibold text-slate-800 mb-2">Have Questions?</h3>
                  <p className="text-sm text-slate-600 mb-4">Contact us for more information about this course</p>
                  <Button variant="outline" className="w-full border-teal-300 text-teal-700 hover:bg-teal-50" onClick={() => router.push("/contact")}>
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      {showEnroll && <EnrollModal course={course} onClose={() => setShowEnroll(false)} />}

      {/* Reviews */}
      <TrustpilotSection />
    </div>
  );
}
