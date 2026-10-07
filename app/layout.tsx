import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site-url.ts";
import "./globals.css";

const description = "취향으로 알아보는 내 타입, 친구와의 SYNC";

export const metadata: Metadata = {
  // 하위 페이지의 og:url·og:image가 이 주소를 기준으로 절대 주소가 된다.
  metadataBase: new URL(siteUrl()),
  title: "SYNC",
  description,
  openGraph: { title: "SYNC", description, siteName: "SYNC", locale: "ko_KR", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
