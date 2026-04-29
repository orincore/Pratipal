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
  Package,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";

interface ServiceBooking {
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

interface ServiceOrdersResponse {
  bookings: ServiceBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  statusStats: {
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  paymentStats: {
    pending: number;
    paid: number;
    failed: number;
  };
}

export default function ServiceOrdersPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [paymentStats, setPaymentStats] = useState({
    pending: 0,
    paid: 0,
    failed: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    booking_status: "all",
    payment_status: "all",
    search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    booking_status: "",
    admin_notes: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<ServiceBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        order_type: "service", // always filter to service only
        ...(filters.booking_status !== "all" && { booking_status: filters.booking_status }),
        ...(filters.payment_status !== "all" && { payment_status: filters.payment_status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/service-orders?${params}`);
      if (response.ok) {
        const data: ServiceOrdersResponse = await response.json();
        setBookings(data.bookings);
        setPagination(data.pagination);
        setStatusStats(data.statusStats);
        setPaymentStats(data.paymentStats);
      }
    } catch (error) {
      console.error("Error fetching service orders:", error);
      toast.error("Failed to load service orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters]);

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, booking_status: status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePaymentFilter = (status: string) => {
    setFilters(prev => ({ ...prev, payment_status: status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewBooking = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleEditBooking = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setEditForm({
      booking_status: booking.booking_status || "pending",
      admin_notes: booking.admin_notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      setUpdateLoading(true);
      const response = await fetch(`/api/admin/service-orders/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        fetchBookings();
        toast.success("Service order updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update service order");
      }
    } catch (error) {
      console.error("Error updating service order:", error);
      toast.error("Failed to update service order");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setBookingToDelete(bookings.find((b) => b.id === bookingId) || null);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/service-orders/${bookingToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBookings();
        toast.success("Service order deleted successfully");
        setDeleteDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete service order");
      }
    } catch (error) {
      console.error("Error deleting service order:", error);
      toast.error("Failed to delete service order");
    } finally {
      setDeleting(false);
      setBookingToDelete(null);
    }
  };

  const getBookingStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "paid":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "failed":
        return "bg-rose-100 text-rose-800 hover:bg-rose-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Orders</h1>
        <p className="text-muted-foreground">
          Manage service bookings and track their status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { key: "total", icon: Package, color: "text-blue-600", label: "Total Orders", value: pagination.total },
          { key: "pending", icon: Clock, color: "text-yellow-600", label: "Pending", value: statusStats.pending },
          { key: "completed", icon: CheckCircle2, color: "text-green-600", label: "Completed", value: statusStats.completed },
          { key: "revenue", icon: DollarSign, color: "text-emerald-600", label: "Paid Orders", value: paymentStats.paid },
        ].map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by booking number, customer name, or email..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.booking_status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Booking Status" />
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
            <Select value={filters.payment_status} onValueChange={handlePaymentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Payment Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Payment Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Bookings</CardTitle>
          <CardDescription>
            {pagination.total} total service bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No service orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{booking.booking_number}</h3>
                        <Badge className={getBookingStatusBadgeVariant(booking.booking_status || "pending")}>
                          {(booking.booking_status || "pending").replace("_", " ")}
                        </Badge>
                        <Badge className={getPaymentStatusBadgeVariant(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                        {(booking as any).booking_type === "course" && (
                          <Badge className="bg-blue-100 text-blue-800">Course</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{booking.service_name}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {booking.customer_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {booking.customer_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(booking.amount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(booking.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700"
                      >
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
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Order Details</DialogTitle>
            <DialogDescription>
              View complete service booking information
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Booking Number</Label>
                  <p className="text-sm">{selectedBooking.booking_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <p className="text-sm">{selectedBooking.service_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedBooking.service_category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Frequency</Label>
                  <p className="text-sm">{selectedBooking.frequency_label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm font-semibold">{formatPrice(selectedBooking.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Booking Status</Label>
                  <Badge className={getBookingStatusBadgeVariant(selectedBooking.booking_status || "pending")}>
                    {(selectedBooking.booking_status || "pending").replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <Badge className={getPaymentStatusBadgeVariant(selectedBooking.payment_status)}>
                    {selectedBooking.payment_status}
                  </Badge>
                </div>
                {selectedBooking.razorpay_payment_id && (
                  <div>
                    <Label className="text-sm font-medium">Transaction ID</Label>
                    <p className="text-sm font-mono">{selectedBooking.razorpay_payment_id}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer Name</Label>
                  <p className="text-sm">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedBooking.customer_phone}</p>
                </div>
              </div>

              {selectedBooking.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-md">
                    {selectedBooking.admin_notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{formatDate(selectedBooking.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p>{formatDate(selectedBooking.updated_at)}</p>
                </div>
              </div>

              {selectedBooking.whatsapp_redirect_url && selectedBooking.payment_status === "paid" && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => window.open(selectedBooking.whatsapp_redirect_url, "_blank")}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Open WhatsApp Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Order</DialogTitle>
            <DialogDescription>
              Update the booking status and add admin notes
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="booking_status">Booking Status</Label>
                <Select
                  value={editForm.booking_status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, booking_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Add internal notes about this service order..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateBooking}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteBooking}
        title="Delete Service Order"
        itemName={bookingToDelete?.booking_number}
        description={`Are you sure you want to delete service order ${bookingToDelete?.booking_number}? This action cannot be undone.`}
        isDeleting={deleting}
      />
    </div>
  );
}