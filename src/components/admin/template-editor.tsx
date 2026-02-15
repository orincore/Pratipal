"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  CalendarCheck2,
  Clock3,
  MapPin,
  GripVertical,
  Video,
  Link as LinkIcon,
  Youtube,
  MousePointerClick,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DEFAULT_MEDIA_SETTINGS, type LandingTemplateData, type MediaFieldOptions } from "@/lib/template-types";

const mediaKey = (...parts: (string | number)[]) => parts.join(".");

// ---------------------------------------------------------------------------
// Collapsible Section with Drag Handle
// ---------------------------------------------------------------------------
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div 
      className="border border-gray-200 rounded-xl overflow-hidden bg-white"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {draggable && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />}
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
// Enhanced Media Upload Field (Image/Video/YouTube)
// ---------------------------------------------------------------------------
function MediaField({
  label,
  value,
  onChange,
  settings,
  onSettingsChange,
  onClearSettings,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  settings?: MediaFieldOptions;
  onSettingsChange?: (value: Partial<MediaFieldOptions>) => void;
  onClearSettings?: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'link' | 'upload' | 'youtube'>(() => {
    if (!value) return 'link';
    if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
    if (value.match(/\.(mp4|webm|ogg)$/i)) return 'link';
    return 'link';
  });
  const currentSettings = settings || DEFAULT_MEDIA_SETTINGS;

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) { toast.error("Please select an image or video"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Max 50MB"); return; }
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

  const extractYouTubeId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTube = value.includes('youtube.com') || value.includes('youtu.be');
  const isVideo = value.match(/\.(mp4|webm|ogg)$/i);
  const isImage = !isYouTube && !isVideo;
  const youtubeId = isYouTube ? extractYouTubeId(value) : null;
  const youtubeEmbedUrl = youtubeId
    ? (() => {
        const params = new URLSearchParams({
          autoplay: currentSettings.autoplay ? "1" : "0",
          mute: currentSettings.mute ? "1" : "0",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
        });
        return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
      })()
    : null;

  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      
      <div className="flex gap-1 mt-1 mb-2">
        <Button 
          type="button"
          variant={mediaType === 'link' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('link')}
        >
          <LinkIcon className="h-3 w-3 mr-1" /> Link
        </Button>
        <Button 
          type="button"
          variant={mediaType === 'upload' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('upload')}
        >
          <Upload className="h-3 w-3 mr-1" /> Upload
        </Button>
        <Button 
          type="button"
          variant={mediaType === 'youtube' ? 'default' : 'outline'} 
          size="sm" 
          className="h-7 text-[10px] flex-1"
          onClick={() => setMediaType('youtube')}
        >
          <Youtube className="h-3 w-3 mr-1" /> YouTube
        </Button>
      </div>

      {mediaType === 'link' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200"
          placeholder="Paste image/video URL..."
        />
      )}

      {mediaType === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8 w-full text-xs" 
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-2" /> Choose Image or Video
          </Button>
        </div>
      )}

      {mediaType === 'youtube' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs bg-gray-50 border-gray-200"
          placeholder="Paste YouTube URL..."
        />
      )}

      {mediaType === 'youtube' && onSettingsChange && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">Autoplay</span>
            <Switch
              checked={currentSettings.autoplay}
              onCheckedChange={(checked) => onSettingsChange({ autoplay: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">Mute</span>
            <Switch
              checked={currentSettings.mute}
              onCheckedChange={(checked) => onSettingsChange({ mute: checked })}
            />
          </div>
        </div>
      )}

      {value && (
        <div className="mt-2 relative group">
          {isYouTube ? (
            <div className="aspect-video rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                src={youtubeEmbedUrl || ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isVideo ? (
            <video src={value} className="w-full h-32 object-cover rounded-lg border border-gray-200" controls />
          ) : (
            <img src={value} alt="" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
          )}
          <Button
            type="button"
            onClick={() => {
              onChange("");
              onClearSettings && onClearSettings();
            }}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy Image Upload Field (for backward compatibility)
// ---------------------------------------------------------------------------
function ImageField({
  label,
  value,
  onChange,
  settings,
  onSettingsChange,
  onClearSettings,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  settings?: MediaFieldOptions;
  onSettingsChange?: (value: Partial<MediaFieldOptions>) => void;
  onClearSettings?: () => void;
}) {
  return (
    <MediaField
      label={label}
      value={value}
      onChange={onChange}
      settings={settings}
      onSettingsChange={onSettingsChange}
      onClearSettings={onClearSettings}
    />
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
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  
  const canonicalSections = useMemo(
    () => ['hero', 'marquee', 'why', 'about', 'logos', 'gallery', 'stats', 'testimonials', 'program', 'invitation', 'bonus', 'footer'],
    []
  );
  const sectionOrder = useMemo(() => {
    const base = data.sectionOrder?.length ? data.sectionOrder : canonicalSections;
    const missing = canonicalSections.filter((key) => !base.includes(key));
    return [...base, ...missing];
  }, [data.sectionOrder, canonicalSections]);
  const mediaSettings = data.mediaSettings || {};

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

  const handleMediaSettingsChange = useCallback(
    (key: string, value: Partial<MediaFieldOptions>) => {
      const current = mediaSettings[key] || DEFAULT_MEDIA_SETTINGS;
      onChange({
        ...data,
        mediaSettings: {
          ...mediaSettings,
          [key]: { ...current, ...value },
        },
      });
    },
    [data, mediaSettings, onChange]
  );

  const clearMediaSettings = useCallback(
    (key: string) => {
      if (!mediaSettings[key]) return;
      const updated = { ...mediaSettings } as Record<string, MediaFieldOptions>;
      delete updated[key];
      onChange({ ...data, mediaSettings: updated });
    },
    [data, mediaSettings, onChange]
  );

  const handleDragStart = useCallback((sectionKey: string) => (e: React.DragEvent) => {
    setDraggedSection(sectionKey);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetSection: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSection) return;

    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetSection);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection);

    onChange({ ...data, sectionOrder: newOrder });
    setDraggedSection(null);
  }, [draggedSection, sectionOrder, data, onChange]);

  const sectionComponents: Record<string, JSX.Element> = {
    colors: (
      <Section key="colors" title="Theme Colors" icon={<Palette className="h-4 w-4" />} defaultOpen>
        <ColorField label="Primary" value={data.colors.primary} onChange={(v) => updateColors("primary", v)} />
        <ColorField label="Secondary" value={data.colors.secondary} onChange={(v) => updateColors("secondary", v)} />
        <ColorField label="Accent" value={data.colors.accent} onChange={(v) => updateColors("accent", v)} />
        <ColorField label="Hero BG" value={data.colors.heroBg} onChange={(v) => updateColors("heroBg", v)} />
        <ColorField label="Dark BG" value={data.colors.darkBg} onChange={(v) => updateColors("darkBg", v)} />
        <ColorField label="Body BG" value={data.colors.bodyBg} onChange={(v) => updateColors("bodyBg", v)} />
      </Section>
    ),
    floatingButton: (
      <Section
        key="floatingButton"
        title="Floating CTA Button"
        icon={<MousePointerClick className="h-4 w-4" />}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enable floating button</Label>
          <Switch
            checked={data.floatingButton.enabled}
            onCheckedChange={(v) => update("floatingButton", { enabled: v })}
          />
        </div>
        <p className="text-[11px] text-gray-500">
          When enabled, a single CTA button will float near the bottom of the page on mobile for quick access.
        </p>
        {data.floatingButton.enabled && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Button Source</Label>
            <select
              value={data.floatingButton.section}
              onChange={(e) => update("floatingButton", { section: e.target.value as LandingTemplateData["floatingButton"]["section"] })}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="hero">Hero CTA Button</option>
              <option value="program">Program CTA Button</option>
              <option value="invitation">Request Invitation Button</option>
              <option value="footer">Footer CTA Button</option>
            </select>
            <p className="text-[10px] text-gray-400">
              Only one floating button can be active at a time. Update the source button text inside its section.
            </p>
          </div>
        )}
      </Section>
    ),
    hero: (
      (() => {
        const heroImageKey = mediaKey("hero", "heroImage");
        return (
      <Section 
        key="hero"
        title="Hero Section" 
        icon={<Star className="h-4 w-4" />} 
        defaultOpen
        draggable
        onDragStart={handleDragStart('hero')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('hero')}
      >
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
        <ImageField
          label="Hero Image"
          value={data.hero.heroImage}
          onChange={(v) => update("hero", { heroImage: v })}
          settings={mediaSettings[heroImageKey]}
          onSettingsChange={(value) => handleMediaSettingsChange(heroImageKey, value)}
          onClearSettings={() => clearMediaSettings(heroImageKey)}
        />
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
    );
      })()
    ),
    marquee: (
      <Section 
        key="marquee"
        title="Marquee / Ticker" 
        icon={<Type className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('marquee')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('marquee')}
      >
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
    ),
    why: (
      <Section 
        key="why"
        title="Why Section" 
        icon={<LayoutGrid className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('why')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('why')}
      >
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
        {data.why.points.map((point, i) => {
          const pointImageKey = mediaKey("why", "points", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Point {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(pointImageKey);
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
            <ImageField
              label="Image"
              value={point.image}
              onChange={(v) => {
                const arr = [...data.why.points]; arr[i] = { ...arr[i], image: v }; update("why", { points: arr });
              }}
              settings={mediaSettings[pointImageKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(pointImageKey, value)}
              onClearSettings={() => clearMediaSettings(pointImageKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("why", { points: [...data.why.points, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Point
        </Button>
      </Section>
    ),
    about: (
      <Section 
        key="about"
        title="About Section" 
        icon={<Users className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('about')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('about')}
      >
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
        <ImageField
          label="Photo"
          value={data.about.image}
          onChange={(v) => update("about", { image: v })}
          settings={mediaSettings[mediaKey("about", "image")]}
          onSettingsChange={(value) => handleMediaSettingsChange(mediaKey("about", "image"), value)}
          onClearSettings={() => clearMediaSettings(mediaKey("about", "image"))}
        />
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
    ),
    logos: (
      <Section 
        key="logos"
        title="Logo Bar" 
        icon={<Award className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('logos')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('logos')}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.logos.enabled} onCheckedChange={(v) => update("logos", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.logos.title} onChange={(e) => update("logos", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.logos.logos.map((logo, i) => {
          const logoKey = mediaKey("logos", "logos", i, "image");
          return (
          <div key={i} className="flex gap-1 items-end">
            <div className="flex-1">
              <ImageField
                label={`Logo ${i + 1}`}
                value={logo.image}
                onChange={(v) => {
                  const arr = [...data.logos.logos]; arr[i] = { ...arr[i], image: v }; update("logos", { logos: arr });
                }}
                settings={mediaSettings[logoKey]}
                onSettingsChange={(value) => handleMediaSettingsChange(logoKey, value)}
                onClearSettings={() => clearMediaSettings(logoKey)}
              />
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 mb-1" onClick={() => {
              clearMediaSettings(logoKey);
              update("logos", { logos: data.logos.logos.filter((_, j) => j !== i) });
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("logos", { logos: [...data.logos.logos, { image: "", alt: "Logo" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Logo
        </Button>
      </Section>
    ),
    gallery: (
      <Section 
        key="gallery"
        title="Gallery" 
        icon={<ImageIcon className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('gallery')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('gallery')}
      >
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
        {data.gallery.images.map((img, i) => {
          const galleryKey = mediaKey("gallery", "images", i, "url");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Image {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(galleryKey);
                update("gallery", { images: data.gallery.images.filter((_, j) => j !== i) });
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <ImageField
              label="URL"
              value={img.url}
              onChange={(v) => {
                const arr = [...data.gallery.images]; arr[i] = { ...arr[i], url: v }; update("gallery", { images: arr });
              }}
              settings={mediaSettings[galleryKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(galleryKey, value)}
              onClearSettings={() => clearMediaSettings(galleryKey)}
            />
            <Input value={img.caption} onChange={(e) => {
              const arr = [...data.gallery.images]; arr[i] = { ...arr[i], caption: e.target.value }; update("gallery", { images: arr });
            }} className="h-8 text-xs bg-white border-gray-200" placeholder="Caption" />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("gallery", { images: [...data.gallery.images, { url: "", caption: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Image
        </Button>
      </Section>
    ),
    stats: (
      <Section 
        key="stats"
        title="Stats / CTA Section" 
        icon={<Globe className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('stats')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('stats')}
      >
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
        <ImageField
          label="Background Image"
          value={data.stats.backgroundImage}
          onChange={(v) => update("stats", { backgroundImage: v })}
          settings={mediaSettings[mediaKey("stats", "backgroundImage")]}
          onSettingsChange={(value) => handleMediaSettingsChange(mediaKey("stats", "backgroundImage"), value)}
          onClearSettings={() => clearMediaSettings(mediaKey("stats", "backgroundImage"))}
        />
      </Section>
    ),
    testimonials: (
      <Section 
        key="testimonials"
        title="Testimonials" 
        icon={<MessageSquare className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('testimonials')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('testimonials')}
      >
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
        {data.testimonials.items.map((item, i) => {
          const testimonialKey = mediaKey("testimonials", "items", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Testimonial {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(testimonialKey);
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
            <ImageField
              label="Photo"
              value={item.image}
              onChange={(v) => {
                const arr = [...data.testimonials.items]; arr[i] = { ...arr[i], image: v }; update("testimonials", { items: arr });
              }}
              settings={mediaSettings[testimonialKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(testimonialKey, value)}
              onClearSettings={() => clearMediaSettings(testimonialKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("testimonials", { items: [...data.testimonials.items, { name: "", quote: "", image: "", role: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Testimonial
        </Button>
      </Section>
    ),
    program: (
      <Section 
        key="program"
        title="Program / What You'll Learn" 
        icon={<BookOpen className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('program')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('program')}
      >
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
    ),
    bonus: (
      <Section 
        key="bonus"
        title="Bonus Section" 
        icon={<Gift className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('bonus')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('bonus')}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Enabled</Label>
          <Switch checked={data.bonus.enabled} onCheckedChange={(v) => update("bonus", { enabled: v })} />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input value={data.bonus.title} onChange={(e) => update("bonus", { title: e.target.value })} className="h-8 text-xs mt-1 bg-gray-50 border-gray-200" />
        </div>
        {data.bonus.items.map((item, i) => {
          const bonusKey = mediaKey("bonus", "items", i, "image");
          return (
          <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Bonus {i + 1}</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-red-500" onClick={() => {
                clearMediaSettings(bonusKey);
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
            <ImageField
              label="Image"
              value={item.image}
              onChange={(v) => {
                const arr = [...data.bonus.items]; arr[i] = { ...arr[i], image: v }; update("bonus", { items: arr });
              }}
              settings={mediaSettings[bonusKey]}
              onSettingsChange={(value) => handleMediaSettingsChange(bonusKey, value)}
              onClearSettings={() => clearMediaSettings(bonusKey)}
            />
          </div>
        )})}
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => update("bonus", { items: [...data.bonus.items, { title: "", description: "", image: "" }] })}>
          <Plus className="h-3 w-3 mr-1" /> Add Bonus
        </Button>
      </Section>
    ),
    invitation: (
      (() => {
        const highlights = data.invitation.formHighlights;
        return (
      <Section 
        key="invitation"
        title="Request Invitation"
        icon={<CalendarCheck2 className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('invitation')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('invitation')}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-600">Show section</Label>
          <Switch
            checked={data.invitation.enabled}
            onCheckedChange={(v) => update("invitation", { enabled: v })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-gray-500">Badge Emoji</Label>
            <Input
              value={data.invitation.badgeEmoji}
              onChange={(e) => update("invitation", { badgeEmoji: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Badge Text</Label>
            <Input
              value={data.invitation.badgeText}
              onChange={(e) => update("invitation", { badgeText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Title</Label>
          <Input
            value={data.invitation.title}
            onChange={(e) => update("invitation", { title: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Subtitle</Label>
          <Textarea
            value={data.invitation.subtitle}
            onChange={(e) => update("invitation", { subtitle: e.target.value })}
            rows={2}
            className="text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <CalendarCheck2 className="h-3.5 w-3.5" /> Date Label
            </Label>
            <Input
              value={data.invitation.dateLabel}
              onChange={(e) => update("invitation", { dateLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
            <Input
              value={data.invitation.dateValue}
              onChange={(e) => update("invitation", { dateValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
              placeholder="15 Feb 2026"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> Time Label
            </Label>
            <Input
              value={data.invitation.timeLabel}
              onChange={(e) => update("invitation", { timeLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
            <Input
              value={data.invitation.timeValue}
              onChange={(e) => update("invitation", { timeValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
              placeholder="03:00 PM"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-[11px] text-gray-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Venue Label
            </Label>
            <Input
              value={data.invitation.venueLabel}
              onChange={(e) => update("invitation", { venueLabel: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-500">Venue Details</Label>
            <Input
              value={data.invitation.venueValue}
              onChange={(e) => update("invitation", { venueValue: e.target.value })}
              className="h-8 text-xs mt-1 bg-white border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Availability Text</Label>
          <Input
            value={data.invitation.availabilityText}
            onChange={(e) => update("invitation", { availabilityText: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Primary Button Text</Label>
          <Input
            value={data.invitation.buttonText}
            onChange={(e) => update("invitation", { buttonText: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Form Title</Label>
          <Input
            value={data.invitation.formTitle}
            onChange={(e) => update("invitation", { formTitle: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-500">Form Highlights</Label>
          {highlights.map((item, i) => (
            <div key={i} className="flex gap-1 mt-1">
              <Input
                value={item}
                onChange={(e) => {
                  const arr = [...highlights];
                  arr[i] = e.target.value;
                  update("invitation", { formHighlights: arr });
                }}
                className="h-8 text-xs bg-white border-gray-200 flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-500"
                onClick={() => update("invitation", { formHighlights: highlights.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs mt-1"
            onClick={() => update("invitation", { formHighlights: [...highlights, ""] })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Highlight
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-gray-500">Form Button Text</Label>
            <Input
              value={data.invitation.formButtonText}
              onChange={(e) => update("invitation", { formButtonText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Support Text</Label>
            <Input
              value={data.invitation.supportText}
              onChange={(e) => update("invitation", { supportText: e.target.value })}
              className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-500">Success Title</Label>
          <Input
            value={data.invitation.successTitle}
            onChange={(e) => update("invitation", { successTitle: e.target.value })}
            className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Success Description</Label>
          <Textarea
            value={data.invitation.successDescription}
            onChange={(e) => update("invitation", { successDescription: e.target.value })}
            rows={2}
            className="text-xs mt-1 bg-gray-50 border-gray-200"
          />
        </div>
      </Section>
    );
      })()
    ),
    footer: (
      <Section 
        key="footer"
        title="Footer" 
        icon={<Globe className="h-4 w-4" />}
        draggable
        onDragStart={handleDragStart('footer')}
        onDragOver={handleDragOver}
        onDrop={handleDrop('footer')}
      >
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
    ),
  };

  return (
    <div className="space-y-3 p-1">
      {sectionComponents.colors}
      {sectionComponents.floatingButton}
      {sectionOrder.map(key => sectionComponents[key]).filter(Boolean)}
    </div>
  );
}
