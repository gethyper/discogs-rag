import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
      },
      {
        protocol: 'https',
        hostname: 'st.discogs.com',
      },
      {
        protocol: 'https',
        hostname: 's.discogs.com',
      },
    ],
  },
};

export default nextConfig;
