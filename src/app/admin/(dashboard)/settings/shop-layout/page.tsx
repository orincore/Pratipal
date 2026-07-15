"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  ShoppingBag,
  Zap,
  Grid,
  Laptop,
  Tablet,
  Phone,
  Eye,
  SlidersHorizontal,
  Save,
  Undo2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_SHOP_SETTINGS, type ShopSettings } from "@/hooks/use-shop-settings";

const DUMMY_PRODUCTS = [
  {
    id: "1",
    name: "Intention Crystals Healing Candle",
    category: "Aromatherapy",
    price: 349,
    originalPrice: 499,
    shortDescription: "Soy wax candle infused with real lavender petals and healing amethyst crystals.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    name: "Therapeutic Lavender Essential Oil Roll-On",
    category: "Wellness Essentials",
    price: 199,
    shortDescription: "Organic roll-on essential oil designed to promote stress relief and calm intentions.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    name: "Epsom Intention Salt Bath Soak",
    category: "Body Care",
    price: 249,
    originalPrice: 320,
    shortDescription: "Himalayan intention salts infused with rosemary extract for deep physical relief.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "Aura Cleansing Smudge Sage Wand",
    category: "Energetics",
    price: 149,
    shortDescription: "White sage bundles hand-tied with cotton string for domestic energetic purification.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ShopLayoutPage() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/shop-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        toast.error("Failed to load layout settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shop-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Shop visual layout updated successfully");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to save layout settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading Shop Visual Settings...</p>
      </div>
    );
  }

  // Shadow class mappings
  const shadowClasses: Record<string, string> = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  // Hover shadow class mappings
  const hoverShadowClasses: Record<string, string> = {
    none: "hover:shadow-none",
    sm: "hover:shadow-sm",
    md: "hover:shadow-md",
    lg: "hover:shadow-lg",
    xl: "hover:shadow-xl",
  };

  // Aspect ratio mappings
  const aspectRatios: Record<string, string> = {
    "3/4": "aspect-[3/4]",
    "1/1": "aspect-square",
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    auto: "aspect-auto",
  };

  // Viewport widths
  const viewportWidths = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] overflow-hidden -m-6">
      {/* LEFT: Live Preview Canvas */}
      <div className="flex-1 bg-slate-100 flex flex-col overflow-y-auto p-6 min-w-0">
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Live Preview Canvas</span>
          </div>
          {/* Viewport Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setPreviewViewport("desktop")}
              className={`p-1.5 rounded-lg transition-all ${
                previewViewport === "desktop" ? "bg-white shadow-sm text-violet-600" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Desktop View"
            >
              <Laptop className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewViewport("tablet")}
              className={`p-1.5 rounded-lg transition-all ${
                previewViewport === "tablet" ? "bg-white shadow-sm text-violet-600" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewViewport("mobile")}
              className={`p-1.5 rounded-lg transition-all ${
                previewViewport === "mobile" ? "bg-white shadow-sm text-violet-600" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Mobile View"
            >
              <Phone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Outer Frame Wrapper */}
        <div className="flex-1 flex justify-center items-start overflow-y-auto transition-all duration-300">
          <div
            className={`bg-slate-50 min-h-full rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col transition-all duration-300 ${viewportWidths[previewViewport]}`}
          >
            {/* Page Headers */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Our Healing Collection
              </h2>
              <p className="text-xs text-slate-500 mt-1">Intentionally crafted wellness & aromatherapy essentials</p>
            </div>

            {/* Grid Container */}
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns:
                  previewViewport === "mobile"
                    ? `repeat(${settings.gridColumnsMobile}, minmax(0, 1fr))`
                    : previewViewport === "tablet"
                    ? `repeat(${settings.gridColumnsTablet}, minmax(0, 1fr))`
                    : `repeat(${settings.gridColumnsDesktop}, minmax(0, 1fr))`,
              }}
            >
              {DUMMY_PRODUCTS.map((prod, index) => {
                const hasDiscount = prod.originalPrice !== undefined;
                const discountPct = hasDiscount
                  ? Math.round(((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100)
                  : 0;

                return (
                  <div
                    key={prod.id}
                    className={`group flex flex-col overflow-hidden border transition-all duration-300 select-none ${
                      shadowClasses[settings.cardShadow]
                    } ${hoverShadowClasses[settings.cardHoverShadow]}`}
                    style={{
                      backgroundColor: settings.cardBgColor,
                      borderRadius: `${settings.cardBorderRadius}px`,
                      borderColor: settings.cardBorderColor,
                      padding: `${settings.cardPadding}px`,
                      // Animation placeholder
                      animation:
                        settings.cardAnimation !== "none"
                          ? `ve-${settings.cardAnimation} ${settings.cardAnimationDuration}ms cubic-bezier(0.16, 1, 0.3, 1) both`
                          : "none",
                      animationDelay: `${index * 80}ms`,
                    }}
                  >
                    {/* Image Area */}
                    <div
                      className={`relative overflow-hidden w-full bg-slate-100 rounded-lg flex-shrink-0 ${
                        aspectRatios[settings.imageAspectRatio]
                      }`}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-full h-full transition-transform duration-500 ${
                          settings.imageObjectFit === "cover"
                            ? "object-cover"
                            : settings.imageObjectFit === "contain"
                            ? "object-contain"
                            : "object-fill"
                        } ${settings.imageHoverScale ? "group-hover:scale-105" : ""}`}
                      />
                      {settings.showCategory && prod.category && (
                        <span
                          className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm bg-black/40"
                          style={{ color: settings.categoryColor }}
                        >
                          {prod.category}
                        </span>
                      )}
                      {settings.showDiscountBadge && hasDiscount && (
                        <span
                          className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: settings.discountBadgeBg,
                            color: settings.discountBadgeColor,
                          }}
                        >
                          -{discountPct}%
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col flex-1 mt-3 gap-1">
                      <h3
                        className="line-clamp-2 leading-snug transition-colors"
                        style={{
                          color: settings.productTitleColor,
                          fontSize: `${settings.productTitleSize}px`,
                          fontWeight: settings.productTitleWeight,
                        }}
                      >
                        {prod.name}
                      </h3>

                      {settings.showDescription && (
                        <p
                          className="line-clamp-2 leading-relaxed min-h-[2.5rem]"
                          style={{
                            color: settings.descriptionColor,
                            fontSize: `${settings.descriptionSize}px`,
                          }}
                        >
                          {prod.shortDescription}
                        </p>
                      )}

                      {/* Pricing Row */}
                      <div className="flex items-baseline gap-2 mt-auto pt-2 border-t border-slate-100">
                        <span
                          style={{
                            color: settings.priceColor,
                            fontSize: `${settings.priceSize}px`,
                            fontWeight: 700,
                          }}
                        >
                          ₹{prod.price}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                        )}
                      </div>

                      {/* Actions */}
                      {settings.showActions && (
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                              settings.buttonHoverScale ? "hover:scale-[1.03]" : ""
                            }`}
                            style={{
                              borderRadius: `${settings.buttonBorderRadius}px`,
                              padding: `${settings.buttonPaddingY}px ${settings.buttonPaddingX}px`,
                              backgroundColor:
                                settings.buttonVariant === "solid" ? settings.buttonBgColor : "transparent",
                              color:
                                settings.buttonVariant === "solid" ? settings.buttonTextColor : settings.buttonTextColor,
                              border: `2px solid ${settings.buttonBorderColor}`,
                              // Simple css transition simulation
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {settings.buttonText}
                          </button>
                          <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-gradient-brand rounded-lg hover:shadow-sm"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Buy Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Element Properties Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200/80 flex flex-col overflow-y-auto">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-800">Shop Layout Editor</h3>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setSettings(DEFAULT_SHOP_SETTINGS)}>
              <Undo2 className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Layout"}
            </Button>
          </div>
        </div>

        {/* Properties Fields */}
        <div className="p-4 space-y-6">
          {/* Section: Grid Configuration */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Grid Layout Columns</span>
            <div className="space-y-2">
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Desktop Grid Columns</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {[2, 3, 4, 5].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => updateSetting("gridColumnsDesktop", cols)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        settings.gridColumnsDesktop === cols ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {cols} Col
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Tablet Grid Columns</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {[2, 3].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => updateSetting("gridColumnsTablet", cols)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        settings.gridColumnsTablet === cols ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {cols} Col
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Mobile Grid Columns</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {[1, 2].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => updateSetting("gridColumnsMobile", cols)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        settings.gridColumnsMobile === cols ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {cols} Col
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Card Properties */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Card Design Settings</span>
            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Card Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={settings.cardBgColor}
                    onChange={(e) => updateSetting("cardBgColor", e.target.value)}
                    className="h-8 w-12 p-0 border border-slate-200 cursor-pointer bg-white"
                  />
                  <Input
                    type="text"
                    value={settings.cardBgColor}
                    onChange={(e) => updateSetting("cardBgColor", e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Border Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={settings.cardBorderColor}
                    onChange={(e) => updateSetting("cardBorderColor", e.target.value)}
                    className="h-8 w-12 p-0 border border-slate-200 cursor-pointer bg-white"
                  />
                  <Input
                    type="text"
                    value={settings.cardBorderColor}
                    onChange={(e) => updateSetting("cardBorderColor", e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Border Hover Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={settings.cardHoverBorderColor}
                    onChange={(e) => updateSetting("cardHoverBorderColor", e.target.value)}
                    className="h-8 w-12 p-0 border border-slate-200 cursor-pointer bg-white"
                  />
                  <Input
                    type="text"
                    value={settings.cardHoverBorderColor}
                    onChange={(e) => updateSetting("cardHoverBorderColor", e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Border Radius ({settings.cardBorderRadius}px)</Label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.cardBorderRadius}
                  onChange={(e) => updateSetting("cardBorderRadius", Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Card Padding ({settings.cardPadding}px)</Label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={settings.cardPadding}
                  onChange={(e) => updateSetting("cardPadding", Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Card Shadow</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {["none", "sm", "md", "lg"].map((sh) => (
                    <button
                      key={sh}
                      onClick={() => updateSetting("cardShadow", sh)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg uppercase transition-all ${
                        settings.cardShadow === sh ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Card Hover Shadow</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {["none", "sm", "md", "lg", "xl"].map((sh) => (
                    <button
                      key={sh}
                      onClick={() => updateSetting("cardHoverShadow", sh)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg uppercase transition-all ${
                        settings.cardHoverShadow === sh ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Image properties */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Image Sizing & Fits</span>
            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Image Aspect Ratio</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {["3/4", "1/1", "16/9", "auto"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => updateSetting("imageAspectRatio", ratio)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        settings.imageAspectRatio === ratio ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Image Fit</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {["cover", "contain", "fill"].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => updateSetting("imageObjectFit", fit)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                        settings.imageObjectFit === fit ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Image Hover Zoom (1.05x)</Label>
                <Switch checked={settings.imageHoverScale} onCheckedChange={(v) => updateSetting("imageHoverScale", v)} />
              </div>
            </div>
          </div>

          {/* Section: Typography settings */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Typography & Texts</span>
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-4">
              {/* Category tag */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <Label className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Category Tag</Label>
                  <Switch checked={settings.showCategory} onCheckedChange={(v) => updateSetting("showCategory", v)} />
                </div>
                {settings.showCategory && (
                  <div>
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Tag Text Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings.categoryColor}
                        onChange={(e) => updateSetting("categoryColor", e.target.value)}
                        className="h-8 w-12 p-0 border border-slate-200 cursor-pointer bg-white"
                      />
                      <Input
                        type="text"
                        value={settings.categoryColor}
                        onChange={(e) => updateSetting("categoryColor", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Title tag */}
              <div className="space-y-2 border-t border-slate-150 pt-2">
                <Label className="text-[11px] text-slate-600 font-bold uppercase tracking-wider block">Product Title</Label>
                <div>
                  <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={settings.productTitleColor}
                      onChange={(e) => updateSetting("productTitleColor", e.target.value)}
                      className="h-8 w-12 p-0 border border-slate-200 cursor-pointer bg-white"
                    />
                    <Input
                      type="text"
                      value={settings.productTitleColor}
                      onChange={(e) => updateSetting("productTitleColor", e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Size (px)</Label>
                    <Input
                      type="number"
                      value={settings.productTitleSize}
                      onChange={(e) => updateSetting("productTitleSize", Number(e.target.value))}
                      className="h-8 text-xs bg-white"
                      min={10}
                      max={28}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Weight</Label>
                    <Input
                      type="number"
                      value={settings.productTitleWeight}
                      onChange={(e) => updateSetting("productTitleWeight", Number(e.target.value))}
                      className="h-8 text-xs bg-white"
                      step={100}
                      min={300}
                      max={900}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 border-t border-slate-150 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <Label className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Short Description</Label>
                  <Switch checked={settings.showDescription} onCheckedChange={(v) => updateSetting("showDescription", v)} />
                </div>
                {settings.showDescription && (
                  <div className="flex gap-2">
                    <div className="flex-[2]">
                      <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Text Color</Label>
                      <div className="flex gap-1.5 mt-1">
                        <Input
                          type="color"
                          value={settings.descriptionColor}
                          onChange={(e) => updateSetting("descriptionColor", e.target.value)}
                          className="h-8 w-10 p-0 border border-slate-200 cursor-pointer bg-white"
                        />
                        <Input
                          type="text"
                          value={settings.descriptionColor}
                          onChange={(e) => updateSetting("descriptionColor", e.target.value)}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Size (px)</Label>
                      <Input
                        type="number"
                        value={settings.descriptionSize}
                        onChange={(e) => updateSetting("descriptionSize", Number(e.target.value))}
                        className="h-8 text-xs bg-white mt-1"
                        min={8}
                        max={16}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2 border-t border-slate-150 pt-2">
                <Label className="text-[11px] text-slate-600 font-bold uppercase tracking-wider block">Price Display</Label>
                <div className="flex gap-2">
                  <div className="flex-[2]">
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Text Color</Label>
                    <div className="flex gap-1.5 mt-1">
                      <Input
                        type="color"
                        value={settings.priceColor}
                        onChange={(e) => updateSetting("priceColor", e.target.value)}
                        className="h-8 w-10 p-0 border border-slate-200 cursor-pointer bg-white"
                      />
                      <Input
                        type="text"
                        value={settings.priceColor}
                        onChange={(e) => updateSetting("priceColor", e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Size (px)</Label>
                    <Input
                      type="number"
                      value={settings.priceSize}
                      onChange={(e) => updateSetting("priceSize", Number(e.target.value))}
                      className="h-8 text-xs bg-white mt-1"
                      min={12}
                      max={28}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Action Buttons */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Action Buttons</span>
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-150">
                <Label className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Show Action Buttons</Label>
                <Switch checked={settings.showActions} onCheckedChange={(v) => updateSetting("showActions", v)} />
              </div>

              {settings.showActions && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Button Text</Label>
                    <Input
                      value={settings.buttonText}
                      onChange={(e) => updateSetting("buttonText", e.target.value)}
                      className="h-8 text-xs mt-1 bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Button Variant</Label>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      {["solid", "outline"].map((v) => (
                        <button
                          key={v}
                          onClick={() => updateSetting("buttonVariant", v as any)}
                          className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                            settings.buttonVariant === v ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500 uppercase tracking-wider">BG Color</Label>
                      <div className="flex mt-1">
                        <Input
                          type="color"
                          value={settings.buttonBgColor}
                          onChange={(e) => updateSetting("buttonBgColor", e.target.value)}
                          className="h-8 w-8 p-0 border border-slate-200 cursor-pointer bg-white"
                        />
                        <Input
                          type="text"
                          value={settings.buttonBgColor}
                          onChange={(e) => updateSetting("buttonBgColor", e.target.value)}
                          className="h-8 text-[10px] p-1 bg-white border-l-0 rounded-l-none"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Text Color</Label>
                      <div className="flex mt-1">
                        <Input
                          type="color"
                          value={settings.buttonTextColor}
                          onChange={(e) => updateSetting("buttonTextColor", e.target.value)}
                          className="h-8 w-8 p-0 border border-slate-200 cursor-pointer bg-white"
                        />
                        <Input
                          type="text"
                          value={settings.buttonTextColor}
                          onChange={(e) => updateSetting("buttonTextColor", e.target.value)}
                          className="h-8 text-[10px] p-1 bg-white border-l-0 rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Border Color</Label>
                      <div className="flex mt-1">
                        <Input
                          type="color"
                          value={settings.buttonBorderColor}
                          onChange={(e) => updateSetting("buttonBorderColor", e.target.value)}
                          className="h-8 w-8 p-0 border border-slate-200 cursor-pointer bg-white"
                        />
                        <Input
                          type="text"
                          value={settings.buttonBorderColor}
                          onChange={(e) => updateSetting("buttonBorderColor", e.target.value)}
                          className="h-8 text-[10px] p-1 bg-white border-l-0 rounded-l-none"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Hover BG Color</Label>
                      <div className="flex mt-1">
                        <Input
                          type="color"
                          value={settings.buttonHoverBg}
                          onChange={(e) => updateSetting("buttonHoverBg", e.target.value)}
                          className="h-8 w-8 p-0 border border-slate-200 cursor-pointer bg-white"
                        />
                        <Input
                          type="text"
                          value={settings.buttonHoverBg}
                          onChange={(e) => updateSetting("buttonHoverBg", e.target.value)}
                          className="h-8 text-[10px] p-1 bg-white border-l-0 rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Radius (px)</Label>
                      <Input
                        type="number"
                        value={settings.buttonBorderRadius}
                        onChange={(e) => updateSetting("buttonBorderRadius", Number(e.target.value))}
                        className="h-8 text-xs bg-white mt-1"
                        min={0}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Padding X</Label>
                      <Input
                        type="number"
                        value={settings.buttonPaddingX}
                        onChange={(e) => updateSetting("buttonPaddingX", Number(e.target.value))}
                        className="h-8 text-xs bg-white mt-1"
                        min={0}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Padding Y</Label>
                      <Input
                        type="number"
                        value={settings.buttonPaddingY}
                        onChange={(e) => updateSetting("buttonPaddingY", Number(e.target.value))}
                        className="h-8 text-xs bg-white mt-1"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Button Hover Scale</Label>
                    <Switch checked={settings.buttonHoverScale} onCheckedChange={(v) => updateSetting("buttonHoverScale", v)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Entrance Animation */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Card Entry Animation</span>
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-3">
              <div>
                <Label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Animation Effect</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {["none", "fade-in", "slide-up", "zoom-in"].map((anim) => (
                    <button
                      key={anim}
                      onClick={() => updateSetting("cardAnimation", anim)}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded-lg capitalize transition-all ${
                        settings.cardAnimation === anim ? "bg-white shadow-sm text-violet-600" : "text-slate-500"
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              {settings.cardAnimation !== "none" && (
                <div>
                  <Label className="text-[11px] text-slate-500 uppercase tracking-wider">Duration ({settings.cardAnimationDuration}ms)</Label>
                  <input
                    type="range"
                    min="300"
                    max="2000"
                    step="100"
                    value={settings.cardAnimationDuration}
                    onChange={(e) => updateSetting("cardAnimationDuration", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
