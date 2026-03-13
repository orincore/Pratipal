import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShippingSettings from "@/models/ShippingSettings";

export async function GET() {
  try {
    await connectDB();
    
    let settings = await ShippingSettings.findOne().sort({ updated_at: -1 }).lean();
    
    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = new ShippingSettings({
        free_shipping_threshold: 500,
        flat_rate: 50,
        weight_based_enabled: false,
        weight_tiers: [
          { min_weight: 0, max_weight: 1, rate: 50 },
          { min_weight: 1, max_weight: 5, rate: 100 },
          { min_weight: 5, max_weight: 10, rate: 150 },
        ],
        enabled: true,
      });
      
      settings = await defaultSettings.save();
    } else {
      // Migrate existing settings to include new fields if they don't exist
      if (settings.weight_based_enabled === undefined) {
        await ShippingSettings.findByIdAndUpdate(settings._id, {
          $set: {
            weight_based_enabled: false,
            weight_tiers: [
              { min_weight: 0, max_weight: 1, rate: 50 },
              { min_weight: 1, max_weight: 5, rate: 100 },
              { min_weight: 5, max_weight: 10, rate: 150 },
            ],
          },
        });
        
        // Refetch the updated settings
        settings = await ShippingSettings.findById(settings._id).lean();
      }
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const {
      free_shipping_threshold,
      flat_rate,
      weight_based_enabled,
      weight_tiers,
      enabled
    } = body;

    // Validate weight tiers
    if (weight_based_enabled && weight_tiers) {
      for (const tier of weight_tiers) {
        if (tier.min_weight < 0 || tier.max_weight < 0 || tier.rate < 0) {
          return NextResponse.json(
            { error: "Weight and rate values must be non-negative" },
            { status: 400 }
          );
        }
        if (tier.min_weight >= tier.max_weight) {
          return NextResponse.json(
            { error: "Min weight must be less than max weight" },
            { status: 400 }
          );
        }
      }
    }

    // Update or create shipping settings
    let settings = await ShippingSettings.findOne().sort({ updated_at: -1 });
    
    if (settings) {
      // Update existing settings
      settings.free_shipping_threshold = free_shipping_threshold;
      settings.flat_rate = flat_rate;
      settings.weight_based_enabled = weight_based_enabled;
      settings.weight_tiers = weight_tiers || [];
      settings.enabled = enabled !== false;
      
      await settings.save();
    } else {
      // Create new settings
      settings = new ShippingSettings({
        free_shipping_threshold,
        flat_rate,
        weight_based_enabled,
        weight_tiers: weight_tiers || [],
        enabled: enabled !== false,
      });
      
      await settings.save();
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    return NextResponse.json(
      { error: "Failed to update shipping settings" },
      { status: 500 }
    );
  }
}