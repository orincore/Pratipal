import { Loader2 } from "lucide-react";

/** Full-page centered spinner for admin pages */
export function AdminLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/** Skeleton row for table-style pages */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 rounded bg-gray-100 animate-pulse"
              style={{ flex: j === 0 ? "0 0 40px" : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton grid for card-style pages */
export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-48 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" />
      ))}
    </div>
  );
}
