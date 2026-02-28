import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["database", "shared"],
  output: "standalone",
};

export default nextConfig;
