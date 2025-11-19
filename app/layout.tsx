// "use client"

import '@/app/globals.css'

import Header from '@/app/components/common/Header'
import Sidebar from '@/app/components/common/Sidebar'
import Footer from '@/app/components/common/Footer'
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {

  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "HOSPOTAL CONTROL SYSTEM",
    template: "%s | HOSPOTAL CONTROL SYSTEM",
  },
  description: "로봇 상태·알림·통계를 통합 관제하는 대시보드",
  applicationName: "Robot Control",
  openGraph: {
    type: "website",
    url: "/",
    title: "병원 로봇 관제 시스템",
    description: "병원 내 로봇을 실시간 관제"
  },
  icons: {
    icon: "/favicon.ico"
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0EA5E9"
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="ko">
      <body>
        <Header />
        <Sidebar />
        <main className='page-container'>{children}</main>
        <Footer />
      </body>
    </html>
  )
}