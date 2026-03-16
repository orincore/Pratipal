"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import {
  Loader2, MapPin, Phone, Save, LogOut, User,
  Package, Plus, X, Pencil, Trash2, ChevronRight,
} from "lucide-react";

interface Address {
  id: string;
  address_type: "shipping" | "billing";
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

const emptyAddress: Address = {
  id: "", address_type: "shipping", first_name: "", last_name: "",
  company: "", address_line1: "", address_line2: "", city: "",
  state: "", postal_code: "", country: "India", phone: "", is_default: false,
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, logout } = useCustomerAuth();
  const [profileSaving, setProfileSaving] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Address>(emptyAddress);
  const [addressSaving, setAddressSaving] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "" });

  useEffect(() => {
    if (!loading && !customer) router.push("/login?redirect=/account");
  }, [customer, loading, router]);

  useEffect(() => {
    if (customer) {
      setProfileForm({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
      });
      loadAddresses();
    }
  }, [customer]);

  async function loadAddresses() {
    try {
      setFetchingAddresses(true);
      const res = await fetch("/api/account/addresses");
      if (!res.ok) throw new Error("Failed to load addresses");
      setAddresses((await res.json()).addresses || []);
    } catch (err: any) {
      toast.error(err.message || "Could not load addresses");
    } finally {
      setFetchingAddresses(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated");
      setShowProfileForm(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  function startEditAddress(address: Address) {
    setAddressForm({ ...address });
    setShowAddressForm(true);
  }

  function cancelAddressForm() {
    setAddressForm(emptyAddress);
    setShowAddressForm(false);
  }

  async function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    setAddressSaving(true);
    try {
      const payload = { ...addressForm };
      if (payload.id) {
        const res = await fetch(`/api/account/addresses/${payload.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update address");
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create address");
      }
      toast.success("Address saved");
      cancelAddressForm();
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Could not save address");
    } finally {
      setAddressSaving(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address removed");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Could not delete address");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  }

  if (loading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const initials = `${customer.first_name?.[0] || ""}${customer.last_name?.[0] || ""}`.toUpperCase() || customer.email[0].toUpperCase();

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your profile and addresses</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Avatar + quick links */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-emerald-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
            <p className="text-sm text-slate-500 truncate">{customer.email}</p>
          </div>
          <button
            onClick={() => router.push("/account/orders")}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition"
          >
            <Package className="h-4 w-4" /> Order History <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
            </div>
            {!showProfileForm && (
              <button
                onClick={() => setShowProfileForm(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-semibold transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>

          {showProfileForm ? (
            <form onSubmit={handleProfileSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-xs font-medium text-slate-600">First Name</Label>
                  <Input id="first_name" value={profileForm.first_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                    className="rounded-xl border-black/10 bg-white/80" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-xs font-medium text-slate-600">Last Name</Label>
                  <Input id="last_name" value={profileForm.last_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                    className="rounded-xl border-black/10 bg-white/80" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email</Label>
                <Input id="email" value={customer.email} disabled className="rounded-xl bg-gray-100 border-black/5 text-slate-500" />
                <p className="text-xs text-slate-400">Email changes require contacting support.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-slate-600">Phone</Label>
                <Input id="phone" type="tel" value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210" className="rounded-xl border-black/10 bg-white/80" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowProfileForm(false)}
                  className="h-9 px-4 rounded-xl border border-black/10 text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={profileSaving}
                  className="flex items-center gap-2 h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50">
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-0.5">First Name</p>
                  <p className="text-sm font-medium text-gray-900">{customer.first_name || <span className="text-slate-400 italic">Not set</span>}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-0.5">Last Name</p>
                  <p className="text-sm font-medium text-gray-900">{customer.last_name || <span className="text-slate-400 italic">Not set</span>}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900">{customer.email}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-medium text-gray-900">{customer.phone || <span className="text-slate-400 italic">Not set</span>}</p>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-gray-900">Saved Addresses</h2>
            </div>
            {!showAddressForm && (
              <button
                onClick={() => { setAddressForm(emptyAddress); setShowAddressForm(true); }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Address
              </button>
            )}
          </div>

          {/* Address form — shown only when adding/editing */}
          {showAddressForm && (
            <div className="p-5 border-b border-black/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">
                  {addressForm.id ? "Edit Address" : "New Address"}
                </p>
                <button onClick={cancelAddressForm} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAddressSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">First Name</Label>
                    <Input value={addressForm.first_name} onChange={(e) => setAddressForm((p) => ({ ...p, first_name: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Last Name</Label>
                    <Input value={addressForm.last_name} onChange={(e) => setAddressForm((p) => ({ ...p, last_name: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Phone</Label>
                    <Input value={addressForm.phone || ""} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className="rounded-xl border-black/10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Company (optional)</Label>
                    <Input value={addressForm.company || ""} onChange={(e) => setAddressForm((p) => ({ ...p, company: e.target.value }))} className="rounded-xl border-black/10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Address Line 1</Label>
                  <Textarea value={addressForm.address_line1} onChange={(e) => setAddressForm((p) => ({ ...p, address_line1: e.target.value }))} className="rounded-xl border-black/10" rows={2} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Address Line 2</Label>
                  <Input value={addressForm.address_line2 || ""} onChange={(e) => setAddressForm((p) => ({ ...p, address_line2: e.target.value }))} className="rounded-xl border-black/10" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">City</Label>
                    <Input value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">State</Label>
                    <Input value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Postal Code</Label>
                    <Input value={addressForm.postal_code} onChange={(e) => setAddressForm((p) => ({ ...p, postal_code: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Country</Label>
                    <Input value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} className="rounded-xl border-black/10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Type</Label>
                    <div className="flex gap-4 text-sm pt-1">
                      {(["shipping", "billing"] as const).map((t) => (
                        <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="address_type" value={t}
                            checked={addressForm.address_type === t}
                            onChange={() => setAddressForm((p) => ({ ...p, address_type: t }))} />
                          <span className="capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
                    <input type="checkbox" checked={addressForm.is_default}
                      onChange={(e) => setAddressForm((p) => ({ ...p, is_default: e.target.checked }))} />
                    Set as default
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={cancelAddressForm}
                    className="h-9 px-4 rounded-xl border border-black/10 text-slate-600 text-sm font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={addressSaving}
                    className="flex items-center gap-2 h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50">
                    {addressSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address list */}
          <div className="p-5">
            {fetchingAddresses ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading addresses…
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No saved addresses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="rounded-2xl border border-black/5 bg-white/60 p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{addr.first_name} {addr.last_name}</p>
                        <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">{addr.address_type}</span>
                      </div>
                      {addr.is_default && (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex-shrink-0">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}<br />
                      {addr.city}, {addr.state} {addr.postal_code}<br />
                      {addr.country}
                    </p>
                    {addr.phone && (
                      <p className="text-xs flex items-center gap-1 text-slate-400">
                        <Phone className="h-3 w-3" /> {addr.phone}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => startEditAddress(addr)}
                        className="flex items-center gap-1 h-7 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-medium transition">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => deleteAddress(addr.id)}
                        className="flex items-center gap-1 h-7 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
