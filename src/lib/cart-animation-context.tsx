"use client";

import React, { createContext, useContext, useRef, useCallback, useState } from "react";

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image?: string;
}

interface CartAnimationContextValue {
  cartIconRef: React.RefObject<HTMLButtonElement>;
  triggerFly: (sourceEl: HTMLElement, image?: string) => void;
  popCount: number;
}

const CartAnimationContext = createContext<CartAnimationContextValue | null>(null);

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<FlyingParticle[]>([]);
  const [popCount, setPopCount] = useState(0);
  const counterRef = useRef(0);

  const triggerFly = useCallback((sourceEl: HTMLElement, image?: string) => {
    const cartEl = cartIconRef.current;
    if (!cartEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const dstRect = cartEl.getBoundingClientRect();

    const startX = srcRect.left + srcRect.width / 2;
    const startY = srcRect.top + srcRect.height / 2;
    const endX = dstRect.left + dstRect.width / 2;
    const endY = dstRect.top + dstRect.height / 2;

    const id = ++counterRef.current;
    setParticles((prev) => [...prev, { id, startX, startY, endX, endY, image }]);

    // Remove particle and pop cart icon after animation (~700ms)
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
      setPopCount((c) => c + 1);
    }, 700);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ cartIconRef, triggerFly, popCount }}>
      {children}
      {/* Flying particles rendered at root level */}
      {particles.map((p) => (
        <FlyingParticle key={p.id} {...p} />
      ))}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const ctx = useContext(CartAnimationContext);
  if (!ctx) {
    // Return a no-op fallback so components outside the provider don't crash
    return {
      cartIconRef: { current: null } as React.RefObject<HTMLButtonElement>,
      triggerFly: () => {},
      popCount: 0,
    };
  }
  return ctx;
}

function FlyingParticle({ startX, startY, endX, endY, image }: FlyingParticle) {
  const dx = endX - startX;
  const dy = endY - startY;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: startX,
        top: startY,
        transform: "translate(-50%, -50%)",
        animation: "cart-fly 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        // CSS custom properties for the keyframe
        ["--dx" as any]: `${dx}px`,
        ["--dy" as any]: `${dy}px`,
      }}
    >
      <div
        style={{
          animation: "cart-fly-scale 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="h-10 w-10 rounded-xl object-cover shadow-lg border-2 border-white"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
