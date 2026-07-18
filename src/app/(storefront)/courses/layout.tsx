import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Healing Courses | ${siteConfig.name}`,
  description:
    `Explore ${siteConfig.name}'s healing and wellness courses — guided learning to deepen your practice and transform your energy.`,
  alternates: { canonical: "/courses" },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
