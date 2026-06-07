import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healing Courses | Pratipal",
  description:
    "Explore Pratipal's healing and wellness courses — guided learning to deepen your practice and transform your energy.",
  alternates: { canonical: "/courses" },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
