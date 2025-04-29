// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Memory optimization for production builds
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    // Lower memory usage during build
    config.optimization = {
      ...config.optimization,
      minimize: true,
      runtimeChunk: isServer ? false : 'single',
    }

    // Reduce memory usage by splitting chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000
      }
      
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          net: false,
          tls: false,
          fs: false,
          dns: false,
          http2: false,
          http: false,
          https: false,
          stream: false,
          crypto: false,
          buffer: false,
          'aws-crt': false,
          'mock-aws-s3': false,
          'aws-sdk': false,
          nock: false,
        },
      }
    }
    return config
  }
}

export default config
