import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const booking_status = searchParams.get("booking_status");
    const payment_status = searchParams.get("payment_status");
    const booking_type = searchParams.get("booking_type");
    const order_type = searchParams.get("order_type");
    const search = searchParams.get("search");

    const { SessionBooking } = await getDB();

    // Build filter query
    const filter: any = {};
    
    if (booking_status && booking_status !== "all") {
      filter.booking_status = booking_status;
    }
    
    if (payment_status && payment_status !== "all") {
      filter.payment_status = payment_status;
    }

    if (booking_type && booking_type !== "all") {
      filter.booking_type = booking_type;
    }

    if (order_type && order_type !== "all") {
      if (order_type === "service") {
        // Exclude anything explicitly marked as course, include everything else
        // (covers legacy records with no order_type/booking_type set, which are services by default)
        filter.$nor = [
          { order_type: "course" },
          { booking_type: "course" },
        ];
      } else {
        // For course: must be explicitly tagged
        const typeConditions = [{ order_type }, { booking_type: order_type }];
        if (filter.$and) {
          filter.$and.push({ $or: typeConditions });
        } else {
          filter.$and = [{ $or: typeConditions }];
        }
      }
    }

    if (search) {
      const searchConditions = [
        { booking_number: { $regex: search, $options: "i" } },
        { customer_name: { $regex: search, $options: "i" } },
        { customer_email: { $regex: search, $options: "i" } },
        { service_name: { $regex: search, $options: "i" } },
      ];
      if (filter.$and) {
        filter.$and.push({ $or: searchConditions });
      } else {
        filter.$and = [{ $or: searchConditions }];
      }
    }

    // Get total count
    const total = await SessionBooking.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get bookings with pagination
    const bookings = await SessionBooking.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Get status statistics scoped to the same filter
    const statusStats = await SessionBooking.aggregate([
      { $match: filter },
      { $group: { _id: "$booking_status", count: { $sum: 1 } } },
    ]);

    const paymentStats = await SessionBooking.aggregate([
      { $match: filter },
      { $group: { _id: "$payment_status", count: { $sum: 1 } } },
    ]);

    // Format stats
    const formattedStatusStats = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    const formattedPaymentStats = {
      pending: 0,
      paid: 0,
      failed: 0,
    };

    statusStats.forEach((stat: any) => {
      if (stat._id && formattedStatusStats.hasOwnProperty(stat._id)) {
        formattedStatusStats[stat._id as keyof typeof formattedStatusStats] = stat.count;
      }
    });

    paymentStats.forEach((stat: any) => {
      if (stat._id && formattedPaymentStats.hasOwnProperty(stat._id)) {
        formattedPaymentStats[stat._id as keyof typeof formattedPaymentStats] = stat.count;
      }
    });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      statusStats: formattedStatusStats,
      paymentStats: formattedPaymentStats,
    });
  } catch (error: any) {
    console.error("Admin service orders fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch service orders" },
      { status: 500 }
    );
  }
}