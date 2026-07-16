"use client";

import React, { createContext, useContext } from "react";

export interface DashboardLayoutContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // When true, <main> drops its padding entirely so a page's own
  // viewport-height container (h-[calc(100vh-3.5rem)]) isn't pushed taller
  // than the visible area by that padding — which is what caused the page
  // to scroll instead of the editor canvas fitting flush.
  fullBleed: boolean;
  setFullBleed: (fullBleed: boolean) => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | undefined>(undefined);

export const DashboardLayoutProvider = DashboardLayoutContext.Provider;

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) {
    throw new Error("useDashboardLayout must be used within DashboardLayoutProvider");
  }
  return ctx;
}
