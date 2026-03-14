// One-time script to fix the specific order with ID: 69b53877d176959feffe4446
import getDB from "@/lib/db";

async function fixSpecificOrder() {
  try {
    const { Order, OrderItem } = await getDB();
    const orderId = "69b53877d176959feffe4446";

    console.log(`Fixing order: ${orderId}`);

    // Get the order and its items
    const order = await Order.findById(orderId).lean();
    if (!order) {
      console.error("Order not found");
      return;
    }

    const items = await OrderItem.find({ order_id: order._id }).lean();
    if (items.length === 0) {
      console.error("No order items found");
      return;
    }

    console.log("Current order totals:", {
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping_cost,
      total: order.total
    });

    console.log("Order items:", items.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal
    })));

    // Recalculate totals based on order items
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    console.log("New calculated totals:", {
      subtotal,
      tax,
      shipping,
      total
    });

    // Update the order with recalculated totals
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        subtotal,
        tax,
        shipping_cost: shipping,
        total,
      },
      { new: true }
    ).lean();

    if (updatedOrder) {
      console.log("Order totals updated successfully!");
      console.log("Final totals:", {
        subtotal: updatedOrder.subtotal,
        tax: updatedOrder.tax,
        shipping: updatedOrder.shipping_cost,
        total: updatedOrder.total
      });
    } else {
      console.error("Failed to update order");
    }

  } catch (error) {
    console.error("Error fixing order:", error);
  }
}

// Run the fix
fixSpecificOrder().then(() => {
  console.log("Fix completed");
  process.exit(0);
}).catch((error) => {
  console.error("Fix failed:", error);
  process.exit(1);
});