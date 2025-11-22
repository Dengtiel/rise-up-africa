/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: 'standalone', // Enable standalone output for Docker
  // Only consider these page file extensions so compiled `.js` files
  // won't create duplicate routes with the source `.tsx` files.
  pageExtensions: ['tsx', 'ts', 'jsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
