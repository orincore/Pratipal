"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BlogEditor = dynamic(
  () => import("@/components/admin/blog-editor").then((m) => m.BlogEditor),
  { ssr: false, loading: () => <div className="h-64 border rounded-xl bg-gray-50 animate-pulse" /> }
);

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category?: string;
  tags: string[];
  author: string;
  status: string;
  featured: boolean;
  read_time?: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

const emptyForm = () => ({
  title: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category: "",
  tags: [] as string[],
  author: "Dr. Aparnaa Singh",
  status: "draft",
  featured: false,
  seo_title: "",
  seo_description: "",
});

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => { fetchBlogs(); }, []);

  async function fetchBlogs() {
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch { toast.error("Failed to load blogs"); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setFormData(emptyForm());
    setTagInput("");
    setFormOpen(true);
  }

  function openEdit(blog: Blog) {
    setEditing(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      featured_image: blog.featured_image || "",
      category: blog.category || "",
      tags: blog.tags || [],
      author: blog.author,
      status: blog.status,
      featured: blog.featured,
      seo_title: blog.seo_title || "",
      seo_description: blog.seo_description || "",
    });
    setTagInput("");
    setFormOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "uploads");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((p) => ({ ...p, featured_image: data.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData((p) => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Title is required"); return; }
    if (!formData.content || formData.content === "<p></p>") { toast.error("Content is required"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/blogs/${editing.id}` : "/api/admin/blogs";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(editing ? "Blog updated" : "Blog created");
      setFormOpen(false);
      fetchBlogs();
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      fetchBlogs();
    } catch { toast.error("Failed to delete"); }
  }

  const statusColor: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-100 text-gray-600",
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  // ── FORM VIEW ──
  if (formOpen) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Blog Editor</p>
            <h1 className="text-2xl font-bold">{editing ? "Edit Post" : "New Blog Post"}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              form="blog-form" type="submit" disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <form id="blog-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Blog post title"
              className="mt-1 text-lg font-medium"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label>Excerpt <span className="text-gray-400 font-normal">(shown on listing page)</span></Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
              placeholder="Short summary of the post..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Featured image */}
          <div>
            <Label>Featured Image</Label>
            <div className="mt-1">
              {formData.featured_image ? (
                <div className="relative w-full h-52 rounded-xl overflow-hidden border">
                  <img src={formData.featured_image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, featured_image: "" }))}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload cover image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Content editor */}
          <div>
            <Label>Content *</Label>
            <div className="mt-1">
              <BlogEditor
                content={formData.content}
                onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Wellness, Healing"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status + featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Featured post</span>
              </label>
            </div>
          </div>

          {/* SEO */}
          <details className="border rounded-xl p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">SEO Settings (optional)</summary>
            <div className="mt-3 space-y-3">
              <div>
                <Label>SEO Title</Label>
                <Input value={formData.seo_title} onChange={(e) => setFormData((p) => ({ ...p, seo_title: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea value={formData.seo_description} onChange={(e) => setFormData((p) => ({ ...p, seo_description: e.target.value }))} rows={2} className="mt-1" />
              </div>
            </div>
          </details>
        </form>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">{blogs.length} post{blogs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {blogs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Plus className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">No blog posts yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first post to start your blog.</p>
            <Button onClick={openCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-400">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {blog.featured_image && (
                    <img src={blog.featured_image} alt="" className="h-20 w-28 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[blog.status] || statusColor.draft}`}>
                        {blog.status}
                      </span>
                      {blog.featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Featured</span>}
                      {blog.category && <span className="text-xs text-gray-500">{blog.category}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{blog.title}</h3>
                    {blog.excerpt && <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{blog.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {blog.read_time && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blog.read_time} min read</span>
                      )}
                      <span>{format(new Date(blog.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/blogs/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(blog)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(blog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
