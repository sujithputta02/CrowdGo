/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@google-cloud/logging',
    '@google-cloud/monitoring',
    '@google-cloud/bigquery',
    '@google-cloud/aiplatform',
    '@google-cloud/secret-manager',
  ],
};

export default nextConfig;
