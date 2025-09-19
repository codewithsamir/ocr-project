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
  },
webpack: (config) => {
    config.module.rules.push({
      test: /pdf\.worker(\.min)?\.mjs$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[name][ext]",
      },
    });
    return config;
  },
  
};

export default nextConfig; 
