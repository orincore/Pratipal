import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, getUserFromRequest } from "@/lib/auth";
import { requireCustomerSession } from "@/lib/customer-session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Context) {
  try {
    const supabase = getServiceSupabase();
    const { id } = await context.params;
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function normalizeStatus(value: string | null | undefined) {
  return value ? value.toLowerCase() : null;
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action: string | undefined = body.action;

    if (action !== "cancel") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `*,
        items:order_items(*)`
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const adminUser = getUserFromRequest(req);
    const isAdmin = !!adminUser && adminUser.role === "admin";
    const orderStatus = normalizeStatus(order.status);
    const trackingStatus = normalizeStatus(order.tracking_status);

    if (!isAdmin) {
      const session = await requireCustomerSession();
      const matchesCustomer = order.customer_id
        ? order.customer_id === session.id
        : order.customer_email === session.email;
      if (!matchesCustomer) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const lockedTrackingStatuses = new Set(["shipped", "out_for_delivery", "delivered"]);
      const lockedOrderStatuses = new Set(["completed", "cancelled", "failed"]);
      if (
        (orderStatus && lockedOrderStatuses.has(orderStatus)) ||
        (trackingStatus && lockedTrackingStatuses.has(trackingStatus))
      ) {
        return NextResponse.json(
          { error: "Order can no longer be cancelled" },
          { status: 400 }
        );
      }
    }

    if (orderStatus === "cancelled") {
      return NextResponse.json({ error: "Order already cancelled" }, { status: 400 });
    }

    const cancellationMessage: string = body.reason
      ? String(body.reason)
      : isAdmin
        ? "Cancelled by admin"
        : "Cancelled by customer";

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        tracking_status: "cancelled",
        tracking_message: cancellationMessage,
        tracking_updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `*,
        items:order_items(*)`
      )
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Failed to cancel" }, { status: 500 });
    }

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    if (err?.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
