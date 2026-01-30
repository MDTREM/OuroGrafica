import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'assets.rbl.ms' },
      { protocol: 'https', hostname: 'mediaserver.goepson.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'www.xerox.com' },
      { protocol: 'https', hostname: '**.supabase.co' }, // Wildcard for supabase projects
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google Profiles
    ],
  },
};

export default nextConfig;
