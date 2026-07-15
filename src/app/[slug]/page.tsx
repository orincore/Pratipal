import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DynamicPageRenderer } from "@/components/storefront/dynamic-page-renderer";
import { LandingTemplate } from "@/components/storefront/landing-template";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "assets",
  "_next",
  "favicon.ico",
]);

const DEFAULT_THEME = {
  primary: "#0F8A5F",
  secondary: "#0B4F6C",
  accent: "#18A999",
  background: "#FFFFFF",
};

function toTheme(theme: Record<string, any> | undefined) {
  return { ...DEFAULT_THEME, ...theme };
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublishedPage(slug: string) {
  if (RESERVED_SLUGS.has(slug)) {
    return null;
  }

  const { LandingPage } = await getDB();
  const page = await LandingPage.findOne({ slug, status: "published" })
    .select("title slug seo_title seo_description schema_type custom_schema content theme")
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

// Build JSON-LD structured data: prefer the admin-provided custom JSON-LD,
// otherwise generate a minimal object from the chosen schema type.
function buildSchema(page: any): object | null {
  const custom = (page.custom_schema || "").trim();
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch {
      // Invalid JSON — skip rather than emit broken structured data.
      return null;
    }
  }
  const type = (page.schema_type || "").trim();
  if (!type || type.toLowerCase() === "none") return null;
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: page.seo_title || page.title,
    description: page.seo_description || undefined,
  };
}

export default async function DynamicLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    notFound();
  }

  const schema = buildSchema(page!);
  const schemaScript = schema ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ) : null;

  // Check if this page uses the fixed template (has templateData in content)
  const content = page!.content as any;
  const hasTemplate = content?.templateData != null;

  if (hasTemplate) {
    return (
      <>
        {schemaScript}
        <LandingTemplate
          data={content.templateData}
          pageContent={content}
          landingPageId={page!.id}
          pageSlug={page!.slug || slug}
        />
      </>
    );
  }

  return (
    <>
      {schemaScript}
      <DynamicPageRenderer
        content={page!.content}
        theme={toTheme(page!.theme)}
        title={page!.title}
        pageSlug={page!.slug || slug}
        landingPageId={page!.id}
      />
    </>
  );
}
