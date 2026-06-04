import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Next.js API Routes (app/api/ 配下) は beforeFiles で定義された
      // Route Handler が rewrite より優先される。
      // ここでは Python バックエンドへのプロキシを afterFiles に定義。
      beforeFiles: [],
      afterFiles: [
        {
          // state/git-sync は Next.js Route Handler が処理するため除外
          source: "/api/((?!state|git-sync).*)",
          destination: "http://127.0.0.1:8000/api/:path*", // Proxy to Backend
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
