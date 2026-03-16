"use client";

import { useEffect } from "react";
import { useHeaderTheme } from "@/lib/header-theme-context";

/**
 * Drop this at the top of any page that has a dark hero behind the header.
 * It signals the header to use white text/icons.
 * Automatically resets to "light" on unmount.
 */
export function DarkHeroPage() {
  const { setTheme } = useHeaderTheme();
  useEffect(() => {
    setTheme("dark");
    return () => setTheme("light");
  }, [setTheme]);
  return null;
}
