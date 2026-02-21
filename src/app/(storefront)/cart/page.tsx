"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { CartItem } from "@/lib/ecommerce-types";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    totalWeight: 0,
    shippingCost: 0,
    costPerKg: 50,
    freeShippingThreshold: 500,
    isFreeShipping: false,
  });

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateShipping();
    }
  }, [cartItems]);

  async function loadCart() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cart || []);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function calculateShipping() {
    try {
      const res = await fetch("/api/cart/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });

      if (res.ok) {
        const data = await res.json();
        setShippingInfo(data);
      }
    } catch (err) {
      console.error("Failed to calculate shipping:", err);
    }
  }

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Cart updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update cart");
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdating(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove item");

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.18;
  const shipping = shippingInfo.shippingCost;
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button onClick={() => router.push("/")} size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const price = product.sale_price || product.price;
              const itemTotal = price * item.quantity;

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {product.featured_image && (
                          <Image
                            src={product.featured_image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {product.name}
                            </h3>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.variant.name}
                              </p>
                            )}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold">
                                ₹{price.toFixed(2)}
                              </span>
                              {product.sale_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold mb-2">
                              ₹{itemTotal.toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              disabled={updating === item.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.id}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={
                              updating === item.id ||
                              item.quantity >= (product.stock_quantity || 0)
                            }
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {product.stock_quantity && product.stock_quantity < 10 && (
                            <span className="text-xs text-orange-600 ml-2">
                              Only {product.stock_quantity} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping ({shippingInfo.totalWeight.toFixed(2)} kg)
                    </span>
                    <span className="font-medium">
                      {shippingInfo.isFreeShipping ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {!shippingInfo.isFreeShipping && subtotal < shippingInfo.freeShippingThreshold && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700 font-medium">
                        Add ₹{(shippingInfo.freeShippingThreshold - subtotal).toFixed(2)} more for FREE shipping!
                      </p>
                    </div>
                  )}
                  {shippingInfo.isFreeShipping && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700 font-medium">
                        🎉 You've qualified for FREE shipping!
                      </p>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base mb-3"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3 text-sm">We Accept</h3>
                  <div className="flex gap-2 flex-wrap">
                    <div className="border rounded px-3 py-2 text-xs font-medium">
                      Razorpay
                    </div>
                    <div className="border rounded px-3 py-2 text-xs font-medium">
                      UPI
                    </div>
                    <div className="border rounded px-3 py-2 text-xs font-medium">
                      Cards
                    </div>
                    <div className="border rounded px-3 py-2 text-xs font-medium">
                      Net Banking
                    </div>
                    <div className="border rounded px-3 py-2 text-xs font-medium">
                      COD
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3 text-sm">Secure Checkout</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>SSL encrypted payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
