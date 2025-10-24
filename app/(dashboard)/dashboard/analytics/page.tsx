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
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Award,
  Zap,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus
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
import { cn } from '@/lib/utils'

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
      {/* Header */}
      <FadeIn direction="down">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Analytics
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">
            Track your event performance and key metrics
          </p>
        </div>
      </FadeIn>

      {/* Main Stats Grid */}
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
              <p className="text-[10px] text-gray-600 mt-0.5">
                {stats.publishedEvents} published
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={150}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Registrations</p>
                <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalRegistrations}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Across all events
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Avg Attendance</p>
                <div className="h-6 w-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.averageAttendance}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Per event
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={250}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Total Revenue</p>
                <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">${stats.totalRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                From ticket sales
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FadeIn direction="up" delay={300}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Fill Rate</p>
                <div className="h-6 w-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.avgFillRate}%</p>
              <div className="mt-1.5">
                <Progress value={stats.avgFillRate} className="h-0.5" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={350}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Upcoming</p>
                <div className="h-6 w-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.upcomingEvents}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Scheduled
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Completed</p>
                <div className="h-6 w-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.pastEvents}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Past events
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={450}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-600 font-medium">Drafts</p>
                <div className="h-6 w-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.draftEvents}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Unpublished
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Top Performers */}
      {(stats.topPerforming || stats.highestRevenue) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.topPerforming && (
            <FadeIn direction="up" delay={500}>
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
                <CardHeader className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-sm">Top Performing Event</CardTitle>
                  </div>
                  <CardDescription className="text-[10px]">Highest fill rate</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">{stats.topPerforming.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Fill Rate</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(((stats.topPerforming._count?.registrations || 0) / stats.topPerforming.capacity) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={((stats.topPerforming._count?.registrations || 0) / stats.topPerforming.capacity) * 100} 
                      className="h-1"
                    />
                    <div className="flex items-center justify-between text-[10px] text-gray-600">
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
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
                <CardHeader className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-sm">Highest Revenue Event</CardTitle>
                  </div>
                  <CardDescription className="text-[10px]">Most earnings</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">{stats.highestRevenue.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        ${(stats.highestRevenue.price * (stats.highestRevenue._count?.registrations || 0)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-600">
                      <span>{stats.highestRevenue._count?.registrations || 0} tickets at ${stats.highestRevenue.price}</span>
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
        <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
          <CardHeader className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-sm">Event Performance</CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Detailed metrics for all your events
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {!events || events.length === 0 ? (
              <div className="text-center py-8 relative">
                <div 
                  className="absolute inset-0 opacity-[0.015]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
                    backgroundSize: '1rem 1rem'
                  }}
                />
                <div className="relative">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No events to display</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Event</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Date</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Status</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Registered</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Capacity</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Fill Rate</TableHead>
                        <TableHead className="text-right text-[10px] font-semibold text-gray-700 h-9">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event: DashboardEvent, index: number) => {
                        const fillRate = Math.round(
                          ((event._count?.registrations || 0) / event.capacity) * 100
                        )
                        const revenue = event.price * (event._count?.registrations || 0)
                        
                        return (
                          <TableRow 
                            key={event.id}
                            className="hover:bg-gray-50/50 transition-colors"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium text-xs text-gray-900 py-3">
                              <span className="line-clamp-1 max-w-[200px]">{event.title}</span>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 py-3">
                              {format(new Date(event.startDate), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge 
                                variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                                className="text-[10px] h-5 px-2"
                              >
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-900 font-medium py-3 tabular-nums">
                              {event._count?.registrations || 0}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 py-3 tabular-nums">
                              {event.capacity}
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <Progress value={fillRate} className="h-1 flex-1" />
                                <span className="text-xs font-medium text-gray-900 tabular-nums w-10 text-right">
                                  {fillRate}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-gray-900 py-3 tabular-nums">
                              ${revenue.toFixed(0)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <FadeIn direction="up" delay={650}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-sm">Upcoming Events</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] mt-0.5">
                    Next {Math.min(upcomingEvents.length, 5)} scheduled events
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  {upcomingEvents.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2.5">
                {upcomingEvents.slice(0, 5).map((event: DashboardEvent) => {
                  const fillRate = Math.round(((event._count?.registrations || 0) / event.capacity) * 100)
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">{event.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {format(new Date(event.startDate), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(event.startDate), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900 tabular-nums">
                          {event._count?.registrations || 0} / {event.capacity}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Progress value={fillRate} className="h-0.5 w-16" />
                          <p className="text-[10px] text-gray-600 tabular-nums">{fillRate}%</p>
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