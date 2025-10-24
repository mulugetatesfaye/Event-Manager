'use client'

import { useMyEvents, useDeleteEvent } from '@/hooks'
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
  TrendingUp,
  MapPin,
  DollarSign,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { DashboardEvent } from '@/types'
import { cn } from '@/lib/utils'

export default function MyEventsPage() {
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
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
                My Events
              </span>
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5">
              Manage and track all your events
            </p>
          </div>
          <Button 
            asChild 
            size="sm" 
            className="h-7 text-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden w-fit"
          >
            <Link href="/events/create">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Plus className="w-3 h-3 mr-1.5 relative" />
              <span className="relative">Create Event</span>
            </Link>
          </Button>
        </div>
      </FadeIn>

      {/* Stats Overview */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <FadeIn direction="up" delay={100}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Total</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{stats.total}</p>
                <p className="text-[10px] text-gray-500">Events</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Published</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{stats.published}</p>
                <p className="text-[10px] text-gray-500">Live</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Drafts</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{stats.draft}</p>
                <p className="text-[10px] text-gray-500">Unpublished</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={250}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Completed</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{stats.completed}</p>
                <p className="text-[10px] text-gray-500">Past</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={300}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Attendees</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{stats.totalAttendees}</p>
                <p className="text-[10px] text-gray-500">Total</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="up" delay={350}>
            <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all group backdrop-blur-sm bg-white/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-600 font-medium">Revenue</p>
                  <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 tabular-nums">${stats.totalRevenue.toFixed(0)}</p>
                <p className="text-[10px] text-gray-500">Earned</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Events Table/Empty State */}
      {!events || events.length === 0 ? (
        <FadeIn direction="up" delay={200}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50 relative overflow-hidden">
            {/* Pattern overlay */}
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
                Get started by creating your first event and sharing it with your audience
              </p>
              <Button 
                asChild 
                size="sm" 
                className="h-8 text-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
              >
                <Link href="/events/create">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Plus className="w-3.5 h-3.5 mr-1.5 relative" />
                  <span className="relative">Create Your First Event</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={400}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-white" />
                    </div>
                    All Events
                  </CardTitle>
                  <CardDescription className="text-[10px] mt-0.5">
                    {events.length} {events.length === 1 ? 'event' : 'events'} total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="rounded-lg border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80">
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Event Name</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Date</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Location</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Capacity</TableHead>
                        <TableHead className="text-[10px] font-semibold text-gray-700 h-9">Status</TableHead>
                        <TableHead className="text-right text-[10px] font-semibold text-gray-700 h-9">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event: DashboardEvent, index: number) => {
                        const fillRate = Math.round(((event._count?.registrations || 0) / event.capacity) * 100)
                        const StatusIcon = getStatusIcon(event.status)
                        
                        return (
                          <TableRow 
                            key={event.id} 
                            className="hover:bg-gray-50/50 transition-colors group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium text-xs text-gray-900 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded flex items-center justify-center flex-shrink-0 group-hover:from-primary group-hover:to-purple-600 transition-all">
                                  <Calendar className="w-3 h-3 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <span className="truncate max-w-[200px]">{event.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 py-3">
                              <div className="flex flex-col">
                                <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                                <span className="text-[10px] text-gray-500">
                                  {format(new Date(event.startDate), 'h:mm a')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 py-3">
                              <div className="flex items-center gap-1 max-w-[150px]">
                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="space-y-1 min-w-[100px]">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-900 font-medium tabular-nums">
                                    {event._count?.registrations || 0} / {event.capacity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Progress value={fillRate} className="h-0.5 flex-1" />
                                  <span className="text-[10px] text-gray-600 font-medium tabular-nums">
                                    {fillRate}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge 
                                variant={getStatusColor(event.status)}
                                className="text-[10px] h-5 px-2 gap-1"
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 backdrop-blur-sm bg-white/95">
                                  <DropdownMenuLabel className="text-[10px] text-gray-500 font-medium">
                                    ACTIONS
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-100" />
                                  <DropdownMenuItem asChild className="text-xs cursor-pointer">
                                    <Link href={`/events/${event.id}`} className="flex items-center">
                                      <Eye className="w-3 h-3 mr-2 text-gray-400" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild className="text-xs cursor-pointer">
                                    <Link href={`/events/${event.id}/edit`} className="flex items-center">
                                      <Edit className="w-3 h-3 mr-2 text-gray-400" />
                                      Edit Event
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-100" />
                                  <DropdownMenuItem
                                    className="text-xs text-red-600 cursor-pointer focus:text-red-600"
                                    onClick={() => handleDeleteClick(event.id)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
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
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 border-gray-200/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-base">Delete Event?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-gray-600">
              This action cannot be undone. This will permanently delete the
              event and all associated registrations from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}