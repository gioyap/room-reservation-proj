import { config } from 'dotenv';
config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    // Enable source maps only during development
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }

    return config;
  },
};

export default nextConfig;
