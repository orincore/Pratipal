import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";
import { LandingTemplate } from "@/components/storefront/landing-template";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublishedPage(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("title, seo_title, seo_description, content, theme")
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

  const content = page!.content as any;
  const hasTemplate = content?.templateData != null;

  if (hasTemplate) {
    return <LandingTemplate data={content.templateData} />;
  }

  return (
    <DynamicPageRenderer
      content={page!.content}
      theme={page!.theme}
      title={page!.title}
    />
  );
}
