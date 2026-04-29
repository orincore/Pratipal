import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, Tag, User } from "lucide-react";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Not Found" };
  return {
    title: blog.seo_title || blog.title,
    description: blog.seo_description || blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero ── */}
      <div className="relative">
        {blog.featured_image ? (
          <>
            <div className="w-full h-72 sm:h-96 lg:h-[480px] overflow-hidden">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8 pt-16 max-w-5xl mx-auto w-full">
              {blog.category && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-300 bg-emerald-900/50 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                  {blog.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                {blog.title}
              </h1>
            </div>
          </>
        ) : (
          /* No image — gradient banner */
          <div className="w-full bg-gradient-to-br from-stone-800 via-emerald-900 to-teal-900 px-4 sm:px-6 pt-16 pb-12">
            <div className="max-w-5xl mx-auto">
              {blog.category && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full mb-3">
                  {blog.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* ── Content card ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 pb-20 relative z-10">

        {/* Meta bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 px-5 py-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-stone-800">{blog.author}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(blog.created_at), "MMMM d, yyyy")}
            </span>
            {blog.read_time && (
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="h-3.5 w-3.5" />
                {blog.read_time} min read
              </span>
            )}
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Posts
          </Link>
        </div>

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

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-stone-200">
            <Tag className="h-4 w-4 text-stone-400 flex-shrink-0" />
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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
          <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blogs/${blog.slug}`} />
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-200 text-sm font-semibold text-stone-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
