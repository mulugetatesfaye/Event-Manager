// app/events/[id]/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEvent, useCancelRegistration } from '@/hooks'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/fade-in'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  ArrowLeft,
  Edit,
  Mail,
  TrendingUp,
  ArrowRight,
  Ticket,
  Settings,
  AlertCircle,
  Building2,
  Loader2,
  MessageSquare,
  Bookmark,
  Eye,
  Navigation,
  Calendar,
  Trophy,
  Wifi,
  Coffee,
  Award,
  Info,
} from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Image from 'next/image'
import { toast } from 'sonner'
import { RegistrationWithRelations, EventWithRelations } from '@/types'
import { RegistrationModal } from '@/components/events/registration-modal'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  usesTicketingSystem, 
  getEventPriceRange,
  calculateAvailableSpots,
  calculateTotalTicketsSold,
  calculateFillPercentage,
  isEventFull,
  hasEarlyBirdTickets,
  getTicketTypeSummary,
  getTimeUntilEvent,
  getEventStatusLabel,
  canRegisterForEvent
} from '@/lib/event-utils'
import confetti from 'canvas-confetti'

// Ethiopian Birr formatter
const formatETB = (amount: number): string => {
  return `${amount.toFixed(2)} ETB`
}

// Loading skeleton component
const EventDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="h-64 bg-gray-200 animate-pulse" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  const eventId = params.id as string
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const { data: event, isLoading, error } = useEvent(eventId)
  const cancelMutation = useCancelRegistration(eventId)

  // Calculate registration status
  const isRegistered = useMemo(() => {
    if (!event || !currentUser) return false
    return event.registrations?.some(
      (reg: RegistrationWithRelations) => 
        reg.user?.id === currentUser.id && reg.status === 'CONFIRMED'
    ) ?? false
  }, [event, currentUser])

  // Get event metrics
  const hasTickets = event ? usesTicketingSystem(event) : false
  const priceRange = event ? getEventPriceRange(event) : 'Free'
  const hasEarlyBird = event ? hasEarlyBirdTickets(event) : false
  const ticketSummary = event ? getTicketTypeSummary(event) : null
  const totalTicketsSold = event ? calculateTotalTicketsSold(event) : 0
  const availableSpots = event ? calculateAvailableSpots(event) : 0
  const fillPercentage = event ? calculateFillPercentage(event) : 0
  const isFull = event ? isEventFull(event) : false
  const canRegister = event ? canRegisterForEvent(event) : false
  const timeUntilEvent = event ? getTimeUntilEvent(event) : null
  const eventStatus = event ? getEventStatusLabel(event) : null

  const isPastEvent = event ? isPast(new Date(event.endDate)) : false
  const isOrganizer = isSignedIn && currentUser?.id === event?.organizer?.id
  const isAdmin = currentUser?.role === 'ADMIN'
  const canManage = isOrganizer || isAdmin

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return
    
    try {
      await cancelMutation.mutateAsync()
      toast.success('Registration cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel registration')
      console.error('Cancellation error:', error)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Removed from saved events' : 'Event saved!')
  }

  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    toast.success('🎉 Successfully registered for the event!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <EventDetailsSkeleton />
        <Footer />
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Event not found</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push('/events')} className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          {event.imageUrl ? (
            <div className="relative h-80 w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
              
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/events')}
                  className="bg-white/90 hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <div className="flex items-center gap-2">
                  {eventStatus && (
                    <Badge
                      variant={
                        eventStatus.color === 'green' ? 'default' :
                        eventStatus.color === 'red' ? 'destructive' :
                        'secondary'
                      }
                      className="bg-white/90"
                    >
                      {eventStatus.label}
                    </Badge>
                  )}
                  {hasEarlyBird && !isPastEvent && (
                    <Badge className="bg-yellow-500 text-white">
                      Early Bird
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="max-w-7xl mx-auto">
                  {event.category && (
                    <Badge
                      className="mb-3"
                      style={{
                        backgroundColor: event.category.color || '#6b7280',
                        color: 'white'
                      }}
                    >
                      {event.category.name}
                    </Badge>
                  )}
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={event.organizer?.imageUrl || undefined} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        <UserIcon className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-white">
                      <p className="text-xs opacity-90">Organized by</p>
                      <p className="font-semibold">
                        {event.organizer?.firstName} {event.organizer?.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/events')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                {eventStatus && (
                  <Badge
                    variant={
                      eventStatus.color === 'green' ? 'default' :
                      eventStatus.color === 'red' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {eventStatus.label}
                  </Badge>
                )}
              </div>
              
              {event.category && (
                <Badge
                  className="mb-4"
                  style={{
                    backgroundColor: event.category.color || '#6b7280',
                    color: 'white'
                  }}
                >
                  {event.category.name}
                </Badge>
              )}
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarImage src={event.organizer?.imageUrl || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    <UserIcon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-gray-600">Organized by</p>
                  <p className="font-semibold text-gray-900">
                    {event.organizer?.firstName} {event.organizer?.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {format(new Date(event.startDate), 'dd')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(event.startDate), 'MMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {format(new Date(event.startDate), 'h:mm')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(event.startDate), 'a')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalTicketsSold}
                  </p>
                  <p className="text-xs text-gray-600">
                    {hasTickets ? 'Tickets Sold' : 'Registered'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  {priceRange === 'Free' ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900">FREE</p>
                      <p className="text-xs text-gray-600">No ticket</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-gray-900">
                        {priceRange.replace('$', '').replace('-', ' - ')} ETB
                      </p>
                      <p className="text-xs text-gray-600">
                        {priceRange.includes('-') ? 'From' : 'Price'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Progress */}
        {!isPastEvent && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Event Capacity
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {fillPercentage.toFixed(0)}% Full
                </span>
              </div>
              <Progress value={fillPercentage} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{totalTicketsSold} {hasTickets ? 'tickets sold' : 'registered'}</span>
                {isFull ? (
                  <span className="text-red-600 font-medium">Event Full</span>
                ) : (
                  <span className="text-green-600 font-medium">
                    {availableSpots} {hasTickets ? 'tickets' : 'spots'} available
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Event */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About this event</h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap">
                      {event.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Trophy, label: 'Prizes' },
                      { icon: Wifi, label: 'Free WiFi' },
                      { icon: Coffee, label: 'Refreshments' },
                      { icon: Award, label: 'Certificate' },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Types */}
              {hasTickets && ticketSummary && ticketSummary.ticketTypes.length > 0 && (
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Ticket Options</h2>
                      {hasEarlyBird && (
                        <Badge variant="secondary">
                          Early Bird Available
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {ticketSummary.ticketTypes.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={cn(
                            "border rounded-lg p-4",
                            ticket.isSoldOut 
                              ? "bg-gray-50 opacity-60 border-gray-200" 
                              : "border-gray-200 hover:border-blue-300 bg-white"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-base">{ticket.name}</h4>
                                {ticket.isEarlyBird && !ticket.isSoldOut && (
                                  <Badge variant="secondary" className="text-xs">
                                    Early Bird
                                  </Badge>
                                )}
                                {ticket.isSoldOut && (
                                  <Badge variant="destructive" className="text-xs">
                                    Sold Out
                                  </Badge>
                                )}
                              </div>
                              
                              {ticket.description && (
                                <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                              )}
                              
                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {ticket.available} / {ticket.total} available
                                </span>
                              </div>
                              
                              <Progress 
                                value={(1 - ticket.available / ticket.total) * 100} 
                                className="h-2"
                              />
                            </div>
                            
                            <div className="text-right ml-6">
                              <p className="text-2xl font-bold text-blue-600">
                                {formatETB(ticket.price)}
                              </p>
                              {ticket.isEarlyBird && ticket.regularPrice !== ticket.price && (
                                <>
                                  <p className="text-sm text-gray-400 line-through">
                                    {formatETB(ticket.regularPrice)}
                                  </p>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Save {formatETB(ticket.regularPrice - ticket.price)}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {!ticket.isSoldOut && ticket.available < 10 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Only {ticket.available} tickets left!
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Details */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                        {event.venue && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Building2 className="w-4 h-4" />
                            {event.venue}
                          </p>
                        )}
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                          <Navigation className="w-4 h-4 mr-1" />
                          Get directions
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Date & Time</p>
                        <p className="text-gray-600">
                          {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                        </p>
                        <p className="text-gray-600">
                          {format(new Date(event.startDate), 'h:mm a')} -{' '}
                          {format(new Date(event.endDate), 'h:mm a')}
                        </p>
                        {timeUntilEvent && timeUntilEvent.isUpcoming && (
                          <div className="mt-2">
                            {isToday(new Date(event.startDate)) ? (
                              <Badge variant="default">
                                Today at {format(new Date(event.startDate), 'h:mm a')}
                              </Badge>
                            ) : isTomorrow(new Date(event.startDate)) ? (
                              <Badge variant="secondary">
                                Tomorrow
                              </Badge>
                            ) : (
                              <p className="text-sm text-orange-600 font-medium">
                                Starts in {timeUntilEvent.days} days
                              </p>
                            )}
                          </div>
                        )}
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          Add to calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendees */}
              {event.registrations && event.registrations.length > 0 && (
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Who&apos;s Coming
                      </h2>
                      <Badge variant="secondary">
                        {event._count?.registrations || 0} attendees
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {event.registrations
                        .filter((r: RegistrationWithRelations) => r.status === 'CONFIRMED')
                        .slice(0, 17)
                        .map((registration: RegistrationWithRelations) => (
                        <div
                          key={registration.id}
                          className="flex flex-col items-center gap-2"
                        >
                          <Avatar className="h-12 w-12 border-2 border-gray-200">
                            <AvatarImage src={registration.user?.imageUrl || undefined} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {registration.user?.firstName?.charAt(0)}
                              {registration.user?.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-900 text-center line-clamp-1">
                            {registration.user?.firstName} {registration.user?.lastName?.charAt(0)}.
                          </span>
                        </div>
                      ))}
                      {(event._count?.registrations || 0) > 17 && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                            <Users className="w-6 h-6 text-gray-600" />
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            +{(event._count?.registrations || 0) - 17}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Action Card */}
              <Card className="border border-gray-200 shadow-lg sticky top-32">
                <CardContent className="p-6">
                  {isPastEvent ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center">
                      <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">Event Ended</p>
                    </div>
                  ) : isRegistered ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">You&apos;re Registered!</p>
                      <p className="text-sm text-green-600 mt-1">Check your email for details</p>
                    </div>
                  ) : isFull ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                      <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold text-red-800">Event Full</p>
                    </div>
                  ) : !canRegister ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-center">
                      <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-semibold text-orange-800">Registration Closed</p>
                    </div>
                  ) : null}

                  {!isPastEvent && (
                    <div className="text-center py-4 border-b border-gray-200 mb-4">
                      {hasTickets ? (
                        <>
                          <p className="text-sm text-gray-600 mb-1">Tickets from</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {priceRange.replace('$', '').split('-')[0]} ETB
                          </p>
                        </>
                      ) : (
                        <>
                          {event.price > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 mb-1">Ticket Price</p>
                              <p className="text-3xl font-bold text-gray-900">
                                {formatETB(event.price)}
                              </p>
                            </>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2">
                              <span className="text-lg font-bold text-green-700">Free Event</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {!isSignedIn ? (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                        onClick={() => router.push('/sign-in')}
                      >
                        Sign In to Register
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : isPastEvent ? (
                      <Button className="w-full" disabled>
                        Event Ended
                      </Button>
                    ) : canManage ? (
                      <>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          onClick={() => router.push(`/events/${event.id}/manage`)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Event
                        </Button>
                        <Button
                          className="w-full border-gray-300"
                          variant="outline"
                          onClick={() => router.push(`/events/${event.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </Button>
                      </>
                    ) : isRegistered ? (
                      <Button
                        className="w-full border-gray-300"
                        variant="outline"
                        onClick={handleCancelRegistration}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Registration'
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          onClick={() => setShowRegistrationModal(true)}
                          disabled={isFull || !canRegister}
                        >
                          {isFull ? 'Event Full' : hasTickets ? 'Get Tickets' : 'Register Now'}
                          {!isFull && canRegister && <ArrowRight className="ml-2 w-4 h-4" />}
                        </Button>
                        {!isFull && canRegister && availableSpots < 20 && (
                          <p className="text-sm text-center text-orange-600 font-medium">
                            Only {availableSpots} spots left
                          </p>
                        )}
                      </>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={handleBookmark}
                        className="border-gray-300"
                      >
                        <Bookmark className={cn(
                          "w-4 h-4",
                          isBookmarked && "fill-current text-blue-600"
                        )} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="border-gray-300"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Card */}
              {event.organizer && (
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Event Organizer</h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={event.organizer.imageUrl || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {event.organizer.firstName?.charAt(0)}
                          {event.organizer.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {event.organizer.firstName} {event.organizer.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          <p className="text-sm truncate">{event.organizer.email}</p>
                        </div>
                        {event.organizer.role && (
                          <Badge variant="secondary" className="mt-2">
                            {event.organizer.role}
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 border-gray-300"
                          onClick={() => toast.info('Contact feature coming soon!')}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Organizer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Why Attend */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Why Attend?</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Trophy, text: 'Win exciting prizes and giveaways' },
                      { icon: Users, text: 'Network with industry professionals' },
                      { icon: Coffee, text: 'Enjoy refreshments and snacks' },
                    ].map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600 shrink-0" />
                          <span className="text-sm text-gray-700">{item.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Discover More
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Explore More Events?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join amazing events happening around you and connect with like-minded people
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-sm"
              >
                <Link href="/events">
                  Browse All Events
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              {isSignedIn && currentUser?.role !== 'ATTENDEE' && (
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/events/create">
                    Create Your Event
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && currentUser && (
        <RegistrationModal
          event={event}
          isOpen={showRegistrationModal}
          onClose={handleRegistrationComplete}
          currentUser={currentUser}
        />
      )}
    </>
  )
}