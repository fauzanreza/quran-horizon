const nextConfig = {
  output: 'standalone',
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'android.quran.com',
      },
    ],
  },
};

module.exports = nextConfig;
