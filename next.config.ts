import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix CSP issues with inline scripts
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://kaytop-production.up.railway.app",
              "frame-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Experimental features for better hydration
  experimental: {
    optimizePackageImports: ['@radix-ui/react-checkbox'],
  },
};

export default nextConfig;
