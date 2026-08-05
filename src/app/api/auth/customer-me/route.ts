import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getSessionCookieOptions } from "@/lib/auth";
import getDB from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CUSTOMER_COOKIE_NAME = "customer_session";

// Every page mounts CustomerAuthProvider, which calls this on load to check
// for a signed-in customer — so "not authenticated" is the common, expected
// result for anonymous visitors, not an error. It resolves with 200 and
// `customer: null` rather than 401 so an anonymous pageview doesn't show up
// as a red "401 Unauthorized" network error in the browser console (a real
// 401 status is logged there by the browser itself, independent of any app
// code, no matter how the response body is handled).
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(CUSTOMER_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ customer: null });
    }

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded) {
      const response = NextResponse.json({ customer: null });
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
      const response = NextResponse.json({ customer: null });
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
    const response = NextResponse.json({ customer: null });
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
      ...cookieOpts,
      maxAge: 0,
    });
    return response;
  }
}
