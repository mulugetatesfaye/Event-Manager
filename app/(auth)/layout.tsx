// app/(auth)/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Sparkles, Calendar, Users, TrendingUp, Shield, Award, Zap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSignUp = pathname?.includes('sign-up')

  const features = [
    { icon: Calendar, label: 'Unlimited Events' },
    { icon: Users, label: '10K+ Active Users' },
    { icon: Shield, label: 'Enterprise Security' },
    { icon: Zap, label: 'Real-time Analytics' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Premium Gradient Background with Content */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center overflow-hidden">
        {/* Premium gradient background - Deep purple to black */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        
        {/* Mesh gradient overlay for depth */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-br from-violet-600/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-gradient-to-tl from-indigo-600/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Premium grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Dot pattern for texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
            backgroundSize: '25px 25px'
          }}
        />

        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse animation-delay-2000" />

        {/* Content */}
        <div className="relative z-10 px-12 xl:px-16 max-w-lg">
          {/* Logo */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight">
              {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
            </h1>
            
            <p className="text-lg text-white/70 leading-relaxed">
              {isSignUp 
                ? 'Join thousands of event organizers who trust EventHub to bring their vision to life.'
                : 'Your events are waiting. Continue managing and growing your community.'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-white/80 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <feature.icon className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="relative">
            <div className="absolute -left-2 -top-2 text-6xl text-white/10">&quot;</div>
            <blockquote className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                EventHub transformed how we manage our conferences. The platform is intuitive, 
                powerful, and our attendees love the seamless experience.
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white font-semibold text-sm">
                  MK
                </div>
                <div>
                  <div className="text-white/90 text-sm font-medium">Maria Kotova</div>
                  <div className="text-white/60 text-xs">Director of Events, TechCorp</div>
                </div>
              </footer>
            </blockquote>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60 text-sm">#1 Event Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">SOC 2 Certified</span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-white">
        {children}
      </div>
    </div>
  )
}