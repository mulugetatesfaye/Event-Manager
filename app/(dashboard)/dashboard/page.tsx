'use client'

import { useCurrentUser, useMyEvents, useMyRegistrations } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FadeIn } from '@/components/ui/fade-in'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  Search,
  Settings,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MapPin,
  Sparkles,
  Eye,
  Target,
  DollarSign,
  UserCheck,
  Star,
  Zap,
  Award,
  Rocket,
  Globe,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DashboardEvent, DashboardRegistration } from '@/types'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents()
  const { data: myRegistrations, isLoading: registrationsLoading } = useMyRegistrations()

  const isOrganizer = user?.role !== 'ATTENDEE'

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalEvents = myEvents?.length || 0
    const upcomingEvents = myEvents?.filter(
      (event: DashboardEvent) => new Date(event.startDate) > new Date()
    ).length || 0
    
    const totalRegistrations = myRegistrations?.length || 0
    const upcomingRegistrations = myRegistrations?.filter(
      (reg: DashboardRegistration) => new Date(reg.event.startDate) > new Date()
    ).length || 0

    // Organizer-specific stats
    const totalAttendees = myEvents?.reduce(
      (sum: number, event: DashboardEvent) => sum + (event._count?.registrations || 0), 
      0
    ) || 0

    const totalRevenue = myEvents?.reduce(
      (sum: number, event: DashboardEvent) => 
        sum + (event.price * (event._count?.registrations || 0)), 
      0
    ) || 0

    const avgAttendanceRate = totalEvents > 0 
      ? myEvents?.reduce((sum: number, event: DashboardEvent) => {
          const rate = ((event._count?.registrations || 0) / event.capacity) * 100
          return sum + rate
        }, 0) / totalEvents 
      : 0

    const publishedEvents = myEvents?.filter(
      (event: DashboardEvent) => event.status === 'PUBLISHED'
    ).length || 0

    const draftEvents = myEvents?.filter(
      (event: DashboardEvent) => event.status === 'DRAFT'
    ).length || 0

    const completedEvents = myEvents?.filter(
      (event: DashboardEvent) => event.status === 'COMPLETED'
    ).length || 0

    const completionRate = totalEvents > 0 
      ? Math.round((completedEvents / totalEvents) * 100)
      : 0

    return {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      upcomingRegistrations,
      totalAttendees,
      totalRevenue,
      avgAttendanceRate: Math.round(avgAttendanceRate),
      publishedEvents,
      draftEvents,
      completedEvents,
      completionRate
    }
  }, [myEvents, myRegistrations])

  // Get next upcoming event for attendees
  const nextEvent = useMemo(() => {
    return myRegistrations
      ?.filter((reg: DashboardRegistration) => new Date(reg.event.startDate) > new Date())
      .sort((a: DashboardRegistration, b: DashboardRegistration) => 
        new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime()
      )[0]
  }, [myRegistrations])

  // Get next upcoming event for organizers
  const nextOrganizerEvent = useMemo(() => {
    return myEvents
      ?.filter((event: DashboardEvent) => new Date(event.startDate) > new Date())
      .sort((a: DashboardEvent, b: DashboardEvent) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )[0]
  }, [myEvents])

  const isLoading = userLoading || eventsLoading || registrationsLoading

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-5 pb-8">
      {/* Header Section */}
      <FadeIn direction="down">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}!
              </span>
              <span className="ml-2">👋</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5">
              {isOrganizer 
                ? "Here's an overview of your events and performance" 
                : "Here's what's happening with your events today"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="h-7 text-xs border-gray-300 hover:border-gray-400">
              <Link href="/events">
                <Search className="w-3 h-3 mr-1.5" />
                Browse Events
              </Link>
            </Button>
            {isOrganizer && (
              <Button 
                asChild 
                size="sm" 
                className="h-7 text-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
              >
                <Link href="/events/create">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Plus className="w-3 h-3 mr-1.5 relative" />
                  <span className="relative">Create Event</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid - Different for Organizers vs Attendees */}
      {isOrganizer ? (
        <>
          {/* Organizer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <FadeIn direction="up" delay={100}>
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-gray-700">Total Events</CardTitle>
                  <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl font-bold text-gray-900 tabular-nums">{stats.totalEvents}</div>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {stats.publishedEvents} published, {stats.draftEvents} drafts
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.completionRate} className="h-0.5" />
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {stats.completionRate}% completion rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-gray-700">Total Attendees</CardTitle>
                  <div className="h-7 w-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <UserCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl font-bold text-gray-900 tabular-nums">{stats.totalAttendees}</div>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Across all your events
                  </p>
                  {stats.upcomingEvents > 0 && (
                    <Button asChild variant="link" className="px-0 h-auto mt-1.5 p-0" size="sm">
                      <Link href="/dashboard/registrations" className="text-[10px] text-primary hover:text-primary/80">
                        View registrations <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={300}>
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-gray-700">Total Revenue</CardTitle>
                  <div className="h-7 w-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <DollarSign className="h-3.5 w-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl font-bold text-gray-900 tabular-nums">${stats.totalRevenue.toFixed(0)}</div>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    From ticket sales
                  </p>
                  {stats.totalRevenue > 0 && (
                    <Button asChild variant="link" className="px-0 h-auto mt-1.5 p-0" size="sm">
                      <Link href="/dashboard/analytics" className="text-[10px] text-primary hover:text-primary/80">
                        View analytics <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={400}>
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-gray-700">Avg Fill Rate</CardTitle>
                  <div className="h-7 w-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Target className="h-3.5 w-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-xl font-bold text-gray-900 tabular-nums">{stats.avgAttendanceRate}%</div>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Average event capacity
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.avgAttendanceRate} className="h-0.5" />
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      Event performance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Next Organizer Event Highlight */}
          {nextOrganizerEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-background border-primary/20 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-sm">Your Next Event</CardTitle>
                  </div>
                  <CardDescription className="text-[10px]">Upcoming event details</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-gray-900">{nextOrganizerEvent.title}</h3>
                      <div className="flex flex-wrap gap-3 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(nextOrganizerEvent.startDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(nextOrganizerEvent.startDate), 'p')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{nextOrganizerEvent._count?.registrations || 0} / {nextOrganizerEvent.capacity} registered</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs border-gray-300">
                        <Link href={`/events/${nextOrganizerEvent.id}`}>
                          <Eye className="w-3 h-3 mr-1.5" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="h-7 text-xs">
                        <Link href={`/events/${nextOrganizerEvent.id}/edit`}>
                          Edit Event
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </>
      ) : (
        <>
          {/* Attendee Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                title: 'My Registrations',
                value: stats.totalRegistrations,
                subtitle: "Events you're attending",
                icon: Users,
                color: 'from-green-500 to-green-600',
                link: stats.totalRegistrations > 0 ? '/dashboard/registrations' : null,
                linkText: 'Manage'
              },
              {
                title: 'Upcoming Attendance',
                value: stats.upcomingRegistrations,
                subtitle: 'Events to attend soon',
                icon: TrendingUp,
                color: 'from-orange-500 to-orange-600',
                link: stats.upcomingRegistrations > 0 ? '/dashboard/registrations' : null,
                linkText: 'View schedule'
              },
              {
                title: 'Events Attended',
                value: stats.totalRegistrations - stats.upcomingRegistrations,
                subtitle: 'Past events completed',
                icon: CheckCircle2,
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Discover More',
                value: 'Browse',
                subtitle: 'Find new events',
                icon: Search,
                color: 'from-purple-500 to-purple-600',
                link: '/events',
                linkText: 'Explore events'
              }
            ].map((stat, index) => (
              <FadeIn key={index} direction="up" delay={(index + 1) * 100}>
                <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                    <CardTitle className="text-xs font-medium text-gray-700">{stat.title}</CardTitle>
                    <div className={cn(
                      "h-7 w-7 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform",
                      stat.color
                    )}>
                      <stat.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-xl font-bold text-gray-900 tabular-nums">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {stat.subtitle}
                    </p>
                    {stat.link && (
                      <Button asChild variant="link" className="px-0 h-auto mt-1.5 p-0" size="sm">
                        <Link href={stat.link} className="text-[10px] text-primary hover:text-primary/80">
                          {stat.linkText} <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Next Attendee Event Highlight */}
          {nextEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-background border-primary/20 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-sm">Your Next Event</CardTitle>
                  </div>
                  <CardDescription className="text-[10px]">Coming up soon</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-gray-900">{nextEvent.event.title}</h3>
                      <div className="flex flex-wrap gap-3 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(nextEvent.event.startDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(nextEvent.event.startDate), 'p')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{nextEvent.event.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild size="sm" className="h-7 text-xs">
                      <Link href={`/events/${nextEvent.event.id}`}>
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Recent Events for Organizers */}
        {isOrganizer && (
          <FadeIn direction="up" delay={600}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-white" />
                      </div>
                      Your Events
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-[10px]">
                      Recently created events
                    </CardDescription>
                  </div>
                  {myEvents && myEvents.length > 0 && (
                    <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                      <Link href="/dashboard/my-events">
                        View all
                        <ArrowRight className="w-2.5 h-2.5 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                {myEvents && myEvents.length > 0 ? (
                  <div className="space-y-2">
                    {myEvents.slice(0, 5).map((event: DashboardEvent) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2.5 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-medium text-xs truncate text-gray-900">{event.title}</h4>
                            <Badge 
                              variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className="flex-shrink-0 text-[10px] h-4 px-1.5"
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {format(new Date(event.startDate), 'MMM dd')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" />
                              {event._count?.registrations || 0} / {event.capacity}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-2.5 h-2.5" />
                              {Math.round(((event._count?.registrations || 0) / event.capacity) * 100)}%
                            </span>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                          <Link href={`/events/${event.id}`}>
                            <Eye className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-600 mb-2">No events yet</p>
                    <Button asChild size="sm" className="h-6 text-[10px] px-3">
                      <Link href="/events/create">
                        <Plus className="w-3 h-3 mr-1" />
                        Create Your First Event
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Upcoming Registrations / Top Performing Events */}
        <FadeIn direction="up" delay={isOrganizer ? 700 : 600}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "w-6 h-6 bg-gradient-to-br rounded flex items-center justify-center",
                      isOrganizer ? "from-purple-500 to-purple-600" : "from-green-500 to-green-600"
                    )}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    {isOrganizer ? 'Top Performing Events' : 'Upcoming Events'}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-[10px]">
                    {isOrganizer 
                      ? 'Events with highest registration rates'
                      : 'Events you\'re registered for'}
                  </CardDescription>
                </div>
                {myRegistrations && myRegistrations.length > 0 && !isOrganizer && (
                  <Button asChild variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    <Link href="/dashboard/registrations">
                      View all
                      <ArrowRight className="w-2.5 h-2.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {isOrganizer ? (
                myEvents && myEvents.length > 0 ? (
                  <div className="space-y-2">
                    {myEvents
                      .filter((event: DashboardEvent) => event.status === 'PUBLISHED')
                      .sort((a: DashboardEvent, b: DashboardEvent) => {
                        const rateA = ((a._count?.registrations || 0) / a.capacity) * 100
                        const rateB = ((b._count?.registrations || 0) / b.capacity) * 100
                        return rateB - rateA
                      })
                      .slice(0, 5)
                      .map((event: DashboardEvent) => {
                        const fillRate = Math.round(((event._count?.registrations || 0) / event.capacity) * 100)
                        return (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-2.5 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs truncate mb-0.5 text-gray-900">{event.title}</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 text-[10px] text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-2.5 h-2.5" />
                                    {event._count?.registrations || 0} / {event.capacity}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {format(new Date(event.startDate), 'MMM dd')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={fillRate} className="h-0.5 flex-1" />
                                  <span className="text-[10px] font-medium text-gray-700">{fillRate}%</span>
                                </div>
                              </div>
                            </div>
                            <Button asChild size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2">
                              <Link href={`/events/${event.id}`}>
                                <Eye className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-600 mb-2">No published events yet</p>
                    <Button asChild size="sm" className="h-6 text-[10px] px-3">
                      <Link href="/events/create">
                        <Plus className="w-3 h-3 mr-1" />
                        Create Event
                      </Link>
                    </Button>
                  </div>
                )
              ) : (
                myRegistrations && 
                myRegistrations.filter((reg: DashboardRegistration) => 
                  new Date(reg.event.startDate) > new Date()
                ).length > 0 ? (
                  <div className="space-y-2">
                    {myRegistrations
                      .filter((reg: DashboardRegistration) => new Date(reg.event.startDate) > new Date())
                      .slice(0, 5)
                      .map((registration: DashboardRegistration) => (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between p-2.5 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs truncate mb-0.5 text-gray-900">{registration.event.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {format(new Date(registration.event.startDate), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate">{registration.event.location}</span>
                              </span>
                            </div>
                          </div>
                          <Button asChild size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                            <Link href={`/events/${registration.event.id}`}>
                              <Eye className="w-3 h-3" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-600 mb-2">No upcoming events</p>
                    <Button asChild size="sm" className="h-6 text-[10px] px-3">
                      <Link href="/events">
                        <Search className="w-3 h-3 mr-1" />
                        Browse Events
                      </Link>
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Performance Insights for Organizers */}
      {isOrganizer && myEvents && myEvents.length > 0 && (
        <FadeIn direction="up" delay={800}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
                <CardTitle className="text-sm">Performance Insights</CardTitle>
              </div>
              <CardDescription className="text-[10px]">Key metrics for your events</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Most Popular Event */}
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                      <TrendingUp className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-xs text-blue-900">Most Popular</h4>
                  </div>
                  {(() => {
                    const mostPopular = myEvents
                      .filter((event: DashboardEvent) => event.status === 'PUBLISHED')
                      .sort((a: DashboardEvent, b: DashboardEvent) => 
                        (b._count?.registrations || 0) - (a._count?.registrations || 0)
                      )[0]
                    
                    return mostPopular ? (
                      <div>
                        <p className="text-xs font-medium text-blue-900 truncate">{mostPopular.title}</p>
                        <p className="text-[10px] text-blue-700 mt-0.5">
                          {mostPopular._count?.registrations || 0} registrations
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-blue-700">No published events yet</p>
                    )
                  })()}
                </div>

                {/* Highest Revenue */}
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center">
                      <DollarSign className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-xs text-green-900">Highest Revenue</h4>
                  </div>
                  {(() => {
                    const highestRevenue = myEvents
                      .filter((event: DashboardEvent) => event.price > 0)
                      .sort((a: DashboardEvent, b: DashboardEvent) => 
                        (b.price * (b._count?.registrations || 0)) - (a.price * (a._count?.registrations || 0))
                      )[0]
                    
                    return highestRevenue ? (
                      <div>
                        <p className="text-xs font-medium text-green-900 truncate">{highestRevenue.title}</p>
                        <p className="text-[10px] text-green-700 mt-0.5">
                          ${(highestRevenue.price * (highestRevenue._count?.registrations || 0)).toFixed(0)} earned
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-green-700">No paid events yet</p>
                    )
                  })()}
                </div>

                {/* Next Event */}
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center">
                      <Clock className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-xs text-purple-900">Coming Next</h4>
                  </div>
                  {nextOrganizerEvent ? (
                    <div>
                      <p className="text-xs font-medium text-purple-900 truncate">{nextOrganizerEvent.title}</p>
                      <p className="text-[10px] text-purple-700 mt-0.5">
                        {format(new Date(nextOrganizerEvent.startDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-purple-700">No upcoming events</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Quick Actions */}
      <FadeIn direction="up" delay={900}>
        <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </div>
            <CardDescription className="text-[10px]">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {isOrganizer && (
                <>
                  <Button asChild variant="outline" className="h-auto p-2.5 justify-start border-gray-200/50 hover:border-gray-300/50 hover:shadow-md transition-all group">
                    <Link href="/events/create">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-primary group-hover:to-purple-600 transition-all">
                          <Plus className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-xs text-gray-900">Create Event</div>
                          <div className="text-[10px] text-gray-600">Start a new event</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-2.5 justify-start border-gray-200/50 hover:border-gray-300/50 hover:shadow-md transition-all group">
                    <Link href="/dashboard/my-events">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-xs text-gray-900">My Events</div>
                          <div className="text-[10px] text-gray-600">Manage your events</div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-2.5 justify-start border-gray-200/50 hover:border-gray-300/50 hover:shadow-md transition-all group">
                    <Link href="/dashboard/analytics">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-orange-500 group-hover:to-orange-600 transition-all">
                          <BarChart3 className="w-3.5 h-3.5 text-orange-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-xs text-gray-900">Analytics</div>
                          <div className="text-[10px] text-gray-600">View insights</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </>
              )}
              
              <Button asChild variant="outline" className="h-auto p-2.5 justify-start border-gray-200/50 hover:border-gray-300/50 hover:shadow-md transition-all group">
                <Link href="/events">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-green-500 group-hover:to-green-600 transition-all">
                      <Search className="w-3.5 h-3.5 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-xs text-gray-900">Browse Events</div>
                      <div className="text-[10px] text-gray-600">Find events to join</div>
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-2.5 justify-start border-gray-200/50 hover:border-gray-300/50 hover:shadow-md transition-all group">
                <Link href="/dashboard/settings">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-purple-500 group-hover:to-pink-600 transition-all">
                      <Settings className="w-3.5 h-3.5 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-xs text-gray-900">Settings</div>
                      <div className="text-[10px] text-gray-600">Manage account</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}