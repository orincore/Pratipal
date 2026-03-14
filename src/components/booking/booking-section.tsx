"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, User, Loader2, Heart, Sparkles, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCustomerAuth } from "@/lib/customer-auth-context";

interface ServiceFrequency {
  label: string;
  value: string;
  price: number;
}

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  detailed_description?: string;
  image_url: string;
  base_price: number;
  frequency_options: ServiceFrequency[];
  category: string;
}

export function BookingSection() {
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sessionType: "",
    frequency: "",
    notes: "",
  });
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const { customer } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch services");
        }
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Services fetch error:", error);
        setServicesError("Unable to load services. Please try again later.");
      } finally {
        setServicesLoading(false);
      }
    }

    loadServices();
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.id === formData.sessionType),
    [services, formData.sessionType]
  );

  const handleSessionTypeChange = (value: string) => {
    setFormData({
      ...formData,
      sessionType: value,
      frequency: "",
    });
    const service = services.find((item) => item.id === value);
    if (service) {
      setSelectedAmount(service.frequency_options.length ? 0 : service.base_price);
    } else {
      setSelectedAmount(0);
    }
  };

  const handleFrequencyChange = (value: string) => {
    setFormData({ ...formData, frequency: value });
    const option = selectedService?.frequency_options.find((f) => f.value === value);
    setSelectedAmount(option?.price || selectedService?.base_price || 0);
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
    if (!customer) {
      toast.info("Please login to continue");
      router.push("/login?redirect=/");
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
      // Get the selected frequency option to get the proper label
      const selectedFrequencyOption = selectedService?.frequency_options.find(
        (option) => option.value === formData.frequency
      );
      const frequencyLabel = selectedFrequencyOption?.label || "One-time";

      // Create booking and Razorpay order
      const bookingRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer?.id,
          service_id: selectedService?.id,
          service_name: selectedService?.title,
          service_category: selectedService?.category,
          frequency_label: frequencyLabel,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          amount: selectedAmount,
        }),
      });

      if (!bookingRes.ok) {
        const error = await bookingRes.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const { booking, razorpay_order_id, razorpay_key_id } = await bookingRes.json();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const options = {
        key: razorpay_key_id,
        amount: selectedAmount * 100,
        currency: "INR",
        name: "Pratipal Healing",
        description: `${selectedService?.title} - ${booking.booking_number}`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
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

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            const { whatsapp_url } = await verifyRes.json();
            
            // Redirect to WhatsApp
            window.open(whatsapp_url, "_blank");
            
            // Redirect to success page
            toast.success("Payment successful! Redirecting...");
            setTimeout(() => {
              window.location.href = `/account/orders`;
            }, 1500);
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
    <section id="booking" className="py-20 md:py-28 bg-[#f5f4ef]">
      <div className="container max-w-6xl">
        <div className="text-center mb-14 space-y-3">
          <span className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-1 text-xs uppercase tracking-[0.25em] text-gray-500">
            Services
          </span>
          <h2 className="text-4xl md:text-[46px] font-serif text-gray-900 leading-tight">
            Tailored Healing & Learning Programs
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Curated offerings that combine clinical precision with intuitive care. Select a service, choose the cadence that suits you, and begin a considered transformation.
          </p>
        </div>

        {step === 'selection' ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Panel: Service Cards (40%) */}
            <div className="w-full lg:w-2/5 space-y-4">
              <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {renderServiceCards()}
              </div>
              <div className="hidden md:flex flex-col gap-3">
                {renderServiceCards()}
              </div>
            </div>

            {/* Right Panel: Selection Options (60%) */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white border border-gray-200 rounded-[18px] shadow-[0_15px_60px_rgba(15,23,42,0.04)] p-8 md:p-10 min-h-[440px] space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Overview</p>
                  <h3 className="mt-2 text-2xl font-serif text-gray-900">Selected Program</h3>
                </div>
                {servicesLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-brand-teal mx-auto" />
                      <p className="text-gray-500">Loading services...</p>
                    </div>
                  </div>
                ) : servicesError ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-4">
                      <p className="text-lg font-semibold text-red-500">{servicesError}</p>
                      <Button onClick={() => window.location.reload()} variant="outline">
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : !formData.sessionType ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center space-y-3 text-gray-500">
                      <div className="inline-flex items-center justify-center h-14 w-14 rounded-md border border-dashed border-gray-300">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-medium text-gray-800">Select a service to begin</p>
                      <p>Browse the programs on the left to view their detail and schedule.</p>
                    </div>
                  </div>
                ) : selectedService ? (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="relative w-full lg:w-2/5 overflow-hidden border border-gray-200 bg-white rounded-[14px]">
                        <Image
                          src={selectedService.image_url || "/placeholder.jpg"}
                          alt={selectedService.title}
                          width={480}
                          height={360}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center px-3 py-[2px] border border-gray-300 rounded-full uppercase tracking-wide">
                            {selectedService.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-[2px] text-[11px] bg-gray-100 rounded-full">
                            {selectedService.frequency_options.length || 1} options available
                          </span>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-3xl font-serif text-gray-900 leading-tight">
                            {selectedService.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedService.detailed_description || selectedService.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {renderOptionsPanel()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">Service unavailable.</div>
                )}

                {/* Amount Banner & Continue Button */}
                {selectedAmount > 0 && (
                  <div className="pt-4 space-y-4 border-t">
                    <div className="flex items-center justify-between text-gray-800">
                      <span className="text-sm uppercase tracking-[0.3em] text-gray-500">Total</span>
                      <span className="text-2xl font-semibold">₹{selectedAmount.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={handleContinueToDetails}
                      className="w-full h-13 text-base font-semibold bg-gray-900 text-white hover:bg-gray-800"
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
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 md:p-12 space-y-8">
              <button
                type="button"
                onClick={() => setStep('selection')}
                className="mb-6 text-gray-600 hover:text-brand-teal flex items-center gap-2 transition-colors font-medium group"
              >
                <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Session Selection
              </button>

              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-md border border-gray-300 mb-2">
                    <User className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-3xl font-serif text-gray-900">Your Information</h3>
                  <p className="text-gray-600">We’ll confirm your booking and share guidance using these details.</p>
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
    if (servicesLoading) {
      return [1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-white/60 rounded-2xl border border-dashed border-gray-200 animate-pulse" />
      ));
    }

    if (!services.length) {
      return (
        <div className="text-gray-500 text-sm">No services available right now.</div>
      );
    }

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
        }}
        style={{ minWidth: formData.sessionType ? 'auto' : '280px' }}
      >
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-brand/10 shadow-inner flex-shrink-0 overflow-hidden">
            <Image
              src={service.image_url || "/placeholder.jpg"}
              alt={service.title}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-1 truncate">
              {service.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1">
              {service.description}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              Starts at <span className="font-semibold text-gradient-brand">₹{(service.frequency_options[0]?.price || service.base_price).toLocaleString()}</span>
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
    if (!selectedService) return null;

    if (selectedService.frequency_options.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-serif font-semibold text-gray-800">One-time Session</h4>
              <p className="text-gray-600 text-sm">Fixed investment for this service</p>
            </div>
            <span className="text-3xl font-bold text-gradient-brand">₹{selectedService.base_price.toLocaleString()}</span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-gradient-brand mb-2">Choose an Option</h3>
          <p className="text-gray-600">Select the plan or frequency that aligns with your healing journey</p>
        </div>
        <div className="grid gap-3">
          {selectedService.frequency_options.map((freq) => (
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
}
