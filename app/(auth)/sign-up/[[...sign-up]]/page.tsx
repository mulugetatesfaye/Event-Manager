// app/(auth)/sign-up/[[...sign-up]]/page.tsx
'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation */}
      <div className="px-6 lg:px-8 pt-6 pb-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8 pb-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 flex justify-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600">
              Get started with EventHub today. No credit card required.
            </p>
          </div>

          {/* Clerk SignUp Component */}
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-gray-700 h-11",
                socialButtonsBlockButtonText: "font-medium text-sm",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500 bg-white px-4 text-xs font-medium uppercase tracking-wide",
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 font-medium h-11",
                footerActionLink: 
                  "text-blue-600 hover:text-blue-700 transition-colors font-medium",
                formFieldLabel: "text-gray-900 font-medium text-sm mb-1.5",
                formFieldInput: 
                  "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-11",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-600",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                identityPreviewText: "text-gray-900",
                formHeaderTitle: "hidden",
                formHeaderSubtitle: "hidden",
                otpCodeFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                formResendCodeLink: "text-blue-600 hover:text-blue-700",
                alertText: "text-sm",
                formFieldError: "text-red-600 text-xs mt-1",
                formFieldSuccessText: "text-green-600 text-xs mt-1",
                footerAction: "text-center",
                footerActionText: "text-gray-600 text-sm",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
            redirectUrl="/onboarding"
          />

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/sign-in" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
            
            <p className="text-xs text-gray-500 px-4">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors">
                Terms
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="px-6 lg:px-8 py-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy
          </Link>
          <Link href="/help" className="hover:text-gray-900 transition-colors">
            Help
          </Link>
        </div>
      </div>
    </div>
  )
}