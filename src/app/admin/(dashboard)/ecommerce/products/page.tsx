"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import type { Product as EcomProduct } from "@/lib/ecommerce-types";

export default function EcommerceProductsPage() {
  const [products, setProducts] = useState<EcomProduct[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProducts();
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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    router.push("/admin/ecommerce/products/create");
  }

  function openEdit(product: EcomProduct) {
    router.push(`/admin/ecommerce/products/create?productId=${product.id}`);
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
    </div>
  );
}
