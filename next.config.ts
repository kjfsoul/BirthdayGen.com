import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Only ignore build errors in development for faster iteration
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  // Remove webpack overrides that disable hot reloading
  eslint: {
    // Only ignore ESLint during builds in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
