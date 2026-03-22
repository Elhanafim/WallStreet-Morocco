/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/WallStreet-Morocco',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

module.exports = nextConfig;
