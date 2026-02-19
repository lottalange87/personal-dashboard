import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/dashboard',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
