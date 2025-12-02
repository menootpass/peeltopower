import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      // Add your custom domain if you're using one for R2
      ...(process.env.R2_PUBLIC_URL 
        ? [{
            protocol: 'https' as const,
            hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
          }]
        : []
      ),
    ],
  },
};

export default nextConfig;
