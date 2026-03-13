import { NextRequest, NextResponse } from "next/server";
import getDB from "@/lib/db";

export async function GET() {
  try {
    const { ShippingSettings } = await getDB();

    const settings = await ShippingSettings.findOne()
      .sort({ updated_at: -1 })
      .lean();

    if (!settings) {
      return NextResponse.json({ flat_rate: 50, free_shipping_threshold: 500, enabled: true });
    }

    return NextResponse.json({
      ...settings,
      id: settings._id.toString(),
      _id: undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { ShippingSettings } = await getDB();
    const body = await req.json();

    const { flat_rate, free_shipping_threshold, enabled } = body;

    // Get existing settings
    const existing = await ShippingSettings.findOne().sort({ updated_at: -1 });

    let result;
    if (existing) {
      // Update existing
      result = await ShippingSettings.findByIdAndUpdate(
        existing._id,
        { flat_rate, free_shipping_threshold, enabled },
        { new: true }
      ).lean();
    } else {
      // Insert new
      result = await ShippingSettings.create({
        flat_rate,
        free_shipping_threshold,
        enabled,
      });
    }

    return NextResponse.json({
      ...result,
      id: result._id.toString(),
      _id: undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
