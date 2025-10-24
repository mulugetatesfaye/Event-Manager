// app/page.tsx
'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { useEvents } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventCard } from '@/components/events/event-card'
import { AnimatedTextLoop } from '@/components/ui/animated-text-loop'
import { CountUp } from '@/components/ui/count-up'
import { FadeIn } from '@/components/ui/fade-in'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Globe,
  Zap,
  Star,
  Award,
  Target,
  Rocket,
  BarChart,
  Heart,
  Play,
  LayoutDashboard,
  Plus,
  MapPin,
  Ticket,
  ChevronRight
} from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { EventWithRelations } from '@/types'

export default function HomePage() {
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  
  // Fetch latest events
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    page: 1,
    limit: 4, // Show 4 latest events
    search: '',
    category: '',
  })

  const features = [
    {
      icon: Calendar,
      title: 'Event Creation',
      description: 'Create stunning events with our intuitive builder and comprehensive customization options.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Registration Management',
      description: 'Track attendees in real-time with automated capacity management and confirmations.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Gain valuable insights with comprehensive analytics and performance metrics.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data protection.',
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Tech Conference Organizer',
      content: 'EventHub has transformed how we manage our tech conferences. The analytics features have helped us grow our events by 300%.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Event Enthusiast',
      content: 'As an attendee, I love how easy it is to find and register for events. The interface is intuitive and I never miss an event.',
      avatar: '👨‍💻',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Manager',
      content: 'The multi-role system is perfect for our organization. We manage everything from one platform and productivity has doubled.',
      avatar: '👩‍🎨',
      rating: 5
    }
  ]

  const benefits = [
    { icon: Clock, title: 'Save Time', description: 'Automate tasks' },
    { icon: Globe, title: 'Global Reach', description: 'Reach worldwide' },
    { icon: Zap, title: 'Fast Setup', description: 'Minutes to launch' },
    { icon: Shield, title: 'Secure', description: 'Enterprise-level' }
  ]

  const heroWords = ['Conferences', 'Workshops', 'Meetups', 'Webinars', 'Seminars']

  // Determine CTA based on user status
  const getPrimaryCTA = () => {
    if (!isSignedIn) {
      return {
        href: '/sign-up',
        text: 'Get Started Free',
        icon: ArrowRight
      }
    }

    if (currentUser?.role === 'ATTENDEE') {
      return {
        href: '/events',
        text: 'Browse Events',
        icon: Sparkles
      }
    }

    // For ORGANIZER or ADMIN
    return {
      href: '/events/create',
      text: 'Create Event',
      icon: Plus
    }
  }

  const getSecondaryCTA = () => {
    if (!isSignedIn) {
      return {
        href: '/events',
        text: 'Browse Events',
        icon: Sparkles
      }
    }

    return {
      href: '/dashboard',
      text: 'Go to Dashboard',
      icon: LayoutDashboard
    }
  }

  const primaryCTA = getPrimaryCTA()
  const secondaryCTA = getSecondaryCTA()

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        {/* Enhanced Hero Section - Keeping existing code */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-4 overflow-hidden">
          {/* All the existing hero section code remains unchanged */}
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />
          
          {/* Dense Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(0, 0, 0) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(0, 0, 0) 1px, transparent 1px)
              `,
              backgroundSize: '1.5rem 1.5rem'
            }}
          />
          
          {/* Dense Dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1rem 1rem'
            }}
          />
          
          {/* Fine dot matrix */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
              backgroundSize: '0.5rem 0.5rem'
            }}
          />
          
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          </div>
          
          {/* Radial gradient spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          {/* Top glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          {/* Floating elements - decorative */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-500/20 rounded-full animate-pulse animation-delay-1000" />
          <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-pink-500/20 rounded-full animate-pulse animation-delay-2000" />
          <div className="absolute top-60 right-1/3 w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-pulse animation-delay-3000" />
          
          {/* Dense noise texture overlay for depth */}
          <div 
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'5\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
            }}
          />

          {/* Diagonal lines pattern */}
          <div 
            className="absolute inset-0 opacity-[0.01]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.03) 10px,
                rgba(0, 0, 0, 0.03) 11px
              )`
            }}
          />

          <div className="mx-auto max-w-6xl text-center relative z-10">
            {/* Enhanced Trust Badge */}
            <FadeIn direction="down" delay={100}>
              <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-white/80 border border-gray-200/50 rounded-full px-3 py-1.5 mb-6 text-xs font-medium text-gray-700 shadow-sm shadow-gray-900/5 hover:shadow-md hover:border-gray-300/50 transition-all group cursor-default">
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border border-white shadow-sm transition-transform group-hover:scale-110" />
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border border-white shadow-sm transition-transform group-hover:scale-110 animation-delay-100" />
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 border border-white shadow-sm transition-transform group-hover:scale-110 animation-delay-200" />
                </div>
                <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Trusted by 10,000+ organizers
                </span>
                <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
              </div>
            </FadeIn>

            {/* Enhanced Main Heading */}
            <FadeIn direction="up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900 leading-tight">
                <span className="inline-block">
                  Professional{' '}
                  <span className="relative inline-block">
                    <AnimatedTextLoop 
                      words={heroWords}
                      className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent"
                    />
                    {/* Enhanced underline */}
                    <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 rounded-full blur-sm" />
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 rounded-full" />
                  </span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Made Simple
                  </span>
                  {/* Glow effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-primary/20 blur-2xl -z-10" />
                </span>
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={300}>
              <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Create, manage, and attend events with our comprehensive platform. 
                Perfect for organizers and attendees alike.
              </p>
            </FadeIn>

            {/* Smart CTA Buttons */}
            <FadeIn direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                <Button 
                  asChild 
                  size="default" 
                  className="h-10 px-6 text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
                >
                  <Link href={primaryCTA.href}>
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center">
                      {primaryCTA.text}
                      <primaryCTA.icon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="default" 
                  className="h-10 px-6 text-sm font-medium border-gray-300 hover:border-gray-400 backdrop-blur-sm bg-white/50 hover:bg-white/80 group relative overflow-hidden"
                >
                  <Link href={secondaryCTA.href}>
                    <span className="relative flex items-center">
                      <Play className="mr-2 w-4 h-4" />
                      {secondaryCTA.text}
                      <secondaryCTA.icon className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </div>
            </FadeIn>

            {/* Enhanced Trust Indicators */}
            <FadeIn direction="up" delay={500}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
                {[
                  { value: 10000, suffix: '+', label: 'Active Users', icon: Users, color: 'from-blue-500 to-blue-600' },
                  { value: 50000, suffix: '+', label: 'Events Created', icon: Calendar, color: 'from-purple-500 to-purple-600' },
                  { value: 100000, suffix: '+', label: 'Registrations', icon: Award, color: 'from-pink-500 to-pink-600' },
                  { value: 99.9, suffix: '%', label: 'Uptime', icon: Target, color: 'from-green-500 to-green-600' }
                ].map((stat, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-default"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                    
                    {/* Card */}
                    <div className="relative backdrop-blur-sm bg-white/80 border border-gray-200/50 rounded-xl p-4 shadow-sm shadow-gray-900/5 hover:border-gray-300/50 hover:shadow-md transition-all">
                      <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent tabular-nums">
                        <CountUp end={stat.value} suffix={stat.suffix} duration={2000} />
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* New: Social Proof Logos */}
            <FadeIn direction="up" delay={600}>
              <div className="mt-16 pt-8 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-medium">
                  Trusted by leading organizations
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40 grayscale">
                  {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, i) => (
                    <div 
                      key={i} 
                      className="text-gray-400 font-bold text-lg hover:opacity-100 hover:grayscale-0 transition-all cursor-default"
                    >
                      {company}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </section>

        {/* NEW: Latest Events Section */}
        <section className="py-16 md:py-20 px-4 bg-white border-t border-gray-100 relative">
          {/* Dense background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1rem 1rem'
            }}
          />
          
          <div className="mx-auto max-w-6xl relative">
            <FadeIn direction="up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/50 border-gray-200/50 shadow-sm" variant="outline">
                    <Ticket className="w-3 h-3 mr-1.5" />
                    Latest Events
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Upcoming Events
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Discover what&apos;s happening near you
                  </p>
                </div>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="default" 
                  className="h-9 px-4 text-sm font-medium border-gray-300 hover:border-gray-400 group"
                >
                  <Link href="/events">
                    View All Events
                    <ChevronRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
            
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="h-72 animate-pulse bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventsData.events.map((event: EventWithRelations, index: number) => (
                  <FadeIn key={event.id} direction="up" delay={index * 100}>
                    <EventCard event={event} />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50/50 rounded-xl">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">No upcoming events</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Be the first to create an event and start building your community.
                </p>
                <Button asChild size="sm">
                  <Link href={isSignedIn ? '/events/create' : '/sign-up'}>
                    {isSignedIn ? 'Create First Event' : 'Get Started'}
                    <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Quick Stats Bar */}
            {eventsData && eventsData.events.length > 0 && (
              <FadeIn direction="up" delay={500}>
                <div className="mt-8 pt-8 border-t border-gray-200/50">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Events in <span className="font-semibold">Multiple Cities</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">1000+</span> Attendees Expected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">New Events</span> Added Daily
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* Features Section - Keep existing code */}
        <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-gray-50/50 to-white relative">
          {/* Dense background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1rem 1rem'
            }}
          />
          
          <div className="mx-auto max-w-6xl relative">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/50 border-gray-200/50 shadow-sm" variant="outline">
                  <Rocket className="w-3 h-3 mr-1.5" />
                  Powerful Features
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Everything You Need to Manage Events
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                  Our platform provides all the tools you need to create, manage, 
                  and grow your events successfully.
                </p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {features.map((feature, index) => (
                <FadeIn key={index} direction="up" delay={index * 100}>
                  <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg group relative overflow-hidden h-full backdrop-blur-sm bg-white/50">
                    {/* Hover glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <CardContent className="pt-5 pb-5 relative">
                      <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-gray-900/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-base group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Rest of the sections remain unchanged */}
        {/* How It Works Section */}
        <section className="py-16 md:py-20 px-4 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          {/* Dense pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
              backgroundSize: '0.75rem 0.75rem'
            }}
          />
          
          <div className="mx-auto max-w-6xl relative">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/80 border-gray-200/50" variant="outline">
                  <BarChart className="w-3 h-3 mr-1.5" />
                  Simple Process
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Get Started in 3 Easy Steps
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                  From signup to your first event in minutes
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  step: 1,
                  title: 'Create Your Account',
                  description: 'Sign up for free and choose your role. No credit card required.',
                  icon: Users
                },
                {
                  step: 2,
                  title: 'Create or Browse Events',
                  description: 'Organizers create events, attendees discover and register easily.',
                  icon: Calendar
                },
                {
                  step: 3,
                  title: 'Manage & Attend',
                  description: 'Track registrations and enjoy seamless event experiences.',
                  icon: Rocket
                }
              ].map((item, index) => (
                <FadeIn key={index} direction="up" delay={index * 150}>
                  <div className="relative">
                    <div className="text-center group">
                      <div className="relative inline-block mb-4">
                        {/* Outer glow ring */}
                        <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Step number */}
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300">
                          {item.step}
                          
                          {/* Inner shine */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-xl" />
                        </div>
                      </div>
                      
                      <item.icon className="w-5 h-5 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    {index < 2 && (
                      <div className="hidden md:block absolute top-7 -right-4 text-gray-300">
                        <ArrowRight className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-100 relative">
          {/* Dense grid */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(0, 0, 0) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(0, 0, 0) 1px, transparent 1px)
              `,
              backgroundSize: '2rem 2rem'
            }}
          />
          
          <div className="mx-auto max-w-6xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <FadeIn direction="left">
                <div>
                  <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/50 border-gray-200/50" variant="outline">
                    <Star className="w-3 h-3 mr-1.5" />
                    Why Choose Us
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Built for Success
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Join thousands of successful event organizers who trust EventHub
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Easy to Use',
                        description: 'Intuitive interface designed for everyone'
                      },
                      {
                        title: 'Real-time Updates',
                        description: 'Instant notifications about registrations'
                      },
                      {
                        title: 'Multi-role Support',
                        description: 'Flexible permissions for your team'
                      },
                      {
                        title: 'Comprehensive Analytics',
                        description: 'Track performance with detailed insights'
                      }
                    ].map((benefit, index) => (
                      <FadeIn key={index} direction="left" delay={index * 100}>
                        <div className="flex gap-3 group cursor-default">
                          <div className="flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center group-hover:from-primary group-hover:to-purple-600 group-hover:scale-110 transition-all duration-300 shadow-sm">
                              <CheckCircle className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-0.5 text-gray-900">{benefit.title}</h3>
                            <p className="text-sm text-gray-600">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="right">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {benefits.map((benefit, index) => (
                    <Card 
                      key={index} 
                      className={`border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50 ${index % 2 === 1 ? 'mt-6' : ''}`}
                    >
                      <CardContent className="pt-5 pb-5 text-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                          <benefit.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1 text-sm text-gray-900">{benefit.title}</h3>
                        <p className="text-xs text-gray-600">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 px-4 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          {/* Dense dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1.25rem 1.25rem'
            }}
          />
          
          <div className="mx-auto max-w-6xl relative">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/80 border-gray-200/50" variant="outline">
                  <Heart className="w-3 h-3 mr-1.5" />
                  Testimonials
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Loved by Thousands
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                  See what our users have to say about EventHub
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {testimonials.map((testimonial, index) => (
                <FadeIn key={index} direction="up" delay={index * 100}>
                  <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group h-full backdrop-blur-sm bg-white/80">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center gap-0.5 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 transition-transform group-hover:scale-110" 
                            style={{ transitionDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                        &quot;{testimonial.content}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-lg shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{testimonial.name}</p>
                          <p className="text-xs text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative py-16 md:py-20 px-4 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-primary" />
          
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_600px_at_50%_200px,#ffffff,transparent)]" />
          </div>
          
          {/* Animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Dense dot pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '1.5rem 1.5rem'
            }}
          />
          
          {/* Fine grid */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 0.5px, transparent 0.5px),
                linear-gradient(to bottom, white 0.5px, transparent 0.5px)
              `,
              backgroundSize: '2rem 2rem'
            }}
          />
          
          <FadeIn direction="up">
            <div className="mx-auto max-w-3xl text-center relative z-10 text-white">
              <Badge className="mb-4 px-3 py-1 text-xs bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-colors shadow-lg">
                <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
                Start Your Journey
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                Ready to Create Amazing Events?
              </h2>
              <p className="text-sm md:text-base opacity-90 mb-8 max-w-xl mx-auto">
                Join thousands of event organizers who trust our platform to bring their visions to life
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="default" variant="secondary" className="h-10 px-6 text-sm font-medium shadow-2xl hover:shadow-2xl hover:scale-105 transition-all group">
                  <Link href={isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? '/events/create' : '/events') : '/sign-up'}>
                    {isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? 'Create Event' : 'Browse Events') : 'Create Your First Event'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="default" variant="outline" className="h-10 px-6 text-sm font-medium border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/10 transition-all group">
                  <Link href={isSignedIn ? '/dashboard' : '/events'}>
                    {isSignedIn ? 'Go to Dashboard' : 'Browse Events'}
                    <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs opacity-75 mt-5">
                {isSignedIn ? 'Start creating events today' : 'No credit card required • Free to start • Cancel anytime'}
              </p>
            </div>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  )
}