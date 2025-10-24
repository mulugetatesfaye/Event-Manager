'use client'

import { useMyRegistrations, useMyEvents, useCancelRegistration } from '@/hooks'
import { useCurrentUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FadeIn } from '@/components/ui/fade-in'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Mail, 
  User, 
  X,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  DollarSign,
  ChevronRight,
  FileText,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { DashboardEvent, DashboardRegistration, RegistrationWithRelations } from '@/types'
import { useQuery } from '@tanstack/react-query'

export default function RegistrationsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()

  if (userLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (currentUser?.role === 'ATTENDEE') {
    return <AttendeeView />
  } else {
    return <OrganizerView />
  }
}

// Component for Attendees
function AttendeeView() {
  const { data: registrations, isLoading } = useMyRegistrations()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('')

  const handleCancelClick = (eventId: string, eventTitle: string) => {
    setSelectedEventId(eventId)
    setSelectedEventTitle(eventTitle)
    setCancelDialogOpen(true)
  }

  const cancelMutation = useCancelRegistration(selectedEventId || '')

  const handleCancelConfirm = async () => {
    if (selectedEventId) {
      await cancelMutation.mutateAsync()
      setCancelDialogOpen(false)
      setSelectedEventId(null)
      setSelectedEventTitle('')
    }
  }

  const upcomingRegistrations = useMemo(() => {
    return registrations?.filter(
      (reg: DashboardRegistration) => new Date(reg.event.startDate) > new Date()
    ).sort((a: DashboardRegistration, b: DashboardRegistration) => 
      new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime()
    ) || []
  }, [registrations])

  const pastRegistrations = useMemo(() => {
    return registrations?.filter(
      (reg: DashboardRegistration) => new Date(reg.event.startDate) <= new Date()
    ).sort((a: DashboardRegistration, b: DashboardRegistration) => 
      new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime()
    ) || []
  }, [registrations])

  const stats = useMemo(() => {
    return {
      total: registrations?.length || 0,
      upcoming: upcomingRegistrations.length,
      past: pastRegistrations.length
    }
  }, [registrations, upcomingRegistrations, pastRegistrations])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-5 pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                My Registrations
              </span>
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5">
              Events you&apos;re registered to attend
            </p>
          </div>
          <Button 
            asChild 
            size="sm" 
            className="h-7 text-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden w-fit"
          >
            <Link href="/events">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Search className="w-3 h-3 mr-1.5 relative" />
              <span className="relative">Browse Events</span>
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Total</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.total}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Upcoming</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.upcoming}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Completed</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.past}</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events Tabs */}
      <FadeIn direction="up" delay={250}>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-9">
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({upcomingRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs">
              Past ({pastRegistrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingRegistrations.length === 0 ? (
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50 relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-[0.015]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
                    backgroundSize: '1rem 1rem'
                  }}
                />
                <CardContent className="flex flex-col items-center justify-center py-12 relative">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl blur-xl" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No upcoming events</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center max-w-sm">
                    Discover and register for exciting events happening around you
                  </p>
                  <Button asChild size="sm" className="h-8 text-xs">
                    <Link href="/events">
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      Browse Events
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRegistrations.map((registration: DashboardRegistration) => (
                  <EventRegistrationCard
                    key={registration.id}
                    registration={registration}
                    onCancel={handleCancelClick}
                    isUpcoming
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastRegistrations.length === 0 ? (
              <Card className="border border-gray-200/50 backdrop-blur-sm bg-white/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-600">No past events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastRegistrations.map((registration: DashboardRegistration) => (
                  <EventRegistrationCard
                    key={registration.id}
                    registration={registration}
                    onCancel={handleCancelClick}
                    isUpcoming={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 border-gray-200/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-base">Cancel Registration?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-gray-600">
              Are you sure you want to cancel your registration for <span className="font-semibold text-gray-900">{selectedEventTitle}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs border-gray-300">Keep Registration</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Registration'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Event Registration Card Component
function EventRegistrationCard({ 
  registration, 
  onCancel, 
  isUpcoming 
}: { 
  registration: DashboardRegistration
  onCancel: (eventId: string, title: string) => void
  isUpcoming: boolean
}) {
  return (
    <Card className={`border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50 h-full ${!isUpcoming && 'opacity-75 hover:opacity-90'}`}>
      <CardContent className="pt-5 pb-5">
        {/* Event Category/Status */}
        <div className="flex items-center justify-between mb-3">
          {registration.event.category && (
            <Badge 
              className="text-[10px] h-5 px-2"
              style={{ backgroundColor: registration.event.category.color || '#6b7280' }}
            >
              {registration.event.category.name}
            </Badge>
          )}
          <Badge 
            variant={isUpcoming ? (registration.status === 'CONFIRMED' ? 'default' : 'secondary') : 'outline'}
            className="text-[10px] h-5 px-2"
          >
            {isUpcoming ? registration.status : 'COMPLETED'}
          </Badge>
        </div>

        {/* Event Title */}
        <h3 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem]">
          {registration.event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-[10px] text-gray-600">
            <Calendar className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div>{format(new Date(registration.event.startDate), 'EEEE, MMM dd, yyyy')}</div>
              <div className="text-gray-500">{format(new Date(registration.event.startDate), 'h:mm a')}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-[10px] text-gray-600">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{registration.event.location}</span>
          </div>
          {registration.event.price > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <DollarSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span>${registration.event.price.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            asChild 
            size="sm" 
            variant={isUpcoming ? 'default' : 'outline'}
            className="flex-1 h-7 text-xs"
          >
            <Link href={`/events/${registration.event.id}`}>
              <Eye className="w-3 h-3 mr-1.5" />
              View Event
            </Link>
          </Button>
          {isUpcoming && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={() => onCancel(registration.event.id, registration.event.title)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component for Organizers
function OrganizerView() {
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents()

  // Fetch all registrations for organizer's events
  const { data: allRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['organizer-registrations'],
    queryFn: async () => {
      const response = await fetch('/api/registrations/my-events')
      if (!response.ok) throw new Error('Failed to fetch registrations')
      return response.json()
    },
    enabled: !!myEvents && myEvents.length > 0
  })

  const stats = useMemo(() => {
    if (!allRegistrations) return {
      totalEvents: myEvents?.length || 0,
      totalRegistrations: 0,
      upcomingEvents: 0,
      totalRevenue: 0
    }

    const totalRegistrations = allRegistrations.length

    const totalRevenue = allRegistrations.reduce(
      (sum: number, reg: RegistrationWithRelations) => 
        sum + (reg.event?.price || 0),
      0
    )

    const upcomingEvents = myEvents?.filter(
      (event: DashboardEvent) => new Date(event.startDate) > new Date()
    ).length || 0

    return {
      totalEvents: myEvents?.length || 0,
      totalRegistrations,
      upcomingEvents,
      totalRevenue
    }
  }, [myEvents, allRegistrations])

  // Group registrations by event
  const eventRegistrations = useMemo(() => {
    if (!myEvents || !allRegistrations) return []

    return myEvents.map((event: DashboardEvent) => {
      const registrations = allRegistrations.filter(
        (reg: RegistrationWithRelations) => reg.eventId === event.id
      )

      return {
        event,
        registrations,
        count: registrations.length,
        fillRate: Math.round((registrations.length / event.capacity) * 100)
      }
    }).sort((a: { event: DashboardEvent }, b: { event: DashboardEvent }) => new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime())
  }, [myEvents, allRegistrations])

  const isLoading = eventsLoading || registrationsLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-5 pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Event Registrations
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">
            View and manage registrations across all your events
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.totalEvents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Total Events</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalEvents}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Registrations</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalRegistrations}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Upcoming</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.upcomingEvents}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={250}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Revenue</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">${stats.totalRevenue.toFixed(0)}</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events with Registrations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Event Registrations</h2>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Click on an event to view registrant details
            </p>
          </div>
        </div>

        {eventRegistrations.length === 0 ? (
          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
                  backgroundSize: '1rem 1rem'
                }}
              />
              <CardContent className="flex flex-col items-center justify-center py-12 relative">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl blur-xl" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No events yet</h3>
                <p className="text-sm text-gray-600 mb-4 text-center max-w-sm">
                  Create your first event to start receiving registrations
                </p>
                <Button asChild size="sm" className="h-8 text-xs">
                  <Link href="/events/create">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {eventRegistrations.map((item: { event: DashboardEvent; registrations: RegistrationWithRelations[]; count: number; fillRate: number }, index: number) => (
              <FadeIn key={item.event.id} direction="up" delay={300 + index * 50}>
                <EventWithRegistrationsCard 
                  event={item.event}
                  registrations={item.registrations}
                  count={item.count}
                  fillRate={item.fillRate}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Event with Registrations Card
function EventWithRegistrationsCard({
  event,
  registrations,
  count,
  fillRate
}: {
  event: DashboardEvent
  registrations: RegistrationWithRelations[]
  count: number
  fillRate: number
}) {
  const [expanded, setExpanded] = useState(false)
  const isUpcoming = new Date(event.startDate) > new Date()

  return (
    <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
      <CardContent className="pt-4 pb-4">
        {/* Event Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-primary group-hover:to-purple-600 transition-all">
                <Calendar className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {event.title}
                  </h3>
                  <Badge 
                    variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="text-[10px] h-5 px-2 flex-shrink-0"
                  >
                    {event.status}
                  </Badge>
                  {!isUpcoming && (
                    <Badge variant="outline" className="text-[10px] h-5 px-2 flex-shrink-0">
                      Past
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.startDate), 'h:mm a')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{event.location}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[80px]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900 tabular-nums">
                  {count}
                </p>
              </div>
              <p className="text-[10px] text-gray-600">
                of {event.capacity}
              </p>
              <div className="mt-1.5">
                <Progress value={fillRate} className="h-1 w-full" />
                <p className="text-[10px] text-gray-600 mt-0.5">{fillRate}% filled</p>
              </div>
            </div>

            <div className="flex gap-2">
              {count > 0 && (
                <Button 
                  variant="outline"
                  size="sm" 
                  className="h-8 text-xs border-gray-300"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide' : 'Show'} ({count})
                  <ChevronRight className={`w-3.5 h-3.5 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </Button>
              )}
              
              <Button 
                asChild 
                variant="outline"
                size="sm" 
                className="h-8 text-xs border-gray-300"
              >
                <Link href={`/events/${event.id}`}>
                  <Eye className="w-3 h-3 mr-1.5" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Registrations List */}
        {expanded && count > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              {registrations.map((registration: RegistrationWithRelations) => (
                <div 
                  key={registration.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage 
                        src={registration.user?.imageUrl || undefined} 
                        alt={`${registration.user?.firstName} ${registration.user?.lastName}`}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-[10px]">
                        {registration.user?.firstName?.[0]}{registration.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs text-gray-900">
                        {registration.user?.firstName} {registration.user?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" />
                        {registration.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={registration.status === 'CONFIRMED' ? 'default' : 'secondary'}
                      className="text-[10px] h-5 px-2"
                    >
                      {registration.status}
                    </Badge>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {format(new Date(registration.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}