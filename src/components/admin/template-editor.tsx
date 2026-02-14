"use client";

import React, { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Palette,
  Image as ImageIcon,
  Type,
  Star,
  Users,
  LayoutGrid,
  Award,
  MessageSquare,
  BookOpen,
  Gift,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { LandingTemplateData } from "@/lib/template-types";

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-semibold text-gray-800 flex-1">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color Picker Row
// ---------------------------------------------------------------------------
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</Label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="h-8 w-8 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-gray-300"
          style={{ backgroundColor: value }}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs font-mono bg-gray-50 border-gray-200 flex-1"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Upload Field
// ---------------------------------------------------------------------------
function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    const formData = new FormData();
    formData.append("file", file);
    try {
      toast.loading("Uploading...", { id: "tpl-upload" });
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      toast.success("Uploaded!", { id: "tpl-upload" });
    } catch {
      toast.error("Upload failed", { id: "tpl-upload" });
    }
    e.target.value = "";
  }, [onChange]);

  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
          placeholder="Image URL..."
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
        </Button>
      </div>
      {value && (
        <div className="mt-2 relative group">
          <img src={value} alt="" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Template Editor
// ---------------------------------------------------------------------------
interface TemplateEditorProps {
  data: LandingTemplateData;
  onChange: (data: LandingTemplateData) => void;
}

export function TemplateEditor({ data, onChange }: TemplateEditorProps) {
  const update = useCallback(
    <K extends keyof LandingTemplateData>(section: K, value: Partial<LandingTemplateData[K]>) => {
      onChange({ ...data, [section]: { ...data[section], ...value } });
    },
    [data, onChange]
  );

  const updateColors = useCallback(
    (key: string, value: string) => {
      onChange({ ...data, colors: { ...data.colors, [key]: value } });
    },
    [data, onChange]
  );

  return (
    <div className="space-y-3 p-1">
      {/* ===== COLORS ===== */}
      <Section title="Theme Colors" icon={<Palette className="h-4 w-4" />} defaultOpen>
        <ColorField label="Primary" value={data.colors.primary} onChange={(v) => updateColors("primary", v)} />
        <ColorField label="Secondary" value={data.colors.secondary} onChange={(v) => updateColors("secondary", v)} />
        <ColorField label="Accent" value={data.colors.accent} onChange={(v) => updateColors("accent", v)} />
        <ColorField label="Hero BG" value={data.colors.heroBg} onChange={(v) => updateColors("heroBg", v)} />
        <ColorField label="Dark BG" value={data.colors.darkBg} onChange={(v) => updateColors("darkBg", v)} />
        <ColorField label="Body BG" value={data.colors.bodyBg} onChange={(v) => updateColors("bodyBg", v)} />
      </Section>

      {/* ===== HERO ===== */}
      <Section title="Hero Section" icon={<Star className="h-4 w-4" />} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show hero block</Label>
          <Switch
            checked={data.hero.visible}
            onCheckedChange={(v) => update("hero", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Badge Text</Label>
          <Input value={data.hero.badge} onChange={(e) => update("hero", { badge: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Headline</Label>
          <Input value={data.hero.headline} onChange={(e) => update("hero", { headline: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Highlighted Word</Label>
          <Input value={data.hero.highlightedWord} onChange={(e) => update("hero", { highlightedWord: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subheadline</Label>
          <Textarea value={data.hero.subheadline} onChange={(e) => update("hero", { subheadline: e.target.value })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Bullet Points</Label>
          {data.hero.bulletPoints.map((bp, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input
                value={bp}
                onChange={(e) => {
                  const arr = [...data.hero.bulletPoints];
                  arr[i] = e.target.value;
                  update("hero", { bulletPoints: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                const arr = data.hero.bulletPoints.filter((_, j) => j !== i);
                update("hero", { bulletPoints: arr });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("hero", { bulletPoints: [...data.hero.bulletPoints, ""] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Point
          </Button>
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.hero.ctaButtonText} onChange={(e) => update("hero", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.hero.ctaButtonLink} onChange={(e) => update("hero", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <ImageField label="Hero Image" value={data.hero.heroImage} onChange={(v) => update("hero", { heroImage: v })} />
        <div>
          <Label className="text-xs text-gray-500">Floating Stats</Label>
          {data.hero.floatingStats.map((stat, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input
                value={stat.value}
                onChange={(e) => {
                  const arr = [...data.hero.floatingStats];
                  arr[i] = { ...arr[i], value: e.target.value };
                  update("hero", { floatingStats: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 w-24"
                placeholder="Value"
              />
              <Input
                value={stat.label}
                onChange={(e) => {
                  const arr = [...data.hero.floatingStats];
                  arr[i] = { ...arr[i], label: e.target.value };
                  update("hero", { floatingStats: arr });
                }}
                className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
                placeholder="Label"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("hero", { floatingStats: data.hero.floatingStats.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("hero", { floatingStats: [...data.hero.floatingStats, { value: "", label: "" }] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Stat
          </Button>
        </div>
      </Section>

      {/* ===== MARQUEE ===== */}
      <Section title="Marquee / Ticker" icon={<Type className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.marquee.enabled} onCheckedChange={(v) => update("marquee", { enabled: v })} />
        </div>
        {data.marquee.items.map((item, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={item}
              onChange={(e) => {
                const arr = [...data.marquee.items];
                arr[i] = e.target.value;
                update("marquee", { items: arr });
              }}
              className="h-8 text-xs bg-gray-50 border-gray-200 flex-1"
            />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
              update("marquee", { items: data.marquee.items.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("marquee", { items: [...data.marquee.items, ""] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Item
        </Button>
      </Section>

      {/* ===== WHY SECTION ===== */}
      <Section title="Why Section" icon={<LayoutGrid className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.why.visible}
            onCheckedChange={(v) => update("why", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.why.title} onChange={(e) => update("why", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Textarea value={data.why.subtitle} onChange={(e) => update("why", { subtitle: e.target.value })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.why.points.map((point, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Point {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("why", { points: data.why.points.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={point.title} onChange={(e) => {
              const arr = [...data.why.points]; arr[i] = { ...arr[i], title: e.target.value }; update("why", { points: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
            <Textarea value={point.description} onChange={(e) => {
              const arr = [...data.why.points]; arr[i] = { ...arr[i], description: e.target.value }; update("why", { points: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            <ImageField label="Image" value={point.image} onChange={(v) => {
              const arr = [...data.why.points]; arr[i] = { ...arr[i], image: v }; update("why", { points: arr });
            }} />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("why", { points: [...data.why.points, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Point
        </Button>
      </Section>

      {/* ===== ABOUT ===== */}
      <Section title="About Section" icon={<Users className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.about.visible}
            onCheckedChange={(v) => update("about", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Section Title</Label>
          <Input value={data.about.title} onChange={(e) => update("about", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Name</Label>
          <Input value={data.about.name} onChange={(e) => update("about", { name: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Description</Label>
          <Textarea value={data.about.description} onChange={(e) => update("about", { description: e.target.value })} rows={3} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <ImageField label="Photo" value={data.about.image} onChange={(v) => update("about", { image: v })} />
        <div>
          <Label className="text-xs text-gray-500">Credentials</Label>
          {data.about.credentials.map((cred, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input value={cred} onChange={(e) => {
                const arr = [...data.about.credentials]; arr[i] = e.target.value; update("about", { credentials: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("about", { credentials: data.about.credentials.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("about", { credentials: [...data.about.credentials, ""] })}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </Section>

      {/* ===== LOGOS ===== */}
      <Section title="Logo Bar" icon={<Award className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.logos.enabled} onCheckedChange={(v) => update("logos", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.logos.title} onChange={(e) => update("logos", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.logos.logos.map((logo, i) => (
          <div key={i} className="flex gap-1 items-end">
            <div className="flex-1">
              <ImageField label={`Logo ${i + 1}`} value={logo.image} onChange={(v) => {
                const arr = [...data.logos.logos]; arr[i] = { ...arr[i], image: v }; update("logos", { logos: arr });
              }} />
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 mb-1" onClick={() => {
              update("logos", { logos: data.logos.logos.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("logos", { logos: [...data.logos.logos, { image: "", alt: "Logo" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Logo
        </Button>
      </Section>

      {/* ===== GALLERY ===== */}
      <Section title="Gallery" icon={<ImageIcon className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show gallery</Label>
          <Switch
            checked={data.gallery.visible}
            onCheckedChange={(v) => update("gallery", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.gallery.title} onChange={(e) => update("gallery", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.gallery.subtitle} onChange={(e) => update("gallery", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.gallery.images.map((img, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Image {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("gallery", { images: data.gallery.images.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <ImageField label="URL" value={img.url} onChange={(v) => {
              const arr = [...data.gallery.images]; arr[i] = { ...arr[i], url: v }; update("gallery", { images: arr });
            }} />
            <Input value={img.caption} onChange={(e) => {
              const arr = [...data.gallery.images]; arr[i] = { ...arr[i], caption: e.target.value }; update("gallery", { images: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Caption" />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("gallery", { images: [...data.gallery.images, { url: "", caption: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Image
        </Button>
      </Section>

      {/* ===== STATS ===== */}
      <Section title="Stats / CTA Section" icon={<Globe className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show stats section</Label>
          <Switch
            checked={data.stats.visible}
            onCheckedChange={(v) => update("stats", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.stats.title} onChange={(e) => update("stats", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.stats.subtitle} onChange={(e) => update("stats", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.stats.stats.map((stat, i) => (
          <div key={i} className="flex gap-1">
            <Input value={stat.value} onChange={(e) => {
              const arr = [...data.stats.stats]; arr[i] = { ...arr[i], value: e.target.value }; update("stats", { stats: arr });
            }} className="h-8 text-xs bg-gray-50 border-gray-200 w-24" placeholder="Value" />
            <Input value={stat.label} onChange={(e) => {
              const arr = [...data.stats.stats]; arr[i] = { ...arr[i], label: e.target.value }; update("stats", { stats: arr });
            }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="Label" />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
              update("stats", { stats: data.stats.stats.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("stats", { stats: [...data.stats.stats, { value: "", label: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Stat
        </Button>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.stats.ctaButtonText} onChange={(e) => update("stats", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.stats.ctaButtonLink} onChange={(e) => update("stats", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <ImageField label="Background Image" value={data.stats.backgroundImage} onChange={(v) => update("stats", { backgroundImage: v })} />
      </Section>

      {/* ===== TESTIMONIALS ===== */}
      <Section title="Testimonials" icon={<MessageSquare className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show testimonials</Label>
          <Switch
            checked={data.testimonials.visible}
            onCheckedChange={(v) => update("testimonials", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.testimonials.title} onChange={(e) => update("testimonials", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.testimonials.subtitle} onChange={(e) => update("testimonials", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.testimonials.items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Testimonial {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("testimonials", { items: data.testimonials.items.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={item.name} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], name: e.target.value }; update("testimonials", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Name" />
            <Input value={item.role} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], role: e.target.value }; update("testimonials", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Role" />
            <Textarea value={item.quote} onChange={(e) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], quote: e.target.value }; update("testimonials", { items: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Quote" />
            <ImageField label="Photo" value={item.image} onChange={(v) => {
              const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], image: v }; update("testimonials", { items: arr });
            }} />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("testimonials", { items: [...data.testimonials.items, { name: "", quote: "", image: "", role: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Testimonial
        </Button>
      </Section>

      {/* ===== PROGRAM ===== */}
      <Section title="Program / What You'll Learn" icon={<BookOpen className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show program section</Label>
          <Switch
            checked={data.program.visible}
            onCheckedChange={(v) => update("program", { visible: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.program.title} onChange={(e) => update("program", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Input value={data.program.subtitle} onChange={(e) => update("program", { subtitle: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.program.points.map((point, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Point {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("program", { points: data.program.points.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-1">
              <Input value={point.icon} onChange={(e) => {
                const arr = [...data.program.points]; arr[i] = { ...arr[i], icon: e.target.value }; update("program", { points: arr });
              }} className="h-8 text-xs bg-white border-gray-200 w-16" placeholder="Icon" />
              <Input value={point.title} onChange={(e) => {
                const arr = [...data.program.points]; arr[i] = { ...arr[i], title: e.target.value }; update("program", { points: arr });
              }} className="h-8 text-xs bg-white border-gray-200 flex-1" placeholder="Title" />
            </div>
            <Textarea value={point.description} onChange={(e) => {
              const arr = [...data.program.points]; arr[i] = { ...arr[i], description: e.target.value }; update("program", { points: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("program", { points: [...data.program.points, { title: "", description: "", icon: "✨" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Point
        </Button>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.program.ctaButtonText} onChange={(e) => update("program", { ctaButtonText: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.program.ctaButtonLink} onChange={(e) => update("program", { ctaButtonLink: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
      </Section>

      {/* ===== BONUS ===== */}
      <Section title="Bonus Section" icon={<Gift className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.bonus.enabled} onCheckedChange={(v) => update("bonus", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.bonus.title} onChange={(e) => update("bonus", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.bonus.items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Bonus {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                update("bonus", { items: data.bonus.items.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={item.title} onChange={(e) => {
              const arr = [...data.bonus.items]; arr[i] = { ...arr[i], title: e.target.value }; update("bonus", { items: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Title" />
            <Textarea value={item.description} onChange={(e) => {
              const arr = [...data.bonus.items]; arr[i] = { ...arr[i], description: e.target.value }; update("bonus", { items: arr });
            }} rows={2} className="text-xs bg-white border-gray-200" placeholder="Description" />
            <ImageField label="Image" value={item.image} onChange={(v) => {
              const arr = [...data.bonus.items]; arr[i] = { ...arr[i], image: v }; update("bonus", { items: arr });
            }} />
          </div>
        ))}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("bonus", { items: [...data.bonus.items, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Bonus
        </Button>
      </Section>

      {/* ===== FOOTER ===== */}
      <Section title="Footer" icon={<Globe className="h-4 w-4" />}>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show footer CTA</Label>
          <Switch
            checked={data.footer.enabled}
            onCheckedChange={(v) => update("footer", { enabled: v })}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Title</Label>
          <Input value={data.footer.cta.title} onChange={(e) => update("footer", { cta: { ...data.footer.cta, title: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Subtitle</Label>
          <Textarea value={data.footer.cta.subtitle} onChange={(e) => update("footer", { cta: { ...data.footer.cta, subtitle: e.target.value } })} rows={2} className="text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Text</Label>
          <Input value={data.footer.cta.ctaButtonText} onChange={(e) => update("footer", { cta: { ...data.footer.cta, ctaButtonText: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">CTA Button Link</Label>
          <Input value={data.footer.cta.ctaButtonLink} onChange={(e) => update("footer", { cta: { ...data.footer.cta, ctaButtonLink: e.target.value } })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Copyright</Label>
          <Input value={data.footer.copyright} onChange={(e) => update("footer", { copyright: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Footer Links</Label>
          {data.footer.links.map((link, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input value={link.label} onChange={(e) => {
                const arr = [...data.footer.links]; arr[i] = { ...arr[i], label: e.target.value }; update("footer", { links: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 w-28" placeholder="Label" />
              <Input value={link.url} onChange={(e) => {
                const arr = [...data.footer.links]; arr[i] = { ...arr[i], url: e.target.value }; update("footer", { links: arr });
              }} className="h-8 text-xs bg-gray-50 border-gray-200 flex-1" placeholder="URL" />
              <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => {
                update("footer", { links: data.footer.links.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => update("footer", { links: [...data.footer.links, { label: "", url: "#" }] })}>
            <Plus className="h-3 w-3 mr-1" /> Add Link
          </Button>
        </div>
      </Section>
    </div>
  );
}
