"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { siteConfig } from "@/config/site.config";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  MapPin,
  PlusCircle,
  Home,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import type { CartItem, Address } from "@/lib/ecommerce-types";
import { useCartStore } from "@/stores/cart-store";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type AddressFormState = {
  first_name: string;
  last_name: string;
  company?: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: "shipping" | "billing";
  is_default: boolean;
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get("buyNow");
  const { customer, loading: authLoading, register, login } = useCustomerAuth();
  const [guestPassword, setGuestPassword] = useState("");
  const [guestPasswordConfirm, setGuestPasswordConfirm] = useState("");
  // Toggles the "Create Your Account" fields over to an inline sign-in
  // form for guests who already have an account — login() sets `customer`
  // via context on success, so the page just re-renders into the signed-in
  // view in place; no navigation, no reload, cart/shipping state untouched.
  const [showInlineSignIn, setShowInlineSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function handleInlineSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please enter your email and password");
      return;
    }
    setSigningIn(true);
    try {
      await login(signInEmail, signInPassword);
      toast.success("Signed in — continuing your checkout.");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setSigningIn(false);
    }
  }
  const clearCartStore = useCartStore((state) => state.clearCart);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    totalWeight: 0,
    shippingCost: 0,
    costPerKg: 50,
    freeShippingThreshold: 500,
    isFreeShipping: false,
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>(() => ({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    company: "",
    phone: customer?.phone || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    address_type: "shipping",
    is_default: false,
  }));

  const [shippingAddress, setShippingAddress] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [billingAddress, setBillingAddress] = useState({
    first_name: "",
    last_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadCart();
  }, [authLoading]);

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateShipping();
    }
  }, [cartItems]);

  useEffect(() => {
    if (customer) {
      setShippingAddress((prev) => ({
        ...prev,
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email,
        phone: customer.phone || "",
      }));
    }
  }, [customer]);

  const applyAddressToShipping = useCallback(
    (address: Address) => {
      setShippingAddress((prev) => ({
        ...prev,
        first_name: address.first_name,
        last_name: address.last_name,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country || "India",
        phone: address.phone || prev.phone || customer?.phone || "",
        email: customer?.email || prev.email,
      }));
    },
    [customer]
  );

  const loadAddresses = useCallback(async () => {
    if (!customer) return;
    setAddressesLoading(true);
    try {
      const res = await fetch("/api/account/addresses");
      if (res.status === 401) {
        setAddresses([]);
        setSelectedAddressId(null);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load addresses");
      }
      const data = await res.json();
      const list: Address[] = data.addresses || [];
      setAddresses(list);
      if (list.length > 0) {
        const preferred = list.find((addr) => addr.is_default) || list[0];
        setSelectedAddressId(preferred.id);
        applyAddressToShipping(preferred);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Unable to load saved addresses");
    } finally {
      setAddressesLoading(false);
    }
  }, [customer, applyAddressToShipping]);

  useEffect(() => {
    if (customer) {
      setShippingAddress((prev) => ({
        ...prev,
        first_name: customer.first_name || prev.first_name,
        last_name: customer.last_name || prev.last_name,
        email: customer.email,
        phone: customer.phone || prev.phone,
      }));
      setAddressForm((prev) => ({
        ...prev,
        first_name: prev.first_name || customer.first_name || "",
        last_name: prev.last_name || customer.last_name || "",
        phone: prev.phone || customer.phone || "",
      }));
      loadAddresses();
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
    }
  }, [customer, loadAddresses]);

  async function loadCart() {
    try {
      if (buyNowProductId) {
        // Buy Now flow — fetch just this product, skip cart entirely
        const res = await fetch(`/api/products/${buyNowProductId}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        const p = data.product || data;
        const syntheticItem: CartItem = {
          id: `buynow-${p.id}`,
          product_id: p.id,
          product: {
            id: p.id,
            name: p.name,
            price: p.sale_price || p.price,
            sale_price: p.sale_price,
            featured_image: p.featured_image || p.images?.[0] || "",
            sku: p.sku,
            is_ebook: p.is_ebook,
            weight: p.weight,
          } as any,
          quantity: 1,
          price: p.sale_price || p.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCartItems([syntheticItem]);
      } else {
        const res = await fetch("/api/cart");
        const data = await res.json();
        const items = data.cart || [];
        setCartItems(items);
        if (items.length === 0) {
          toast.error("Your cart is empty");
          router.push("/cart");
        }
      }
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

  function handleAddressFormChange(
    field: keyof AddressFormState,
    value: string | boolean
  ) {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddressSelect(addressId: string) {
    setSelectedAddressId(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      applyAddressToShipping(address);
    }
  }

  async function handleCreateAddress() {
    if (!customer) {
      toast.error("Please sign in to save addresses");
      return;
    }

    const requiredFields: (keyof AddressFormState)[] = [
      "first_name",
      "last_name",
      "address_line1",
      "city",
      "state",
      "postal_code",
    ];

    for (const field of requiredFields) {
      if (!addressForm[field]) {
        toast.error(`Please fill in ${field.replace("_", " ")}`);
        return;
      }
    }

    setCreatingAddress(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save address");
      }

      const data = await res.json();
      const savedAddress: Address = data.address;
      toast.success("Address saved");
      setShowAddressForm(false);
      setAddressForm({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        company: "",
        phone: customer.phone || "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        address_type: "shipping",
        is_default: false,
      });
      await loadAddresses();
      setSelectedAddressId(savedAddress.id);
      applyAddressToShipping(savedAddress);
    } catch (err: any) {
      toast.error(err.message || "Unable to save address");
    } finally {
      setCreatingAddress(false);
    }
  }

  function loadRazorpayScript() {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }

  function handleShippingChange(field: string, value: string) {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleBillingChange(field: string, value: string) {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    const required = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "address_line1",
      "city",
      "state",
      "postal_code",
    ];

    for (const field of required) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast.error(`Please fill in ${field.replace("_", " ")}`);
        return false;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      toast.error("Invalid email address");
      return false;
    }

    if (!/^[+]?[\d\s-]{10,}$/.test(shippingAddress.phone)) {
      toast.error("Invalid phone number");
      return false;
    }

    // Guests get an account created from these same details as part of
    // placing the order (see handlePlaceOrder), so a password is required
    // for them same as it would be on a normal sign-up form.
    if (!customer) {
      if (guestPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (guestPassword !== guestPasswordConfirm) {
        toast.error("Passwords don't match");
        return false;
      }
    }

    return true;
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.sale_price || item.product?.price || item.price;
    return sum + price * item.quantity;
  }, 0);

  // Ebooks are delivered digitally — an order made up entirely of ebooks
  // is never charged GST or shipping.
  const isEbookOnlyOrder =
    cartItems.length > 0 && cartItems.every((item) => item.product?.is_ebook);

  const tax = isEbookOnlyOrder ? 0 : subtotal * 0.18;
  const shipping = isEbookOnlyOrder ? 0 : shippingInfo.shippingCost;
  const total = subtotal + tax + shipping;

  async function handlePlaceOrder() {
    if (!validateForm()) return;

    if (customer && addresses.length > 0 && !selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setProcessing(true);

    try {
      const orderData = {
        customer_email: shippingAddress.email,
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        shipping_address_id: selectedAddressId,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      await initiateRazorpayPayment(orderData);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
      setProcessing(false);
    }
  }

  async function initiateRazorpayPayment(orderData: any) {
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          orderData,
        }),
      });

      if (!res.ok) throw new Error("Failed to create Razorpay order");

      const data = await res.json();

      const options = {
        key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: siteConfig.razorpayDisplayName,
        description: "Order Payment",
        image: siteConfig.logo.footer.startsWith("http") ? siteConfig.logo.footer : `${siteConfig.domain}${siteConfig.logo.footer}`,
        order_id: data.razorpay_order_id,
        // Echoed back on the payment entity in every webhook event, so
        // /api/razorpay/webhook can still find this order if the order-id
        // lookup ever comes up empty.
        notes: { order_id: data.order_id },
        handler: async function (response: any) {
          await verifyPayment(response, data.order_id);
        },
        prefill: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          // Matches the site's ayurvedic green brand accent (Tailwind
          // emerald-600 — the same green used for CTAs, trust badges, and
          // the shop's default button color throughout the storefront).
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
      setProcessing(false);
    }
  }

  async function verifyPayment(response: any, orderId: string) {
    try {
      const res = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          order_id: orderId,
        }),
      });

      if (!res.ok) throw new Error("Payment verification failed");

      toast.success("Payment successful!");

      // Guests: the order is placed and paid — now create (and sign into)
      // an account from the same contact details + password entered above,
      // instead of ever sending them to a separate sign-up screen. This
      // runs after payment succeeds, not before, so an abandoned payment
      // never leaves behind an unused account.
      if (!customer) {
        try {
          await register({
            email: shippingAddress.email,
            password: guestPassword,
            first_name: shippingAddress.first_name,
            last_name: shippingAddress.last_name,
            phone: shippingAddress.phone,
          });
          toast.success("You're signed in — this order is now saved to your account.");
        } catch (err: any) {
          const message: string = err.message || "";
          // The order is already placed and paid at this point regardless —
          // account creation failing (most likely a pre-existing account
          // with this email) shouldn't block the confirmation page.
          if (/already registered/i.test(message)) {
            toast.error("An account already exists for this email — sign in to see this order under My Orders.");
          } else {
            console.error("Post-order account creation failed:", err);
          }
        }
      }

      // Clear cart only if this was a normal cart checkout
      if (!buyNowProductId) {
        clearCartStore();
        fetch('/api/cart/clear', { method: 'POST' }).catch(console.warn);
      }

      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed");
      router.push(`/order-failed?orderId=${orderId}`);
    } finally {
      setProcessing(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 sm:pt-28 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>

        {!customer && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <span className="font-semibold">Sign in to skip re-entering your details.</span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowInlineSignIn((v) => !v)}
            >
              {showInlineSignIn ? "Never mind" : "Sign in instead"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {!customer && showInlineSignIn ? (
                    <>
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!customer && showInlineSignIn ? (
                  // Signing in is the only thing to do here — the address
                  // form comes back (pre-filled with the account's saved
                  // addresses) the moment login() resolves and `customer`
                  // is set.
                  <section className="space-y-4">
                    <div>
                      <p className="font-semibold">Sign In</p>
                      <p className="text-sm text-muted-foreground">
                        Sign in to pull in your saved addresses automatically — you'll stay right here on this page.
                      </p>
                    </div>

                    <form onSubmit={handleInlineSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin_email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="signin_email"
                          type="email"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          autoFocus
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="signin_password">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="signin_password"
                          type="password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="submit" className="flex-1" disabled={signingIn}>
                          {signingIn ? "Signing in..." : "Sign In"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setShowInlineSignIn(false)}
                          disabled={signingIn}
                        >
                          New here? Continue as guest
                        </Button>
                      </div>
                    </form>
                  </section>
                ) : (
                  <>
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">
                          Select a saved address or add a new one
                        </p>
                      </div>
                    </div>
                    {customer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressForm((prev) => !prev)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {showAddressForm ? "Close" : "Add New"}
                      </Button>
                    )}
                  </div>

                  {customer ? (
                    <>
                      {addressesLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map((item) => (
                            <div
                              key={item}
                              className="h-20 w-full rounded-lg bg-muted animate-pulse"
                            />
                          ))}
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-muted-foreground text-center">
                          You haven't saved any addresses yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <button
                              type="button"
                              key={address.id}
                              onClick={() => handleAddressSelect(address.id)}
                              className={`w-full text-left border rounded-lg p-4 flex gap-3 transition-colors ${
                                selectedAddressId === address.id
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                readOnly
                                checked={selectedAddressId === address.id}
                                className="mt-1 h-4 w-4"
                              />
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">
                                    {address.first_name} {address.last_name}
                                  </p>
                                  <span className="text-xs uppercase tracking-wide rounded-full bg-gray-100 px-2 py-0.5">
                                    {address.address_type}
                                  </span>
                                  {address.is_default && (
                                    <span className="text-xs font-semibold text-green-600">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 leading-snug">
                                  {address.address_line1}
                                  {address.address_line2 ? `, ${address.address_line2}` : ""}, {address.city}, {address.state} {address.postal_code}
                                </p>
                                {address.phone && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    📞 {address.phone}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showAddressForm && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Add New Address
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new_first_name">First Name</Label>
                              <Input
                                id="new_first_name"
                                value={addressForm.first_name}
                                onChange={(e) =>
                                  handleAddressFormChange("first_name", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_last_name">Last Name</Label>
                              <Input
                                id="new_last_name"
                                value={addressForm.last_name}
                                onChange={(e) =>
                                  handleAddressFormChange("last_name", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new_phone">Phone</Label>
                              <PhoneInput
                                id="new_phone"
                                value={addressForm.phone}
                                onChange={(v) => handleAddressFormChange("phone", v)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_company">Company (optional)</Label>
                              <Input
                                id="new_company"
                                value={addressForm.company || ""}
                                onChange={(e) =>
                                  handleAddressFormChange("company", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="new_address_line1">Address Line 1</Label>
                            <Input
                              id="new_address_line1"
                              value={addressForm.address_line1}
                              onChange={(e) =>
                                handleAddressFormChange("address_line1", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_address_line2">Address Line 2</Label>
                            <Input
                              id="new_address_line2"
                              value={addressForm.address_line2}
                              onChange={(e) =>
                                handleAddressFormChange("address_line2", e.target.value)
                              }
                              placeholder="Apartment, suite, etc."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="new_city">City</Label>
                              <Input
                                id="new_city"
                                value={addressForm.city}
                                onChange={(e) =>
                                  handleAddressFormChange("city", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_state">State</Label>
                              <Input
                                id="new_state"
                                value={addressForm.state}
                                onChange={(e) =>
                                  handleAddressFormChange("state", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="new_postal">Postal Code</Label>
                              <Input
                                id="new_postal"
                                value={addressForm.postal_code}
                                onChange={(e) =>
                                  handleAddressFormChange("postal_code", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Address Type</Label>
                              <Select
                                value={addressForm.address_type}
                                onValueChange={(val: "shipping" | "billing") =>
                                  handleAddressFormChange("address_type", val)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="shipping">Shipping</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <label className="flex items-center space-x-2 pt-6 text-sm text-muted-foreground">
                              <input
                                type="checkbox"
                                id="new_default"
                                checked={addressForm.is_default}
                                onChange={(e) =>
                                  handleAddressFormChange("is_default", e.target.checked)
                                }
                                className="h-4 w-4 rounded border border-gray-300"
                              />
                              <span>Set as default for this address type</span>
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              className="flex-1"
                              onClick={handleCreateAddress}
                              disabled={creatingAddress}
                            >
                              {creatingAddress ? "Saving..." : "Save Address"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="flex-1"
                              onClick={() => setShowAddressForm(false)}
                              disabled={creatingAddress}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Checking out as a guest</p>
                      <p className="text-xs mt-1">
                        Enter your shipping details below — we'll set up your account automatically once the order is placed, so you can track it afterward.
                      </p>
                    </div>
                  )}
                </section>

                <section className="space-y-4 border-t pt-4">
                  <div>
                    <p className="font-semibold">Contact & Delivery Details</p>
                    <p className="text-sm text-muted-foreground">
                      These details will be used for delivery and notifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleShippingChange("first_name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleShippingChange("last_name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleShippingChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <PhoneInput
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(v) => handleShippingChange("phone", v)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address_line1"
                      value={shippingAddress.address_line1}
                      onChange={(e) => handleShippingChange("address_line1", e.target.value)}
                      placeholder="House number, street name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={shippingAddress.address_line2}
                      onChange={(e) => handleShippingChange("address_line2", e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleShippingChange("state", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">
                        Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleShippingChange("postal_code", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={shippingAddress.country}
                      onValueChange={(v) => handleShippingChange("country", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                {!customer && (
                  <section className="space-y-4 border-t pt-4">
                    <div>
                      <p className="font-semibold">Create Your Account</p>
                      <p className="text-sm text-muted-foreground">
                        Set a password to finish creating your account — it's built from the details above, and you'll be signed in automatically once the order is placed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guest_password">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guest_password"
                          type="password"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          minLength={6}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest_password_confirm">
                          Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guest_password_confirm"
                          type="password"
                          value={guestPasswordConfirm}
                          onChange={(e) => setGuestPasswordConfirm(e.target.value)}
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                  </section>
                )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("razorpay")}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">Razorpay (UPI, Cards, Net Banking)</p>
                        <p className="text-sm text-muted-foreground">
                          Pay securely using Razorpay
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    const price = product.sale_price || product.price;

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
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
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold">
                            ₹{(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isEbookOnlyOrder
                        ? "Shipping"
                        : `Shipping (${shippingInfo.totalWeight.toFixed(2)} kg)`}
                    </span>
                    <span>
                      {isEbookOnlyOrder || shippingInfo.isFreeShipping ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {isEbookOnlyOrder && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
                      📖 Digital delivery — no shipping or tax charged on ebooks!
                    </div>
                  )}
                  {!isEbookOnlyOrder && shippingInfo.isFreeShipping && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
                      🎉 You've qualified for FREE shipping!
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : customer
                    ? "Proceed to Payment"
                    : "Create Account & Pay"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
