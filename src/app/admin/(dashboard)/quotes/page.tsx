"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Quote } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DailyQuote {
  id: string;
  text: string;
  author?: string;
  date: string;
  status: "active" | "draft";
  created_at: string;
}

const emptyForm = () => ({
  text: "",
  author: "",
  date: new Date().toISOString().split("T")[0],
  status: "active" as "active" | "draft",
});

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyQuote | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    try {
      const res = await fetch("/api/admin/quotes");
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch {
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData(emptyForm());
    setFormOpen(true);
  }

  function openEdit(q: DailyQuote) {
    setEditing(q);
    setFormData({ text: q.text, author: q.author || "", date: q.date, status: q.status });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.text.trim() || !formData.date) {
      toast.error("Quote text and date are required");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/quotes/${editing.id}` : "/api/admin/quotes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save quote");
        return;
      }
      toast.success(editing ? "Quote updated" : "Quote created");
      closeForm();
      fetchQuotes();
    } catch {
      toast.error("Failed to save quote");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this quote?")) return;
    try {
      await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
      toast.success("Quote deleted");
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      toast.error("Failed to delete quote");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Schedule one quote per day to display on the homepage.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Quote
          </Button>
        )}
      </div>

      {/* Form */}
      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5">
            {editing ? "Edit Quote" : "New Quote"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Quote Text *</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData((p) => ({ ...p, text: e.target.value }))}
                placeholder="Enter the inspirational quote..."
                rows={3}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Author</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))}
                  placeholder="e.g. Dr. Aparnaa Singh"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, status: v as "active" | "draft" }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Update Quote" : "Create Quote"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Quote className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No quotes yet. Add your first daily quote.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">
                    {format(new Date(q.date + "T00:00:00"), "MMM d, yyyy")}
                  </span>
                  {q.date === today && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                      Today
                    </Badge>
                  )}
                  <Badge
                    variant={q.status === "active" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {q.status}
                  </Badge>
                </div>
                <p className="text-gray-800 font-medium leading-snug line-clamp-2">
                  &ldquo;{q.text}&rdquo;
                </p>
                {q.author && (
                  <p className="text-sm text-gray-400 mt-1">— {q.author}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(q)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(q.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
