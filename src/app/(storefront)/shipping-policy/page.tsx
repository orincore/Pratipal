import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy | Pratipal",
  description: "Read Pratipal's Shipping Policy — delivery timelines, charges, and order processing details.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-emerald-600 hover:text-emerald-800 transition">← Back to Home</Link>
          <h1 className="mt-4 text-4xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Shipping Policy
          </h1>
          <p className="mt-2 text-sm text-stone-500">Last updated: March 25, 2026</p>
          <p className="mt-3 text-sm text-stone-600">
            Thank you for shopping with Pratipal. Please read our shipping policy carefully to understand how we process and deliver your orders.
          </p>
        </div>

        <div className="space-y-8 text-stone-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>1. Order Processing</h2>
            <p className="mb-3">All orders are processed within <strong>1–3 business days</strong> after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
            <p>You will receive an email confirmation once your order has been placed and another notification when your order has been dispatched.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>2. Shipping Charges</h2>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Order Value</th>
                    <th className="text-left px-4 py-3 font-semibold">Shipping Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-stone-200">
                    <td className="px-4 py-3">Below ₹500</td>
                    <td className="px-4 py-3">₹50 flat rate</td>
                  </tr>
                  <tr className="border-t border-stone-200 bg-emerald-50">
                    <td className="px-4 py-3 font-medium text-emerald-700">₹500 and above</td>
                    <td className="px-4 py-3 font-medium text-emerald-700">FREE shipping</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-stone-500">Shipping charges are calculated at checkout and displayed before payment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>3. Delivery Timelines</h2>
            <p className="mb-3">Estimated delivery times after dispatch:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Metro cities</strong> (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata): 3–5 business days</li>
              <li><strong>Tier 2 & Tier 3 cities:</strong> 5–7 business days</li>
              <li><strong>Remote areas & North-East India:</strong> 7–10 business days</li>
            </ul>
            <p className="mt-3 text-stone-500 text-xs">Delivery timelines are estimates and may vary due to courier delays, weather conditions, or public holidays.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>4. Shipping Coverage</h2>
            <p className="mb-3">We currently ship to all major cities and towns across <strong>India</strong>. We do not offer international shipping at this time.</p>
            <p>If you are unsure whether we deliver to your location, please contact us at <a href="mailto:connect@pratipal.in" className="text-emerald-700 underline">connect@pratipal.in</a> before placing your order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>5. Order Tracking</h2>
            <p className="mb-3">Once your order is dispatched, you will receive a tracking number via email. You can use this tracking number on the courier partner's website to track your shipment in real time.</p>
            <p>You can also view your order status by logging into your account at <a href="/account" className="text-emerald-700 underline">My Account</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>6. Packaging</h2>
            <p>All Pratipal products are carefully packed to ensure they reach you in perfect condition. Our healing products — including candles, essential oils, and crystal kits — are wrapped with protective materials to prevent damage during transit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>7. Damaged or Lost Shipments</h2>
            <p className="mb-3">If your order arrives damaged or is lost in transit, please contact us within <strong>48 hours</strong> of the expected delivery date with:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Your order number</li>
              <li>A description of the issue</li>
              <li>Photographs of the damaged packaging/product (if applicable)</li>
            </ul>
            <p>We will investigate and work with the courier to resolve the issue as quickly as possible. Please note this is separate from our <Link href="/refund-policy" className="text-emerald-700 underline">Refund Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>8. Digital Products & Courses</h2>
            <p>Digital products (PDFs, videos, guides) and online courses are delivered electronically via email or your account dashboard immediately after payment confirmation. No physical shipping applies to these items.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>9. Contact Us</h2>
            <p className="mb-2">For any shipping-related queries, please reach out to us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>By email: <a href="mailto:connect@pratipal.in" className="text-emerald-700 underline">connect@pratipal.in</a></li>
              <li>By visiting: <a href="https://www.pratipal.in/" className="text-emerald-700 underline">https://www.pratipal.in/</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
