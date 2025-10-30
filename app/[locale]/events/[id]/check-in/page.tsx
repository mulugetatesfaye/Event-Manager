// app/events/[id]/check-in/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Search,
  QrCode,
  Users,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileDown,
  Undo2,
  CheckSquare,
  MoreVertical,
  ArrowLeft,
  Calendar,
  MapPin,
} from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

interface CheckInPageProps {
  params: Promise<{
    id: string
  }>
}

interface CheckInData {
  event: {
    id: string
    title: string
    capacity: number
    startDate: string
    endDate: string
  }
  statistics: {
    totalRegistrations: number
    totalTickets: number
    checkedInCount: number
    checkedInTickets: number
    notCheckedInCount: number
    notCheckedInTickets: number
    checkInRate: number
    ticketCheckInRate: number
  }
  timeline: Array<{
    time: string
    count: number
  }>
  recentCheckIns: Array<{
    id: string
    user: {
      id: string
      firstName: string | null
      lastName: string | null
      email: string
      imageUrl: string | null
    }
    checkedInAt: string | null
    checkedInBy: string | null
    quantity: number
    notes: string | null
  }>
  registrations: Array<{
    id: string
    user: {
      id: string
      firstName: string | null
      lastName: string | null
      email: string
      imageUrl: string | null
    }
    status: string
    quantity: number
    checkedIn: boolean
    checkedInAt: string | null
    checkedInBy: string | null
    checkInNotes: string | null
    ticketNumber: string | null
    createdAt: string
  }>
}

export default function CheckInDashboard({ params }: CheckInPageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [eventData, setEventData] = useState<CheckInData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [checkInNotes, setCheckInNotes] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [undoDialogOpen, setUndoDialogOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null)
  const [undoReason, setUndoReason] = useState('')
  const [bulkNotesDialogOpen, setBulkNotesDialogOpen] = useState(false)

  // Fetch check-in data
  const fetchCheckInData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/events/${eventId}/check-in`)
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('You do not have permission to view this page')
          router.push(`/events/${eventId}`)
          return
        }
        throw new Error('Failed to fetch check-in data')
      }
      
      const data = await response.json()
      setEventData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load check-in data')
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCheckInData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCheckInData, 30000)
    return () => clearInterval(interval)
  }, [eventId])

  // Handle individual check-in
  const handleCheckIn = async (registrationId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationId, 
          notes: notes || checkInNotes 
        })
      })

      const data = await response.json()
      
      if (data.alreadyCheckedIn) {
        toast.info('Already checked in')
      } else {
        toast.success('Check-in successful!')
        await fetchCheckInData()
      }
    } catch (error) {
      toast.error('Failed to check in')
    }
  }

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (selectedRegistrations.length === 0) {
      toast.error('No registrations selected')
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/check-in/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationIds: selectedRegistrations,
          notes: checkInNotes
        })
      })

      const data = await response.json()
      toast.success(`Checked in ${data.summary.successful} attendees`)
      setSelectedRegistrations([])
      setCheckInNotes('')
      setBulkNotesDialogOpen(false)
      await fetchCheckInData()
    } catch (error) {
      toast.error('Bulk check-in failed')
    }
  }

  // Handle undo check-in
  const handleUndoCheckIn = async () => {
    if (!selectedRegistration) return

    try {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationId: selectedRegistration, 
          reason: undoReason 
        })
      })

      if (response.ok) {
        toast.success('Check-in undone')
        setUndoDialogOpen(false)
        setSelectedRegistration(null)
        setUndoReason('')
        await fetchCheckInData()
      }
    } catch (error) {
      toast.error('Failed to undo check-in')
    }
  }

  // Export data
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/check-in/export?format=${format}`
      )
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `check-ins-${eventId}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `check-ins-${eventId}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      }
      
      toast.success(`Data exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  // Filter registrations based on search and tab
  const filteredRegistrations = eventData?.registrations.filter(reg => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      reg.user.firstName?.toLowerCase().includes(searchLower) ||
      reg.user.lastName?.toLowerCase().includes(searchLower) ||
      reg.user.email.toLowerCase().includes(searchLower) ||
      reg.ticketNumber?.toLowerCase().includes(searchLower)
    )

    if (activeTab === 'checked-in') {
      return matchesSearch && reg.checkedIn
    } else if (activeTab === 'not-checked-in') {
      return matchesSearch && !reg.checkedIn
    }
    return matchesSearch
  }) || []

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    )
  }

  if (!eventData) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Failed to load check-in data</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/events/${eventId}`)}
                className="h-8 px-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Event
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Check-in Dashboard
                </h1>
                <p className="text-base text-gray-900 font-medium mb-1">{eventData.event.title}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(eventData.event.startDate), 'PPP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(eventData.event.startDate), 'p')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCheckInData()}
                  disabled={refreshing}
                  className="h-8 text-xs"
                >
                  <RefreshCw className={cn(
                    "w-3.5 h-3.5 mr-1.5",
                    refreshing && "animate-spin"
                  )} />
                  Refresh
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center justify-between">
                    Total Registrations
                    <Users className="w-4 h-4 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {eventData.statistics.totalRegistrations}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({eventData.statistics.totalTickets} tickets)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-200/50 hover:border-green-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-green-50/50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-green-700 flex items-center justify-between">
                    Checked In
                    <UserCheck className="w-4 h-4 text-green-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-green-600">
                      {eventData.statistics.checkedInCount}
                    </p>
                    <p className="text-xs text-green-600">
                      ({eventData.statistics.checkedInTickets} tickets)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-orange-200/50 hover:border-orange-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-orange-50/50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-orange-700 flex items-center justify-between">
                    Not Checked In
                    <UserX className="w-4 h-4 text-orange-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-orange-600">
                      {eventData.statistics.notCheckedInCount}
                    </p>
                    <p className="text-xs text-orange-600">
                      ({eventData.statistics.notCheckedInTickets} tickets)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-blue-50/50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-xs font-medium text-blue-700 flex items-center justify-between">
                    Check-in Rate
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {eventData.statistics.checkInRate}%
                  </p>
                  <Progress 
                    value={eventData.statistics.checkInRate} 
                    className="h-1.5"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Check-ins */}
          {eventData.recentCheckIns.length > 0 && (
            <Card className="mb-6 border border-gray-200/50 backdrop-blur-sm bg-white/50">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-white" />
                  </div>
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  {eventData.recentCheckIns.slice(0, 5).map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={checkIn.user.imageUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {checkIn.user.firstName?.[0]}{checkIn.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {checkIn.user.firstName} {checkIn.user.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{checkIn.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-600 mb-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Checked In
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {checkIn.checkedInAt && format(new Date(checkIn.checkedInAt), 'p')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registrations Table */}
          <Card className="border border-gray-200/50 backdrop-blur-sm bg-white/50">
            <CardHeader className="pb-3 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Attendees</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {filteredRegistrations.length} of {eventData.registrations.length} registrations
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <Input
                      placeholder="Search attendees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs w-full sm:w-64"
                    />
                  </div>
                  
                  {selectedRegistrations.length > 0 && (
                    <Button 
                      onClick={() => setBulkNotesDialogOpen(true)}
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                      Check In ({selectedRegistrations.length})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="text-xs">
                    All ({eventData.registrations.length})
                  </TabsTrigger>
                  <TabsTrigger value="checked-in" className="text-xs">
                    Checked In ({eventData.statistics.checkedInCount})
                  </TabsTrigger>
                  <TabsTrigger value="not-checked-in" className="text-xs">
                    Not Checked In ({eventData.statistics.notCheckedInCount})
                  </TabsTrigger>
                </TabsList>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredRegistrations.length > 0 &&
                              filteredRegistrations.every(r => selectedRegistrations.includes(r.id))
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRegistrations(filteredRegistrations.map(r => r.id))
                              } else {
                                setSelectedRegistrations([])
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-xs">Attendee</TableHead>
                        <TableHead className="text-xs">Ticket</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Check-in Time</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((registration) => (
                          <TableRow key={registration.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox
                                checked={selectedRegistrations.includes(registration.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRegistrations([...selectedRegistrations, registration.id])
                                  } else {
                                    setSelectedRegistrations(selectedRegistrations.filter(id => id !== registration.id))
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={registration.user.imageUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {registration.user.firstName?.[0]}{registration.user.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-xs text-gray-900">
                                    {registration.user.firstName} {registration.user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-600">{registration.user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                {registration.ticketNumber || registration.id.slice(-8)}
                              </code>
                            </TableCell>
                            <TableCell className="text-xs">{registration.quantity}</TableCell>
                            <TableCell>
                              {registration.checkedIn ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {registration.checkedInAt ? (
                                <span className="text-xs text-gray-700">
                                  {format(new Date(registration.checkedInAt), 'MMM dd, p')}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!registration.checkedIn ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleCheckIn(registration.id)}
                                  className="h-7 text-xs px-3"
                                >
                                  Check In
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRegistration(registration.id)
                                    setUndoDialogOpen(true)
                                  }}
                                  className="h-7 text-xs px-2"
                                >
                                  <Undo2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-sm text-gray-500">No registrations found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Check-in Dialog */}
      <Dialog open={bulkNotesDialogOpen} onOpenChange={setBulkNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Check-in</DialogTitle>
            <DialogDescription>
              Check in {selectedRegistrations.length} attendee(s). Add optional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this bulk check-in..."
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCheckIn}>
              Check In {selectedRegistrations.length} Attendee(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Check-in Dialog */}
      <Dialog open={undoDialogOpen} onOpenChange={setUndoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Check-in</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo this check-in? This action can be reversed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason (Optional)</label>
              <Textarea
                placeholder="Enter reason for undoing check-in..."
                value={undoReason}
                onChange={(e) => setUndoReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUndoDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUndoCheckIn}>
              Undo Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}