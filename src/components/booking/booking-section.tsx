"use client";

import React, { useState } from "react";
import { ArrowRight, Calendar, User, Loader2, Heart, Sparkles, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SESSION_TYPES } from "@/lib/session-types";

export function BookingSection() {
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sessionType: "",
    frequency: "",
    healingType: "",
    courseType: "",
    notes: "",
  });
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handleSessionTypeChange = (value: string) => {
    setFormData({
      ...formData,
      sessionType: value,
      frequency: "",
      healingType: "",
      courseType: "",
    });
    setSelectedAmount(0);
  };

  const handleFrequencyChange = (value: string) => {
    setFormData({ ...formData, frequency: value });
    const freq = SESSION_TYPES.one_to_one.frequencies.find((f) => f.value === value);
    setSelectedAmount(freq?.price || 0);
  };

  const handleHealingTypeChange = (value: string) => {
    setFormData({ ...formData, healingType: value });
    const type = SESSION_TYPES.need_based.types.find((t) => t.value === value);
    setSelectedAmount(type?.price || 0);
  };

  const handleCourseTypeChange = (value: string) => {
    setFormData({ ...formData, courseType: value });
    const course = SESSION_TYPES.learning_curve.courses.find((c) => c.value === value);
    setSelectedAmount(course?.price || 0);
  };

  const handleGroupHealingSelect = () => {
    setSelectedAmount(SESSION_TYPES.group_healing.price);
  };

  const handleContinueToDetails = () => {
    if (!formData.sessionType) {
      toast.error("Please select a session type");
      return;
    }
    if (selectedAmount === 0) {
      toast.error("Please select a session option");
      return;
    }
    setStep('details');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.sessionType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedAmount === 0) {
      toast.error("Please select a session option");
      return;
    }

    setLoading(true);

    try {
      const bookingRes = await fetch("/api/sessions/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: selectedAmount,
        }),
      });

      if (!bookingRes.ok) {
        throw new Error("Failed to create booking");
      }

      const { booking } = await bookingRes.json();

      const paymentRes = await fetch("/api/sessions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: selectedAmount,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const { orderId } = await paymentRes.json();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const whatsappMessage = `Hi! I've booked a session (${booking.booking_number}). Looking forward to connecting!`;
      const whatsappNumber = "919876543210";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedAmount * 100,
        currency: "INR",
        name: "Pratipal Healing",
        description: `Session Booking - ${booking.booking_number}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/sessions/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            window.open(whatsappUrl, "_blank");
            window.location.href = `/booking-success?bookingId=${booking.id}`;
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: {
          color: "#1B7F79",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-brand/10 rounded-full mb-4">
            <Calendar className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Book Your Healing Journey</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
            Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn to cure yourself and many. Points of transformation & training courses
          </p>
        </div>

        {step === 'selection' ? (
          // Step 1: Two-Panel Split Layout
          <div className="flex flex-col md:flex-row gap-8 items-start max-w-7xl mx-auto">
            {/* Left Panel: Service Cards (40%) */}
            <div className="w-full md:w-2/5">
              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {renderServiceCards()}
              </div>
              {/* Desktop: Vertical list */}
              <div className="hidden md:flex flex-col gap-4">
                {renderServiceCards()}
              </div>
            </div>

            {/* Right Panel: Selection Options (60%) */}
            <div className="w-full md:w-3/5">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 min-h-[400px] transition-all duration-500">
                {!formData.sessionType ? (
                  // Placeholder
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-brand/10 mb-4">
                        <ArrowRight className="h-10 w-10 text-brand-teal rotate-180" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-gradient-brand">
                        Select a service to get started
                      </h3>
                      <p className="text-gray-600">
                        Choose from our healing services on the left
                      </p>
                    </div>
                  </div>
                ) : formData.sessionType === 'group_healing' ? (
                  // Group Healing Summary
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg">
                        <Leaf className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">Group Healing</h3>
                      <p className="text-gray-600">Collective healing circles & spiritual guidance</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <div className="text-center">
                        <span className="text-sm text-gray-600 uppercase tracking-wider block mb-2">Fixed Price</span>
                        <span className="text-5xl font-bold text-gradient-brand">
                          ₹{SESSION_TYPES.group_healing.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-gray-700">
                      <p>Join our collective healing circles where the power of group energy amplifies individual transformation.</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal mt-1">•</span>
                          <span>Shared healing experience with like-minded individuals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal mt-1">•</span>
                          <span>Guided meditation and energy work</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal mt-1">•</span>
                          <span>Community support and spiritual guidance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // Options for other session types
                  <div className="space-y-6 animate-fadeIn">
                    {renderOptionsPanel()}
                  </div>
                )}

                {/* Amount Banner & Continue Button */}
                {selectedAmount > 0 && (
                  <div className="mt-8 space-y-4 animate-fadeIn">
                    <div className="relative overflow-hidden bg-gradient-to-r from-brand-teal via-brand-green to-brand-teal rounded-2xl p-6 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-pulse"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-white/90 text-sm font-medium uppercase tracking-wider">Session Amount</span>
                        <span className="text-3xl font-bold text-white">
                          ₹{selectedAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleContinueToDetails}
                      className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                      variant="cta"
                    >
                      Continue to Details
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Step 2: Personal Details & Payment (unchanged)
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 md:p-12 space-y-8 border border-gray-100">
              <button
                type="button"
                onClick={() => setStep('selection')}
                className="mb-6 text-gray-600 hover:text-brand-teal flex items-center gap-2 transition-colors font-medium group"
              >
                <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Session Selection
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-brand mb-4 shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-gradient-brand mb-2">
                    Your Information
                  </h3>
                  <p className="text-gray-600">We'll use this to confirm your booking and send you details</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="h-14 text-base border-2 focus:border-brand-teal rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-semibold text-gray-700">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                      className="h-14 text-base border-2 focus:border-brand-teal rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                    className="h-14 text-base border-2 focus:border-brand-teal rounded-xl"
                  />
                </div>
              </div>

              {selectedAmount > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-r from-brand-teal via-brand-green to-brand-teal rounded-2xl p-8 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-pulse"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-white/80 text-sm font-medium uppercase tracking-wider block mb-1">Total Amount</span>
                      <span className="text-4xl font-bold text-white">
                        ₹{selectedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || selectedAmount === 0}
                className="w-full h-16 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300"
                variant="cta"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure payment powered by Razorpay. You'll receive confirmation via email & WhatsApp.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );

  // Helper function to render service cards
  function renderServiceCards() {
    const services = [
      {
        id: 'one_to_one',
        icon: Heart,
        title: 'One to One',
        description: 'Personalized healing sessions',
        gradient: 'from-purple-500 to-pink-500',
        price: SESSION_TYPES.one_to_one.frequencies[0].price,
      },
      {
        id: 'need_based',
        icon: Sparkles,
        title: 'Need Based',
        description: 'Specialized healing modalities',
        gradient: 'from-blue-500 to-teal-500',
        price: SESSION_TYPES.need_based.types[0].price,
      },
      {
        id: 'group_healing',
        icon: Leaf,
        title: 'Group Healing',
        description: 'Collective healing circles',
        gradient: 'from-green-500 to-emerald-500',
        price: SESSION_TYPES.group_healing.price,
      },
      {
        id: 'learning_curve',
        icon: User,
        title: 'Learning Curve',
        description: 'Transformative training courses',
        gradient: 'from-orange-500 to-amber-500',
        price: SESSION_TYPES.learning_curve.courses[0].price,
      },
    ];

    return services.map((service) => (
      <div
        key={service.id}
        className={`group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 cursor-pointer snap-start flex-shrink-0 md:flex-shrink ${
          formData.sessionType === service.id
            ? 'border-brand-teal ring-4 ring-brand-teal/20'
            : 'border-transparent hover:border-gray-200'
        } ${formData.sessionType === service.id ? '' : 'md:hover:-translate-x-1'}`}
        onClick={() => {
          handleSessionTypeChange(service.id);
          if (service.id === 'group_healing') {
            handleGroupHealingSelect();
          }
        }}
        style={{ minWidth: formData.sessionType ? 'auto' : '280px' }}
      >
        <div className="flex items-center gap-4">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} shadow-md flex-shrink-0`}>
            <service.icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-1 truncate">
              {service.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1">
              {service.description}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              From <span className="font-semibold text-gradient-brand">₹{service.price.toLocaleString()}</span>
            </div>
          </div>
          {formData.sessionType === service.id && (
            <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    ));
  }

  // Helper function to render options panel
  function renderOptionsPanel() {
    if (formData.sessionType === 'one_to_one') {
      return (
        <>
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">Choose Your Frequency</h3>
            <p className="text-gray-600">Select the session frequency that works best for you</p>
          </div>
          <div className="grid gap-3">
            {SESSION_TYPES.one_to_one.frequencies.map((freq) => (
              <button
                key={freq.value}
                type="button"
                onClick={() => handleFrequencyChange(freq.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.frequency === freq.value
                    ? 'border-brand-teal bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-brand-teal/50 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{freq.label}</span>
                  <span className="text-gradient-brand font-bold text-lg">₹{freq.price.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (formData.sessionType === 'need_based') {
      return (
        <>
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">Choose Your Healing</h3>
            <p className="text-gray-600">Select the specialized healing modality you need</p>
          </div>
          <div className="grid gap-3">
            {SESSION_TYPES.need_based.types.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleHealingTypeChange(type.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.healingType === type.value
                    ? 'border-brand-teal bg-gradient-to-r from-blue-50 to-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-brand-teal/50 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{type.label}</span>
                  <span className="text-gradient-brand font-bold text-lg">₹{type.price.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (formData.sessionType === 'learning_curve') {
      return (
        <>
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">Choose Your Course</h3>
            <p className="text-gray-600">Select the transformative training that resonates with you</p>
          </div>
          <div className="grid gap-3">
            {SESSION_TYPES.learning_curve.courses.map((course) => (
              <button
                key={course.value}
                type="button"
                onClick={() => handleCourseTypeChange(course.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.courseType === course.value
                    ? 'border-brand-teal bg-gradient-to-r from-orange-50 to-amber-50 shadow-md'
                    : 'border-gray-200 hover:border-brand-teal/50 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{course.label}</span>
                  <span className="text-gradient-brand font-bold text-lg">₹{course.price.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      );
    }

    return null;
  }
}
