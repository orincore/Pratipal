"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, User, Mail, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { SESSION_TYPES } from "@/lib/session-types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookSessionPage() {
  const router = useRouter();
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
      // Create booking
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

      // Create Razorpay order
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

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // WhatsApp redirect message
      const whatsappMessage = `Hi! I've booked a session (${booking.booking_number}). Looking forward to connecting!`;
      const whatsappNumber = "919876543210"; // Replace with actual number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedAmount * 100,
        currency: "INR",
        name: "Pratipal Healing",
        description: `Session Booking - ${booking.booking_number}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
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

            // Redirect to WhatsApp
            window.open(whatsappUrl, "_blank");

            // Redirect to success page
            router.push(`/booking-success?bookingId=${booking.id}`);
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-brand mb-4">
              Book Your Healing Session
            </h1>
            <p className="text-gray-600 text-lg">
              Begin your journey to wellness and spiritual growth
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gradient-brand flex items-center gap-2">
                <User className="h-6 w-6" />
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Session Type Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gradient-brand flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Select Session Type
              </h2>

              <RadioGroup value={formData.sessionType} onValueChange={handleSessionTypeChange}>
                <div className="space-y-4">
                  {/* One to One */}
                  <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="one_to_one" id="one_to_one" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="one_to_one" className="text-lg font-semibold cursor-pointer">
                          {SESSION_TYPES.one_to_one.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.one_to_one.description}</p>
                        
                        {formData.sessionType === "one_to_one" && (
                          <div className="mt-4 space-y-2">
                            <Label>Select Frequency *</Label>
                            <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                {SESSION_TYPES.one_to_one.frequencies.map((freq) => (
                                  <SelectItem key={freq.value} value={freq.value}>
                                    {freq.label} - ₹{freq.price.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Need Based */}
                  <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="need_based" id="need_based" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="need_based" className="text-lg font-semibold cursor-pointer">
                          {SESSION_TYPES.need_based.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.need_based.description}</p>
                        
                        {formData.sessionType === "need_based" && (
                          <div className="mt-4 space-y-2">
                            <Label>Select Healing Type *</Label>
                            <Select value={formData.healingType} onValueChange={handleHealingTypeChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose healing type" />
                              </SelectTrigger>
                              <SelectContent>
                                {SESSION_TYPES.need_based.types.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label} - ₹{type.price.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Group Healing */}
                  <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem 
                        value="group_healing" 
                        id="group_healing" 
                        className="mt-1"
                        onClick={handleGroupHealingSelect}
                      />
                      <div className="flex-1">
                        <Label htmlFor="group_healing" className="text-lg font-semibold cursor-pointer">
                          {SESSION_TYPES.group_healing.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.group_healing.description}</p>
                        <p className="text-brand-teal font-semibold mt-2">₹{SESSION_TYPES.group_healing.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning Curve */}
                  <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-brand-teal transition-all">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="learning_curve" id="learning_curve" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="learning_curve" className="text-lg font-semibold cursor-pointer">
                          {SESSION_TYPES.learning_curve.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{SESSION_TYPES.learning_curve.description}</p>
                        
                        {formData.sessionType === "learning_curve" && (
                          <div className="mt-4 space-y-2">
                            <Label>Select Course *</Label>
                            <Select value={formData.courseType} onValueChange={handleCourseTypeChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose course" />
                              </SelectTrigger>
                              <SelectContent>
                                {SESSION_TYPES.learning_curve.courses.map((course) => (
                                  <SelectItem key={course.value} value={course.value}>
                                    {course.label} - ₹{course.price.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Share any specific concerns or questions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Amount Display */}
            {selectedAmount > 0 && (
              <div className="bg-gradient-brand-light rounded-xl p-6 border-2 border-brand-teal">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-3xl font-bold text-gradient-brand">
                    ₹{selectedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || selectedAmount === 0}
              className="w-full h-14 text-lg"
              variant="cta"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              By booking, you agree to our terms and conditions. You'll receive a confirmation email after payment.
            </p>
          </form>
        </div>
      </main>
  );
}
