import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/maxliu.github.io",
  assetPrefix: "/maxliu.github.io",
};

export default nextConfig;
