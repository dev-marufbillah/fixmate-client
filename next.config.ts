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
    // When NEXT_PUBLIC_API_URL=/backend the browser talks to the same origin and
    // Next.js proxies /backend/* to the Express server's /api/*. The dedicated
    // /api/auth/* route handlers are never affected (different prefix). In
    // production you can instead point NEXT_PUBLIC_API_URL directly at the
    // deployed API and keep CORS as the only bridge (see .env.example).
    if (process.env.NEXT_PUBLIC_API_URL !== "/backend") return [];
    return [{ source: "/backend/:path*", destination: `${API_URL_INTERNAL}/:path*` }];
  },
};

export default nextConfig;
