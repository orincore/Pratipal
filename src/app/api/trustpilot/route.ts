import { NextResponse } from "next/server";

const TP_URL = "https://www.trustpilot.com/review/pratipal.in";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

let cache: { data: TrustpilotData; ts: number } | null = null;

export interface TrustpilotReview {
  id: string;
  title: string;
  text: string;
  rating: number;
  date: string;
  consumer: {
    name: string;
    countryCode: string;
    imageUrl: string | null;
    hasImage: boolean;
  };
  verified: boolean;
}

export interface TrustpilotData {
  businessName: string;
  trustScore: number;
  totalReviews: number;
  stars: number;
  reviews: TrustpilotReview[];
}

async function fetchFromTrustpilot(): Promise<TrustpilotData> {
  const res = await fetch(TP_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Trustpilot fetch failed: ${res.status}`);

  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error("__NEXT_DATA__ not found");

  const nextData = JSON.parse(match[1]);
  const props = nextData?.props?.pageProps ?? {};
  const bu = props.businessUnit ?? {};
  const rawReviews: any[] = props.reviews ?? [];

  const reviews: TrustpilotReview[] = rawReviews
    .filter((r: any) => !r.filtered && !r.isPending && r.text)
    .map((r: any) => ({
      id: r.id,
      title: r.title ?? "",
      text: r.text ?? "",
      rating: r.rating ?? 5,
      date: r.dates?.publishedDate ?? r.dates?.experiencedDate ?? "",
      consumer: {
        name: r.consumer?.displayName ?? "Anonymous",
        countryCode: r.consumer?.countryCode ?? "",
        imageUrl: r.consumer?.hasImage ? r.consumer.imageUrl : null,
        hasImage: r.consumer?.hasImage ?? false,
      },
      verified: r.labels?.verification?.isVerified ?? false,
    }));

  return {
    businessName: bu.displayName ?? "Pratipal",
    trustScore: bu.trustScore ?? 0,
    totalReviews: bu.numberOfReviews ?? reviews.length,
    stars: bu.stars ?? bu.trustScore ?? 0,
    reviews,
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }
    const data = await fetchFromTrustpilot();
    cache = { data, ts: now };
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
