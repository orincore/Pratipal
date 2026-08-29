import { cn } from "@/lib/utils";

/**
 * Loading-skeleton primitives.
 *
 * Deliberately plain markup with no "use client" directive, so the same pieces
 * compose both the route-level loading.tsx files (server components, shown
 * while a page streams in) and the client pages that fetch their own data and
 * used to render a centred spinner.
 *
 * The visual treatment lives in globals.css under `.sk` — a brand-tinted sweep
 * whose colours differ per site. See the note there.
 */

/**
 * `index` staggers this block within the sweep. Give blocks their reading-order
 * position and the highlight crosses the layout as one wave; leave it off and
 * everything pulses in unison, which reads as noise.
 */
type SkeletonProps = {
  className?: string;
  index?: number;
  style?: React.CSSProperties;
};

export function Skeleton({ className, index = 0, style }: SkeletonProps) {
  return (
    <div
      className={cn("sk rounded-lg", className)}
      style={{ ["--sk-i" as string]: index, ...style }}
    />
  );
}

/**
 * Paragraph placeholder. The last line is short because real paragraphs end
 * mid-measure — equal-length bars are the tell of a careless skeleton.
 */
export function SkeletonText({
  lines = 3,
  className,
  index = 0,
  lineClassName,
}: SkeletonProps & { lines?: number; lineClassName?: string }) {
  const widths = ["w-full", "w-[96%]", "w-[88%]", "w-[92%]", "w-[84%]"];
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          index={index + i}
          className={cn(
            "h-3.5 rounded-full",
            i === lines - 1 ? "w-[55%]" : widths[i % widths.length],
            lineClassName
          )}
        />
      ))}
    </div>
  );
}

/** Pill for a tag, badge, price chip or filter control. */
export function SkeletonPill({ className, index = 0 }: SkeletonProps) {
  return <Skeleton index={index} className={cn("h-8 w-24 rounded-full", className)} />;
}

/**
 * The card shape shared by the shop, course and blog grids: media on top, a
 * title, a couple of meta lines and a footer row.
 */
export function SkeletonCard({
  index = 0,
  media = "aspect-[4/3]",
  lines = 2,
  footer = true,
  className,
}: SkeletonProps & { media?: string; lines?: number; footer?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 shadow-sm",
        className
      )}
    >
      <Skeleton index={index} className={cn("w-full rounded-none", media)} />
      <div className="space-y-3 p-4 sm:p-5">
        <Skeleton index={index + 1} className="h-4 w-[70%] rounded-full" />
        <SkeletonText lines={lines} index={index + 2} />
        {footer && (
          <div className="flex items-center justify-between pt-2">
            <Skeleton index={index + 4} className="h-5 w-20 rounded-full" />
            <Skeleton index={index + 5} className="h-9 w-24 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Wrapper every page skeleton goes through.
 *
 * Announces the wait once to assistive tech rather than letting a screen reader
 * walk dozens of meaningless empty blocks: the blocks are hidden and a single
 * polite status message carries the meaning.
 */
export function SkeletonScreen({
  children,
  label = "Loading",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
