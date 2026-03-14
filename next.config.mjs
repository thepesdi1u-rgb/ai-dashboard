/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "img.youtube.com", "i.ytimg.com"],
  },
  webpack: (config, { isServer }) => {
    // 1. Fix the 'jose' warning by aliasing the problematic deflate module to a no-op
    // since we don't use JWE compression in this app.
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'jose/dist/webapi/lib/deflate': false,
        'jose/dist/nodewebapi/lib/deflate': false,
      };
    }

    // 2. Suppress the "big strings" serialization warning
    config.infrastructureLogging = { level: 'error' };
    config.stats = { warningsFilter: [/Serialization big strings/] };

    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
