"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  User,
  Clock,
  BookOpen,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";

interface CourseBooking {
  id: string;
  booking_number: string;
  service_id: string;
  service_name: string;
  service_category: string;
  frequency_label: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed";
  booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  whatsapp_redirect_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Response {
  bookings: CourseBooking[];
  pagination: { page: number; limit: number; total: number; pages: number };
  statusStats: { pending: number; confirmed: number; in_progress: number; completed: number; cancelled: number };
  paymentStats: { pending: number; paid: number; failed: number };
}

export default function CourseOrdersPage() {
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusStats, setStatusStats] = useState({ pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 });
  const [paymentStats, setPaymentStats] = useState({ pending: 0, paid: 0, failed: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ booking_status: "all", payment_status: "all", search: "" });
  const [selectedBooking, setSelectedBooking] = useState<CourseBooking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ booking_status: "", admin_notes: "" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<CourseBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        order_type: "course",
        ...(filters.booking_status !== "all" && { booking_status: filters.booking_status }),
        ...(filters.payment_status !== "all" && { payment_status: filters.payment_status }),
        ...(filters.search && { search: filters.search }),
      });
      const res = await fetch(`/api/admin/service-orders?${params}`);
      if (res.ok) {
        const data: Response = await res.json();
        setBookings(data.bookings);
        setPagination(data.pagination);
        setStatusStats(data.statusStats);
        setPaymentStats(data.paymentStats);
      }
    } catch {
      toast.error("Failed to load course orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [pagination.page, filters]);

  const statusColor = (s: string) => ({
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }[s] ?? "bg-gray-100 text-gray-800");

  const paymentColor = (s: string) => ({
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
  }[s] ?? "bg-gray-100 text-gray-800");

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleUpdate = async () => {
    if (!selectedBooking) return;
    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/admin/service-orders/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditDialogOpen(false);
        fetchBookings();
        toast.success("Course order updated");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update course order");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBookingToDelete(bookings.find((b) => b.id === id) || null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/service-orders/${bookingToDelete.id}`, { method: "DELETE" });
      if (res.ok) { 
        fetchBookings(); 
        toast.success("Deleted"); 
        setDeleteDialogOpen(false);
      }
      else toast.error("Failed to delete");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setBookingToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Orders</h1>
        <p className="text-muted-foreground">Manage course enrollments and track their status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, color: "text-blue-600", label: "Total Enrollments", value: pagination.total },
          { icon: Clock, color: "text-yellow-600", label: "Pending", value: statusStats.pending },
          { icon: CheckCircle2, color: "text-green-600", label: "Completed", value: statusStats.completed },
          { icon: DollarSign, color: "text-emerald-600", label: "Paid", value: paymentStats.paid },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by booking number, customer, or course name..."
                value={filters.search}
                onChange={(e) => { setFilters(p => ({ ...p, search: e.target.value })); setPagination(p => ({ ...p, page: 1 })); }}
                className="pl-10"
              />
            </div>
            <Select value={filters.booking_status} onValueChange={(v) => { setFilters(p => ({ ...p, booking_status: v })); setPagination(p => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.payment_status} onValueChange={(v) => { setFilters(p => ({ ...p, payment_status: v })); setPagination(p => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
          <CardDescription>{pagination.total} total course enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No course enrollments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold">{b.booking_number}</h3>
                        <Badge className={statusColor(b.booking_status || "pending")}>
                          {(b.booking_status || "pending").replace("_", " ")}
                        </Badge>
                        <Badge className={paymentColor(b.payment_status)}>{b.payment_status}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-1">{b.service_name}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.customer_name}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{b.customer_email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{b.customer_phone}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatPrice(b.amount)}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(b.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setIsViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(b); setEditForm({ booking_status: b.booking_status, admin_notes: b.admin_notes || "" }); setIsEditDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>Previous</Button>
            <span className="text-sm">Page {pagination.page} of {pagination.pages}</span>
            <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages}>Next</Button>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Enrollment Details</DialogTitle>
            <DialogDescription>Full details for this course enrollment</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Booking Number</Label><p className="text-sm">{selectedBooking.booking_number}</p></div>
                <div><Label>Course Name</Label><p className="text-sm">{selectedBooking.service_name}</p></div>
                <div><Label>Amount</Label><p className="text-sm font-semibold">{formatPrice(selectedBooking.amount)}</p></div>
                <div><Label>Booking Status</Label><Badge className={statusColor(selectedBooking.booking_status || "pending")}>{(selectedBooking.booking_status || "pending").replace("_", " ")}</Badge></div>
                <div><Label>Payment Status</Label><Badge className={paymentColor(selectedBooking.payment_status)}>{selectedBooking.payment_status}</Badge></div>
                {selectedBooking.razorpay_payment_id && (
                  <div><Label>Transaction ID</Label><p className="text-sm font-mono">{selectedBooking.razorpay_payment_id}</p></div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Customer Name</Label><p className="text-sm">{selectedBooking.customer_name}</p></div>
                <div><Label>Email</Label><p className="text-sm">{selectedBooking.customer_email}</p></div>
                <div><Label>Phone</Label><p className="text-sm">{selectedBooking.customer_phone}</p></div>
              </div>
              {selectedBooking.admin_notes && (
                <div><Label>Admin Notes</Label><p className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-md">{selectedBooking.admin_notes}</p></div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div><Label>Created</Label><p>{fmt(selectedBooking.created_at)}</p></div>
                <div><Label>Updated</Label><p>{fmt(selectedBooking.updated_at)}</p></div>
              </div>
              {selectedBooking.whatsapp_redirect_url && selectedBooking.payment_status === "paid" && (
                <div className="pt-4 border-t">
                  <Button onClick={() => window.open(selectedBooking.whatsapp_redirect_url, "_blank")} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-4 w-4" /> Open WhatsApp Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Course Enrollment</DialogTitle>
            <DialogDescription>Update status and add admin notes</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label>Booking Status</Label>
                <Select value={editForm.booking_status} onValueChange={(v) => setEditForm(p => ({ ...p, booking_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea value={editForm.admin_notes} onChange={(e) => setEditForm(p => ({ ...p, admin_notes: e.target.value }))} placeholder="Internal notes..." rows={4} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateLoading}>{updateLoading ? "Updating..." : "Update"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Course Enrollment"
        itemName={bookingToDelete?.booking_number}
        description={`Are you sure you want to delete course enrollment ${bookingToDelete?.booking_number}? This action cannot be undone.`}
        isDeleting={deleting}
      />
    </div>
  );
}
