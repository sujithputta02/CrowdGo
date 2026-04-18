/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@google-cloud/logging',
    '@google-cloud/monitoring',
    '@google-cloud/bigquery',
    '@google-cloud/aiplatform',
    '@google-cloud/secret-manager',
  ],
  
  // Security headers (additional layer beyond middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
