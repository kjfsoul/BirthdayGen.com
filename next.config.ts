import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep React strict mode
  reactStrictMode: true,

  // Standalone output for deployment (keeps dynamic features)
  output: 'standalone',

  // Properly trace all dependencies including dynamic ones
  outputFileTracingRoot: process.cwd(),

  // Include all files needed for autosend route
  outputFileTracingIncludes: {
    '/autosend': ['./src/app/**/*', './src/lib/**/*', './prisma/**/*'],
    '/api/*': ['./src/app/api/**/*', './src/lib/**/*', './prisma/**/*'],
  },

  // Exclude unnecessary files from tracing
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },

  // Don't optimize away dynamic features
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Keep all dynamic imports and server features
      config.externals = [...(config.externals || [])];
    }

    // Add webpack config to help with module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
