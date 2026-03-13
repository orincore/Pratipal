"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Clock, CheckCircle2, MessageCircle, ArrowLeft } from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface ServiceBooking {
  id: string;
  booking_number: string;
  service_name: string;
  service_category: string;
  frequency_label: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed";
  razorpay_payment_id?: string;
  whatsapp_redirect_url?: string;
  created_at: string;
}

export default function OrderHistoryPage() {
  const { customer, loading } = useCustomerAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/order-history");
    }
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    async function loadBookings() {
      setFetching(true);
      try {
        const bookingsRes = await fetch("/api/bookings/customer", { 
          cache: "no-store",
          credentials: "include"
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        } else if (bookingsRes.status === 401) {
          router.push("/login?redirect=/order-history");
        }
      } catch (err: any) {
        toast.error(err.message || "Unable to load order history");
      } finally {
        setFetching(false);
      }
    }
    loadBookings();
  }, [customer, router]);

  const metrics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((booking) => booking.payment_status === "pending").length;
    const paid = bookings.filter((booking) => booking.payment_status === "paid").length;
    const totalValue = bookings
      .filter((booking) => booking.payment_status === "paid")
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);
    return { total, pending, paid, totalValue };
  }, [bookings]);

  if (loading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">My Account</p>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View all your service bookings and transaction details
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard
            title="Total Bookings"
            icon={Package}
            value={metrics.total.toString()}
            description="All service bookings"
          />
          <MetricCard
            title="Pending"
            icon={Clock}
            value={metrics.pending.toString()}
            description="Awaiting payment"
          />
          <MetricCard
            title="Completed"
            icon={CheckCircle2}
            value={metrics.paid.toString()}
            description="Successfully paid"
          />
          <MetricCard
            title="Total Spent"
            icon={CheckCircle2}
            value={formatPrice(metrics.totalValue)}
            description="On completed bookings"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Service Bookings</CardTitle>
            <CardDescription>Most recent bookings appear first</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your bookings…
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No bookings yet</p>
                <p className="text-sm mt-2">Book a service to see your orders here</p>
                <Button className="mt-6" onClick={() => router.push("/")}>
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  description,
  value,
  icon: Icon,
}: {
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-white/70 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking }: { booking: ServiceBooking }) {
  const eventDate = new Date(booking.created_at);
  const statusMeta = {
    pending: { label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
    paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800" },
    failed: { label: "Payment Failed", color: "bg-rose-100 text-rose-800" },
  };
  const meta = statusMeta[booking.payment_status];

  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Booking #{booking.booking_number}</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {booking.service_name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Booked on {eventDate.toLocaleDateString(undefined, { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} at {eventDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge className={`${meta.color} px-3 py-1 text-xs font-semibold`}>
            {meta.label}
          </Badge>
          <p className="text-xl font-bold text-gray-900">{formatPrice(booking.amount)}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Service Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-gray-900">{booking.service_category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium text-gray-900">{booking.frequency_label}</span>
              </div>
              {booking.razorpay_payment_id && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {booking.razorpay_payment_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Contact Information</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start py-2 border-b border-gray-100">
                <span className="text-muted-foreground w-20">Name</span>
                <span className="font-medium text-gray-900">{booking.customer_name}</span>
              </div>
              <div className="flex items-start py-2 border-b border-gray-100">
                <span className="text-muted-foreground w-20">Email</span>
                <span className="font-medium text-gray-900 break-all">{booking.customer_email}</span>
              </div>
              <div className="flex items-start py-2">
                <span className="text-muted-foreground w-20">Phone</span>
                <span className="font-medium text-gray-900">{booking.customer_phone}</span>
              </div>
            </div>
          </div>
        </div>

        {booking.whatsapp_redirect_url && booking.payment_status === "paid" && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => window.open(booking.whatsapp_redirect_url, "_blank")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Continue to WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
