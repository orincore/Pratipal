"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Mail, Phone, Home, Loader2 } from "lucide-react";
import Link from "next/link";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push("/");
      return;
    }

    // In a real app, fetch booking details from API
    // For now, we'll simulate it
    setTimeout(() => {
      setBooking({
        id: bookingId,
        booking_number: `SB-${Date.now()}`,
        customer_name: "Customer",
        customer_email: "customer@example.com",
        amount: 5000,
      });
      setLoading(false);
    }, 1000);
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-warm">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-brand p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-brand-green" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-white/90 text-lg">
                Your session has been booked successfully
              </p>
            </div>

            {/* Booking Details */}
            <div className="p-8 space-y-6">
              <div className="bg-gradient-brand-light rounded-xl p-6 border-2 border-brand-teal">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold text-gray-900">{booking.booking_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-2xl text-gradient-brand">
                      ₹{booking.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-teal" />
                  What Happens Next?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Confirmation Email Sent</p>
                      <p className="text-sm text-gray-600">Check your inbox for booking details and receipt</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">WhatsApp Notification</p>
                      <p className="text-sm text-gray-600">You'll receive a message with session coordination details</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Team Contact</p>
                      <p className="text-sm text-gray-600">Our team will reach out within 24 hours to schedule your session</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5 text-brand-teal" />
                  <span className="text-sm">hello@pratipal.in</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-5 w-5 text-brand-teal" />
                  <span className="text-sm">+91 98765 43210</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="flex-1" variant="cta">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild className="flex-1" variant="outline">
                  <Link href="/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              A copy of your booking confirmation has been sent to your email address.
              <br />
              Please check your spam folder if you don't see it in your inbox.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-teal" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
