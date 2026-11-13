/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};
module.exports = nextConfig;
