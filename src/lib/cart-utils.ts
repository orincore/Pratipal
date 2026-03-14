import { useCartStore } from "@/stores/cart-store";

/**
 * Clear both client-side and server-side cart
 */
export async function clearAllCarts() {
  try {
    // Clear client-side cart
    const clearCart = useCartStore.getState().clearCart;
    clearCart();
    
    // Clear server-side cart
    await fetch('/api/cart/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.warn('Failed to clear server cart:', error);
      // Don't throw error as client cart is already cleared
    });
    
    console.log('All carts cleared successfully');
  } catch (error) {
    console.error('Error clearing carts:', error);
  }
}

/**
 * Clear only client-side cart (for immediate UI feedback)
 */
export function clearClientCart() {
  try {
    const clearCart = useCartStore.getState().clearCart;
    clearCart();
    console.log('Client cart cleared');
  } catch (error) {
    console.error('Error clearing client cart:', error);
  }
}