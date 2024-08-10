/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "impartial-goat-87.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
