"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Globe,
  Clock,
  Copy,
  Search,
  LayoutGrid,
  ListIcon,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DynamicLandingPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  theme: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export default function AdminLandingPages() {
  const router = useRouter();
  const [pages, setPages] = useState<DynamicLandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  async function loadPages() {
    try {
      const res = await fetch("/api/landing-pages", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load pages");
      }
      const data = await res.json();
      setPages(data.pages ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load landing pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);

    const slug = newSlug.trim() || generateSlug(newTitle);

    try {
      const res = await fetch("/api/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create page");
      }

      const data = await res.json();
      toast.success("Landing page created!");
      setDialogOpen(false);
      setNewTitle("");
      setNewSlug("");
      router.push(`/admin/landing-pages/${data.page.id}/edit`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create page");
    } finally {
      setCreating(false);
    }
  }

  async function handleDuplicate(page: DynamicLandingPage) {
    setDuplicatingId(page.id);
    try {
      const res = await fetch(`/api/landing-pages/${page.id}/duplicate`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to duplicate page");
      }

      const data = await res.json();
      toast.success(`Page duplicated as "${data.page.title}"`);
      loadPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate page");
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/landing-pages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete page");
      }

      toast.success("Page deleted");
      loadPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete page");
    }
  }

  async function toggleStatus(page: DynamicLandingPage) {
    const newStatus = page.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/landing-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(
        newStatus === "published" ? "Page published!" : "Page unpublished"
      );
      loadPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const publishedCount = pages.filter((p) => p.status === "published").length;
  const draftCount = pages.filter((p) => p.status !== "published").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage dynamic landing pages
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Landing Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-sm font-medium">Page Title</Label>
                <Input
                  placeholder="e.g. Salt Magic Webinar"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setNewSlug(generateSlug(e.target.value));
                  }}
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-sm font-medium">URL Slug</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm text-gray-400 font-mono">/</span>
                  <Input
                    placeholder="salt-magic-webinar"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  URL will be auto-incremented if it already exists (e.g. -1, -2, -3)
                </p>
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {creating ? "Creating..." : "Create & Open Editor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      {pages.length > 0 && (
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">{pages.length}</span> total
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              <span className="font-semibold text-green-600">{publishedCount}</span> published
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              <span className="font-semibold text-amber-600">{draftCount}</span> drafts
            </span>
          </div>
          <div className="flex-1" />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-white border-gray-200"
            />
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-5">
              <FileText className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No landing pages yet</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              Create your first dynamic landing page with our visual editor
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-1.5" /> Create Your First Page
            </Button>
          </CardContent>
        </Card>
      ) : filteredPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">No pages found</h3>
            <p className="text-sm text-gray-400">
              Try a different search term
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              className="group relative overflow-hidden hover:shadow-md transition-all duration-200 border-gray-200 hover:border-violet-200"
            >
              {/* Color strip at top */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: page.theme
                    ? `linear-gradient(90deg, ${page.theme.primary || "#6366f1"}, ${page.theme.accent || "#8b5cf6"})`
                    : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />

              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate text-[15px] leading-tight">
                        {page.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                        /{page.slug}
                      </p>
                    </div>
                    <Badge
                      variant={page.status === "published" ? "default" : "secondary"}
                      className={`cursor-pointer flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                        page.status === "published"
                          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                      onClick={() => toggleStatus(page)}
                    >
                      {page.status === "published" ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" /> Live
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" /> Draft
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Theme colors + Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {page.theme &&
                        Object.values(page.theme)
                          .slice(0, 4)
                          .map((color, i) => (
                            <div
                              key={i}
                              className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(page.updated_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 h-9 text-xs font-medium border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                    >
                      <Link href={`/admin/landing-pages/${page.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-medium border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                      onClick={() => handleDuplicate(page)}
                      disabled={duplicatingId === page.id}
                      title="Duplicate page"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      {duplicatingId === page.id ? "..." : "Duplicate"}
                    </Button>

                    {page.status === "published" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-9 w-9 p-0"
                        title="View live page"
                      >
                        <Link href={`/${page.slug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete page"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete page?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{page.title}
                            &quot;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(page.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
