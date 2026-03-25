import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Pratipal",
  description: "Read Pratipal's refund policy for healing courses, digital products, and physical products.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-emerald-600 hover:text-emerald-800 transition">← Back to Home</Link>
          <h1 className="mt-4 text-4xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Refund Policy
          </h1>
          <p className="mt-2 text-sm text-stone-500">Last Updated: 20th March 2026</p>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 text-sm leading-relaxed">
          <p>
            At <strong>Pratipal</strong> (<a href="https://www.pratipal.in" className="text-emerald-700 underline">https://www.pratipal.in/</a>), we are committed to delivering high-quality healing courses and products designed to support your personal growth and well-being.
          </p>
          <p>Please read our refund policy carefully before making a purchase.</p>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">1. No Refund Policy</h2>
            <p>All purchases made on our website are <strong>final and non-refundable</strong>.</p>
            <p className="mt-2">We do not offer refunds, returns, or exchanges for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Healing courses (online/offline, live or recorded)</li>
              <li>Digital products (PDFs, videos, guides, etc.)</li>
              <li>Physical healing products (oils, tools, kits, etc.)</li>
              <li>Workshops, webinars, or consultations</li>
            </ul>
            <p className="mt-2">Once a payment is successfully made, it cannot be reversed under any circumstances.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">2. Reason for No Refunds</h2>
            <p>Due to the nature of our offerings:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Digital products and courses are instantly accessible and cannot be returned.</li>
              <li>Energy healing and spiritual services are experiential and subjective in nature.</li>
              <li>Knowledge-based content cannot be "unlearned" once accessed.</li>
            </ul>
            <p className="mt-2">Therefore, we maintain a strict no refund policy to ensure fairness and transparency.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">3. Order Confirmation</h2>
            <p>Before completing any purchase, customers are advised to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Carefully review product/course details</li>
              <li>Understand what is included</li>
              <li>Ensure it meets their expectations</li>
            </ul>
            <p className="mt-2">By making a purchase, you acknowledge that you have read and agreed to this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">4. Exceptions (If Applicable)</h2>
            <p>Refunds will not be provided except in the following rare cases:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Duplicate payment due to technical error</li>
              <li>Failed transaction where amount is deducted but service/product is not delivered</li>
            </ul>
            <p className="mt-2">In such cases, you must contact us within <strong>48 hours</strong> of the transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">5. Contact Us</h2>
            <p>For any payment-related issues, you can reach us at:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>By email: <a href="mailto:connect@pratipal.in" className="text-emerald-700 underline">connect@pratipal.in</a></li>
              <li>By visiting: <a href="https://www.pratipal.in/" className="text-emerald-700 underline">https://www.pratipal.in/</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">6. Policy Acceptance</h2>
            <p>
              By purchasing from our website, you agree to this Refund Policy and accept that no refund requests will be entertained under normal circumstances.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
