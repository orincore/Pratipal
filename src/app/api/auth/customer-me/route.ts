import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getSessionCookieOptions } from "@/lib/auth";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CUSTOMER_COOKIE_NAME = "customer_session";

export async function GET(req: NextRequest) {
  try {
    console.log("customer-me: incoming cookies", req.headers.get("cookie"));
    const sessionCookie = req.cookies.get(CUSTOMER_COOKIE_NAME);

    if (!sessionCookie?.value) {
      console.warn("customer-me: missing session cookie");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      console.warn("customer-me: invalid token");
      const response = NextResponse.json({ error: "Invalid session" }, { status: 401 });
      const cookieOpts = getSessionCookieOptions();
      response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
        ...cookieOpts,
        maxAge: 0,
      });
      return response;
    }
    const { Customer } = await getDB();

    const customer = await Customer.findOne({ email: decoded.email })
      .select("email first_name last_name phone avatar_url is_verified created_at")
      .lean();

    if (!customer) {
      console.warn("customer-me: customer not found", decoded.sub);
      const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const cookieOpts = getSessionCookieOptions();
      response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
        ...cookieOpts,
        maxAge: 0,
      });
      return response;
    }

    customer.id = customer._id.toString();
    delete customer._id;

    return NextResponse.json({ customer });
  } catch (err: any) {
    console.error("customer-me error", err);
    const response = NextResponse.json({ error: "Invalid session" }, { status: 401 });
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
      ...cookieOpts,
      maxAge: 0,
    });
    return response;
  }
}
