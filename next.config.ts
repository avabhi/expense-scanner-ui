import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["f76b-2406-7400-63-5693-1870-57b2-e8dd-127e.ngrok-free.app"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
