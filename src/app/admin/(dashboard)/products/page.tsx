"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Search } from "lucide-react";
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
