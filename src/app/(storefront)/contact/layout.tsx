import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Pratipal",
  description:
    "Get in touch with Pratipal. Reach out for product questions, healing session enquiries, or support — we'd love to hear from you.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
