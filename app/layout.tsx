"use client"

import './globals.css'
import './components/style.css'

import { usePathname } from 'next/navigation'
import Header from './components/header'
import Sidebar from './components/sidebar'
import Footer from './components/footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const hideChrome = pathname === '/users/login'
  
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