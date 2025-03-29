/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MOCK_API_CALLS: process.env.MOCK_API_CALLS,
  },
  // Make environment variables accessible on the client
  publicRuntimeConfig: {
    MOCK_API_CALLS: process.env.MOCK_API_CALLS,
  },
}

module.exports = nextConfig 