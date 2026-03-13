"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  featured_image?: string;
  duration?: string;
  level?: string;
  category?: string;
  highlights: string[];
  curriculum: { title: string; description: string; topics?: string[] }[];
  what_you_receive: string[];
  who_is_this_for: string[];
  bonuses?: string[];
  instructor: { name: string; title: string; bio: string };
  status: string;
  featured: boolean;
  display_order: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: 0,
    featured_image: "",
    duration: "",
    level: "all",
    category: "",
    highlights: [""],
    curriculum: [{ title: "", description: "", topics: [""] }],
    what_you_receive: [""],
    who_is_this_for: [""],
    bonuses: [""],
    instructor: {
      name: "Dr Aparnaa Singh",
      title: "Naturopathy & Holistic Healing Practitioner",
      bio: "Founder – Pratipal"
    },
    status: "draft",
    featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/courses", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCourse(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      price: 0,
      featured_image: "",
      duration: "",
      level: "all",
      category: "",
      highlights: [""],
      curriculum: [{ title: "", description: "", topics: [""] }],
      what_you_receive: [""],
      who_is_this_for: [""],
      bonuses: [""],
      instructor: {
        name: "Dr Aparnaa Singh",
        title: "Naturopathy & Holistic Healing Practitioner",
        bio: "Founder – Pratipal"
      },
      status: "draft",
      featured: false,
      display_order: 0,
    });
    setFormOpen(true);
  }

  function openEditDialog(course: Course) {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      price: course.price,
      featured_image: course.featured_image || "",
      duration: course.duration || "",
      level: course.level || "all",
      category: course.category || "",
      highlights: course.highlights.length > 0 ? course.highlights : [""],
      curriculum:
        course.curriculum.length > 0
          ? course.curriculum.map((section) => ({
              title: section.title,
              description: section.description,
              topics: section.topics && section.topics.length > 0 ? section.topics : [""],
            }))
          : [{ title: "", description: "", topics: [""] }],
      what_you_receive: course.what_you_receive.length > 0 ? course.what_you_receive : [""],
      who_is_this_for: course.who_is_this_for.length > 0 ? course.who_is_this_for : [""],
      bonuses: course.bonuses && course.bonuses.length > 0 ? course.bonuses : [""],
      instructor: course.instructor,
      status: course.status,
      featured: course.featured,
      display_order: course.display_order,
    });
    setFormOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, featured_image: data.url }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanedData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim()),
        curriculum: formData.curriculum
          .filter((c) => c.title.trim() && c.description.trim())
          .map((c) => ({
            ...c,
            topics: (c.topics ?? []).filter((t) => t.trim()),
          })),
        what_you_receive: formData.what_you_receive.filter(w => w.trim()),
        who_is_this_for: formData.who_is_this_for.filter(w => w.trim()),
        bonuses: formData.bonuses?.filter(b => b.trim()) || [],
      };

      const url = editingCourse
        ? `/api/admin/courses/${editingCourse.id}`
        : "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save course");
      }

      toast.success(editingCourse ? "Course updated" : "Course created");
      setFormOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      toast.success("Course deleted");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  function addArrayItem(field: keyof typeof formData) {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), ""]
    }));
  }

  function removeArrayItem(field: keyof typeof formData, index: number) {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  }

  function updateArrayItem(field: keyof typeof formData, index: number, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? value : item)
    }));
  }

  function addCurriculumItem() {
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, { title: "", description: "", topics: [""] }]
    }));
  }

  function removeCurriculumItem(index: number) {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
  }

  function updateCurriculumItem(index: number, field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (formOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Course Builder</p>
            <h1 className="text-3xl font-bold">{editingCourse ? "Edit Course" : "Create Course"}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditingCourse(null); }}>
              Cancel
            </Button>
            <Button form="course-form" type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingCourse ? "Update" : "Create"} Course
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border p-6">
          <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Subtitle *</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 weeks, 4 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Healing, Therapy"
                  />
                </div>
              </div>

              <div>
                <Label>Featured Image</Label>
                <div className="space-y-2">
                  {formData.featured_image && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
              </div>

              <div>
                <Label>Highlights</Label>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={highlight}
                      onChange={(e) => updateArrayItem("highlights", index, e.target.value)}
                      placeholder="Course highlight"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("highlights", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("highlights")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Highlight
                </Button>
              </div>

              <div>
                <Label>Curriculum</Label>
                {formData.curriculum.map((item, index) => (
                  <Card key={index} className="p-4 mb-3">
                    <div className="space-y-3">
                      <Input
                        value={item.title}
                        onChange={(e) => updateCurriculumItem(index, "title", e.target.value)}
                        placeholder="Section title"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateCurriculumItem(index, "description", e.target.value)}
                        placeholder="Section description"
                        rows={2}
                      />
                      <div>
                        <Label className="text-xs">Topics (optional)</Label>
                        {item.topics?.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex gap-2 mb-2">
                            <Input
                              value={topic}
                              onChange={(e) => {
                                const newTopics = [...(item.topics || [])];
                                newTopics[topicIndex] = e.target.value;
                                updateCurriculumItem(index, "topics", newTopics);
                              }}
                              placeholder="Topic"
                              className="text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newTopics = (item.topics || []).filter((_, i) => i !== topicIndex);
                                updateCurriculumItem(index, "topics", newTopics);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTopics = [...(item.topics || []), ""];
                            updateCurriculumItem(index, "topics", newTopics);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Topic
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCurriculumItem(index)}
                      >
                        Remove Section
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addCurriculumItem}>
                  <Plus className="h-4 w-4 mr-2" /> Add Curriculum Section
                </Button>
              </div>

              <div>
                <Label>What You Will Receive</Label>
                {formData.what_you_receive.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem("what_you_receive", index, e.target.value)}
                      placeholder="What participants receive"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("what_you_receive", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("what_you_receive")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div>
                <Label>Who Is This For</Label>
                {formData.who_is_this_for.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem("who_is_this_for", index, e.target.value)}
                      placeholder="Target audience"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("who_is_this_for", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("who_is_this_for")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div>
                <Label>Bonuses (optional)</Label>
                {formData.bonuses?.map((bonus, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={bonus}
                      onChange={(e) => updateArrayItem("bonuses", index, e.target.value)}
                      placeholder="Bonus item"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("bonuses", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("bonuses")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Bonus
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="featured" className="cursor-pointer">Featured Course</Label>
              </div>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your course offerings</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{course.title}</CardTitle>
                    <Badge variant={course.status === "published" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                    {course.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <CardDescription>{course.subtitle}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">₹{course.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(course)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
