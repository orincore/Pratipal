"use client";

import { useEffect, useRef } from "react";

interface TrustpilotWidgetProps {
  businessUnitId: string;
  /** Trustpilot template IDs:
   *  Carousel:    5406e65db0d04a09e042d5fc
   *  Mini:        53aa8807dec7e10d38f59f32
   *  Horizontal:  5406e65db0d04a09e042d5fc
   *  Grid:        539adbd6dec7e10e686debee
   */
  templateId?: string;
  locale?: string;
  theme?: "light" | "dark";
  height?: string;
}

export function TrustpilotWidget({
  businessUnitId,
  templateId = "5406e65db0d04a09e042d5fc", // Carousel
  locale = "en-US",
  theme = "light",
  height = "140px",
}: TrustpilotWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-initialize after client navigation — Trustpilot's bootstrap script
    // only auto-runs on initial page load.
    if (ref.current && (window as any).Trustpilot) {
      (window as any).Trustpilot.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={height}
      data-style-width="100%"
      data-theme={theme}
      data-stars="4,5"
    >
      {/* Fallback link shown before script loads */}
      <a
        href={`https://www.trustpilot.com/review/pratipal.in`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-emerald-600 underline"
      >
        Read our reviews on Trustpilot
      </a>
    </div>
  );
}
