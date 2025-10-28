// app/(auth)/layout.tsx
'use client'

import type { ReactNode } from 'react'

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 -mt-14 md:-mt-16 pt-0">
      {/* Centered Auth Form */}
      <div className="w-full max-w-md px-4 sm:px-6">
        {children}
      </div>
    </div>
  )
}