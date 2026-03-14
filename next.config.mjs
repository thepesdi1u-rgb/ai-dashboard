/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "img.youtube.com", "i.ytimg.com"],
  },
  webpack: (config, { isServer }) => {
    // Fixes the 'jose' warning about Node.js APIs in Edge Runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: false,
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
