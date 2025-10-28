'use client'

import { useMyEvents, useDeleteEvent } from '@/hooks'
import { useCurrentUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FadeIn } from '@/components/ui/fade-in'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  MapPin,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Shield,
  Building,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { DashboardEvent } from '@/types'
import { useQuery } from '@tanstack/react-query'

// Helper functions
const formatCurrency = (amount: number): string => {
  return `Br ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

// Type for admin event data from API
interface AdminEventData {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  location: string
  venue: string | null
  startDate: Date | string
  endDate: Date | string
  capacity: number
  price: number
  status: string
  totalTicketsSold: number
  totalRevenue: number
  fillRate: number
  availableSpots: number
  organizer: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  _count: {
    registrations: number
    ticketTypes: number
  }
  ticketTypes?: Array<{
    id: string
    name: string
    price: number
    quantity: number
    quantitySold: number
  }>
}

export default function MyEventsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const isAdmin = currentUser?.role === 'ADMIN'

  if (userLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return <AdminMyEventsView />
  }

  return <OrganizerMyEventsView />
}

// Admin View - All events in the system
function AdminMyEventsView() {
  const deleteEvent = useDeleteEvent()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Fetch all events for admin
  const { data: events, isLoading } = useQuery<AdminEventData[]>({
    queryKey: ['admin-my-events'],
    queryFn: async () => {
      const response = await fetch('/api/admin/events?limit=0')
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json()
    }
  })

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedEventId) {
      await deleteEvent.mutateAsync(selectedEventId)
      setDeleteDialogOpen(false)
      setSelectedEventId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default'
      case 'DRAFT':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      case 'COMPLETED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return CheckCircle2
      case 'DRAFT':
        return FileText
      case 'CANCELLED':
        return XCircle
      case 'COMPLETED':
        return CheckCircle2
      default:
        return FileText
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    if (!events) return {
      total: 0,
      published: 0,
      draft: 0,
      completed: 0,
      totalAttendees: 0,
      totalRevenue: 0
    }

    return {
      total: events.length,
      published: events.filter((e: AdminEventData) => e.status === 'PUBLISHED').length,
      draft: events.filter((e: AdminEventData) => e.status === 'DRAFT').length,
      completed: events.filter((e: AdminEventData) => e.status === 'COMPLETED').length,
      totalAttendees: events.reduce((sum: number, e: AdminEventData) => sum + (e.totalTicketsSold || 0), 0),
      totalRevenue: events.reduce((sum: number, e: AdminEventData) => sum + (e.totalRevenue || 0), 0)
    }
  }, [events])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header Section */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                All Events (Admin)
              </h1>
              <p className="text-sm text-gray-600">
                Manage all events in the system
              </p>
            </div>
          </div>
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Link href="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats Overview */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.published)}</p>
                  <p className="text-xs text-gray-600">Live</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.draft)}</p>
                  <p className="text-xs text-gray-600">Unpublished</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={250}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.completed)}</p>
                  <p className="text-xs text-gray-600">Past</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalAttendees)}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={350}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-600">Earned</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events Table/Empty State */}
      {!events || events.length === 0 ? (
        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events in system</h3>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                No events have been created yet
              </p>
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    All Events
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {formatNumber(events.length)} {events.length === 1 ? 'event' : 'events'} total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-700">Event Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Organizer</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Capacity</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: AdminEventData) => {
                      const StatusIcon = getStatusIcon(event.status)
                      
                      return (
                        <TableRow 
                          key={event.id} 
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <TableCell className="font-medium text-sm text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-gray-600" />
                              </div>
                              <span className="truncate max-w-[250px]">{event.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate max-w-[150px]">
                                {event.organizer.firstName} {event.organizer.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="space-y-0.5">
                              <div>{format(new Date(event.startDate), 'MMM dd, yyyy')}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(event.startDate), 'h:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2 min-w-[140px]">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">
                                  {formatNumber(event.totalTicketsSold || 0)} / {formatNumber(event.capacity)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={event.fillRate || 0} className="h-2 flex-1" />
                                <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">
                                  {event.fillRate || 0}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusColor(event.status)}
                              className="text-xs gap-1.5"
                            >
                              <StatusIcon className="w-3 h-3" />
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-gray-500">
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/events/${event.id}`} className="flex items-center">
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/events/${event.id}/edit`} className="flex items-center">
                                    <Edit className="w-4 h-4 mr-2 text-gray-400" />
                                    Edit Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">Delete Event?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              This will permanently delete the event and all associated registrations from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Organizer View - Only their events
function OrganizerMyEventsView() {
  const { data: events, isLoading } = useMyEvents()
  const deleteEvent = useDeleteEvent()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedEventId) {
      await deleteEvent.mutateAsync(selectedEventId)
      setDeleteDialogOpen(false)
      setSelectedEventId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default'
      case 'DRAFT':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      case 'COMPLETED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return CheckCircle2
      case 'DRAFT':
        return FileText
      case 'CANCELLED':
        return XCircle
      case 'COMPLETED':
        return CheckCircle2
      default:
        return FileText
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    if (!events) return {
      total: 0,
      published: 0,
      draft: 0,
      completed: 0,
      totalAttendees: 0,
      totalRevenue: 0
    }

    return {
      total: events.length,
      published: events.filter((e: DashboardEvent) => e.status === 'PUBLISHED').length,
      draft: events.filter((e: DashboardEvent) => e.status === 'DRAFT').length,
      completed: events.filter((e: DashboardEvent) => e.status === 'COMPLETED').length,
      totalAttendees: events.reduce((sum: number, e: { _count?: { registrations?: number } }) => sum + (e._count?.registrations || 0), 0),
      totalRevenue: events.reduce((sum: number, e: { price: number; _count?: { registrations?: number } }) => sum + (e.price * (e._count?.registrations || 0)), 0)
    }
  }, [events])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header Section */}
      <FadeIn direction="down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Events
            </h1>
            <p className="text-sm text-gray-600">
              Manage and track all your events
            </p>
          </div>
          <Button 
            asChild 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Link href="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats Overview */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.published)}</p>
                  <p className="text-xs text-gray-600">Live</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.draft)}</p>
                  <p className="text-xs text-gray-600">Unpublished</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={250}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.completed)}</p>
                  <p className="text-xs text-gray-600">Past</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Attendees</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalAttendees)}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={350}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-gray-600">Earned</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events Table/Empty State */}
      {!events || events.length === 0 ? (
        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events yet</h3>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                Get started by creating your first event and sharing it with your audience
              </p>
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    All Events
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {formatNumber(events.length)} {events.length === 1 ? 'event' : 'events'} total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-700">Event Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Capacity</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: DashboardEvent) => {
                      const fillRate = Math.round(((event._count?.registrations || 0) / event.capacity) * 100)
                      const StatusIcon = getStatusIcon(event.status)
                      
                      return (
                        <TableRow 
                          key={event.id} 
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <TableCell className="font-medium text-sm text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-gray-600" />
                              </div>
                              <span className="truncate max-w-[250px]">{event.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="space-y-0.5">
                              <div>{format(new Date(event.startDate), 'MMM dd, yyyy')}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(event.startDate), 'h:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2 min-w-[140px]">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900 font-medium">
                                  {formatNumber(event._count?.registrations || 0)} / {formatNumber(event.capacity)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={fillRate} className="h-2 flex-1" />
                                <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">
                                  {fillRate}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusColor(event.status)}
                              className="text-xs gap-1.5"
                            >
                              <StatusIcon className="w-3 h-3" />
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-gray-500">
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/events/${event.id}`} className="flex items-center">
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                  <Link href={`/events/${event.id}/edit`} className="flex items-center">
                                    <Edit className="w-4 h-4 mr-2 text-gray-400" />
                                    Edit Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">Delete Event?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              This will permanently delete the event and all associated registrations from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}