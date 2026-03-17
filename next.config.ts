import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gokwdpupeojyyincdroa.supabase.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'down-br.img.susercontent.com' },
      { protocol: 'https', hostname: '**' }, // Fallback for other https domains
      { protocol: 'http', hostname: '**' }, //  Fallback for local http
    ],
    unoptimized: true,
  },
};

export default nextConfig;
