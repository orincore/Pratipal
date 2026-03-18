import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import getDB from "@/lib/db";
import { sendMail, welcomeEmailHtml } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { Customer } = await getDB();

    const existingCustomer = await Customer.findOne({ email }).lean();

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const customer = await Customer.create({
      email,
      password_hash: passwordHash,
      first_name,
      last_name,
      phone,
      verification_token: verificationToken,
      is_verified: false,
    });

    // Fire-and-forget welcome email
    const displayName = first_name || email.split("@")[0];
    sendMail({
      to: email,
      subject: "Welcome to Pratipal 🌿",
      html: welcomeEmailHtml({ name: displayName }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
