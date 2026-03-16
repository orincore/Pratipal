"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/supabase/auth-context";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ emailCurrent: false, pwCurrent: false, pwNew: false, pwConfirm: false });
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.currentPassword) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: emailForm.currentPassword, newEmail: emailForm.newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Email updated successfully");
      setEmailForm({ currentPassword: "", newEmail: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  }

  function toggle(field: keyof typeof showPw) {
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1b244a]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Update your admin login credentials</p>
        {user?.email && (
          <p className="text-xs text-gray-400 mt-1">Signed in as <span className="font-medium text-gray-600">{user.email}</span></p>
        )}
      </div>

      {/* Update Email */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 text-[#1b244a]">
          <Mail className="h-4 w-4" />
          <h2 className="font-semibold text-sm">Change Email</h2>
        </div>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <PasswordField
            id="email-current-pw"
            label="Current Password"
            value={emailForm.currentPassword}
            onChange={(v) => setEmailForm((p) => ({ ...p, currentPassword: v }))}
            show={showPw.emailCurrent}
            onToggle={() => toggle("emailCurrent")}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="new-email">New Email</label>
            <input
              id="new-email"
              type="email"
              required
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm((p) => ({ ...p, newEmail: e.target.value }))}
              placeholder="new@example.com"
              className="w-full h-10 px-4 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition"
            />
          </div>
          <button
            type="submit"
            disabled={emailLoading}
            className="h-10 px-5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
          >
            {emailLoading ? "Saving..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* Update Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 text-[#1b244a]">
          <KeyRound className="h-4 w-4" />
          <h2 className="font-semibold text-sm">Change Password</h2>
        </div>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <PasswordField
            id="pw-current"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))}
            show={showPw.pwCurrent}
            onToggle={() => toggle("pwCurrent")}
          />
          <PasswordField
            id="pw-new"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))}
            show={showPw.pwNew}
            onToggle={() => toggle("pwNew")}
            placeholder="Min. 8 characters"
          />
          <PasswordField
            id="pw-confirm"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))}
            show={showPw.pwConfirm}
            onToggle={() => toggle("pwConfirm")}
          />
          <button
            type="submit"
            disabled={passwordLoading}
            className="h-10 px-5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #1b244a 0%, #059669 100%)" }}
          >
            {passwordLoading ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Changes take effect immediately. You will remain logged in.
      </div>
    </div>
  );
}

function PasswordField({
  id, label, value, onChange, show, onToggle, placeholder,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="w-full h-10 px-4 pr-11 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition"
        />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
