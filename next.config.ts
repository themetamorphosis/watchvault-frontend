import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/library",
        destination: "/library/movies",
        permanent: true,
      },
      {
        source: "/wishlist",
        destination: "/wishlist/movies",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
