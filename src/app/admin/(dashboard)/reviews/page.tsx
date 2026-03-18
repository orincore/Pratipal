"use client";

import { useEffect, useState } from "react";
import { Star, Plus, Trash2, Pencil, X, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  role: string;
  source: string;
  verified: boolean;
  featured: boolean;
  date: string;
}

const empty = (): Omit<Review, "_id" | "date"> => ({
  name: "", location: "", rating: 5, text: "", role: "",
  source: "trustpilot", verified: true, featured: false,
});

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("h-4 w-4", s <= rating ? "fill-[#00b67a] text-[#00b67a]" : "text-gray-300")}
          onClick={() => onChange?.(s)}
          style={{ cursor: onChange ? "pointer" : "default" }}
        />
      ))}
    </div>
  );
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(empty());
    setShowForm(true);
  }

  function openEdit(r: Review) {
    setEditing(r);
    setForm({ name: r.name, location: r.location, rating: r.rating, text: r.text, role: r.role, source: r.source, verified: r.verified, featured: r.featured });
    setShowForm(true);
  }

  async function save() {
    if (!form.name || !form.text) { toast.error("Name and review text are required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/admin/reviews/${editing._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Review updated");
      } else {
        await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        toast.success("Review added");
      }
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  }

  async function toggleFeatured(r: Review) {
    await fetch(`/api/admin/reviews/${r._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !r.featured }) });
    load();
  }

  // Aggregate stats
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const dist = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage customer reviews shown on the homepage</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap gap-8 items-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{avg}</div>
            <Stars rating={Math.round(Number(avg))} />
            <div className="text-xs text-gray-400 mt-1">{reviews.length} reviews</div>
          </div>
          <div className="flex-1 min-w-[160px] space-y-1.5">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-gray-500">{star}</span>
                <Star className="h-3 w-3 fill-[#00b67a] text-[#00b67a]" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00b67a] rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                </div>
                <span className="w-4 text-gray-400">{count}</span>
              </div>
            ))}
          </div>
          <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#00b67a] font-semibold hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> Trustpilot
          </a>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editing ? "Edit Review" : "Add Review"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Customer name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="City, Country" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Role / Title</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="e.g. Wellness Seeker" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Rating *</label>
                <Stars rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Review *</label>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" placeholder="Customer review text..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="trustpilot">Trustpilot</option>
                  <option value="google">Google</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 pt-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="rounded" />
                  Verified
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No reviews yet</p>
          <p className="text-sm mt-1">Add your first review to display on the homepage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start hover:border-emerald-200 transition">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                  {r.location && <span className="text-xs text-gray-400">{r.location}</span>}
                  {r.role && <span className="text-xs text-emerald-600 font-medium">{r.role}</span>}
                  {r.featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Featured</span>}
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", r.source === "trustpilot" ? "bg-[#00b67a]/10 text-[#00b67a]" : r.source === "google" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500")}>
                    {r.source}
                  </span>
                </div>
                <Stars rating={r.rating} />
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.text}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleFeatured(r)} title={r.featured ? "Unfeature" : "Feature"} className={cn("h-8 w-8 flex items-center justify-center rounded-lg transition", r.featured ? "bg-amber-100 text-amber-600" : "text-gray-400 hover:bg-gray-100")}>
                  <Star className="h-4 w-4" />
                </button>
                <button onClick={() => openEdit(r)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => del(r._id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
