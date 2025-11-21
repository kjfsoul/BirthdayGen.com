/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
