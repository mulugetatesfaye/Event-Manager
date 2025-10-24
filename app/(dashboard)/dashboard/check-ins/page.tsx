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
  CheckCircle2,
  AlertCircle,
  Sparkles,
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
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Check if user has permission
  if (currentUser?.role === 'ATTENDEE') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Organizer Access Required
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Only event organizers and administrators can access check-in management.
          </p>
          <Button onClick={() => router.push('/dashboard')} size="sm">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="down">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Event Check-ins
              </span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage attendee check-ins for your events
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FadeIn direction="up" delay={100}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-medium text-gray-700">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.upcoming} upcoming
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-medium text-gray-700">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</div>
              <p className="text-xs text-gray-600 mt-1">
                Across all events
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={300}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-medium text-gray-700">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
              <p className="text-xs text-gray-600 mt-1">
                Need check-in setup
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-medium text-gray-700">Past Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-gray-900">{stats.past}</div>
              <p className="text-xs text-gray-600 mt-1">
                Completed
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Search */}
      <FadeIn direction="up" delay={500}>
        <Card className="border border-gray-200/50 backdrop-blur-sm bg-white/50">
          <CardContent className="pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <FadeIn direction="up" delay={600}>
            <Card className="border border-gray-200/50 backdrop-blur-sm bg-white/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No events found' : 'No events yet'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first event to manage check-ins'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => router.push('/events/create')} size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
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
              <FadeIn key={event.id} direction="up" delay={600 + index * 50}>
                <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Event Image */}
                      {event.imageUrl ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <Calendar className="w-8 h-8 text-primary" />
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-gray-900 truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(event.startDate), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(event.startDate), 'h:mm a')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                              </span>
                            </div>
                          </div>

                          <Badge
                            variant={isPastEvent ? 'secondary' : 'default'}
                            className="text-xs flex-shrink-0"
                          >
                            {isPastEvent ? 'Past' : 'Upcoming'}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Registered</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {registrationCount} / {event.capacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Fill Rate</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {fillRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">Status</p>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/events/${event.id}/check-in`)}
                          className="h-8 text-xs"
                          disabled={registrationCount === 0}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                          Manage
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
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