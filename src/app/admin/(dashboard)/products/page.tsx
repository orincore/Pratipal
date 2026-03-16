"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, updateProduct } from "@/services/api";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductCategory, ProductStatus } from "@/types";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    router.push("/admin/ecommerce/products/create");
  }

  function openEdit(product: Product) {
    router.push(`/admin/ecommerce/products/create?productId=${product.id}`);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalogue
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
                  <th className="pb-3 font-medium hidden md:table-cell">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 font-medium">{product.name}</td>
                    <td className="py-3 hidden md:table-cell capitalize">
                      {product.category}
                    </td>
                    <td className="py-3">{formatPrice(product.price)}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <Badge
                        variant={
                          product.status === "active" ? "success" : "warning"
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {confirmDeleteId === product.id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                            <span className="text-xs text-red-700 font-medium whitespace-nowrap">Sure?</span>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting}
                              className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-2 py-0.5 rounded transition-colors"
                            >
                              {deleting ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={deleting}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
