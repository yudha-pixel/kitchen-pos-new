import type { NextConfig } from "next";
import withPWA from "next-pwa";
import { LEGACY_ROUTE_REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Silence Turbopack warning
  allowedDevOrigins: ['192.168.1.36'],
  async redirects() {
    return [...LEGACY_ROUTE_REDIRECTS];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
