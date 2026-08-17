import { NextResponse } from "next/server";
import { COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clearing a cookie requires the same domain/path it was set with, or the
  // browser treats it as a different cookie and leaves the real one intact.
  response.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(), maxAge: 0 });

  return response;
}
