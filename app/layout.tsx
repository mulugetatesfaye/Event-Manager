import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AddisVibe - Professional Event Management',
  description: 'Create, manage, and attend events with our comprehensive platform.',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return children
}