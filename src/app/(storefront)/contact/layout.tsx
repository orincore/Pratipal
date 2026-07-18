import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description:
    `Get in touch with ${siteConfig.name}. Reach out for product questions, healing session enquiries, or support — we'd love to hear from you.`,
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
