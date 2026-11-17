import type { NextConfig } from "next";

const API_URL_INTERNAL = process.env.API_URL_INTERNAL || "http://127.0.0.1:5000/api";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.imgbb.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    // When NEXT_PUBLIC_API_URL=/api the browser talks to the same origin and
    // Next.js proxies /api/* to the Express server (its own /api/auth/* route
    // handlers always win — they are filesystem routes). In production you can
    // instead point NEXT_PUBLIC_API_URL directly at the deployed API and keep
    // CORS as the only bridge (see .env.example).
    if (process.env.NEXT_PUBLIC_API_URL !== "/api") return [];
    return [{ source: "/api/:path*", destination: `${API_URL_INTERNAL}/api/:path*` }];
  },
};

export default nextConfig;
