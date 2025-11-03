import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint enabled for development
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type-check errors during builds
    ignoreBuildErrors: false,
  },
}

export default nextConfig;
