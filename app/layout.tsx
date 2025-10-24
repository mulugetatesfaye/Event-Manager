import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import QueryProvider from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'EventHub - Professional Event Management',
  description: 'Create, manage, and attend events with our comprehensive platform. Perfect for organizers and attendees alike.',
  keywords: ['events', 'event management', 'registration', 'event platform'],
  authors: [{ name: 'EventHub' }],
  openGraph: {
    title: 'EventHub - Professional Event Management',
    description: 'Create, manage, and attend events with our comprehensive platform.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <QueryProvider>
            <div className="min-h-screen flex flex-col">
              <div className="flex-1 pt-14 md:pt-16">
                {children}
              </div>
            </div>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#000',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}