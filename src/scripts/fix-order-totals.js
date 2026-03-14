// Simple script to fix order totals for a specific order
// Usage: node scripts/fix-order-totals.js <orderId>

const orderId = process.argv[2];

if (!orderId) {
  console.error('Please provide an order ID');
  console.error('Usage: node scripts/fix-order-totals.js <orderId>');
  process.exit(1);
}

async function fixOrderTotals(orderId) {
  try {
    const response = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add admin authentication here
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to recalculate order totals');
    }

    const result = await response.json();
    console.log('Order totals fixed successfully:');
    console.log('Changes:', result.changes);
    console.log('New totals:');
    console.log(`Subtotal: ₹${result.order.subtotal.toFixed(2)}`);
    console.log(`Tax: ₹${result.order.tax.toFixed(2)}`);
    console.log(`Shipping: ₹${result.order.shipping_cost.toFixed(2)}`);
    console.log(`Total: ₹${result.order.total.toFixed(2)}`);
  } catch (error) {
    console.error('Error fixing order totals:', error.message);
  }
}

fixOrderTotals(orderId);