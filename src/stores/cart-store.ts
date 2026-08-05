"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, id?: string) => void;
  removeItem: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Helper to ensure product has all required fields
function sanitizeProduct(product: Product): Product {
  try {
    return {
      id: product.id || '',
      name: product.name || 'Unknown Product',
      slug: product.slug || '',
      category: product.category || 'candles',
      price: typeof product.price === 'number' ? product.price : 0,
      shortDescription: product.shortDescription || '',
      image: product.image || '/placeholder.jpg',
      status: product.status || 'active',
      landingPages: Array.isArray(product.landingPages) ? product.landingPages : [],
      homepageSection: product.homepageSection,
      weight: product.weight,
    };
  } catch (error) {
    console.error('Error sanitizing product:', error, product);
    return {
      id: '',
      name: 'Unknown Product',
      slug: '',
      category: 'candles',
      price: 0,
      shortDescription: '',
      image: '/placeholder.jpg',
      status: 'active',
      landingPages: [],
    };
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, id) => {
        try {
          const sanitized = sanitizeProduct(product);

          set((state) => {
            const existing = state.items.find(
              (item) => item.product.id === sanitized.id
            );

            if (existing) {
              const newItems = state.items.map((item) =>
                item.product.id === sanitized.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
              return { items: newItems };
            }

            const newItems = [...state.items, { id: id || sanitized.id, product: sanitized, quantity: 1 }];
            return { items: newItems };
          });
        } catch (error) {
          console.error('Error adding item to cart:', error);
        }
      },
      removeItem: (identifier) => {
        try {
          set((state) => ({
            items: state.items.filter(
              (item) => item.id !== identifier && item.product.id !== identifier
            ),
          }));
        } catch (error) {
          console.error('Error removing item:', error);
        }
      },
      updateQuantity: (identifier, quantity) => {
        try {
          if (quantity <= 0) {
            get().removeItem(identifier);
            return;
          }
          set((state) => ({
            items: state.items.map((item) =>
              item.id === identifier || item.product.id === identifier
                ? { ...item, quantity }
                : item
            ),
          }));
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      },
      clearCart: () => {
        try {
          set({ items: [] });

          // zustand's persist middleware writes to localStorage on the next
          // microtask, not synchronously — a caller that reads localStorage
          // right after clearCart() can still see the old items. Double-check
          // shortly after and force it in sync if it didn't take.
          setTimeout(() => {
            try {
              const stored = localStorage.getItem('pratipal-cart');
              if (!stored) return;
              const parsed = JSON.parse(stored);
              if (parsed?.state?.items?.length > 0) {
                localStorage.setItem('pratipal-cart', JSON.stringify({
                  ...parsed,
                  state: { items: [] },
                }));
              }
            } catch (e) {
              console.error('Error force clearing localStorage:', e);
            }
          }, 100);
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      },
      setItems: (items) => {
        try {
          const sanitizedItems = items.map(item => ({
            ...item,
            product: sanitizeProduct(item.product)
          }));
          set({ items: sanitizedItems });
        } catch (error) {
          console.error('Error setting items:', error);
        }
      },
      getTotal: () => {
        try {
          return get().items.reduce(
            (total, item) => total + (item.product.price || 0) * item.quantity,
            0
          );
        } catch (error) {
          console.error('Error calculating total:', error);
          return 0;
        }
      },
      getItemCount: () => {
        try {
          const count = get().items.reduce((count, item) => count + item.quantity, 0);
          return count;
        } catch (error) {
          return 0;
        }
      },
    }),
    {
      name: "pratipal-cart",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        try {
          if (version < 2) {
            const items = (persistedState?.items || []).map((item: any) => ({
              ...item,
              product: sanitizeProduct(item.product)
            }));
            return { items };
          }
          return persistedState;
        } catch (error) {
          console.error('Error migrating cart:', error);
          return { items: [] };
        }
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating cart:', error);
          }
        };
      },
      // Add partialize to ensure we only persist what we need
      partialize: (state) => ({ items: state.items }),
    }
  )
);
