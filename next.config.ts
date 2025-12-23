import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

export default nextConfig;
