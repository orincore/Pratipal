import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }
    
    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Contact.countDocuments(filter);
    
    // Get status counts for dashboard
    const statusCounts = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = {
      new: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    
    statusCounts.forEach((item) => {
      if (item._id in statusStats) {
        statusStats[item._id as keyof typeof statusStats] = item.count;
      }
    });
    
    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statusStats,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}