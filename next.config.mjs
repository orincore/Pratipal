/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Product/course/blog images are uploaded as-is (some several MB, far
    // larger than their ~300-470px display size) — with optimization
    // disabled every one of those was shipped to the browser at full
    // original size, which PageSpeed flagged as 40+ MB of avoidable image
    // weight on a single page. `sharp` is present in node_modules (Next's
    // optimizer auto-detects and uses it), so re-enabling this lets Next
    // resize/recompress/reformat on the fly instead. Verify on staging
    // after deploy — this is the one thing here that touches the server's
    // runtime request path, not just build output.
    formats: ["image/avif", "image/webp"],
    // Next validates <Image quality={n}> against this allowlist —
    // components pass 90 for a few above-the-fold images, which isn't in
    // the default [75] list.
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
