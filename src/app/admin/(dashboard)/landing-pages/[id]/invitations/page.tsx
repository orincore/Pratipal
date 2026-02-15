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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InvitationRequest {
  id: string;
  landing_page_id: string | null;
  landing_page_slug: string | null;
  first_name: string;
  email: string;
  whatsapp_number: string | null;
  gender: string | null;
  created_at: string;
}

export default function LandingPageInvitationsPage() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;

  const [invitations, setInvitations] = useState<InvitationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!landingPageId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations?landingPageId=${landingPageId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load invitations");
      }
      const data = await res.json();
      setInvitations(data.invitations ?? []);
    } catch (err: any) {
      setError(err.message || "Unable to load invitations");
    } finally {
      setLoading(false);
    }
  }, [landingPageId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const filteredInvitations = useMemo(() => {
    if (!search.trim()) return invitations;
    const query = search.toLowerCase();
    return invitations.filter((inv) =>
      [inv.first_name, inv.email, inv.whatsapp_number]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [invitations, search]);

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[700px]">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 z-20 shadow-sm">
        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={router.back}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-800 truncate">Invitation Requests</h1>
          <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Page ID: {landingPageId}</span>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
          <Link href={`/admin/landing-pages/${landingPageId}/edit`}>
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back to Editor
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500">Track all invitation submissions for this landing page.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Showing {filteredInvitations.length} of {invitations.length} submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or WhatsApp"
              className="h-9 text-xs w-64"
            />
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={fetchInvitations} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading submissions…</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-sm text-gray-500">
              No invitations found yet.
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
                      {inv.gender && (
                        <Badge variant="outline" className="text-[11px] uppercase tracking-wider">
                          {inv.gender}
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
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Submitted</div>
                    <div className="flex items-center justify-end gap-2 text-sm font-medium text-gray-700">
                      <CalendarClock className="h-4 w-4 text-violet-500" />
                      {new Date(inv.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    {inv.landing_page_slug && (
                      <Link
                        href={`/${inv.landing_page_slug}`}
                        target="_blank"
                        className="text-[11px] text-violet-600 hover:text-violet-800 mt-1 inline-block"
                      >
                        View landing page ↗
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
