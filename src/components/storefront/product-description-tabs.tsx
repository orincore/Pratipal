"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AdditionalInfoItem {
  label: string;
  value: string;
}

interface ProductDescriptionTabsProps {
  description?: string;
  additionalInfo?: AdditionalInfoItem[];
  reviewsCount?: number;
}

const TABS = [
  { id: "description", label: "Description" },
  { id: "info", label: "Additional Information" },
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDescriptionTabs({
  description,
  additionalInfo = [],
  reviewsCount = 0,
}: ProductDescriptionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  function renderContent() {
    switch (activeTab) {
      case "info":
        return additionalInfo.length ? (
          <dl className="grid gap-4 md:grid-cols-2">
            {additionalInfo.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4">
                <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.label}</dt>
                <dd className="mt-2 text-base font-semibold text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No additional information available.</p>
        );
      case "reviews":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {reviewsCount > 0
                ? `${reviewsCount} customer review${reviewsCount === 1 ? "" : "s"} available soon.`
                : "Be the first to review this product. Reviews will appear here once submitted."}
            </p>
            <button className="inline-flex items-center rounded-full border border-gray-900 px-6 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white">
              Write a review
            </button>
          </div>
        );
      case "description":
      default:
        if (!description) {
          return <p className="text-sm text-muted-foreground">No description provided.</p>;
        }
        return (
          <div
            className="prose prose-neutral max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        );
    }
  }

  return (
    <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-4 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition",
              activeTab === tab.id
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.id === "reviews" && reviewsCount > 0 && (
              <span className="ml-2 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
                {reviewsCount}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute inset-x-4 -bottom-px h-0.5 bg-gray-900" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">{renderContent()}</div>
    </section>
  );
}
