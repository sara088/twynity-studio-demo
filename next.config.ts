import type { NextConfig } from "next";

// Static export of the whole app — every route, no server. GitHub Pages serves
// from /<repo>, so BASE_PATH is set by the deploy script and empty in dev.
const base = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: base,
  assetPrefix: base || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: base },
};

export default nextConfig;
