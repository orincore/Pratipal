import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    // Clearing a cookie requires the same domain/path it was set with.
    response.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(), maxAge: 0 });
    return response;
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role,
    },
  });
}
