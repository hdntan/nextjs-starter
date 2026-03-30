import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Add external image domains consumed by <Image> here, e.g.:
    // { protocol: 'https', hostname: 'cdn.example.com' }
    remotePatterns: [],
  },
}

export default nextConfig
