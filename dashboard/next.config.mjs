const getBackendUrl = () => {
  const url = process.env.BACKEND_URL;
  if (!url) return 'http://localhost:5000';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getBackendUrl()}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
