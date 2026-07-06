import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";
import { LandingTemplate } from "@/components/storefront/landing-template";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_THEME = {
  primary: "#0F8A5F",
  secondary: "#0B4F6C",
  accent: "#18A999",
  background: "#FFFFFF",
};

function toTheme(theme: Record<string, any> | undefined) {
  return { ...DEFAULT_THEME, ...theme };
}

async function getPublishedPage(slug: string) {
  const { LandingPage } = await getDB();
  const page = await LandingPage.findOne({ slug, status: "published" })
    .select("title slug seo_title seo_description content theme")
    .lean();

  if (!page) {
    return null;
  }

  return {
    ...page,
    id: page._id.toString(),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seo_title || page.title || "Pratipal",
    description: page.seo_description || "",
    robots: "noindex",
  };
}

export default async function DynamicLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    notFound();
  }

  const content = page!.content as any;
  const hasTemplate = content?.templateData != null;

  if (hasTemplate) {
    return (
      <LandingTemplate
        data={content.templateData}
        landingPageId={page!.id}
        pageSlug={page!.slug || slug}
      />
    );
  }

  return (
    <DynamicPageRenderer
      content={page!.content}
      theme={toTheme(page!.theme)}
      title={page!.title}
    />
  );
}
