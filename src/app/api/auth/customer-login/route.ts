import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, getSessionCookieOptions } from "@/lib/auth";
import getDB from "@/lib/db";

const CUSTOMER_COOKIE_NAME = "customer_session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { Customer } = await getDB();

    const customerDoc = await Customer.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!customerDoc) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, customerDoc.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const customerId = customerDoc._id.toString();

    const token = signToken({
      id: customerId,
      email: customerDoc.email,
      first_name: customerDoc.first_name,
      last_name: customerDoc.last_name,
      role: "customer",
    });

    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({
      customer: {
        id: customerId,
        email: customerDoc.email,
        first_name: customerDoc.first_name,
        last_name: customerDoc.last_name,
        phone: customerDoc.phone,
        is_verified: customerDoc.is_verified,
      },
    });

    console.log("customer-login: setting cookie", CUSTOMER_COOKIE_NAME);
    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    return response;
  } catch (err: any) {
    console.error("Customer login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
