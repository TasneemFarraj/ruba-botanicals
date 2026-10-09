import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's image-optimization quota is exhausted (402 on /_next/image),
    // so serve images straight from Supabase / public instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
