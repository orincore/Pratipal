import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken, signToken, getSessionCookieOptions, COOKIE_NAME } from "@/lib/auth";
import getDB from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newEmail, newPassword } = await req.json();

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
  }
  if (!newEmail && !newPassword) {
    return NextResponse.json({ error: "Provide a new email or new password" }, { status: 400 });
  }

  const { AuthUser } = await getDB();

  // Use lean() to avoid Mongoose casting the UUID _id as ObjectId
  const userDoc = await AuthUser.findOne({ email: (payload.email as string).toLowerCase() }).lean() as any;
  if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, userDoc.password_hash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const updates: Record<string, any> = {};

  if (newEmail) {
    const existing = await AuthUser.findOne({ email: newEmail.toLowerCase().trim() }).lean() as any;
    if (existing && existing._id.toString() !== userDoc._id.toString()) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    updates.email = newEmail.toLowerCase().trim();
  }

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    updates.password_hash = await bcrypt.hash(newPassword, 12);
  }

  await AuthUser.updateOne({ email: userDoc.email }, { $set: updates });

  const updatedEmail = updates.email ?? userDoc.email;

  // Re-issue token with updated email
  const newToken = signToken({
    id: userDoc._id.toString(),
    email: updatedEmail,
    full_name: userDoc.full_name,
    role: userDoc.role,
    status: userDoc.status,
  });

  const cookieOpts = getSessionCookieOptions();
  const response = NextResponse.json({ success: true, email: updatedEmail });
  response.cookies.set(COOKIE_NAME, newToken, {
    maxAge: cookieOpts.maxAge,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
  });

  return response;
}
