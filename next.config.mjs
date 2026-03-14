/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "img.youtube.com", "i.ytimg.com"],
  },
  webpack: (config, { isServer }) => {
    // 1. Completely ignore warnings from jose (Auth.js) in the Edge Runtime
    config.ignoreWarnings = [
      { module: /node_modules\/jose/ },
      { message: /Serialization big strings/ },
    ];

    // 2. Fix the 'jose' alias for safety
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'jose/dist/webapi/lib/deflate': false,
        'jose/dist/nodewebapi/lib/deflate': false,
      };
    }

    // 3. Suppress secondary logging noise
    config.infrastructureLogging = { level: 'error' };

    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
