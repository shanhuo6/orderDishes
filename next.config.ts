import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 允许加载本地 public/ 目录的图片
    unoptimized: true,
  },
};

export default nextConfig;
