"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Category } from "@/lib/ecommerce-types";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  file?: File;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    sale_price: "",
    cost_price: "",
    sku: "",
    stock_quantity: "0",
    stock_status: "in_stock",
    manage_stock: true,
    category_id: "",
    featured_image: "",
    is_featured: false,
    is_active: true,
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    tags: "",
    meta_title: "",
    meta_description: "",
    homepage_section: "featured",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleDimensionChange(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value },
    }));
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNewCategoryChange(field: string, value: string) {
    setNewCategory((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !newCategory.slug) {
      setNewCategory((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }
    setCreatingCategory(true);
    try {
      const payload = {
        name: newCategory.name,
        slug: newCategory.slug || generateSlug(newCategory.name),
        description: newCategory.description,
        image_url: newCategory.image_url,
        is_active: true,
      };
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create category");
      }
      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);
      handleChange("category_id", data.category.id);
      toast.success("Category created");
      setNewCategory({ name: "", slug: "", description: "", image_url: "" });
      setCategoryDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Could not create category");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a valid image or video`);
          continue;
        }

        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        
        const newMedia: MediaFile = {
          id: Math.random().toString(36).substr(2, 9),
          url: data.url,
          type: isVideo ? "video" : "image",
        };

        setMediaFiles((prev) => [...prev, newMedia]);

        if (isImage && !formData.featured_image) {
          handleChange("featured_image", data.url);
        }
      }

      toast.success("Media uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload media");
    } finally {
      setUploadingMedia(false);
    }
  }

  function removeMedia(id: string) {
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  }

  function setAsFeatured(url: string) {
    handleChange("featured_image", url);
    toast.success("Set as featured image");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        stock_status: formData.stock_status,
        manage_stock: formData.manage_stock,
        category_id: formData.category_id || undefined,
        images: mediaFiles.map((m) => m.url),
        featured_image: formData.featured_image,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
        },
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      router.push("/admin/ecommerce/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Product</h1>
                <p className="text-sm text-muted-foreground">
                  Add a new product to your store
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      handleChange("name", e.target.value);
                      if (!formData.slug) {
                        handleChange("slug", generateSlug(e.target.value));
                      }
                    }}
                    placeholder="e.g., Lavender Aromatherapy Candle"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    placeholder="lavender-aromatherapy-candle"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated from product name if left empty
                  </p>
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleChange("short_description", e.target.value)}
                    placeholder="Brief product description (1-2 sentences)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Detailed product description, features, benefits..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload images or videos
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF, MP4, WebM up to 10MB
                    </p>
                  </label>
                </div>

                {uploadingMedia && (
                  <div className="text-center text-sm text-muted-foreground">
                    Uploading media...
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaFiles.map((media) => (
                      <div
                        key={media.id}
                        className="relative group rounded-lg overflow-hidden border"
                      >
                        {media.type === "image" ? (
                          <div className="relative aspect-square">
                            <Image
                              src={media.url}
                              alt="Product media"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                          {media.type === "image" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setAsFeatured(media.url)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set Featured
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => removeMedia(media.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.featured_image === media.url && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Featured
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">
                      Regular Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="299.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sale_price">Sale Price (₹)</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => handleChange("sale_price", e.target.value)}
                      placeholder="249.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost_price">Cost Price (₹)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => handleChange("cost_price", e.target.value)}
                      placeholder="150.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="PROD-001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleChange("stock_quantity", e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock_status">Stock Status</Label>
                  <Select
                    value={formData.stock_status}
                    onValueChange={(v) => handleChange("stock_status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="on_backorder">On Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manage_stock"
                    checked={formData.manage_stock}
                    onChange={(e) => handleChange("manage_stock", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="manage_stock" className="cursor-pointer">
                    Enable stock management
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      placeholder="0.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.length}
                      onChange={(e) => handleDimensionChange("length", e.target.value)}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.width}
                      onChange={(e) => handleDimensionChange("width", e.target.value)}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.height}
                      onChange={(e) => handleDimensionChange("height", e.target.value)}
                      placeholder="15"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleChange("meta_title", e.target.value)}
                    placeholder="Product name - Your Store"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleChange("meta_description", e.target.value)}
                    placeholder="Brief description for search engines"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="aromatherapy, relaxation, lavender"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.category_id}
                      onValueChange={(v) => handleChange("category_id", v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCategoryDialogOpen(true)}
                      title="Create category"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="homepage_section">Homepage Section</Label>
                  <Select
                    value={formData.homepage_section}
                    onValueChange={(v) => handleChange("homepage_section", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured Products</SelectItem>
                      <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                      <SelectItem value="best_sellers">Best Sellers</SelectItem>
                      <SelectItem value="on_sale">On Sale</SelectItem>
                      <SelectItem value="none">Don't Show on Homepage</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose where this product appears on the homepage
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => handleChange("is_featured", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_featured" className="cursor-pointer">
                      Featured Product
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleChange("is_active", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Active (Visible on store)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featured_image ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={formData.featured_image}
                      alt="Featured"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No featured image</p>
                      <p className="text-xs">Upload media above</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={newCategory.name}
                onChange={(e) => handleNewCategoryChange("name", e.target.value)}
                placeholder="e.g., Ritual Candles"
                required
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={newCategory.slug}
                onChange={(e) => handleNewCategoryChange("slug", e.target.value)}
                placeholder="ritual-candles"
              />
            </div>
            <div>
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                value={newCategory.description}
                onChange={(e) => handleNewCategoryChange("description", e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                value={newCategory.image_url}
                onChange={(e) => handleNewCategoryChange("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
                disabled={creatingCategory}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingCategory}>
                {creatingCategory ? "Saving..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
