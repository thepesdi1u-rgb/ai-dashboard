/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "img.youtube.com", "i.ytimg.com"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'compression-stream': 'commonjs compression-stream',
      });
    }
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
