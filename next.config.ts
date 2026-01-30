import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Allow all HTTPS domains explicitly to avoid broken images
      { protocol: 'http', hostname: '**' }, // Allow HTTP for development/localhost
    ],
  },
};

export default nextConfig;
