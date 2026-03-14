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
          console.log('Adding item to cart:', product);
          const sanitized = sanitizeProduct(product);
          console.log('Sanitized product:', sanitized);
          
          set((state) => {
            const existing = state.items.find(
              (item) => item.product.id === sanitized.id
            );
            
            if (existing) {
              console.log('Item exists, incrementing quantity');
              const newItems = state.items.map((item) =>
                item.product.id === sanitized.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
              console.log('Updated cart items:', newItems);
              return { items: newItems };
            }
            
            console.log('Adding new item to cart');
            const newItems = [...state.items, { id: id || sanitized.id, product: sanitized, quantity: 1 }];
            console.log('New cart items:', newItems);
            return { items: newItems };
          });
          
          // Log cart state after update
          setTimeout(() => {
            const currentState = get();
            console.log('Cart state after add:', currentState.items);
            console.log('Total items:', currentState.getItemCount());
            console.log('Total price:', currentState.getTotal());
            
            // Force a re-render by checking localStorage
            const stored = localStorage.getItem('pratipal-cart');
            console.log('LocalStorage cart:', stored);
          }, 100);
        } catch (error) {
          console.error('Error adding item to cart:', error);
        }
      },
      removeItem: (identifier) => {
        try {
          console.log('Removing item:', identifier);
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
          console.log('Clearing cart');
          set({ items: [] });
          
          // Force immediate localStorage update
          setTimeout(() => {
            const stored = localStorage.getItem('pratipal-cart');
            console.log('LocalStorage after clear:', stored);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.state && parsed.state.items && parsed.state.items.length > 0) {
                  console.log('Force clearing localStorage');
                  localStorage.setItem('pratipal-cart', JSON.stringify({
                    ...parsed,
                    state: { items: [] }
                  }));
                }
              } catch (e) {
                console.error('Error force clearing localStorage:', e);
              }
            }
          }, 100);
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      },
      setItems: (items) => {
        try {
          console.log('Setting cart items:', items);
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
          console.log('Getting item count:', count, 'from items:', get().items);
          return count;
        } catch (error) {
          console.error('Error counting items:', error);
          return 0;
        }
      },
    }),
    {
      name: "pratipal-cart",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        console.log('Migrating cart from version:', version);
        try {
          if (version < 2) {
            const items = (persistedState?.items || []).map((item: any) => ({
              ...item,
              product: sanitizeProduct(item.product)
            }));
            console.log('Migrated items:', items);
            return { items };
          }
          return persistedState;
        } catch (error) {
          console.error('Error migrating cart:', error);
          return { items: [] };
        }
      },
      onRehydrateStorage: () => {
        console.log('Rehydrating cart from localStorage');
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating cart:', error);
          } else {
            console.log('Cart rehydrated successfully:', state?.items);
            console.log('Cart item count:', state?.getItemCount());
          }
        };
      },
      // Add partialize to ensure we only persist what we need
      partialize: (state) => ({ items: state.items }),
    }
  )
);
