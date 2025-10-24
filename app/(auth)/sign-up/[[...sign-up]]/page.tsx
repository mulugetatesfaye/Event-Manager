// app/(auth)/sign-up/[[...sign-up]]/page.tsx
'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const benefits = [
    'Free forever for basic features',
    'No credit card required',
    'Cancel anytime',
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation */}
      <div className="p-6 lg:p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8 py-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-600/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start managing events like a pro
            </p>

            {/* Benefits - Desktop only */}
            <div className="hidden lg:flex flex-col gap-2 mt-6 text-left">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
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
                  "relative border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-normal text-gray-700 shadow-sm",
                socialButtonsBlockButtonText: "font-normal text-sm",
                dividerLine: "bg-gradient-to-r from-transparent via-gray-200 to-transparent",
                dividerText: "text-gray-400 bg-white px-4 text-xs font-normal uppercase tracking-wide",
                formButtonPrimary: 
                  "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all duration-200 font-medium shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30",
                footerActionLink: 
                  "text-violet-600 hover:text-violet-700 transition-colors font-medium",
                formFieldLabel: "text-gray-700 font-medium text-sm mb-1.5",
                formFieldInput: 
                  "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-600",
                identityPreviewEditButton: "text-violet-600 hover:text-violet-700",
                identityPreviewText: "text-gray-700",
                formHeaderTitle: "hidden",
                formHeaderSubtitle: "hidden",
                otpCodeFieldInput: "border-gray-200 focus:border-violet-500 focus:ring-violet-500/20",
                formResendCodeLink: "text-violet-600 hover:text-violet-700",
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
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/sign-in" 
                className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
            
            <p className="text-xs text-gray-500 px-4">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-violet-600 hover:text-violet-700">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-violet-600 hover:text-violet-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="p-6 lg:p-8 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy
          </Link>
          <Link href="/security" className="hover:text-gray-900 transition-colors">
            Security
          </Link>
          <Link href="/help" className="hover:text-gray-900 transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}