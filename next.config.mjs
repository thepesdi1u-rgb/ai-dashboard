/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "img.youtube.com", "i.ytimg.com"],
  },
  webpack: (config) => {
    // Fixes the 'jose' warning about Node.js APIs in Edge Runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: false,
      buffer: false,
      crypto: false,
    };
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
