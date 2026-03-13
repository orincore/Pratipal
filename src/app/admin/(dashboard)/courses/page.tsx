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
  const [dragActive, setDragActive] = useState(false);

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    await uploadFile(file);
    
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      // Upload the dropped file
      uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, featured_image: data.url }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
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
            <Button form="course-form" type="submit" disabled={saving} className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white shadow-lg">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingCourse ? "Update" : "Create"} Course
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 rounded-3xl shadow-lg border border-emerald-100/50 p-6">
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
                <Label className="text-sm font-medium text-slate-700">Featured Image</Label>
                <div className="space-y-4">
                  {formData.featured_image ? (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                      <img 
                        src={formData.featured_image} 
                        alt="Course preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, featured_image: "" }))}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragActive 
                          ? 'border-teal-500 bg-teal-50 scale-105' 
                          : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                        dragActive ? 'text-teal-500' : 'text-slate-400'
                      }`} />
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">
                          {dragActive ? 'Drop image here' : 'Click to upload'}
                        </span>
                        {!dragActive && ' or drag and drop'}
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                      <span className="text-sm text-teal-700">Uploading image...</span>
                    </div>
                  )}
                  
                  {!formData.featured_image && !uploading && (
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        disabled={uploading}
                        className="px-4"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("highlights")} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Plus className="h-4 w-4 mr-2" /> Add Highlight
                </Button>
              </div>

              <div>
                <Label>Curriculum</Label>
                {formData.curriculum.map((item, index) => (
                  <Card key={index} className="p-4 mb-3 border-l-4 border-l-teal-300 bg-gradient-to-r from-white to-teal-50/30">
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
                <Button type="button" variant="outline" size="sm" onClick={addCurriculumItem} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("what_you_receive")} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("who_is_this_for")} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("bonuses")} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
              <p className="text-sm text-slate-500 text-center mb-4">
                Create your first course to get started with your online learning platform
              </p>
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-teal-400">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-slate-800">{course.title}</CardTitle>
                      <Badge 
                        variant={course.status === "published" ? "default" : "secondary"}
                        className={course.status === "published" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      >
                        {course.status}
                      </Badge>
                      {course.featured && (
                        <Badge variant="outline" className="border-teal-300 text-teal-700 bg-teal-50">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-slate-600">{course.subtitle}</CardDescription>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-lg font-semibold text-emerald-600">₹{course.price.toLocaleString()}</p>
                      {course.duration && (
                        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          {course.duration}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full capitalize">
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(course)}
                      className="hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(course.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
