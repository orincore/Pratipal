"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { Loader2, MapPin, Phone, Save } from "lucide-react";

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
  id: "",
  address_type: "shipping",
  first_name: "",
  last_name: "",
  company: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  phone: "",
  is_default: false,
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();
  const [profileSaving, setProfileSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Address>(emptyAddress);
  const [addressSaving, setAddressSaving] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account");
    }
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
      const data = await res.json();
      setAddresses(data.addresses || []);
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  function handleAddressChange(field: keyof Address, value: string | boolean) {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  }

  function startAddAddress() {
    setAddressForm({ ...emptyAddress, id: "" });
  }

  function startEditAddress(address: Address) {
    setAddressForm({ ...address });
  }

  async function handleAddressSave(e: React.FormEvent) {
    e.preventDefault();
    setAddressSaving(true);
    try {
      const payload = { ...addressForm };
      if (payload.id) {
        const res = await fetch(`/api/account/addresses/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update address");
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create address");
      }
      toast.success("Address saved");
      setAddressForm(emptyAddress);
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
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address removed");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Could not delete address");
    }
  }

  if (loading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Manage your profile, saved addresses, and personal preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your basic details so we can personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={customer.email} disabled className="bg-gray-100" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email changes require contacting support.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={profileSaving}>
                    {profileSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Your latest activity at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Member Since</span>
                <span className="font-semibold">
                  {new Date(customer.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Verification</span>
                <span
                  className={`font-semibold ${
                    customer.is_verified ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {customer.is_verified ? "Verified" : "Pending"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Addresses</CardTitle>
            <CardDescription>
              Add and manage your shipping/billing addresses for faster checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddressSave} className="space-y-4 bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {addressForm.id ? "Edit Address" : "Add New Address"}
                </h3>
                {addressForm.id && (
                  <Button variant="ghost" type="button" onClick={startAddAddress}>
                    Cancel
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addr_first_name">First Name</Label>
                  <Input
                    id="addr_first_name"
                    value={addressForm.first_name}
                    onChange={(e) => handleAddressChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addr_last_name">Last Name</Label>
                  <Input
                    id="addr_last_name"
                    value={addressForm.last_name}
                    onChange={(e) => handleAddressChange("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addr_phone">Phone</Label>
                  <Input
                    id="addr_phone"
                    value={addressForm.phone || ""}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="addr_company">Company (optional)</Label>
                  <Input
                    id="addr_company"
                    value={addressForm.company || ""}
                    onChange={(e) => handleAddressChange("company", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="addr_line1">Address Line 1</Label>
                <Textarea
                  id="addr_line1"
                  value={addressForm.address_line1}
                  onChange={(e) => handleAddressChange("address_line1", e.target.value)}
                  required
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="addr_line2">Address Line 2</Label>
                <Input
                  id="addr_line2"
                  value={addressForm.address_line2 || ""}
                  onChange={(e) => handleAddressChange("address_line2", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="addr_city">City</Label>
                  <Input
                    id="addr_city"
                    value={addressForm.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addr_state">State</Label>
                  <Input
                    id="addr_state"
                    value={addressForm.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="addr_postal">Postal Code</Label>
                  <Input
                    id="addr_postal"
                    value={addressForm.postal_code}
                    onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="addr_country">Country</Label>
                  <Input
                    id="addr_country"
                    value={addressForm.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="address_type"
                        value="shipping"
                        checked={addressForm.address_type === "shipping"}
                        onChange={(e) => handleAddressChange("address_type", e.target.value)}
                      />
                      Shipping
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="address_type"
                        value="billing"
                        checked={addressForm.address_type === "billing"}
                        onChange={(e) => handleAddressChange("address_type", e.target.value)}
                      />
                      Billing
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => handleAddressChange("is_default", e.target.checked)}
                  />
                  Set as default
                </label>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={addressSaving}>
                  {addressSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" /> Save Address
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Saved Addresses</h3>
                <Button variant="ghost" size="sm" onClick={startAddAddress}>
                  Add New
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fetchingAddresses ? (
                  <div className="text-sm text-muted-foreground">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    You have no saved addresses.
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border rounded-lg p-4 bg-white flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {addr.first_name} {addr.last_name}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {addr.address_type} address
                          </p>
                        </div>
                        {addr.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addr.address_line1}
                        {addr.address_line2 && <>, {addr.address_line2}</>}
                        <br />
                        {addr.city}, {addr.state} {addr.postal_code}
                        <br />
                        {addr.country}
                      </p>
                      {addr.phone && (
                        <p className="text-sm flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" /> {addr.phone}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditAddress(addr)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAddress(addr.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
