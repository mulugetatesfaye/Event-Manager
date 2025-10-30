// app/(auth)/sign-in/[[...sign-in]]/page.tsx
'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            AddisVibe
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Clerk SignIn Component */}
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0 bg-transparent border-0",
                
                // Hide default headers
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                header: "hidden",
                
                // Social buttons
                socialButtonsBlockButton: 
                  "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm h-10 rounded-lg transition-colors",
                socialButtonsBlockButtonText: "font-medium text-sm",
                socialButtonsProviderIcon: "w-4 h-4",
                
                // Divider
                dividerRow: "my-6",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-400 text-xs px-2",
                
                // Form
                form: "space-y-4",
                formFieldRow: "space-y-1.5",
                formFieldLabel: "text-sm font-medium text-gray-700",
                formFieldInput: 
                  "w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-600",
                
                // Button
                formButtonPrimary: 
                  "w-full bg-gray-900 hover:bg-gray-800 text-white font-medium h-10 rounded-lg transition-colors text-sm",
                
                // Footer
                footerAction: "text-center",
                footerActionText: "text-sm text-gray-600",
                footerActionLink: "text-gray-900 hover:text-gray-700 font-medium",
                
                // Other elements
                formResendCodeLink: "text-gray-900 hover:text-gray-700 font-medium text-sm",
                identityPreviewEditButton: "text-gray-900 hover:text-gray-700 font-medium",
                otpCodeFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                
                // Errors
                formFieldError: "text-red-600 text-xs mt-1",
                formFieldErrorText: "text-red-600 text-xs",
                alert: "border border-red-200 bg-red-50 rounded-lg text-sm",
                alertText: "text-red-800 text-sm",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
          />

          {/* Alternative sign up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/sign-up" 
                className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <Link href="/help" className="hover:text-gray-900 transition-colors">
              Help
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <span>© 2024 AddisVibe</span>
          </div>
        </div>
      </footer>
    </div>
  )
}