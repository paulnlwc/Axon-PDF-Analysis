/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode in development to reduce double-rendering
  reactStrictMode: false,
  // Enable server-side logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    domains: ['d1bg5u8k1zhews.cloudfront.net'],
  },
}

module.exports = nextConfig
