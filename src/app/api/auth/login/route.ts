import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  signToken,
  getSessionCookieOptions,
  COOKIE_NAME,
} from "@/lib/auth";
import getDB from "@/lib/db";
import { sendMail, loginNotificationHtml } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { AuthUser } = await getDB();

    const user = await AuthUser.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is disabled. Contact an administrator." },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
    });

    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    // Fire-and-forget login notification
    sendMail({
      to: user.email,
      subject: "New admin login to Pratipal",
      html: loginNotificationHtml({
        name: user.full_name || "Admin",
        email: user.email,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }),
        isAdmin: true,
      }),
    }).catch(() => {});

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
