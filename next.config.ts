import type { NextConfig } from "next";

// Professional photos are served from the public Supabase storage bucket.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/*
 * Security headers for every page (BACKEND-HANDOFF.md section 45).
 *
 * The content policy (CSP) lists the only places the app may load from: AROM
 * itself, Supabase (photos, files, login) and OpenStreetMap (clinic map tiles).
 * It starts in report only mode: browsers report what it would block, through
 * /api/csp-report, without blocking anything. Switch CSP_ENFORCE to true once
 * the reports show nothing real would break.
 */
const CSP_ENFORCE = false;
const isProduction = process.env.NODE_ENV === "production";
// The Vercel toolbar on previews loads from vercel.live.
const isPreview = process.env.VERCEL_ENV === "preview";
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";
const vercelLive = isPreview ? " https://vercel.live" : "";

const contentPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin} https://tile.openstreetmap.org https://*.tile.openstreetmap.org${vercelLive}`,
  `media-src 'self' blob: data: ${supabaseOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin}${vercelLive}${isProduction ? "" : " ws: wss:"}`,
  `frame-src 'self'${vercelLive}`,
  "frame-ancestors 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(CSP_ENFORCE ? ["upgrade-insecure-requests"] : []),
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: contentPolicy },
  // Other sites cannot show AROM inside a frame (clickjacking). Its own previews still can.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Microphone for voice messages and journaling, location for nearby clinics. Nothing else.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(self), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/professional-photos/**",
          },
        ]
      : [],
  },
  async redirects() {
    return [
      {
        source: "/therapist",
        destination: "/professional",
        permanent: true,
      },
      {
        source: "/therapist/:slug*",
        destination: "/professional/:slug*",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/profile",
        permanent: true,
      },
      // Older links (and tasks already saved in Your Plan For Today) used these.
      {
        source: "/practice",
        destination: "/mindguide/practice",
        permanent: true,
      },
      {
        source: "/tips",
        destination: "/mindguide/tips",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/mindguide/learn",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
