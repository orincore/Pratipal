"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Product as EcomProduct, Category } from "@/lib/ecommerce-types";

export default function EcommerceProductsPage() {
  const [products, setProducts] = useState<EcomProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Partial<EcomProduct> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      toast.error("Failed to load products");
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditProduct({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: 0,
      stock_quantity: 0,
      stock_status: "in_stock",
      manage_stock: true,
      images: [],
      is_featured: false,
      is_active: true,
      tags: [],
    });
    setIsNew(true);
    setDialogOpen(true);
  }

  function openEdit(product: EcomProduct) {
    setEditProduct({ ...product });
    setIsNew(false);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editProduct || !editProduct.name || !editProduct.price) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editProduct),
        });

        if (!res.ok) throw new Error("Failed to create product");
        
        const data = await res.json();
        setProducts((prev) => [...prev, data.product]);
        toast.success("Product created successfully");
      } else {
        const res = await fetch(`/api/products/${editProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editProduct),
        });

        if (!res.ok) throw new Error("Failed to update product");
        
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
        toast.success("Product updated successfully");
      }
      setDialogOpen(false);
      setEditProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your ecommerce product catalog
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Image</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Stock</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                        {product.featured_image && (
                          <Image
                            src={product.featured_image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-medium">{product.name}</td>
                    <td className="py-3 hidden md:table-cell text-muted-foreground">
                      {product.sku || "-"}
                    </td>
                    <td className="py-3">₹{product.price.toFixed(2)}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <Badge variant={product.stock_quantity > 0 ? "success" : "destructive"}>
                        {product.stock_quantity}
                      </Badge>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <Badge variant={product.is_active ? "success" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add Product" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={editProduct.slug}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, slug: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Sale Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editProduct.sale_price || ""}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        sale_price: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={editProduct.sku || ""}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, sku: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={editProduct.stock_quantity}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        stock_quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={editProduct.category_id || ""}
                  onValueChange={(v) =>
                    setEditProduct({ ...editProduct, category_id: v })
                  }
                >
                  <SelectTrigger>
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
              </div>

              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={editProduct.short_description || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      short_description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editProduct.description || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>Featured Image URL</Label>
                <Input
                  value={editProduct.featured_image || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, featured_image: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock Status</Label>
                  <Select
                    value={editProduct.stock_status}
                    onValueChange={(v: any) =>
                      setEditProduct({ ...editProduct, stock_status: v })
                    }
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
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editProduct.is_featured}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          is_featured: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editProduct.is_active}
                      onChange={(e) =>
                        setEditProduct({
                          ...editProduct,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : isNew ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
