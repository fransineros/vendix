const webpack = require('webpack');
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, module: false, crypto: false, stream: false, os: false };
    config.plugins = [
      ...config.plugins,
      new webpack.IgnorePlugin({ resourceRegExp: /^onnxruntime-node$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^@imgly\/background-removal/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^sharp$/ }),
    ];
    config.module.exprContextCritical = false;
    config.module.rules.push({ test: /\.map$/, use: [] });
    return config;
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['onnxruntime-node', 'sharp', '@imgly/background-removal-node', '@imgly/background-removal', 'onnxruntime-web'],
  },
}
module.exports = nextConfig
