import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

// Import webpack and node-polyfill-webpack-plugin
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer }) => {
    // apply polyfills and node: import replacement for all client builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        path: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'), // Ensure process polyfill is defined
        buffer: require.resolve('buffer/'),
        http: false,
        https: false,
        os: false,
        "firebase-admin": false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser', // Provide process polyfill
          Buffer: ['buffer', 'Buffer'],
        }),
        // NodePolyfillPlugin might be redundant if manually specifying fallbacks/provides
        // new NodePolyfillPlugin(), 
        new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, resource => {
          // Strip 'node:' prefix
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
      
      // Remove the potentially conflicting alias generation loop
      // const nodeBuiltins = [...];
      // const aliases = {};
      // nodeBuiltins.forEach(...);
      // config.resolve.alias = { ... };
    }

    // Keep any other server-specific or general webpack config if needed

    return config;
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
