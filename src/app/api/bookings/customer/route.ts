import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const CUSTOMER_COOKIE_NAME = "customer_session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(CUSTOMER_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { SessionBooking } = await getDB();

    // Fetch all bookings for this customer
    const bookings = await SessionBooking.find({ customer_email: decoded.email })
      .sort({ created_at: -1 })
      .lean();

    // Transform _id to id
    const transformedBookings = bookings.map((booking: any) => ({
      ...booking,
      id: booking._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ bookings: transformedBookings });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
