import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gokwdpupeojyyincdroa.supabase.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '**' }, // Fallback for other https domains
      { protocol: 'http', hostname: '**' }, //  Fallback for local http
    ],
  },
};

export default nextConfig;
