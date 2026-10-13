import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: the footer year relies on "use cache" (see Footer.tsx).
  cacheComponents: true,
};

export default nextConfig;
