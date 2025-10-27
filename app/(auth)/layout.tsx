// app/(auth)/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Sparkles, Calendar, Users, Shield, Award, CheckCircle, TrendingUp, BarChart } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSignUp = pathname?.includes('sign-up')

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: Calendar, value: '50K+', label: 'Events Created' },
    { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
  ]

  const features = [
    'Unlimited event creation',
    'Real-time analytics dashboard',
    'Enterprise-grade security',
    'Priority customer support',
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Clean Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-white border-r border-gray-200">
        <div className="flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Header */}
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-8">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isSignUp ? 'Join EventHub Today' : 'Welcome Back'}
            </h1>
            
            <p className="text-gray-600 leading-relaxed max-w-md">
              {isSignUp 
                ? 'Create and manage professional events with our comprehensive platform. Trusted by thousands of organizers worldwide.'
                : 'Continue managing your events and growing your community with powerful tools and insights.'}
            </p>
          </div>

          {/* Middle Content */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-3">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">What you&apos;ll get:</h3>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Award-winning</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SOC 2 Certified</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Join over 10,000 event organizers worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-white">
        {children}
      </div>
    </div>
  )
}