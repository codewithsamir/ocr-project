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
  reactStrictMode:false,
  eslint:{
    ignoreDuringBuilds:true,
  },
  typescript:{
    ignoreBuildErrors:true,
  }
  
};

export default nextConfig; 
