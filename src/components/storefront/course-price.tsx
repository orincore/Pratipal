import { formatPrice } from "@/lib/utils";

type Variant = "card" | "compact" | "detail" | "bar";

interface CoursePriceProps {
  /** What the customer pays (the discounted price). */
  price: number;
  /** Optional higher "sale" price, shown crossed out. */
  originalPrice?: number | null;
  variant?: Variant;
  /** "dark" for use on the gradient hero / modal header. */
  tone?: "light" | "dark";
  className?: string;
}

export function getDiscount(price: number, originalPrice?: number | null) {
  if (typeof originalPrice !== "number" || !(originalPrice > price)) return null;
  const amount = originalPrice - price;
  const percent = Math.max(1, Math.round((amount / originalPrice) * 100));
  return { amount, percent };
}

const GRADIENT_TEXT = "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent";
const PILL =
  "inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold uppercase tracking-wide shadow-sm";

/**
 * `price` is the discounted price; `originalPrice` is the optional higher
 * sale price. The strike-through, % badge and savings only render when
 * originalPrice is actually higher than price.
 */
export function CoursePrice({
  price,
  originalPrice,
  variant = "card",
  tone = "light",
  className = "",
}: CoursePriceProps) {
  const d = getDiscount(price, originalPrice);
  const dark = tone === "dark";
  const strike = `line-through decoration-rose-500 decoration-2 ${dark ? "text-white/70" : "text-slate-400"}`;

  if (variant === "bar" || variant === "compact") {
    return (
      <div className={`flex items-baseline gap-1.5 whitespace-nowrap ${className}`}>
        <span className={`${variant === "bar" ? "text-xl" : "text-base"} font-extrabold ${dark ? "text-white" : "text-teal-700"}`}>
          {formatPrice(price)}
        </span>
        {d && <span className={`text-xs ${strike}`}>{formatPrice(originalPrice!)}</span>}
        {d && variant === "bar" && <span className="text-[11px] font-bold text-emerald-600">{d.percent}% off</span>}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={className}>
        {d && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`${PILL} text-xs px-2.5 py-1`}>{d.percent}% off</span>
            <span className={`text-sm font-semibold ${dark ? "text-emerald-200" : "text-emerald-700"}`}>
              You save {formatPrice(d.amount)}
            </span>
          </div>
        )}
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-extrabold leading-none ${dark ? "text-emerald-200" : GRADIENT_TEXT}`}>
            {formatPrice(price)}
          </span>
          {d && <span className={`text-xl pb-0.5 ${strike}`}>{formatPrice(originalPrice!)}</span>}
        </div>
      </div>
    );
  }

  // card — fixed block height so "Learn More" buttons stay aligned whether or not a course is discounted
  return (
    <div className={`flex flex-col justify-end min-h-[3.75rem] ${className}`}>
      {d && (
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm ${strike}`}>{formatPrice(originalPrice!)}</span>
          <span className={`${PILL} text-[10px] px-2 py-0.5`}>{d.percent}% off</span>
        </div>
      )}
      <span className={`text-3xl font-extrabold leading-none ${dark ? "text-white" : GRADIENT_TEXT}`}>
        {formatPrice(price)}
      </span>
    </div>
  );
}

/** Corner ribbon for course images, e.g. "40% OFF". Renders nothing without a real discount. */
export function DiscountRibbon({
  price,
  originalPrice,
  className = "",
}: {
  price: number;
  originalPrice?: number | null;
  className?: string;
}) {
  const d = getDiscount(price, originalPrice);
  if (!d) return null;
  return (
    <span
      className={`absolute z-10 ${PILL} text-xs px-3 py-1.5 ring-2 ring-white/80 ${className}`}
    >
      {d.percent}% off
    </span>
  );
}
