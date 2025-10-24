
// app/events/[id]/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEvent, useRegisterForEvent, useCancelRegistration } from '@/hooks'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/fade-in'
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  User as UserIcon,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  TrendingUp,
  Shield,
  Heart,
  Star,
  Zap,
  Globe,
  BarChart,
  Award,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Image from 'next/image'
import { toast } from 'sonner'
import { RegistrationWithRelations } from '@/types'
import { RegistrationModal } from '@/components/events/registration-modal'
import Link from 'next/link'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  const eventId = params.id as string
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  const { data: event, isLoading, error } = useEvent(eventId)
  const registerMutation = useRegisterForEvent(eventId)
  const cancelMutation = useCancelRegistration(eventId)

  // Calculate isRegistered
  const isRegistered = useMemo(() => {
    if (!event || !currentUser) return false
    return event.registrations?.some(
      (reg: RegistrationWithRelations) => reg.user?.id === currentUser.id
    ) ?? false
  }, [event, currentUser])

  const handleCancelRegistration = async () => {
    try {
      await cancelMutation.mutateAsync()
      toast.success('Registration cancelled')
    } catch (error) {
      console.error('Cancellation error:', error)
    }
  }

  const handleShare = () => {
    const shareData = {
      title: event?.title,
      text: event?.description || undefined,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
          <div className="h-48 md:h-64 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              <div className="lg:col-span-2 space-y-4">
                <Card className="h-40 animate-pulse bg-gray-100" />
                <Card className="h-28 animate-pulse bg-gray-100" />
              </div>
              <div className="space-y-4">
                <Card className="h-56 animate-pulse bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1.5">Event not found</h2>
            <p className="text-sm text-gray-600 mb-5">The event you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/events')} size="sm" className="h-8 text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" />
              Back to Events
            </Button>
          </div>
        </div>
      </>
    )
  }

  const availableSpots = event.capacity - (event._count?.registrations || 0)
  const isFull = availableSpots <= 0
  const isPastEvent = new Date(event.endDate) < new Date()
  const isOrganizer = isSignedIn && currentUser?.id === event.organizer?.id

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-gray-50 via-white to-white border-b overflow-hidden">
          {/* Dense Background Patterns */}
          <div 
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(0, 0, 0) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(0, 0, 0) 1px, transparent 1px)
              `,
              backgroundSize: '1.5rem 1.5rem'
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1rem 1rem'
            }}
          />

          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-[400px] h-[400px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 -right-4 w-[400px] h-[400px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          </div>

          {/* Radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

          {/* Hero Image or Content */}
          {event.imageUrl ? (
            <div className="relative h-48 md:h-64 w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                  <FadeIn direction="up">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/events')}
                      className="mb-3 text-white hover:text-white hover:bg-white/20 backdrop-blur-sm h-7 text-xs"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1.5" />
                      Back to Events
                    </Button>
                    
                    {event.category && (
                      <Badge
                        className="mb-2 px-2 py-0.5 text-[10px] shadow-lg"
                        style={{
                          backgroundColor: event.category.color || '#6b7280',
                        }}
                      >
                        {event.category.name}
                      </Badge>
                    )}
                    
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">
                      {event.title}
                    </h1>
                    
                    <div className="flex items-center gap-2 text-white/90">
                      {event.organizer?.imageUrl ? (
                        <Image
                          src={event.organizer.imageUrl}
                          alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                          width={28}
                          height={28}
                          className="rounded-full border-2 border-white/50"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                          <UserIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-white/70">Organized by</p>
                        <p className="font-semibold text-xs">
                          {event.organizer?.firstName} {event.organizer?.lastName}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative py-8 md:py-10 px-4">
              <div className="max-w-6xl mx-auto relative z-10">
                <FadeIn direction="up">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/events')}
                    className="mb-3 hover:bg-white/50 h-7 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1.5" />
                    Back to Events
                  </Button>
                  
                  {event.category && (
                    <Badge
                      className="mb-2 px-2 py-0.5 text-[10px]"
                      style={{
                        backgroundColor: event.category.color || '#6b7280',
                      }}
                    >
                      {event.category.name}
                    </Badge>
                  )}
                  
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                    <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {event.title}
                    </span>
                  </h1>
                  
                  <div className="flex items-center gap-2">
                    {event.organizer?.imageUrl ? (
                      <Image
                        src={event.organizer.imageUrl}
                        alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-muted-foreground">Organized by</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {event.organizer?.firstName} {event.organizer?.lastName}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-gray-100 relative">
          {/* Subtle pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
              backgroundSize: '1rem 1rem'
            }}
          />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Date */}
                <div className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 tabular-nums">
                      {format(new Date(event.startDate), 'dd')}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">
                      {format(new Date(event.startDate), 'MMM yyyy')}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 truncate tabular-nums">
                      {format(new Date(event.startDate), 'h:mm')}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {format(new Date(event.startDate), 'a')}
                    </p>
                  </div>
                </div>
                                {/* Attendees */}
                <div className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 tabular-nums">
                      {event._count?.registrations || 0}
                    </p>
                    <p className="text-[10px] text-gray-600">Attendees</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-gray-900 tabular-nums">
                      {event.price > 0 ? event.price.toFixed(0) : '0'}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {event.price > 0 ? 'USD' : 'Free'}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* About Event */}
              <FadeIn direction="up">
                <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg backdrop-blur-sm bg-white/50">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">About this event</h2>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {event.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Event Details */}
              <FadeIn direction="up" delay={100}>
                <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg backdrop-blur-sm bg-white/50">
                  <CardContent className="pt-5 pb-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Event Details</h2>
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-start gap-3 group cursor-default">
                        <div className="w-9 h-9 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-red-500 group-hover:to-orange-500 group-hover:scale-110 transition-all duration-300">
                          <MapPin className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-0.5">Location</p>
                          <p className="text-gray-600 text-sm">{event.location}</p>
                          {event.venue && (
                            <p className="text-gray-500 text-xs mt-0.5">{event.venue}</p>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-start gap-3 group cursor-default">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-primary group-hover:to-purple-600 group-hover:scale-110 transition-all duration-300">
                          <CalendarDays className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-0.5">Date & Time</p>
                          <p className="text-gray-600 text-sm">
                            {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {format(new Date(event.startDate), 'h:mm a')} -{' '}
                            {format(new Date(event.endDate), 'h:mm a')}
                          </p>
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-start gap-3 group cursor-default">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:scale-110 transition-all duration-300">
                          <Users className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm mb-0.5">Capacity</p>
                          <p className="text-gray-600 text-sm">
                            {event._count?.registrations || 0} of {event.capacity} attendees registered
                          </p>
                          {!isFull && !isPastEvent && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <p className="text-xs text-green-600 font-medium">
                                {availableSpots} spots available
                              </p>
                            </div>
                          )}
                          {isFull && !isPastEvent && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              <p className="text-xs text-red-600 font-medium">Event is full</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Attendees */}
              {event.registrations && event.registrations.length > 0 && (
                <FadeIn direction="up" delay={200}>
                  <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg backdrop-blur-sm bg-white/50">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <h2 className="text-lg font-bold text-gray-900">
                            Attendees
                          </h2>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                          {event._count?.registrations || 0}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {event.registrations.slice(0, 8).map((registration: RegistrationWithRelations) => (
                          <div
                            key={registration.id}
                            className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-default"
                          >
                            {registration.user?.imageUrl ? (
                              <Image
                                src={registration.user.imageUrl}
                                alt={registration.user.firstName || ''}
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-900 text-center line-clamp-1">
                              {registration.user?.firstName} {registration.user?.lastName}
                            </span>
                          </div>
                        ))}
                        {(event._count?.registrations || 0) > 8 && (
                          <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-gray-50 rounded-lg">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              +{(event._count?.registrations || 0) - 8}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </div>

            {/* Right Column - Action Card & Organizer */}
            <div className="space-y-4">
              {/* Registration Card */}
              <FadeIn direction="left" delay={100}>
                <Card className="border border-gray-200/50 shadow-lg hover:shadow-xl transition-all sticky top-6 backdrop-blur-sm bg-white/80">
                  <CardContent className="pt-5 pb-5">
                    {/* Status Badge */}
                    {isPastEvent ? (
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-2.5 mb-3 text-center">
                        <XCircle className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-gray-700">Event Ended</p>
                      </div>
                    ) : isRegistered ? (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2.5 mb-3 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-green-800">You&apos;re Registered!</p>
                      </div>
                    ) : isFull ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 text-center">
                        <Users className="w-5 h-5 text-red-600 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-red-800">Event Full</p>
                      </div>
                    ) : null}

                    {/* Price Display */}
                    {!isPastEvent && (
                      <div className="text-center py-3 border-b mb-3">
                        {event.price > 0 ? (
                          <>
                            <p className="text-[10px] text-gray-500 mb-0.5">Ticket Price</p>
                            <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                              ${event.price.toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="inline-flex items-center gap-1.5 bg-green-100 rounded-full px-2.5 py-1 mb-0.5">
                              <Sparkles className="w-3 h-3 text-green-600 animate-pulse" />
                              <span className="text-xs font-semibold text-green-700">Free Event</span>
                            </div>
                            <p className="text-[10px] text-gray-600">No ticket required</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!isSignedIn ? (
                        <>
                          <Button 
                            className="w-full h-9 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden" 
                            onClick={() => router.push('/sign-in')}
                          >
                            {/* Shimmer effect */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative">Sign In to Register</span>
                          </Button>
                          <p className="text-[10px] text-center text-gray-500">
                            Create an account to join this event
                          </p>
                        </>
                      ) : isPastEvent ? (
                        <Button className="w-full h-9 text-sm" disabled>
                          Event Ended
                        </Button>
                      ) : isOrganizer ? (
                        <Button
                          className="w-full h-9 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                                                  onClick={() => router.push(`/events/${event.id}/edit`)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit Event
                        </Button>
                      ) : isRegistered ? (
                        <Button
                          className="w-full h-9 text-sm"
                          variant="outline"
                          onClick={handleCancelRegistration}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Registration'}
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-9 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
                          onClick={() => setShowRegistrationModal(true)}
                          disabled={isFull}
                        >
                          {/* Shimmer effect */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <span className="relative flex items-center">
                            {isFull ? 'Event Full' : 'Register Now'}
                            {!isFull && <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                          </span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="w-full h-9 text-sm border-gray-300 hover:border-gray-400"
                        onClick={handleShare}
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Share Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Organizer Card */}
              {event.organizer && (
                <FadeIn direction="left" delay={200}>
                  <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg backdrop-blur-sm bg-white/50">
                    <CardContent className="pt-5 pb-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-white" />
                        </div>
                        Event Organizer
                      </h3>
                      <div className="flex items-start gap-3">
                        {event.organizer.imageUrl ? (
                          <Image
                            src={event.organizer.imageUrl}
                            alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-lg border-2 border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {event.organizer.firstName} {event.organizer.lastName}
                          </p>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <p className="text-xs truncate">{event.organizer.email}</p>
                          </div>
                          {event.organizer.role && (
                            <Badge 
                              variant="secondary" 
                              className="mt-2 text-[10px] px-1.5 py-0 h-4"
                            >
                              {event.organizer.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}

              {/* Event Highlights */}
              <FadeIn direction="left" delay={300}>
                <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg backdrop-blur-sm bg-white/50">
                  <CardContent className="pt-5 pb-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                      Event Highlights
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">Professional networking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">Expert speakers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">Q&A sessions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">Certificate of attendance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        <section className="py-8 md:py-10 px-4 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white relative">
          {/* Dense dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1.25rem 1.25rem'
            }}
          />
          
          <div className="max-w-6xl mx-auto relative">
            <FadeIn direction="up">
              <div className="text-center mb-6">
                <Badge className="mb-3 px-3 py-1 text-xs backdrop-blur-sm bg-white/80 border-gray-200/50" variant="outline">
                  <Rocket className="w-3 h-3 mr-1.5" />
                  Discover More
                </Badge>
                <h2 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Related Events
                </h2>
                <p className="text-sm text-gray-600">
                  Explore similar events you might be interested in
                </p>
              </div>
            </FadeIn>
            
            {/* Placeholder for related events */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <FadeIn key={i} direction="up" delay={i * 100}>
                  <Card className="border border-gray-200/50 hover:border-gray-300/50 transition-all hover:shadow-lg group backdrop-blur-sm bg-white/50">
                    <CardContent className="pt-5 pb-5">
                      <div className="h-32 bg-gray-100 rounded-lg mb-3 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-8 md:py-10 px-4 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-primary" />
          
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_600px_at_50%_200px,#ffffff,transparent)]" />
          </div>
          
          {/* Dense dot pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '1.5rem 1.5rem'
            }}
          />
          
          <FadeIn direction="up">
            <div className="max-w-3xl mx-auto text-center relative z-10 text-white">
              <Badge className="mb-3 px-3 py-1 text-xs bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-colors shadow-lg">
                <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
                Don&apos;t Miss Out
              </Badge>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                Ready to Join More Events?
              </h2>
              <p className="text-sm opacity-90 mb-5 max-w-xl mx-auto">
                Discover amazing events happening around you and connect with like-minded people
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <Button 
                  asChild 
                  size="sm" 
                  variant="secondary" 
                  className="h-9 px-5 text-sm font-medium shadow-2xl hover:shadow-2xl hover:scale-105 transition-all group"
                >
                  <Link href="/events">
                    Browse All Events
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                {isSignedIn && currentUser?.role !== 'ATTENDEE' && (
                  <Button 
                    asChild 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-5 text-sm font-medium border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/10 transition-all group"
                  >
                    <Link href="/events/create">
                      Create Your Event
                      <Sparkles className="ml-1.5 w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </FadeIn>
        </section>
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && currentUser && (
        <RegistrationModal
          event={event}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
                