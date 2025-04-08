import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Optional: Image optimization domains
  images: {
    remotePatterns: [
      // Example: Allow images from your S3 bucket if URLs are direct
      // {
      //   protocol: 'https',
      //   hostname: '*.s3.amazonaws.com', // Adjust pattern to be more specific if possible
      // },
      // Example: Allow placeholder images if hosted elsewhere
      // {
      //   protocol: 'https',
      //   hostname: 'via.placeholder.com',
      // },
    ],
  },
  // Optional: Add redirects, rewrites, headers, etc.
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ]
  // },
};

export default nextConfig;
