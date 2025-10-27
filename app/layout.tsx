// app/layout.tsx
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
              closeButton
              richColors
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast: 'border border-gray-200 shadow-lg',
                  title: 'text-sm font-medium text-gray-900',
                  description: 'text-sm text-gray-600',
                  actionButton: 'bg-blue-600 text-white hover:bg-blue-700',
                  cancelButton: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                  closeButton: 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900',
                  success: 'border-green-200 bg-green-50',
                  error: 'border-red-200 bg-red-50',
                  warning: 'border-yellow-200 bg-yellow-50',
                  info: 'border-blue-200 bg-blue-50',
                },
              }}
            />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}