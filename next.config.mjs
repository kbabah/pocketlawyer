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
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
