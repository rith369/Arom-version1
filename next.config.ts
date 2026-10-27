import type { NextConfig } from "next";

// Professional photos are served from the public Supabase storage bucket.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
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
