const webpack = require('webpack');
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['@imgly/background-removal'],
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    config.plugins = [
      ...config.plugins,
      new webpack.IgnorePlugin({ resourceRegExp: /^onnxruntime-node$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^sharp$/ }),
    ];
    config.module.exprContextCritical = false;
    config.module.rules.push({ test: /\.map$/, use: [] });
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}
module.exports = nextConfig
