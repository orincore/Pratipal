"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getCategories,
  updateCategory,
  createCategory,
  deleteCategory,
} from "@/services/api";
import type { Category } from "@/types";
import { toast } from "sonner";
import { AdminLoader } from "@/components/admin/admin-loader";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => { setCategories(data); setLoading(false); });
  }, []);

  function openNew() {
    setEditCat({
      id: "",
      name: "",
      slug: "",
      description: "",
      image: "",
      visibleOnHomepage: true,
    });
    setIsNew(true);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditCat({ ...cat });
    setIsNew(false);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editCat) return;
    try {
      if (isNew) {
        const { id, ...rest } = editCat;
        const created = await createCategory(rest);
        setCategories((prev) => [...prev, created]);
        toast.success("Category created");
      } else {
        const updated = await updateCategory(editCat);
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success("Category updated");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  }

  async function handleDelete(id: string) {
    setCategoryToDelete(categories.find((c) => c.id === id) || null);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success("Category deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
      setCategoryToDelete(null);
    }
  }

  async function toggleVisibility(cat: Category) {
    const updated = await updateCategory({
      ...cat,
      visibleOnHomepage: !cat.visibleOnHomepage,
    });
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }

  if (loading) return <AdminLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories and homepage visibility
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {cat.description}
              </p>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cat.visibleOnHomepage}
                  onCheckedChange={() => toggleVisibility(cat)}
                />
                <span className="text-xs text-muted-foreground">
                  {cat.visibleOnHomepage ? "Visible on homepage" : "Hidden"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add Category" : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          {editCat && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editCat.name}
                  onChange={(e) =>
                    setEditCat({ ...editCat, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editCat.slug}
                  onChange={(e) =>
                    setEditCat({ ...editCat, slug: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editCat.description}
                  onChange={(e) =>
                    setEditCat({ ...editCat, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={editCat.image}
                  onChange={(e) =>
                    setEditCat({ ...editCat, image: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editCat.visibleOnHomepage}
                  onCheckedChange={(checked) =>
                    setEditCat({ ...editCat, visibleOnHomepage: checked })
                  }
                />
                <Label>Visible on Homepage</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        isDeleting={deleting}
      />
    </div>
  );
}
