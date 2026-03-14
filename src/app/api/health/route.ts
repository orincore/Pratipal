import { NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const { Product } = await getDB();
    const productCount = await Product.countDocuments();
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        productCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
        vercelUrl: process.env.VERCEL_URL || null,
      },
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
        vercelUrl: process.env.VERCEL_URL || null,
      },
    }, { status: 500 });
  }
}