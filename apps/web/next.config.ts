import type { NextConfig } from "next";
import path from "node:path";
import { config } from "dotenv";

const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

// Load root .env so DATABASE_URL is available (monorepo: .env is at repo root)
const cwd = process.cwd();
const envPath = path.basename(cwd) === "web"
  ? path.resolve(cwd, "../../.env")
  : path.resolve(cwd, ".env");
config({ path: envPath });

const nextConfig: NextConfig = {
  transpilePackages: ["database", "shared"],
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  async redirects() {
    return [{ source: "/topic/:slug", destination: "/quiz/:slug", permanent: true }];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins ?? []), new PrismaPlugin()];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
