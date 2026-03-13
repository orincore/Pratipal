import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import getDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { Order, OrderItem } = await getDB();
    
    const orders = await Order.find({})
      .sort({ created_at: -1 })
      .lean();

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id }).lean();
        return {
          ...order,
          id: order._id.toString(),
          _id: undefined,
          items: items.map(item => ({
            ...item,
            id: item._id.toString(),
            _id: undefined
          }))
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
