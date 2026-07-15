import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";

export async function GET() {
  try {
    await connectDB();
    
    let settings = await ShopSettings.findOne().sort({ updated_at: -1 }).lean();
    
    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = new ShopSettings();
      settings = await defaultSettings.save();
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching shop settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    let settings = await ShopSettings.findOne().sort({ updated_at: -1 });
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new settings
      settings = new ShopSettings(body);
      await settings.save();
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating shop settings:", error);
    return NextResponse.json(
      { error: "Failed to update shop settings" },
      { status: 500 }
    );
  }
}
