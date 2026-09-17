/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}
module.exports = nextConfig