import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, ArrowRight, User } from "lucide-react";
import { format } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { ShareButtons } from "@/components/storefront/share-buttons";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }>; }

async function getBlog(slug: string) {
  await connectDB();
  const blog = await Blog.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) return null;
  return { ...blog, id: blog._id.toString() };
}

// Recent posts + category list for the sidebar
async function getSidebar(currentSlug: string) {
  await connectDB();
  const recentRaw = await Blog.find({ status: "published", slug: { $ne: currentSlug } })
    .select("title slug featured_image created_at category")
    .sort({ created_at: -1 })
    .limit(5)
    .lean() as any[];
  return {
    recent: recentRaw.map((b) => ({ ...b, id: b._id.toString() })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Not Found" };
  return {
    title: blog.seo_title || blog.title,
    description: blog.seo_description || blog.excerpt,
    keywords: blog.seo_keyword || undefined,
    alternates: { canonical: `/blogs/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();
  const { recent } = await getSidebar(slug);

  // Optional Article schema (JSON-LD) — emitted when present on the post
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": blog.schema_type || "Article",
    headline: blog.seo_title || blog.title,
    description: blog.seo_description || blog.excerpt,
    image: blog.featured_image ? [blog.featured_image] : undefined,
    datePublished: new Date(blog.created_at).toISOString(),
    dateModified: new Date(blog.updated_at || blog.created_at).toISOString(),
    author: { "@type": "Person", name: blog.author },
    keywords: blog.seo_keyword || undefined,
  };

  // Prefer admin-provided custom JSON-LD (if valid), else the generated Article schema.
  let schemaJson = JSON.stringify(articleSchema);
  if (blog.custom_schema && blog.custom_schema.trim()) {
    try {
      schemaJson = JSON.stringify(JSON.parse(blog.custom_schema));
    } catch {
      // invalid custom JSON — fall back to the generated Article schema
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />

      {/* ── Header band ── */}
      <div style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-10">
          <Link
            href="/blogs"
            className="flex w-fit items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>
          {blog.category && (
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300 mb-3">
              {blog.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{blog.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />{format(new Date(blog.created_at), "MMMM d, yyyy")}
            </span>
            {blog.read_time && (
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{blog.read_time} min read</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: content + sidebar ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">

        {/* Main column */}
        <article className="min-w-0">
          {/* Featured image — shown in full (no cropping) */}
          {blog.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 shadow-sm">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-auto object-contain max-h-[520px] mx-auto"
              />
            </div>
          )}

          {/* Excerpt pull-quote */}
          {blog.excerpt && (
            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed mb-8 pl-5 border-l-4 border-emerald-400 italic font-light">
              {blog.excerpt}
            </p>
          )}

          {/* Body */}
          <div
            className="prose prose-stone prose-sm sm:prose max-w-none
              prose-headings:font-bold prose-headings:text-stone-900
              prose-p:text-stone-700 prose-p:leading-relaxed
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-stone-800
              prose-blockquote:border-emerald-400 prose-blockquote:text-stone-600 prose-blockquote:italic
              prose-code:bg-stone-100 prose-code:text-emerald-700 prose-code:rounded prose-code:px-1
              prose-pre:bg-stone-900 prose-pre:text-stone-100
              prose-img:rounded-xl prose-img:shadow-md
              prose-hr:border-stone-200"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Author card */}
          <div className="mt-10 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {blog.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-0.5">Written by</p>
              <p className="font-bold text-stone-900">{blog.author}</p>
              <p className="text-sm text-stone-500 mt-1">Holistic healing practitioner &amp; wellness guide at Pratipal.</p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-8 bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <p className="font-semibold text-gray-700 mb-3 text-sm">Share this Article</p>
            <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://pratipal.in'}/blogs/${blog.slug}`} />
          </div>

          {/* Back link */}
          <div className="mt-8">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-200 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="mt-12 lg:mt-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Recent posts */}
          {recent.length > 0 && (
            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" /> Recent Posts
              </h2>
              <ul className="space-y-3">
                {recent.map((post) => (
                  <li key={post.id}>
                    <Link href={`/blogs/${post.slug}`} className="group flex items-center gap-3">
                      <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl opacity-40">🌿</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {format(new Date(post.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All posts CTA */}
          <Link
            href="/blogs"
            className="flex items-center justify-between gap-2 px-5 py-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm hover:shadow-md transition-all group"
          >
            <span className="text-sm font-semibold">Explore all articles</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
