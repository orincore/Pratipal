"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Curated list of common dial codes — not the full ISO-3166 set, but covers
// the countries this store's customers realistically ship/travel from.
// India first since it's the primary market.
export const COUNTRY_CODES: { code: string; dial: string; flag: string; name: string }[] = [
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "NZ", dial: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "MY", dial: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "ID", dial: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "TH", dial: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "PH", dial: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "VN", dial: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "HK", dial: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "China" },
  { code: "NP", dial: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "BD", dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "LK", dial: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "SE", dial: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "IE", dial: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "KE", dial: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "Mexico" },
];

const DEFAULT_DIAL = "+91";

// Dial codes sorted longest-first so e.g. "+971..." isn't misread as "+9"
// (not a real code here, but keeps prefix matching correct in general).
const DIALS_BY_LENGTH = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);

function parsePhone(value: string | undefined | null): { dial: string; local: string } {
  const trimmed = (value || "").trim();
  if (!trimmed) return { dial: DEFAULT_DIAL, local: "" };
  if (trimmed.startsWith("+")) {
    const match = DIALS_BY_LENGTH.find((c) => trimmed.startsWith(c.dial));
    if (match) {
      return { dial: match.dial, local: trimmed.slice(match.dial.length).trim() };
    }
    // Unrecognized "+" prefix — leave it alone rather than mangling it.
    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx > 0) {
      return { dial: trimmed.slice(0, spaceIdx), local: trimmed.slice(spaceIdx + 1).trim() };
    }
    return { dial: DEFAULT_DIAL, local: trimmed };
  }
  // No dial code in the stored value (e.g. legacy data) — assume default
  // market and treat the whole thing as the local number.
  return { dial: DEFAULT_DIAL, local: trimmed };
}

export interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  name?: string;
}

// Drop-in replacement for `<Input type="tel">` — same single `value`/
// `onChange` contract (a plain string like "+91 98765 43210"), but split
// into a country-code dropdown + local-number field. Existing callers don't
// need to change their state shape, just swap the element.
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ id, value, onChange, placeholder = "98765 43210", required, disabled, autoFocus, className, style, name }, ref) => {
    const initial = parsePhone(value);
    const [dial, setDial] = React.useState(initial.dial);
    const [local, setLocal] = React.useState(initial.local);
    const lastEmitted = React.useRef(value);

    // Re-sync from the parent only when it changes the value out from under
    // us (e.g. loading a saved profile) — not on every keystroke we emit
    // ourselves, or the cursor would jump around while typing.
    React.useEffect(() => {
      if (value === lastEmitted.current) return;
      const parsed = parsePhone(value);
      setDial(parsed.dial);
      setLocal(parsed.local);
      lastEmitted.current = value;
    }, [value]);

    function emit(nextDial: string, nextLocal: string) {
      const combined = nextLocal ? `${nextDial} ${nextLocal}`.trim() : "";
      lastEmitted.current = combined;
      onChange(combined);
    }

    return (
      <div className={cn("flex gap-2", className)} style={style}>
        <select
          aria-label="Country code"
          value={dial}
          disabled={disabled}
          onChange={(e) => {
            setDial(e.target.value);
            emit(e.target.value, local);
          }}
          className="flex h-10 w-[78px] sm:w-[92px] flex-shrink-0 rounded-md border border-input bg-background px-1.5 sm:px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <input
          ref={ref}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          value={local}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          placeholder={placeholder}
          onChange={(e) => {
            setLocal(e.target.value);
            emit(dial, e.target.value);
          }}
          className="flex h-10 w-full min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";
