"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Palette,
  Globe,
  Clock,
  Settings2,
  FileText,
  Search,
  X,
  LayoutTemplate,
  Code2,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RichEditor } from "@/components/admin/rich-editor";
import { TemplateEditor } from "@/components/admin/template-editor";
import { LandingTemplate } from "@/components/storefront/landing-template";
import {
  normalizeLandingContent,
  type LandingContent,
} from "@/lib/tiptap/content";
import type { LandingTemplateData } from "@/lib/template-types";
import { DEFAULT_TEMPLATE_DATA } from "@/lib/template-types";
import { toast } from "sonner";
import { useDashboardLayout } from "@/components/admin/dashboard-layout-context";
import { cn } from "@/lib/utils";



interface PageData {
  id: string;
  title: string;
  slug: string;
  content: LandingContent;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  seo_title: string;
  seo_description: string;
  schema_type: string;
  custom_schema: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function LandingPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const { setSidebarCollapsed } = useDashboardLayout();

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [templateData, setTemplateData] = useState<LandingTemplateData>(DEFAULT_TEMPLATE_DATA);


  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/landing-pages/${pageId}`);
        if (!res.ok) {
          throw new Error("Failed to load page");
        }
        const data = await res.json();
        if (!data.page) {
          throw new Error("Page not found");
        }
        const normalized = normalizeLandingContent(data.page.content);
        const savedTemplateData = (data.page.content as any)?.templateData;
        if (savedTemplateData) {
          setTemplateData({ ...DEFAULT_TEMPLATE_DATA, ...savedTemplateData });
        }
        setPage({
          ...data.page,
          schema_type: data.page.schema_type || "",
          custom_schema: data.page.custom_schema || "",
          content: normalized,
        });
        setLoading(false);
      } catch (err: any) {
        toast.error(err.message || "Page not found");
        router.push("/admin/landing-pages");
      }
    }
    load();
  }, [pageId, router]);

  const handleContentChange = useCallback((content: LandingContent) => {
    setPage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...content,
          templateData,
        },
      };
    });
  }, [templateData]);

  const handleThemeChange = useCallback(
    (key: string, value: string) => {
      setPage((prev) =>
        prev ? { ...prev, theme: { ...prev.theme, [key]: value } } : null
      );
    },
    []
  );

  async function handleSave() {
    if (!page) return;
    setSaving(true);

    const savePayload = {
      title: page.title,
      slug: page.slug,
      content: {
        ...page.content,
        templateData,
      },
      theme: page.theme,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      schema_type: page.schema_type,
      custom_schema: page.custom_schema,
      status: page.status,
    };

    try {
      const res = await fetch(`/api/landing-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save page");
      }

      toast.success("Page saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!page) return;
    const newStatus = page.status === "published" ? "draft" : "published";
    setPage({ ...page, status: newStatus });

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
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      setPage({ ...page, status: page.status });
    }
  }

  // Keyboard shortcut: Ctrl/Cmd + S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (loading || !page) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* ===== Top Header Bar ===== */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
        {/* Left: Back + Title */}
        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" asChild>
          <Link href="/admin/landing-pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="text-sm font-semibold border-0 px-2 h-9 focus-visible:ring-1 focus-visible:ring-violet-300 shadow-none bg-transparent"
            placeholder="Page title..."
          />
          <span className="text-[11px] text-gray-400 font-mono hidden sm:inline whitespace-nowrap">/{page.slug}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Badge
            variant={page.status === "published" ? "default" : "secondary"}
            className="cursor-pointer h-7 text-[11px] font-medium"
            onClick={togglePublish}
          >
            {page.status === "published" ? (
              <>
                <Globe className="h-3 w-3 mr-1" /> Published
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" /> Draft
              </>
            )}
          </Badge>

          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-gray-600"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" />
            Settings
          </Button>



          {page?.slug && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-600" asChild>
              <Link href={`/${page.slug}`} target="_blank">
                <Eye className="h-3.5 w-3.5 mr-1" /> Live Page
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            asChild
          >
            <Link href={`/admin/landing-pages/${page.id}/invitations`}>
              Invitations
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="h-8 bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* ===== Main Editor Area ===== */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          <RichEditor
            content={page.content}
            onChange={handleContentChange}
            themeColors={page.theme}
            templateData={templateData}
            setTemplateData={setTemplateData}
            landingPageId={page.id}
            pageSlug={page.slug}
          />
        </div>

        {/* ===== Settings Drawer (Right side overlay) ===== */}
        {showSettingsDrawer && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/10 z-30"
              onClick={() => setShowSettingsDrawer(false)}
            />
            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">Page Settings</h3>
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Page Info */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Page Info
                  </h4>
                  <div>
                    <Label className="text-[11px] text-gray-500">Title</Label>
                    <Input
                      value={page.title}
                      onChange={(e) => setPage({ ...page, title: e.target.value })}
                      className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-gray-500">URL Slug</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[11px] text-gray-400">/</span>
                      <Input
                        value={page.slug}
                        onChange={(e) => setPage({ ...page, slug: e.target.value })}
                        className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-gray-600">
                      {page.status === "published" ? "Published" : "Draft"}
                    </Label>
                    <Switch
                      checked={page.status === "published"}
                      onCheckedChange={() => togglePublish()}
                    />
                  </div>
                  <div className="pt-1 border-t border-gray-100 mt-1">
                    <Link
                      href={`/admin/landing-pages/${page.id}/invitations`}
                      className="text-[11px] text-violet-600 hover:text-violet-800 font-medium"
                    >
                      Manage webinar registration windows &amp; reminders →
                    </Link>
                  </div>
                </div>

                {/* Theme Colors */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5" /> Theme Colors
                  </h4>
                  {(["primary", "secondary", "accent", "background"] as const).map((key) => (
                    <div key={key}>
                      <Label className="capitalize text-[11px] text-gray-500">{key}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="relative">
                          <input
                            type="color"
                            value={page.theme[key]}
                            onChange={(e) => handleThemeChange(key, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-gray-300"
                            style={{ backgroundColor: page.theme[key] }}
                          />
                        </div>
                        <Input
                          value={page.theme[key]}
                          onChange={(e) => handleThemeChange(key, e.target.value)}
                          className="h-8 text-xs font-mono bg-gray-50 border-gray-200 flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* SEO */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Search className="h-3.5 w-3.5" /> SEO Settings
                  </h4>
                  <div>
                    <Label className="text-[11px] text-gray-500">SEO Title</Label>
                    <Input
                      value={page.seo_title}
                      onChange={(e) => setPage({ ...page, seo_title: e.target.value })}
                      className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                      placeholder="Page title for search engines"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-gray-500">Meta Description</Label>
                    <Textarea
                      value={page.seo_description}
                      onChange={(e) => setPage({ ...page, seo_description: e.target.value })}
                      rows={3}
                      className="text-xs mt-1 bg-gray-50 border-gray-200"
                      placeholder="Brief description for search results"
                    />
                  </div>
                </div>

                {/* Structured Data (JSON-LD) */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5" /> Structured Data (Schema)
                  </h4>
                  <div>
                    <Label className="text-[11px] text-gray-500">Schema Type</Label>
                    <select
                      value={page.schema_type}
                      onChange={(e) => setPage({ ...page, schema_type: e.target.value })}
                      className="w-full h-8 text-xs mt-1 bg-gray-50 border border-gray-200 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-violet-300"
                    >
                      <option value="">None</option>
                      <option value="WebPage">WebPage</option>
                      <option value="Article">Article</option>
                      <option value="BlogPosting">BlogPosting</option>
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                      <option value="Course">Course</option>
                      <option value="Event">Event</option>
                      <option value="Organization">Organization</option>
                      <option value="FAQPage">FAQPage</option>
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Generates basic JSON-LD from the page title &amp; description.
                    </p>
                  </div>
                  <div>
                    <Label className="text-[11px] text-gray-500">Custom JSON-LD <span className="text-gray-400">(overrides type)</span></Label>
                    <Textarea
                      value={page.custom_schema}
                      onChange={(e) => setPage({ ...page, custom_schema: e.target.value })}
                      rows={6}
                      className="text-[11px] font-mono mt-1 bg-gray-50 border-gray-200"
                      placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": []\n}'}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Paste full JSON-LD. Must be valid JSON or it will be ignored on the live page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
