import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Enable WebAssembly experiments
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Prevent Webpack from trying to bundle the .wasm file
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
  // Optional: if accessing via network IP, add allowedDevOrigins
  allowedDevOrigins: ['192.168.0.21', 'localhost'],
};

export default nextConfig;