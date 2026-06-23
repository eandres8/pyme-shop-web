import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [process.env.NEXT_PUBLIC_BASE_URL!],
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
};

export default nextConfig;
