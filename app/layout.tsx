import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Cairo } from 'next/font/google'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ICSS Platform — Develop Your Skills, Accelerate Your Success',
  description:
    'ICSS supports startups, entrepreneurs and freelancers with Business English, Pitch & Presentation, International Communication, and Digital Communication training.',
  keywords: ['ICSS', 'startups', 'entrepreneurs', 'Business English', 'Pitch', 'Communication', 'Algeria'],
  openGraph: {
    title: 'ICSS Platform',
    description: 'Professional training and coaching for entrepreneurs and startups.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${cairo.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'inherit' },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  )
}
