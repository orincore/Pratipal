"use client";

import React from "react";
import { useCartStore } from "@/stores/cart-store";

export function CartDebug() {
  const { items, getItemCount, getTotal, clearCart } = useCartStore();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleClearCart = () => {
    clearCart();
    // Also clear server cart
    fetch('/api/cart/clear', { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log('Server cart cleared:', data))
      .catch(console.warn);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Cart Debug</h3>
      <p>Items: {getItemCount()}</p>
      <p>Total: ${getTotal().toFixed(2)}</p>
      <p>LocalStorage: {typeof window !== 'undefined' && localStorage.getItem('pratipal-cart') ? 'Present' : 'Missing'}</p>
      <button 
        onClick={handleClearCart}
        className="mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
      >
        Clear Cart
      </button>
      <details className="mt-2">
        <summary className="cursor-pointer">Items ({items.length})</summary>
        <pre className="mt-1 text-xs overflow-auto max-h-32">
          {JSON.stringify(items, null, 2)}
        </pre>
      </details>
    </div>
  );
}