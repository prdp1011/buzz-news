import type { NextConfig } from "next";
import path from "node:path";
import { config } from "dotenv";

// Load root .env so OPENAI_API_KEY etc. are available to API routes
const cwd = process.cwd();
const envPath = path.basename(cwd) === "admin"
  ? path.resolve(cwd, "../../.env")
  : path.resolve(cwd, ".env");
config({ path: envPath });

const nextConfig: NextConfig = {
  transpilePackages: ["database", "shared"],
  output: "standalone",
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
