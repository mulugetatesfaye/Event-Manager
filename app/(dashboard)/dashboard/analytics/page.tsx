'use client'

import { useMyEvents } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FadeIn } from '@/components/ui/fade-in'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  BarChart3,
  Target,
  Award,
  Zap,
  Clock,
} from 'lucide-react'
import { DashboardEvent } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { useMemo } from 'react'

export default function AnalyticsPage() {
  const { data: events, isLoading } = useMyEvents()

  // Calculate statistics
  const stats = useMemo(() => {
    if (!events) return {
      totalEvents: 0,
      publishedEvents: 0,
      draftEvents: 0,
      totalRegistrations: 0,
      totalRevenue: 0,
      averageAttendance: 0,
      avgFillRate: 0,
      upcomingEvents: 0,
      pastEvents: 0,
      topPerforming: null,
      highestRevenue: null
    }

    const totalEvents = events.length
    const publishedEvents = events.filter((e: DashboardEvent) => e.status === 'PUBLISHED').length
    const draftEvents = events.filter((e: DashboardEvent) => e.status === 'DRAFT').length
    const totalRegistrations = events.reduce(
      (sum: number, event: DashboardEvent) => sum + (event._count?.registrations || 0), 
      0
    )
    const totalRevenue = events.reduce(
      (sum: number, event: DashboardEvent) => 
        sum + (event.price * (event._count?.registrations || 0)), 
      0
    )
    const averageAttendance = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0
    
    const publishedEventsData = events.filter((e: DashboardEvent) => e.status === 'PUBLISHED')
    const avgFillRate = publishedEventsData.length > 0
      ? Math.round(publishedEventsData.reduce((sum: number, event: DashboardEvent) => {
          return sum + ((event._count?.registrations || 0) / event.capacity * 100)
        }, 0) / publishedEventsData.length)
      : 0

    const upcomingEvents = events.filter(
      (e: DashboardEvent) => new Date(e.startDate) > new Date()
    ).length

    const pastEvents = events.filter(
      (e: DashboardEvent) => new Date(e.startDate) <= new Date()
    ).length

    const topPerforming = publishedEventsData.length > 0
      ? publishedEventsData.reduce((top: DashboardEvent, event: DashboardEvent) => {
          const currentFillRate = ((event._count?.registrations || 0) / event.capacity) * 100
          const topFillRate = ((top._count?.registrations || 0) / top.capacity) * 100
          return currentFillRate > topFillRate ? event : top
        })
      : null

    const highestRevenue = events.length > 0
      ? events.reduce((top: DashboardEvent, event: DashboardEvent) => {
          const currentRevenue = event.price * (event._count?.registrations || 0)
          const topRevenue = top.price * (top._count?.registrations || 0)
          return currentRevenue > topRevenue ? event : top
        })
      : null

    return {
      totalEvents,
      publishedEvents,
      draftEvents,
      totalRegistrations,
      totalRevenue,
      averageAttendance,
      avgFillRate,
      upcomingEvents,
      pastEvents,
      topPerforming,
      highestRevenue
    }
  }, [events])

  const upcomingEvents = useMemo(() => {
    return events?.filter(
      (e: DashboardEvent) => new Date(e.startDate) > new Date() && e.status === 'PUBLISHED'
    ).sort((a: DashboardEvent, b: DashboardEvent) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ) || []
  }, [events])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            Analytics
          </h1>
          <p className="text-sm text-gray-600">
            Track your event performance and key metrics
          </p>
        </div>
      </FadeIn>

      {/* Main Stats Grid */}
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
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                <p className="text-xs text-gray-600">
                  {stats.publishedEvents} published
                </p>
              </div>
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
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                <p className="text-xs text-gray-600">
                  Across all events
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.averageAttendance}</p>
                <p className="text-xs text-gray-600">
                  Per event
                </p>
              </div>
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
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toFixed(0)} ETB</p>
                <p className="text-xs text-gray-600">
                  From ticket sales
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <FadeIn direction="up" delay={300}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Fill Rate</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-gray-900">{stats.avgFillRate}%</p>
                <Progress value={stats.avgFillRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={350}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                <p className="text-xs text-gray-600">
                  Scheduled
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.pastEvents}</p>
                <p className="text-xs text-gray-600">
                  Past events
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={450}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.draftEvents}</p>
                <p className="text-xs text-gray-600">
                  Unpublished
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Top Performers */}
      {(stats.topPerforming || stats.highestRevenue) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.topPerforming && (
            <FadeIn direction="up" delay={500}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base font-semibold">Top Performing Event</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Highest fill rate</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-base text-gray-900 mb-4">{stats.topPerforming.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fill Rate</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(((stats.topPerforming._count?.registrations || 0) / stats.topPerforming.capacity) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={((stats.topPerforming._count?.registrations || 0) / stats.topPerforming.capacity) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <span>{stats.topPerforming._count?.registrations || 0} / {stats.topPerforming.capacity} attendees</span>
                      <span>{format(new Date(stats.topPerforming.startDate), 'MMM dd')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {stats.highestRevenue && stats.highestRevenue.price > 0 && (
            <FadeIn direction="up" delay={550}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base font-semibold">Highest Revenue Event</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Most earnings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-base text-gray-900 mb-4">{stats.highestRevenue.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-semibold text-gray-900">
                        {(stats.highestRevenue.price * (stats.highestRevenue._count?.registrations || 0)).toFixed(0)} ETB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <span>{stats.highestRevenue._count?.registrations || 0} tickets at {stats.highestRevenue.price} ETB</span>
                      <span>{format(new Date(stats.highestRevenue.startDate), 'MMM dd')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      )}

      {/* Event Performance Table */}
      <FadeIn direction="up" delay={600}>
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Event Performance</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Detailed metrics for all your events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!events || events.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No events to display</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-700">Event</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Registered</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Capacity</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Fill Rate</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-700">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: DashboardEvent) => {
                      const fillRate = Math.round(
                        ((event._count?.registrations || 0) / event.capacity) * 100
                      )
                      const revenue = event.price * (event._count?.registrations || 0)
                      
                      return (
                        <TableRow 
                          key={event.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium text-sm text-gray-900">
                            <span className="line-clamp-1 max-w-[250px]">{event.title}</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {format(new Date(event.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 font-medium">
                            {event._count?.registrations || 0}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {event.capacity}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 min-w-[140px]">
                              <Progress value={fillRate} className="h-2 flex-1" />
                              <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                                {fillRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-gray-900">
                            {revenue.toFixed(0)} ETB
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <FadeIn direction="up" delay={650}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Next {Math.min(upcomingEvents.length, 5)} scheduled events
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {upcomingEvents.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((event: DashboardEvent) => {
                  const fillRate = Math.round(((event._count?.registrations || 0) / event.capacity) * 100)
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate mb-2">{event.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(event.startDate), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(event.startDate), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                          {event._count?.registrations || 0} / {event.capacity}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={fillRate} className="h-2 w-20" />
                          <p className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">{fillRate}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}