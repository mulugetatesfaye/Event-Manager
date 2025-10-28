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
  X,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  Shield,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { DashboardEvent, DashboardRegistration, RegistrationWithRelations } from '@/types'
import { useQuery } from '@tanstack/react-query'

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `Br ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

export default function RegistrationsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()

  if (userLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (currentUser?.role === 'ADMIN') {
    return <AdminView />
  } else if (currentUser?.role === 'ATTENDEE') {
    return <AttendeeView />
  } else {
    return <OrganizerView />
  }
}

// Component for Admins - System-wide view
function AdminView() {
  // Fetch all events in the system
  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-all-events'],
    queryFn: async () => {
      const response = await fetch('/api/admin/events?limit=0')
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json()
    }
  })

  // Fetch all registrations in the system
  const { data: allRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['admin-all-registrations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/registrations')
      if (!response.ok) throw new Error('Failed to fetch registrations')
      return response.json()
    }
  })

  const stats = useMemo(() => {
    if (!allRegistrations || !allEvents) return {
      totalEvents: 0,
      totalRegistrations: 0,
      upcomingEvents: 0,
      totalRevenue: 0
    }

    const totalRegistrations = allRegistrations.length

    const totalRevenue = allRegistrations.reduce(
      (sum: number, reg: RegistrationWithRelations) => 
        sum + (reg.finalAmount || reg.totalAmount || reg.event?.price || 0),
      0
    )

    const upcomingEvents = allEvents.filter(
      (event: DashboardEvent) => new Date(event.startDate) > new Date()
    ).length

    return {
      totalEvents: allEvents.length,
      totalRegistrations,
      upcomingEvents,
      totalRevenue
    }
  }, [allEvents, allRegistrations])

  // Group registrations by event
  const eventRegistrations = useMemo(() => {
    if (!allEvents || !allRegistrations) return []

    return allEvents.map((event: DashboardEvent) => {
      const registrations = allRegistrations.filter(
        (reg: RegistrationWithRelations) => reg.eventId === event.id
      )

      return {
        event,
        registrations,
        count: registrations.length,
        fillRate: Math.round((registrations.length / event.capacity) * 100)
      }
    }).sort((a: { event: DashboardEvent }, b: { event: DashboardEvent}) => 
      new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime()
    )
  }, [allEvents, allRegistrations])

  const isLoading = eventsLoading || registrationsLoading

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                All Registrations
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              System-wide view of all event registrations
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <FadeIn direction="up" delay={100}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalEvents)}</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={150}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalRegistrations)}</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.upcomingEvents)}</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={250}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Events with Registrations */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Event Registrations</h2>
          <p className="text-sm text-gray-600 mt-1">
            View registrations across all events in the system
          </p>
        </div>

        {eventRegistrations.length === 0 ? (
          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events in system</h3>
                <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                  No events have been created yet
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {eventRegistrations.map((item: { event: DashboardEvent; registrations: RegistrationWithRelations[]; count: number; fillRate: number }, index: number) => (
              <FadeIn key={item.event.id} direction="up" delay={300 + index * 50}>
                <EventWithRegistrationsCard 
                  event={item.event}
                  registrations={item.registrations}
                  count={item.count}
                  fillRate={item.fillRate}
                  isAdmin={true}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Component for Attendees
function AttendeeView() {
  const { data: registrations, isLoading } = useMyRegistrations()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('')
  const [selectedEventStartDate, setSelectedEventStartDate] = useState<Date | string | null>(null)

  const handleCancelClick = (eventId: string, eventTitle: string, eventStartDate: Date | string) => {
    setSelectedEventId(eventId)
    setSelectedEventTitle(eventTitle)
    setSelectedEventStartDate(eventStartDate)
    setCancelDialogOpen(true)
  }

  const cancelMutation = useCancelRegistration(selectedEventId || '')

  const handleCancelConfirm = async () => {
    if (selectedEventId && selectedEventStartDate) {
      await cancelMutation.mutateAsync(selectedEventStartDate)
      setCancelDialogOpen(false)
      setSelectedEventId(null)
      setSelectedEventTitle('')
      setSelectedEventStartDate(null)
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
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Registrations
            </h1>
            <p className="text-sm text-gray-600">
              Events you&apos;re registered to attend
            </p>
          </div>
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Link href="/events">
              <Search className="w-4 h-4 mr-2" />
              Browse Events
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-6">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.upcoming)}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.past)}</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events Tabs */}
      <FadeIn direction="up" delay={250}>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({formatNumber(upcomingRegistrations.length)})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({formatNumber(pastRegistrations.length)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingRegistrations.length === 0 ? (
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <Calendar className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                    Discover and register for exciting events happening around you
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Link href="/events">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Events
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <TabsContent value="past" className="mt-6">
            {pastRegistrations.length === 0 ? (
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">No past events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">Cancel Registration?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              Are you sure you want to cancel your registration for <span className="font-semibold text-gray-900">{selectedEventTitle}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Keep Registration</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
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
  onCancel: (eventId: string, title: string, startDate: Date | string) => void
  isUpcoming: boolean
}) {
  return (
    <Card className={`border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full ${!isUpcoming && 'opacity-60 hover:opacity-80'}`}>
      <CardContent className="p-6">
        {/* Event Category/Status */}
        <div className="flex items-center justify-between mb-4">
          {registration.event.category && (
            <Badge 
              className="text-xs"
              style={{ backgroundColor: registration.event.category.color || '#6b7280' }}
            >
              {registration.event.category.name}
            </Badge>
          )}
          <Badge 
            variant={isUpcoming ? (registration.status === 'CONFIRMED' ? 'default' : 'secondary') : 'outline'}
            className="text-xs"
          >
            {isUpcoming ? registration.status : 'COMPLETED'}
          </Badge>
        </div>

        {/* Event Title */}
        <h3 className="font-semibold text-base text-gray-900 mb-4 line-clamp-2 min-h-[3rem]">
          {registration.event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">{format(new Date(registration.event.startDate), 'EEEE, MMM dd, yyyy')}</div>
              <div className="text-xs text-gray-500">{format(new Date(registration.event.startDate), 'h:mm a')}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{registration.event.location}</span>
          </div>
          {registration.event.price > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{formatCurrency(registration.event.price)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            asChild 
            size="sm" 
            variant={isUpcoming ? 'default' : 'outline'}
            className={`flex-1 ${isUpcoming ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300'}`}
          >
            <Link href={`/events/${registration.event.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Event
            </Link>
          </Button>
          {isUpcoming && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={() => onCancel(registration.event.id, registration.event.title, registration.event.startDate)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component for Organizers (keeping rest of the code same as before)
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
        sum + (reg.finalAmount || reg.totalAmount || reg.event?.price || 0),
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
    }).sort((a: { event: DashboardEvent }, b: { event: DashboardEvent}) => 
      new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime()
    )
  }, [myEvents, allRegistrations])

  const isLoading = eventsLoading || registrationsLoading

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Event Registrations
          </h1>
          <p className="text-sm text-gray-600">
            View and manage registrations across all your events
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.totalEvents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalEvents)}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Registrations</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalRegistrations)}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.upcomingEvents)}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={250}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events with Registrations */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Event Registrations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on an event to view registrant details
          </p>
        </div>

        {eventRegistrations.length === 0 ? (
          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events yet</h3>
                <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                  Create your first event to start receiving registrations
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Link href="/events/create">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-4">
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

// Event with Registrations Card (unchanged)
function EventWithRegistrationsCard({
  event,
  registrations,
  count,
  fillRate,
  isAdmin = false
}: {
  event: DashboardEvent
  registrations: RegistrationWithRelations[]
  count: number
  fillRate: number
  isAdmin?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const isUpcoming = new Date(event.startDate) > new Date()

  return (
    <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Event Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-3">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {event.title}
                  </h3>
                  <Badge 
                    variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {event.status}
                  </Badge>
                  {!isUpcoming && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      Past
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="outline" className="text-xs flex-shrink-0 border-purple-200 bg-purple-50 text-purple-700">
                      <Building className="w-3 h-3 mr-1" />
                      {event.organizer?.firstName} {event.organizer?.lastName}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {format(new Date(event.startDate), 'h:mm a')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{event.location}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center gap-6">
            <div className="text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-400" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(count)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                of {formatNumber(event.capacity)}
              </p>
              <Progress value={fillRate} className="h-2 w-full mb-1" />
              <p className="text-xs text-gray-600">{fillRate}% filled</p>
            </div>

            <div className="flex gap-2">
              {count > 0 && (
                <Button 
                  variant="outline"
                  size="sm" 
                  className="border-gray-300"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide' : 'Show'} ({formatNumber(count)})
                  <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </Button>
              )}
              
              <Button 
                asChild 
                variant="outline"
                size="sm" 
                className="border-gray-300"
              >
                <Link href={`/events/${event.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Registrations List */}
        {expanded && count > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              {registrations.map((registration: RegistrationWithRelations) => (
                <div 
                  key={registration.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-gray-200">
                      <AvatarImage 
                        src={registration.user?.imageUrl || undefined} 
                        alt={`${registration.user?.firstName} ${registration.user?.lastName}`}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {registration.user?.firstName?.[0]}{registration.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {registration.user?.firstName} {registration.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {registration.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={registration.status === 'CONFIRMED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {registration.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
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