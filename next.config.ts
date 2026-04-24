import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  webpack: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      { "utf-8-validate": "commonjs utf-8-validate", bufferutil: "commonjs bufferutil" },
    ];
    return config;
  },
};

export default nextConfig;
