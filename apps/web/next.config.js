/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback, 
      fs: false, 
      path: false,
      module: false 
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
      '@imgly/background-removal-node': false,
    };
    if (!isServer) {
      config.externals = [...(config.externals || []), 'onnxruntime-node', 'sharp'];
    }
    return config;
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['onnxruntime-node', 'sharp', '@imgly/background-removal-node'],
  },
}
module.exports = nextConfig
