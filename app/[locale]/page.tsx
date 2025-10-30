'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { useEvents } from '@/hooks'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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
import { Locale } from '@/app/i18n/config'

export default function HomePage() {
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = (params?.locale as Locale) || 'am'
  
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
      title: t('features.eventCreation.title'),
      description: t('features.eventCreation.description'),
    },
    {
      icon: Users,
      title: t('features.registration.title'),
      description: t('features.registration.description'),
    },
    {
      icon: TrendingUp,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
    }
  ]

  const testimonials = [
    {
      name: t('testimonials.testimonial1.name'),
      role: t('testimonials.testimonial1.role'),
      content: t('testimonials.testimonial1.content'),
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: t('testimonials.testimonial2.name'),
      role: t('testimonials.testimonial2.role'),
      content: t('testimonials.testimonial2.content'),
      avatar: '👨‍💻',
      rating: 5
    },
    {
      name: t('testimonials.testimonial3.name'),
      role: t('testimonials.testimonial3.role'),
      content: t('testimonials.testimonial3.content'),
      avatar: '👩‍🎨',
      rating: 5
    }
  ]

  const heroWords = [
    t('hero.words.conferences'),
    t('hero.words.workshops'),
    t('hero.words.meetups'),
    t('hero.words.webinars'),
    t('hero.words.seminars'),
  ]

  // Determine CTA based on user status
  const getPrimaryCTA = () => {
    if (!isSignedIn) {
      return {
        href: `/${locale}/sign-up`,
        text: t('buttons.getStartedFree'),
        icon: ArrowRight
      }
    }

    if (currentUser?.role === 'ATTENDEE') {
      return {
        href: `/${locale}/events`,
        text: t('buttons.browseEvents'),
        icon: Sparkles
      }
    }

    return {
      href: `/${locale}/events/create`,
      text: t('buttons.createEvent'),
      icon: Plus
    }
  }

  const getSecondaryCTA = () => {
    if (!isSignedIn) {
      return {
        href: `/${locale}/events`,
        text: t('buttons.browseEvents'),
        icon: Sparkles
      }
    }

    return {
      href: `/${locale}/dashboard`,
      text: t('buttons.goToDashboard'),
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
                  {t('hero.trustBadge')}
                </Badge>
              </FadeIn>

              {/* Main Heading */}
              <FadeIn direction="up" delay={200}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {t('hero.title')}{' '}
                  <span className="relative inline-block">
                    <AnimatedTextLoop 
                      words={heroWords}
                      className="text-blue-600"
                    />
                  </span>
                  <br />
                  {t('hero.subtitle')}
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={300}>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  {t('hero.description')}
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
                    {t('upcomingEvents.title')}
                  </h2>
                  <p className="text-gray-600">
                    {t('upcomingEvents.description')}
                  </p>
                </div>
                
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Link href={`/${locale}/events`}>
                    {t('upcomingEvents.viewAll')}
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
                          {t('upcomingEvents.stats.multipleCities')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">1000+</span> {t('upcomingEvents.stats.attendees')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {t('upcomingEvents.stats.newEvents')}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('upcomingEvents.noEvents.title')}</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  {t('upcomingEvents.noEvents.description')}
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={isSignedIn ? `/${locale}/events/create` : `/${locale}/sign-up`}>
                    {isSignedIn ? t('upcomingEvents.noEvents.createFirst') : t('buttons.getStartedFree')}
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
                  {t('features.title')}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {t('features.description')}
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
                  {t('howItWorks.title')}
                </h2>
                <p className="text-gray-600">
                  {t('howItWorks.description')}
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: t('howItWorks.step1.title'),
                  description: t('howItWorks.step1.description'),
                  icon: Users
                },
                {
                  step: 2,
                  title: t('howItWorks.step2.title'),
                  description: t('howItWorks.step2.description'),
                  icon: Calendar
                },
                {
                  step: 3,
                  title: t('howItWorks.step3.title'),
                  description: t('howItWorks.step3.description'),
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
                    {t('benefits.title')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('benefits.description')}
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        title: t('benefits.easyToUse.title'),
                        description: t('benefits.easyToUse.description')
                      },
                      {
                        title: t('benefits.realTime.title'),
                        description: t('benefits.realTime.description')
                      },
                      {
                        title: t('benefits.multiRole.title'),
                        description: t('benefits.multiRole.description')
                      },
                      {
                        title: t('benefits.comprehensiveAnalytics.title'),
                        description: t('benefits.comprehensiveAnalytics.description')
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
                    { icon: Clock, title: t('benefits.saveTime.title'), description: t('benefits.saveTime.description') },
                    { icon: Zap, title: t('benefits.fastSetup.title'), description: t('benefits.fastSetup.description') },
                    { icon: Shield, title: t('benefits.secure.title'), description: t('benefits.secure.description') },
                    { icon: BarChart, title: t('benefits.analyticsCard.title'), description: t('benefits.analyticsCard.description') }
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
                  {t('testimonials.title')}
                </h2>
                <p className="text-gray-600">
                  {t('testimonials.description')}
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
                {t('cta.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Link href={isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? `/${locale}/events/create` : `/${locale}/events`) : `/${locale}/sign-up`}>
                    {isSignedIn ? (currentUser?.role !== 'ATTENDEE' ? t('buttons.createEvent') : t('buttons.browseEvents')) : t('buttons.getStartedFree')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/events`}>
                    {isSignedIn ? t('buttons.goToDashboard') : t('buttons.browseEvents')}
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-white/75 mt-6">
                {isSignedIn ? t('cta.startCreating') : t('cta.disclaimer')}
              </p>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}