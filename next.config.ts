import type { NextConfig } from "next";
import withPWA from "next-pwa";
import { LEGACY_ROUTE_REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Silence Turbopack warning
  images: {
    // Product/QRIS/receipt images are arbitrary URLs staff paste in, and the
    // capture previews are data:/blob: URLs — neither can go through the Next
    // optimizer (it needs an allow-listed host, and rejects data:/blob:
    // outright). Allow-listing '**' would turn this box into an open image
    // proxy, which is the wrong trade for a LAN-deployed POS. So: no
    // optimization, but next/image still gives lazy loading and reserved
    // dimensions, which is what these call sites were missing.
    unoptimized: true,
  },
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
