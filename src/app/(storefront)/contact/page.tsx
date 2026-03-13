"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! We'll get back to you soon.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative">
      {/* Decorative background elements with peacock colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-teal-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-teal-400/15 rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="h-fit border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl text-white">Contact Information</CardTitle>
                  <CardDescription className="text-emerald-100 mb-2">
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 bg-white pt-8 pb-8">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-teal-600 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Email</p>
                      <p className="text-sm text-slate-600">hello@pratipal.in</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Phone</p>
                      <p className="text-sm text-slate-600">+91 98765 43210</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Address</p>
                      <p className="text-sm text-slate-600">
                        Mumbai, Maharashtra<br />
                        India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-cyan-600 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Business Hours</p>
                      <p className="text-sm text-slate-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b border-slate-200">
                  <CardTitle className="text-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Send us a Message</CardTitle>
                  <CardDescription className="text-slate-600">
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  {submitStatus.type && (
                    <div className={`mb-6 relative w-full rounded-lg border p-4 ${
                      submitStatus.type === "success" 
                        ? "border-emerald-200 bg-emerald-50" 
                        : "border-red-200 bg-red-50"
                    }`}>
                      <div className="flex items-start gap-3">
                        {submitStatus.type === "success" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className={`text-sm ${
                          submitStatus.type === "success" ? "text-emerald-800" : "text-red-800"
                        }`}>
                          {submitStatus.message}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-medium">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                          className="border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                          className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-700 font-medium">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="What is this about?"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-700 font-medium">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}