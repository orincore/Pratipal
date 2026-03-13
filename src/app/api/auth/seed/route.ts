import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, secret } = await req.json();

    // Simple protection: require a secret that matches AUTH_JWT_SECRET
    if (secret !== process.env.AUTH_JWT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { AuthUser } = await getDB();

    const existing = await AuthUser.findOne({ email: email.toLowerCase().trim() }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await AuthUser.create({
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: full_name || null,
      role: "admin",
      status: "active",
    });

    return NextResponse.json({ user: user.toJSON(), message: "Admin user created successfully" });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
