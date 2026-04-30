import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "土屋プロトコル - 競馬予想AI",
  description: "TsuchiyaProtocol-Omega v7.0 | 物理演算・機械学習による競馬予想システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
