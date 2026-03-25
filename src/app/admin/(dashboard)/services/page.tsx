"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAdminServices,
  createService,
  updateService,
  deleteService,
} from "@/services/api";
import type { Service, ServiceFrequency } from "@/types";
import { toast } from "sonner";
import Image from "next/image";

interface EditableService extends Service {}

const emptyFrequency = (): ServiceFrequency => ({
  label: "",
  value: "",
  price: 0,
});

const createEmptyService = (): EditableService => ({
  id: "",
  title: "",
  slug: "",
  description: "",
  detailed_description: "",
  image_url: "",
  base_price: 0,
  frequency_options: [],
  category: "general",
  is_active: true,
  display_order: 0,
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
});

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [editingService, setEditingService] = useState<EditableService>(createEmptyService());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await getAdminServices();
      setServices(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingService(createEmptyService());
    setIsNew(true);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService({ ...service });
    setIsNew(false);
    setDialogOpen(true);
  }

  function updateField<K extends keyof EditableService>(key: K, value: EditableService[K]) {
    setEditingService((prev) => ({ ...prev, [key]: value }));
  }

  function updateFrequency(index: number, field: keyof ServiceFrequency, value: ServiceFrequency[keyof ServiceFrequency]) {
    setEditingService((prev) => {
      const next = [...prev.frequency_options];
      next[index] = { ...next[index], [field]: value } as ServiceFrequency;
      return { ...prev, frequency_options: next };
    });
  }

  function addFrequency() {
    setEditingService((prev) => ({
      ...prev,
      frequency_options: [...prev.frequency_options, emptyFrequency()],
    }));
  }

  function removeFrequency(index: number) {
    setEditingService((prev) => ({
      ...prev,
      frequency_options: prev.frequency_options.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      if (isNew) {
        const { id, ...payload } = editingService;
        const created = await createService(payload);
        setServices((prev) => [...prev, created]);
        toast.success("Service created");
      } else {
        const updated = await updateService(editingService);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Service updated");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/services", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      const data = await res.json();
      updateField("image_url", data.url);
      toast.success(`Image uploaded${data.storage === 'r2' ? ' to R2' : ' locally'}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete service");
    }
  }

  const sortedServices = useMemo(() =>
    [...services].sort((a, b) => a.display_order - b.display_order || a.title.localeCompare(b.title))
  , [services]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and organize services shown on the storefront booking widget
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> New Service
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-2xl border border-dashed border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedServices.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{service.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="relative h-32 w-full overflow-hidden rounded-xl border">
                  <Image
                    src={service.image_url || "/placeholder.jpg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>
                <div className="text-sm font-medium">
                  Starts at ₹{(service.frequency_options[0]?.price || service.base_price).toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{service.category}</span>
                  <span>{service.is_active ? "Active" : "Hidden"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[1100px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Service" : "Edit Service"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={editingService.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={editingService.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="auto-generated if blank"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input value={editingService.category} onChange={(e) => updateField("category", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <div className="flex flex-col gap-3">
                <Input
                  value={editingService.image_url}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  placeholder="https://..."
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                  {editingService.image_url && (
                    <span className="text-xs text-muted-foreground truncate max-w-sm">
                      {editingService.image_url}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {editingService.image_url && (
                <div className="mt-2 rounded-xl border overflow-hidden">
                  <Image
                    src={editingService.image_url}
                    alt={editingService.title || "Service preview"}
                    width={600}
                    height={320}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Short Description</Label>
              <Textarea
                value={editingService.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Detailed Description</Label>
              <Textarea
                value={editingService.detailed_description || ""}
                onChange={(e) => updateField("detailed_description", e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>Base Price (₹)</Label>
              <Input
                type="number"
                min="0"
                value={editingService.base_price}
                onChange={(e) => updateField("base_price", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={editingService.display_order}
                onChange={(e) => updateField("display_order", Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">Visible on storefront</p>
                <p className="text-xs text-muted-foreground">Toggle to hide without deleting</p>
              </div>
              <Switch
                checked={editingService.is_active}
                onCheckedChange={(checked) => updateField("is_active", checked)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Frequency / Package Options</Label>
                <Button variant="outline" size="sm" onClick={addFrequency}>
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              </div>
              {editingService.frequency_options.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No custom options added. Base price will be used.
                </p>
              ) : (
                <div className="space-y-2">
                  {editingService.frequency_options.map((freq, index) => (
                    <div key={index} className="rounded-xl border p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4" /> Option {index + 1}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFrequency(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Label>Label</Label>
                        <Input value={freq.label} onChange={(e) => updateFrequency(index, "label", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Value (unique)</Label>
                        <Input value={freq.value} onChange={(e) => updateFrequency(index, "value", e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={freq.price}
                          onChange={(e) => updateFrequency(index, "price", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* SEO Settings */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-800">SEO Settings</p>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">SEO Title <span className="text-muted-foreground/60">(defaults to service title)</span></Label>
              <Input
                value={editingService.seo_title || ""}
                onChange={(e) => updateField("seo_title", e.target.value)}
                placeholder={editingService.title || "Service title"}
                maxLength={70}
              />
              <p className="text-xs text-muted-foreground">{(editingService.seo_title || "").length}/70 characters</p>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Meta Description <span className="text-muted-foreground/60">(defaults to short description)</span></Label>
              <Textarea
                value={editingService.seo_description || ""}
                onChange={(e) => updateField("seo_description", e.target.value)}
                placeholder={editingService.description || "Service description for search engines"}
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{(editingService.seo_description || "").length}/160 characters</p>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Keywords <span className="text-muted-foreground/60">(comma-separated)</span></Label>
              <Input
                value={editingService.seo_keywords || ""}
                onChange={(e) => updateField("seo_keywords", e.target.value)}
                placeholder="healing, therapy, wellness"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
