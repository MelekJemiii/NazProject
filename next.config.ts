import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // cacheComponents (PPR) intentionally left OFF: this app reads per-request
  // Supabase auth throughout, which doesn't fit the cached-by-default model
  // without extensive Suspense boundaries. Adopt it deliberately later.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      // Brand illustrations (Higgsfield CDN) — see src/lib/illustrations.ts
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
        pathname: "/user_3Km3PeOIcRa6RJV8EoG95ZC6TzG/**",
      },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost }]
        : []),
    ],
  },
};

export default nextConfig;
