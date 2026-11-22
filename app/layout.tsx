import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/products";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const description = "강아지·고양이 성격유형 테스트, 오늘의 운세, 사주, 관상, 사람 나이, 건강 리포트를 무료로 확인해 보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "ko_KR", title: `${SITE_NAME} — ${SITE_TAGLINE}`, description, images: [{ url: "/api/og", width: 800, height: 400 }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff6ea" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
