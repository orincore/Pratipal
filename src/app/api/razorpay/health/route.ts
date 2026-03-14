import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    const status = {
      razorpay_configured: !!(keyId && keySecret),
      public_key_configured: !!publicKeyId,
      key_id_present: !!keyId,
      key_secret_present: !!keySecret,
      public_key_present: !!publicKeyId,
      key_id_matches: keyId === publicKeyId,
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: status.razorpay_configured ? "healthy" : "error",
      message: status.razorpay_configured 
        ? "Razorpay credentials are properly configured" 
        : "Razorpay credentials are missing or incomplete",
      details: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to check Razorpay configuration",
        error: error.message 
      },
      { status: 500 }
    );
  }
}