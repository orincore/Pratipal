"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Loader2, ImageIcon, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  url: string;
  r2_key?: string;
  caption?: string;
  display_order: number;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchImages(); }, []);

  async function fetchImages() {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "gallery");

        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

        const saveRes = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadData.url, r2_key: uploadData.key || null, caption: "" }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error || "Save failed");

        setImages((prev) => [saveData.image, ...prev]);
        toast.success(`${file.name} uploaded`);
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(img: GalleryImage) {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success("Image removed");
    } catch {
      toast.error("Failed to delete image");
    }
  }

  async function saveCaption(id: string) {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => prev.map((i) => (i.id === id ? { ...i, caption: editCaption } : i)));
      setEditingId(null);
      toast.success("Caption saved");
    } catch {
      toast.error("Failed to save caption");
    }
  }

  function startEdit(img: GalleryImage) {
    setEditingId(img.id);
    setEditCaption(img.caption || "");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload images and set hover text shown on the homepage.
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Images
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {/* Drop zone */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
        {uploading ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Uploading to R2...</span>
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-emerald-400 mb-1.5" />
            <span className="text-sm text-gray-500">Click or drag images here</span>
            <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP · max 10 MB each · multiple allowed</span>
          </>
        )}
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No images yet. Upload your first gallery image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white flex flex-col">

              {/* Image with action overlay */}
              <div className="relative aspect-video">
                <img
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => startEdit(img)}
                    title="Edit hover text"
                    className="h-9 w-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition shadow"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    title="Delete image"
                    className="h-9 w-9 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-600 transition shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Caption row — always visible, click pencil to edit */}
              <div className="px-3 py-2 flex items-center gap-2 min-h-[40px]">
                {editingId === img.id ? (
                  <>
                    <Input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Hover text shown on image..."
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCaption(img.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button onClick={() => saveCaption(img.id)} className="text-emerald-600 hover:text-emerald-700 flex-shrink-0">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(img)}
                    className="flex items-center gap-1.5 w-full text-left group/caption"
                  >
                    <Pencil className="h-3 w-3 text-gray-300 group-hover/caption:text-emerald-500 flex-shrink-0 transition-colors" />
                    <span className={`text-xs truncate ${img.caption ? "text-gray-600" : "text-gray-300 italic"}`}>
                      {img.caption || "Add hover text..."}
                    </span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
