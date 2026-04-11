import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    rules: {
      // Handle WASM files
      "*.wasm": {
        loaders: ["file-loader"],
        as: "*.wasm",
      },
    },
  },
  // For compatibility with older Webpack-based setups, we can also include webpack config
  // but since Turbopack is default, we'll keep it empty or removed.
  // If you prefer to keep using Webpack, add `webpack: (config) => config` and run with `--webpack`
  allowedDevOrigins: ["192.168.0.21", "localhost"],
};

export default nextConfig;