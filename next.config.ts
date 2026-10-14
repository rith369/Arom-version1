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
    ];
  },
};

export default nextConfig;
