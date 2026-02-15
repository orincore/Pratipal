"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/lib/ecommerce-types";

function OrderFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  async function loadOrder(targetOrderId: string) {
    try {
      const res = await fetch(`/api/orders/${targetOrderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleRetryPayment() {
    router.push("/checkout");
  }

  if (loading) {
    throw new Promise(() => {}); // rethrow to trigger suspense
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Failed</h1>
          <p className="text-lg text-muted-foreground">
            We couldn't process your payment
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What happened?</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment could not be processed. This might be due to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Insufficient funds in your account</li>
                  <li>Incorrect payment details</li>
                  <li>Bank declined the transaction</li>
                  <li>Network connectivity issues</li>
                  <li>Payment gateway timeout</li>
                </ul>
              </div>

              {order && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Order Reference</p>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: <span className="capitalize">{order.payment_status}</span>
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">What should you do?</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Check your payment method and try again</li>
                  <li>Try using a different payment method</li>
                  <li>Contact your bank if the issue persists</li>
                  <li>Contact our support team for assistance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleRetryPayment}
            size="lg"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Payment
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our support team is here to help you complete your purchase.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <a href="mailto:support@yourstore.com" className="text-primary hover:underline">
                      support@yourstore.com
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    <a href="tel:+911234567890" className="text-primary hover:underline">
                      +91 123 456 7890
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Hours:</span> Mon-Sat, 9 AM - 6 PM IST
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Your items are still in your cart. You can try again anytime.
          </p>
          <Link href="/cart" className="text-primary hover:underline text-sm font-medium">
            View Cart →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center text-muted-foreground">Loading payment status...</div>
        </div>
      }
    >
      <OrderFailedContent />
    </Suspense>
  );
}
