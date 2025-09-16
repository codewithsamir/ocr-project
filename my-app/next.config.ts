import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images:{
    // domains:["lh3.googleusercontent.com"]
    remotePatterns:[{
      protocol:"https",
      hostname: "*",
      port: '',
      pathname:"/**"
    }]
  },
    async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  reactStrictMode:false,
  eslint:{
    ignoreDuringBuilds:true,
  },
  typescript:{
    ignoreBuildErrors:true,
  }
  
};

export default nextConfig; 
