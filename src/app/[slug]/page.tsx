import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";
import { LandingTemplate } from "@/components/storefront/landing-template";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "assets",
  "_next",
  "favicon.ico",
]);

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublishedPage(slug: string) {
  if (RESERVED_SLUGS.has(slug)) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("id, title, slug, seo_title, seo_description, content, theme")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return data ?? null;
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
  };
}

export default async function DynamicLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    notFound();
  }

  // Check if this page uses the fixed template (has templateData in content)
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
      theme={page!.theme}
      title={page!.title}
    />
  );
}
