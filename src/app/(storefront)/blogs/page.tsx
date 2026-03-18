import { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Pratipal",
  description: "Insights on holistic healing, essential oils, and conscious living.",
};

async function getBlogs() {
  await connectDB();
  const blogs = await Blog.find({ status: "published" })
    .select("title slug excerpt featured_image category tags author read_time featured created_at")
    .sort({ created_at: -1 })
    .lean() as any[];
  return blogs.map((b) => ({ ...b, id: b._id.toString() }));
}

export default async function BlogsPage() {
  const blogs = await getBlogs();
  const featured = blogs.find((b) => b.featured);
  const rest = blogs.filter((b) => !b.featured || b.id !== featured?.id);

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero strip (matches shop page style) ── */}
      <div style={{ background: "linear-gradient(120deg, #0f172a 0%, #1b244a 40%, #0d3d2e 75%, #134e3a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-1" style={{ color: "#6ee7b7" }}>
              Pratipal Journal
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Blog &amp; Insights
            </h1>
            <p className="text-xs text-white/50 mt-1 hidden sm:block">
              Holistic healing, essential oils &amp; conscious living.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 pb-1">
            {[
              { value: `${blogs.length}`, label: "Articles" },
              { value: "Free", label: "To Read" },
              { value: "Weekly", label: "Updates" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center px-4 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-sm font-bold text-white">{value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {blogs.length === 0 && (
          <div className="text-center py-24 text-stone-400">No posts yet. Check back soon.</div>
        )}

        {/* Featured post */}
        {featured && (
          <Link href={`/blogs/${featured.slug}`} className="group block mb-8">
            <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow grid md:grid-cols-2 border border-stone-100">
              {featured.featured_image ? (
                <div className="h-56 md:h-auto overflow-hidden">
                  <img
                    src={featured.featured_image}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-56 md:h-auto bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🌿</span>
                </div>
              )}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-3">
                  Featured
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors mb-3 leading-snug">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-4">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                  {featured.read_time && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.read_time} min</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{format(new Date(featured.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  Read Article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group block">
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-stone-100 hover:border-emerald-200">
                {blog.featured_image ? (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                    <span className="text-4xl opacity-40">🌿</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {blog.category && (
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                      {blog.category}
                    </span>
                  )}
                  <h3 className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-stone-500 line-clamp-2 flex-1 leading-relaxed">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      {blog.read_time && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blog.read_time} min</span>
                      )}
                      <span>{format(new Date(blog.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
