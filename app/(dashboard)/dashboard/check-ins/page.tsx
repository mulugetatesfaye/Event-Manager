// app/dashboard/check-ins/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useMyEvents } from '@/hooks'
import { useCurrentUser } from '@/hooks/use-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FadeIn } from '@/components/ui/fade-in'
import {
  UserCheck,
  Calendar,
  Users,
  TrendingUp,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { DashboardEvent } from '@/types'
import Image from 'next/image'

export default function CheckInsPage() {
  const router = useRouter()
  const { data: currentUser } = useCurrentUser()
  const { data: myEvents, isLoading } = useMyEvents()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!myEvents) return []
    
    return myEvents.filter((event: DashboardEvent) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      )
    })
  }, [myEvents, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    if (!myEvents) return { total: 0, upcoming: 0, past: 0, totalAttendees: 0 }

    const now = new Date()
    const upcoming = myEvents.filter((e: DashboardEvent) => new Date(e.startDate) > now).length
    const past = myEvents.filter((e: DashboardEvent) => new Date(e.startDate) <= now).length
    const totalAttendees = myEvents.reduce((sum: number, e: DashboardEvent) => 
      sum + (e._count?.registrations || 0), 0
    )

    return {
      total: myEvents.length,
      upcoming,
      past,
      totalAttendees,
    }
  }, [myEvents])

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

  // Check if user has permission
  if (currentUser?.role === 'ATTENDEE') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border border-gray-200">
          <CardContent className="pt-12 pb-12 px-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Organizer Access Required
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Only event organizers and administrators can access check-in management.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Event Check-ins
          </h1>
          <p className="text-sm text-gray-600">
            Manage attendee check-ins for your events
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FadeIn direction="up" delay={100}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-2">
                {stats.upcoming} upcoming
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={150}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalAttendees}</div>
              <p className="text-xs text-gray-600 mt-2">
                Across all events
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.upcoming}</div>
              <p className="text-xs text-gray-600 mt-2">
                Need check-in setup
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={250}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Past Events</CardTitle>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.past}</div>
              <p className="text-xs text-gray-600 mt-2">
                Completed
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Search */}
      <FadeIn direction="up" delay={300}>
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300 text-base"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <FadeIn direction="up" delay={350}>
            <Card className="border border-gray-200">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserCheck className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {searchQuery ? 'No events found' : 'No events yet'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first event to manage check-ins'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => router.push('/events/create')} 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          filteredEvents.map((event: DashboardEvent, index: number) => {
            const isPastEvent = new Date(event.endDate) < new Date()
            const registrationCount = event._count?.registrations || 0
            const fillRate = event.capacity > 0 
              ? Math.round((registrationCount / event.capacity) * 100)
              : 0

            return (
              <FadeIn key={event.id} direction="up" delay={350 + index * 50}>
                <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Event Image */}
                      {event.imageUrl ? (
                        <div className="relative w-full lg:w-24 h-40 lg:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full lg:w-24 h-40 lg:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate mb-2">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(event.startDate), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {format(new Date(event.startDate), 'h:mm a')}
                              </span>
                              <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{event.location}</span>
                              </span>
                            </div>
                          </div>

                          <Badge
                            variant={isPastEvent ? 'secondary' : 'default'}
                            className="flex-shrink-0"
                          >
                            {isPastEvent ? 'Past' : 'Upcoming'}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Registered</p>
                            <p className="text-base font-semibold text-gray-900">
                              {registrationCount} / {event.capacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Fill Rate</p>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-gray-900">
                                {fillRate}%
                              </p>
                              {fillRate >= 80 && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Status</p>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0 lg:self-center">
                        <Button
                          onClick={() => router.push(`/events/${event.id}/check-in`)}
                          disabled={registrationCount === 0}
                          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Manage Check-in
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )
          })
        )}
      </div>
    </div>
  )
}