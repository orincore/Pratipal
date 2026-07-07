"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Plus,
  Users,
  X,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvitationWindow {
  id: string;
  landing_page_id: string;
  landing_page_slug: string;
  name: string;
  registration_start: string;
  registration_end: string;
  webinar_starts_at: string;
  webinar_timezone: string;
  join_link?: string | null;
  join_platform?: string | null;
  registrant_count: number;
  created_at: string;
}

interface InvitationRequest {
  id: string;
  landing_page_id: string | null;
  landing_page_slug: string | null;
  first_name: string;
  email: string;
  whatsapp_number: string | null;
  location: string | null;
  created_at: string;
}

const TIMEZONES = ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"];

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function LandingPageInvitationsPage() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;

  const [windows, setWindows] = useState<InvitationWindow[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(true);
  const [windowsError, setWindowsError] = useState<string | null>(null);

  const [selectedWindow, setSelectedWindow] = useState<InvitationWindow | null>(null);
  const [invitations, setInvitations] = useState<InvitationRequest[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRegStart, setNewRegStart] = useState("");
  const [newRegEnd, setNewRegEnd] = useState("");
  const [newWebinarAt, setNewWebinarAt] = useState("");
  const [newTimezone, setNewTimezone] = useState("Asia/Kolkata");
  const [newJoinLink, setNewJoinLink] = useState("");
  const [newJoinPlatform, setNewJoinPlatform] = useState("zoom");

  const [editingWindow, setEditingWindow] = useState<InvitationWindow | null>(null);
  const [editJoinLink, setEditJoinLink] = useState("");
  const [editJoinPlatform, setEditJoinPlatform] = useState("zoom");
  const [savingJoinLink, setSavingJoinLink] = useState(false);

  // Split date+time pickers (assembled on confirm)
  const [regStartDate, setRegStartDate] = useState("");
  const [regStartTime, setRegStartTime] = useState("09:00");
  const [regEndDate, setRegEndDate] = useState("");
  const [regEndTime, setRegEndTime] = useState("09:00");
  const [webinarDate, setWebinarDate] = useState("");
  const [webinarTime, setWebinarTime] = useState("09:00");

  const fetchWindows = useCallback(async () => {
    if (!landingPageId) return;
    setLoadingWindows(true);
    setWindowsError(null);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}/invitation-windows`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load windows");
      }
      const data = await res.json();
      setWindows(data.windows ?? []);
    } catch (err: any) {
      setWindowsError(err.message || "Unable to load registration windows");
    } finally {
      setLoadingWindows(false);
    }
  }, [landingPageId]);

  useEffect(() => {
    fetchWindows();
  }, [fetchWindows]);

  const openWindow = useCallback(async (w: InvitationWindow) => {
    setSelectedWindow(w);
    setSearch("");
    setLoadingInvitations(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}/invitation-windows/${w.id}/registrants`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load registrants");
      }
      const data = await res.json();
      setInvitations(data.invitations ?? []);
    } catch (err: any) {
      alert(err.message || "Failed to load registrants");
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }, [landingPageId]);

  const handleCreateWindow = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRegStart || !newRegEnd || !newWebinarAt) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}/invitation-windows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          registration_start: new Date(newRegStart).toISOString(),
          registration_end: new Date(newRegEnd).toISOString(),
          webinar_starts_at: new Date(newWebinarAt).toISOString(),
          webinar_timezone: newTimezone,
          join_link: newJoinLink.trim() || undefined,
          join_platform: newJoinLink.trim() ? newJoinPlatform : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create window");
      }
      setShowCreate(false);
      setNewName("");
      setNewRegStart(""); setRegStartDate(""); setRegStartTime("09:00");
      setNewRegEnd(""); setRegEndDate(""); setRegEndTime("09:00");
      setNewWebinarAt(""); setWebinarDate(""); setWebinarTime("09:00");
      setNewJoinLink(""); setNewJoinPlatform("zoom");
      await fetchWindows();
    } catch (err: any) {
      alert(err.message || "Failed to create window");
    } finally {
      setCreating(false);
    }
  }, [landingPageId, newName, newRegStart, newRegEnd, newWebinarAt, newTimezone, newJoinLink, newJoinPlatform, fetchWindows]);

  const openEditJoinLink = useCallback((w: InvitationWindow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWindow(w);
    setEditJoinLink(w.join_link || "");
    setEditJoinPlatform(w.join_platform || "zoom");
  }, []);

  const handleSaveJoinLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWindow) return;
    setSavingJoinLink(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}/invitation-windows/${editingWindow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          join_link: editJoinLink.trim(),
          join_platform: editJoinLink.trim() ? editJoinPlatform : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save join link");
      }
      setEditingWindow(null);
      await fetchWindows();
    } catch (err: any) {
      alert(err.message || "Failed to save join link");
    } finally {
      setSavingJoinLink(false);
    }
  }, [landingPageId, editingWindow, editJoinLink, editJoinPlatform, fetchWindows]);

  const handleDeleteWindow = useCallback(async (w: InvitationWindow) => {
    if (!confirm(`Delete window "${w.name}"? This only removes the window, not the invitation submissions themselves.`)) return;
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}/invitation-windows/${w.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete window");
      }
      if (selectedWindow?.id === w.id) setSelectedWindow(null);
      await fetchWindows();
    } catch (err: any) {
      alert(err.message || "Failed to delete window");
    }
  }, [landingPageId, selectedWindow, fetchWindows]);

  const filteredInvitations = useMemo(() => {
    if (!search.trim()) return invitations;
    const query = search.toLowerCase();
    return invitations.filter((inv) =>
      [inv.first_name, inv.email, inv.whatsapp_number, inv.location]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [invitations, search]);

  const handleDeleteInvitation = useCallback(async (id: string) => {
    if (!confirm("Delete this invitation? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/invitations?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete invitation");
    } finally {
      setDeleting(null);
    }
  }, []);

  const downloadCSV = useCallback(() => {
    const headers = ["Name", "Email", "WhatsApp", "Location", "Submitted At"];
    const rows = filteredInvitations.map((inv) => [
      inv.first_name,
      inv.email,
      inv.whatsapp_number || "",
      inv.location || "",
      fmt(inv.created_at),
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedWindow?.name || "invitations"}-${landingPageId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredInvitations, landingPageId, selectedWindow]);

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[700px]">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 z-20 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => (selectedWindow ? setSelectedWindow(null) : router.back())}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-800 truncate">
            {selectedWindow ? `Registrants — ${selectedWindow.name}` : "Registration Windows"}
          </h1>
          <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Page ID: {landingPageId}</span>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
          <Link href={`/admin/landing-pages/${landingPageId}/edit`}>
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back to Editor
          </Link>
        </Button>
      </div>

      {!selectedWindow ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 bg-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Each window is one occurrence of this webinar. Only submissions inside a window's
                registration dates count as registrants for that occurrence's reminders — so people
                from an earlier run don't get re-notified.
              </p>
            </div>
            <Button size="sm" className="h-9 text-xs bg-violet-600 hover:bg-violet-700" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New Window
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingWindows ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading windows…</p>
              </div>
            ) : windowsError ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{windowsError}</div>
            ) : windows.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-sm text-gray-500">
                No registration windows yet. Create one to start tracking registrants for a specific
                run of this webinar.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {windows.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
                    onClick={() => openWindow(w)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{w.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWindow(w);
                        }}
                        className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-violet-500" />
                        Webinar: {fmt(w.webinar_starts_at)} ({w.webinar_timezone})
                      </div>
                      <div>
                        Registration window: {fmt(w.registration_start)} → {fmt(w.registration_end)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                        <Users className="h-3 w-3" /> {w.registrant_count} registrants
                      </Badge>
                      <span className="text-violet-600 text-xs font-medium inline-flex items-center gap-0.5">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => openEditJoinLink(w, e)}
                      className={`flex items-center gap-1.5 text-[11px] rounded-lg px-2.5 py-1.5 border transition-colors ${
                        w.join_link
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      <Video className="h-3 w-3" />
                      {w.join_link
                        ? `Join link set (${w.join_platform || "other"})`
                        : "Add join link (Zoom/Meet/Teams)"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 bg-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Registration window: {fmt(selectedWindow.registration_start)} → {fmt(selectedWindow.registration_end)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Showing {filteredInvitations.length} of {invitations.length} registrants for this window
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, WhatsApp or location"
                className="h-9 text-xs w-64"
              />
              <Button variant="outline" size="sm" className="h-9 text-xs" onClick={downloadCSV} disabled={filteredInvitations.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => openWindow(selectedWindow)} disabled={loadingInvitations}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingInvitations ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingInvitations ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading registrants…</p>
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-sm text-gray-500">
                No registrants in this window yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-base font-semibold text-gray-900">{inv.first_name}</p>
                        {inv.location && (
                          <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                            {inv.location}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {inv.email}
                        </span>
                        {inv.whatsapp_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {inv.whatsapp_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Submitted</div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CalendarClock className="h-4 w-4 text-violet-500" />
                        {fmt(inv.created_at)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteInvitation(inv.id)}
                        disabled={deleting === inv.id}
                      >
                        <Trash2 className={`h-3.5 w-3.5 mr-1 ${deleting === inv.id ? "animate-spin" : ""}`} />
                        {deleting === inv.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">New Registration Window</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWindow} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Window Name *</Label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. July 2026 Batch"
                  className="mt-1 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Registration Start */}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Registration Start *</Label>
                <div className="mt-1 space-y-2">
                  {newRegStart ? (
                    <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-violet-700">
                        {new Date(`${regStartDate}T${regStartTime}`).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setNewRegStart(""); }}
                        className="text-xs text-violet-600 hover:text-violet-800 font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date</span>
                          <input
                            type="date"
                            value={regStartDate}
                            onChange={(e) => setRegStartDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Time</span>
                          <input
                            type="time"
                            value={regStartTime}
                            onChange={(e) => setRegStartTime(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!regStartDate || !regStartTime}
                        onClick={() => setNewRegStart(`${regStartDate}T${regStartTime}`)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        ✓ Confirm Start
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration End */}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Registration End *</Label>
                <div className="mt-1 space-y-2">
                  {newRegEnd ? (
                    <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-violet-700">
                        {new Date(`${regEndDate}T${regEndTime}`).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setNewRegEnd(""); }}
                        className="text-xs text-violet-600 hover:text-violet-800 font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date</span>
                          <input
                            type="date"
                            value={regEndDate}
                            onChange={(e) => setRegEndDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Time</span>
                          <input
                            type="time"
                            value={regEndTime}
                            onChange={(e) => setRegEndTime(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!regEndDate || !regEndTime}
                        onClick={() => setNewRegEnd(`${regEndDate}T${regEndTime}`)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        ✓ Confirm End
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Webinar Date & Time */}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Webinar Date &amp; Time *</Label>
                <div className="mt-1 space-y-2">
                  {newWebinarAt ? (
                    <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-violet-700">
                        {new Date(`${webinarDate}T${webinarTime}`).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setNewWebinarAt(""); }}
                        className="text-xs text-violet-600 hover:text-violet-800 font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Date</span>
                          <input
                            type="date"
                            value={webinarDate}
                            onChange={(e) => setWebinarDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Time</span>
                          <input
                            type="time"
                            value={webinarTime}
                            onChange={(e) => setWebinarTime(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white cursor-pointer"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!webinarDate || !webinarTime}
                        onClick={() => setNewWebinarAt(`${webinarDate}T${webinarTime}`)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        ✓ Confirm Webinar Time
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Timezone</Label>
                <Select value={newTimezone} onValueChange={setNewTimezone}>
                  <SelectTrigger className="mt-1 w-full bg-white text-slate-900 border-slate-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Join Link */}
              <div>
                <Label className="text-xs font-semibold text-slate-500">Join Link (optional)</Label>
                <div className="mt-1 flex gap-2">
                  <Select value={newJoinPlatform} onValueChange={setNewJoinPlatform}>
                    <SelectTrigger className="w-32 bg-white text-slate-900 border-slate-200 rounded-lg flex-shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100000]">
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="google_meet">Google Meet</SelectItem>
                      <SelectItem value="teams">Teams</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={newJoinLink}
                    onChange={(e) => setNewJoinLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Can also be added later — used for the WhatsApp/email "Join Webinar" button.
                </p>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Only invitation submissions between the registration start/end count as registrants
                for this window's reminders.
              </p>
              <Button type="submit" disabled={creating} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg">
                {creating ? "Creating..." : "Create Window"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {editingWindow && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Join Link — {editingWindow.name}</h3>
              <button onClick={() => setEditingWindow(null)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveJoinLink} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Platform</Label>
                <Select value={editJoinPlatform} onValueChange={setEditJoinPlatform}>
                  <SelectTrigger className="mt-1 w-full bg-white text-slate-900 border-slate-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">Meeting URL</Label>
                <Input
                  value={editJoinLink}
                  onChange={(e) => setEditJoinLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="mt-1 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Registrants tap "Join Webinar" from WhatsApp/email reminders and are redirected here —
                you can change this link anytime without touching the approved WhatsApp template.
              </p>
              <Button type="submit" disabled={savingJoinLink} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg">
                {savingJoinLink ? "Saving..." : "Save Join Link"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
