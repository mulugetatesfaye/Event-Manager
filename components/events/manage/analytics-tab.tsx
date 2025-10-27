// components/events/manage/analytics-tab.tsx
'use client'

import { EventWithRelations } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  DollarSign,
  TrendingUp,
  Ticket,
  Calendar,
  Target,
  Award,
  CheckCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { 
  calculateTotalTicketsSold, 
  calculateEventRevenue,
  getTicketTypeSummary 
} from '@/lib/event-utils'
import { format, differenceInDays } from 'date-fns'

interface AnalyticsTabProps {
  event: EventWithRelations
}

interface AnalyticsData {
  totalRegistrations: number
  totalTicketsSold: number
  totalRevenue: number
  averageTicketPrice: number
  checkInRate: number
  conversionRate: number
  ticketTypeBreakdown: Array<{
    name: string
    sold: number
    revenue: number
    percentage: number
  }>
}

export function AnalyticsTab({ event }: AnalyticsTabProps) {
  // Fetch detailed analytics
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['event-analytics', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/analytics`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
  })

  // Calculate some metrics from the event data
  const totalTicketsSold = calculateTotalTicketsSold(event)
  const totalRevenue = calculateEventRevenue(event)
  const ticketSummary = getTicketTypeSummary(event)
  const fillPercentage = (totalTicketsSold / event.capacity) * 100
  const daysUntilEvent = differenceInDays(new Date(event.startDate), new Date())

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading analytics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              From {totalTicketsSold} tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Capacity Filled</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{fillPercentage.toFixed(1)}%</p>
            <Progress value={fillPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Ticket Price</p>
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">
              ${totalTicketsSold > 0 ? (totalRevenue / totalTicketsSold).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per ticket</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Days Until Event</p>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{daysUntilEvent > 0 ? daysUntilEvent : 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(event.startDate), 'PPP')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Type Performance</CardTitle>
          <CardDescription>Sales breakdown by ticket type</CardDescription>
        </CardHeader>
        <CardContent>
          {ticketSummary.usesTicketingSystem ? (
            <div className="space-y-4">
              {ticketSummary.ticketTypes.map((ticket) => (
                <div key={ticket.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ticket.name}</span>
                      {ticket.isSoldOut && (
                        <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                      )}
                      {ticket.isEarlyBird && (
                        <Badge variant="secondary" className="text-xs">Early Bird</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {ticket.sold} / {ticket.total} sold
                    </span>
                  </div>
                  <Progress value={(ticket.sold / ticket.total) * 100} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>${ticket.price} per ticket</span>
                    <span>Revenue: ${(ticket.sold * ticket.price).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                This event uses simple ticketing. Add ticket types to see detailed analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Capacity</span>
              </div>
              <span className="font-medium">
                {totalTicketsSold} / {event.capacity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Available Spots</span>
              </div>
              <span className="font-medium">
                {Math.max(0, event.capacity - totalTicketsSold)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Total Tickets</span>
              </div>
              <span className="font-medium">{totalTicketsSold}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Ticket Revenue</span>
              </div>
              <span className="font-medium">${totalRevenue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
            <CardDescription>Current event state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Publication Status</span>
              </div>
              <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Fill Rate</span>
              </div>
              <Badge
                variant={
                  fillPercentage >= 80 ? 'default' :
                  fillPercentage >= 50 ? 'secondary' :
                  'outline'
                }
              >
                {fillPercentage.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Group Bookings</span>
              </div>
              <Badge variant={event.allowGroupBooking ? 'default' : 'outline'}>
                {event.allowGroupBooking ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Reserved Seating</span>
              </div>
              <Badge variant={event.requiresSeating ? 'default' : 'outline'}>
                {event.requiresSeating ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}