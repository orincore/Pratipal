"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Loader2 } from "lucide-react";

interface HeroSection {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string;
  cta_link: string | null;
  background_type: string;
  background_image_url: string | null;
  card_type: string;
  card_image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export default function HeroSectionsPage() {
  const [sections, setSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    cta_text: "Learn More",
    cta_link: "",
    background_type: "default",
    background_image_url: "",
    card_type: "image",
    card_image_url: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    try {
      const res = await fetch("/api/admin/hero-sections");
      const data = await res.json();
      setSections(data.heroSections || []);
    } catch (error) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const res = await fetch("/api/admin/hero-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Created");
      setShowCreate(false);
      resetForm();
      loadSections();
    } catch (error) {
      toast.error("Failed to create");
    }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await fetch(`/api/admin/hero-sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Updated");
      setEditingId(null);
      resetForm();
      loadSections();
    } catch (error) {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    try {
      await fetch(`/api/admin/hero-sections/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      loadSections();
    } catch (error) {
      toast.error("Failed to delete");
    }
  }

  async function toggleActive(section: HeroSection) {
    try {
      await fetch(`/api/admin/hero-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...section, is_active: !section.is_active }),
      });
      toast.success(section.is_active ? "Deactivated" : "Activated");
      loadSections();
    } catch (error) {
      toast.error("Failed");
    }
  }

  function startEdit(section: HeroSection) {
    setEditingId(section.id);
    setFormData(section as any);
  }

  function resetForm() {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      cta_text: "Learn More",
      cta_link: "",
      background_type: "default",
      background_image_url: "",
      card_type: "image",
      card_image_url: "",
      display_order: sections.length,
      is_active: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hero Sections</h1>
          <p className="text-gray-600">Manage homepage carousel</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {showCreate && (
        <Card className="border-2 border-brand-teal">
          <CardHeader>
            <CardTitle>Create Hero Section</CardTitle>
          </CardHeader>
          <CardContent>
            <HeroForm
              data={formData}
              onChange={setFormData}
              onSave={handleCreate}
              onCancel={() => { setShowCreate(false); resetForm(); }}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className={!section.is_active ? "opacity-60" : ""}>
            <CardContent className="pt-6">
              {editingId === section.id ? (
                <HeroForm
                  data={formData}
                  onChange={setFormData}
                  onSave={() => handleUpdate(section.id)}
                  onCancel={() => { setEditingId(null); resetForm(); }}
                />
              ) : (
                <div className="flex gap-4">
                  {section.card_image_url && (
                    <img
                      src={section.card_image_url}
                      alt={section.title}
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    {section.subtitle && <p className="text-gray-600">{section.subtitle}</p>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Order: {section.display_order}</span>
                      <span>CTA: {section.cta_text}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(section)}>
                      {section.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(section)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(section.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface HeroFormProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

function HeroForm({ data, onChange, onSave, onCancel }: HeroFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Title *</Label>
          <Input
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Input
            value={data.subtitle || ""}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>CTA Text</Label>
          <Input
            value={data.cta_text}
            onChange={(e) => onChange({ ...data, cta_text: e.target.value })}
          />
        </div>
        <div>
          <Label>CTA Link</Label>
          <Input
            value={data.cta_link || ""}
            onChange={(e) => onChange({ ...data, cta_link: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Background Type</Label>
          <Select
            value={data.background_type}
            onValueChange={(v) => onChange({ ...data, background_type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.background_type === "image" && (
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={data.background_image_url || ""}
              onChange={(e) => onChange({ ...data, background_image_url: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Card Type</Label>
          <Select
            value={data.card_type}
            onValueChange={(v) => onChange({ ...data, card_type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.card_type === "image" && (
          <div>
            <Label>Card Image URL</Label>
            <Input
              value={data.card_image_url || ""}
              onChange={(e) => onChange({ ...data, card_image_url: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Display Order</Label>
          <Input
            type="number"
            value={data.display_order}
            onChange={(e) => onChange({ ...data, display_order: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            checked={data.is_active}
            onChange={(e) => onChange({ ...data, is_active: e.target.checked })}
          />
          <Label>Active</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
