import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@fwty/shared", "@fwty/database"],
  outputFileTracingRoot: path.join(appDir, "../.."),
};

export default nextConfig;
