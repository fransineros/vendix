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
      module: false,
      crypto: false,
      stream: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
      '@imgly/background-removal-node': false,
      '@imgly/background-removal': false,
      'onnxruntime-web': false,
      'onnxruntime-common': false,
    };
    config.module = { ...config.module, exprContextCritical: false };
    config.module.rules.push({
      test: /ort\.node.*\.mjs$/,
      type: 'javascript/auto',
      use: [],
    });
    if (!isServer) {
      config.externals = [...(config.externals || []), 'onnxruntime-node', 'sharp', '@imgly/background-removal-node', '@imgly/background-removal'];
    }
    return config;
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['onnxruntime-node', 'sharp', '@imgly/background-removal-node', '@imgly/background-removal'],
  },
}
module.exports = nextConfig
