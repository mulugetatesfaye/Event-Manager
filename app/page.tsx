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
  Zap,
  Star,
  Rocket,
  BarChart,
  LayoutDashboard,
  Plus,
  MapPin,
  ChevronRight,
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
    limit: 4,
    search: '',
    category: '',
  })

  const features = [
    {
      icon: Calendar,
      title: 'Event Creation',
      description: 'Create stunning events with our intuitive builder and comprehensive customization options.',
    },
    {
      icon: Users,
      title: 'Registration Management',
      description: 'Track attendees in real-time with automated capacity management and confirmations.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Gain valuable insights with comprehensive analytics and performance metrics.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data protection.',
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
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              {/* Trust Badge */}
              <FadeIn direction="down" delay={100}>
                <Badge 
                  variant="outline" 
                  className="mb-6 border-blue-200 bg-blue-50 text-blue-700 px-3 py-1"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Trusted by 10,000+ organizers
                </Badge>
              </FadeIn>

              {/* Main Heading */}
              <FadeIn direction="up" delay={200}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Professional{' '}
                  <span className="relative inline-block">
                    <AnimatedTextLoop 
                      words={heroWords}
                      className="text-blue-600"
                    />
                  </span>
                  <br />
                  Made Simple
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={300}>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Create, manage, and attend events with our comprehensive platform. 
                  Perfect for organizers and attendees alike.
                </p>
              </FadeIn>

              {/* CTA Buttons */}
              <FadeIn direction="up" delay={400}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    asChild 
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href={primaryCTA.href}>
                      {primaryCTA.text}
                      <primaryCTA.icon className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-11 px-6 border-gray-300 hover:bg-gray-50"
                  >
                    <Link href={secondaryCTA.href}>
                      {secondaryCTA.text}
                      <secondaryCTA.icon className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Latest Events Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn direction="up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Upcoming Events
                  </h2>
                  <p className="text-gray-600">
                    Discover what&apos;s happening near you
                  </p>
                </div>
                
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Link href="/events">
                    View All Events
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
            
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="h-72 animate-pulse bg-gray-100 border-gray-200" />
                ))}
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {eventsData.events.map((event: EventWithRelations) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                
                {/* Quick Stats Bar */}
                <FadeIn direction="up" delay={500}>
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Events in <span className="font-semibold text-gray-900">Multiple Cities</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">1000+</span> Attendees Expected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">New Events</span> Added Daily
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Be the first to create an event and start building your community.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={isSignedIn ? '/events/create' : '/sign-up'}>
                    {isSignedIn ? 'Create First Event' : 'Get Started'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn direction="up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Everything You Need to Manage Events
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our platform provides all the tools you need to create, manage, 
                  and grow your events successfully.
                </p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FadeIn key={index} direction="up" delay={index * 100}>
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
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
        </div>

        {/* How It Works Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn direction="up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Get Started in 3 Easy Steps
                </h2>
                <p className="text-gray-600">
                  From signup to your first event in minutes
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <div className="text-center relative">
                    <div className="relative inline-block mb-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    
                    <item.icon className="w-6 h-6 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {index < 2 && (
                      <div className="hidden md:block absolute top-8 -right-4">
                        <ArrowRight className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeIn direction="left">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Built for Success
                  </h2>
                  <p className="text-gray-600 mb-6">
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
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="right">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Clock, title: 'Save Time', description: 'Automate tasks' },
                    { icon: Zap, title: 'Fast Setup', description: 'Minutes to launch' },
                    { icon: Shield, title: 'Secure', description: 'Enterprise-level' },
                    { icon: BarChart, title: 'Analytics', description: 'Track everything' }
                  ].map((benefit, index) => (
                    <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <benefit.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
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
        </div>

        {/* Testimonials Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn direction="up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Loved by Thousands
                </h2>
                <p className="text-gray-600">
                  See what our users have to say about EventHub
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <FadeIn key={index} direction="up" delay={index * 100}>
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                        &quot;{testimonial.content}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-xs text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <FadeIn direction="up">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                Start Your Journey
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Create Amazing Events?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers who trust our platform to bring their visions to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Link href={isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? '/events/create' : '/events') : '/sign-up'}>
                    {isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? 'Create Event' : 'Browse Events') : 'Get Started Free'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href={isSignedIn ? '/dashboard' : '/events'}>
                    {isSignedIn ? 'Go to Dashboard' : 'Browse Events'}
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-white/75 mt-6">
                {isSignedIn ? 'Start creating events today' : 'No credit card required • Free to start • Cancel anytime'}
              </p>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}