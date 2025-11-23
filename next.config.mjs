/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stable build configuration (MEMORY_PROCEDURES.md Section 13)
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
