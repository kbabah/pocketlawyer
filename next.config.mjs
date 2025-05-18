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
  // Security Headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https://api.openai.com; frame-src 'self'; object-src 'none';"
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        }
      ]
    }
  ],
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
