// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     optimizePackageImports: ['lucide-react']
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     domains: [''],
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//     unoptimized: true,
//   },
// }

// export default nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [], // Remove the empty string, keep as empty array
    remotePatterns: [], // Remove the pattern with empty hostname, keep as empty array
    unoptimized: true,
  },
}

export default nextConfig