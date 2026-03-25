import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseDetailClient from "./CourseDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    await connectDB();
    const course = await Course.findOne({ slug, status: "published" }).lean() as any;
    return course;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) return { title: "Course Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pratipal.in";

  return {
    title: course.seo_title || course.title,
    description: course.seo_description || course.subtitle,
    keywords: course.seo_keywords || undefined,
    openGraph: {
      title: course.seo_title || course.title,
      description: course.seo_description || course.subtitle,
      url: `${siteUrl}/courses/${slug}`,
      images: course.featured_image ? [{ url: course.featured_image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.seo_title || course.title,
      description: course.seo_description || course.subtitle,
      images: course.featured_image ? [course.featured_image] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
