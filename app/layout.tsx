import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const vazirmatn = Vazirmatn({ subsets: ['arabic'] })

export const metadata: Metadata = {
  title: 'انجمن علوم کامپیوتر دانشگاه بناب',
  description: 'وب‌سایت رسمی انجمن علوم کامپیوتر دانشگاه بناب',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={vazirmatn.className}>
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
