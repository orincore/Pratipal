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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, id) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.id === id || item.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item === existing
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { id, product, quantity: 1 }],
          };
        });
      },
      removeItem: (identifier) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== identifier && item.product.id !== identifier
          ),
        }));
      },
      updateQuantity: (identifier, quantity) => {
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
      },
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "pratipal-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
