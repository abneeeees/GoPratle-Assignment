import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is not part of this deliverable; TypeScript is the gate.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
