import type { NextConfig } from "next";

const isProdPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isProdPages ? "export" : undefined,
  basePath: isProdPages ? "/dongguk-e-eum" : "",
  assetPrefix: isProdPages ? "/dongguk-e-eum/" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
