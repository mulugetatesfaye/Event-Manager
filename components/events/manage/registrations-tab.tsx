// components/events/manage/registrations-tab.tsx
'use client'

import { useState } from 'react'
import { EventWithRelations } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

interface RegistrationsTabProps {
  event: EventWithRelations
}

interface Registration {
  id: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
  status: string
  finalAmount: number
  paymentStatus: string | null
  checkedIn: boolean
  checkedInAt: Date | null
  ticketPurchases: Array<{
    id: string
    quantity: number
    ticketType: {
      name: string
    }
  }>
  createdAt: Date
}

export function RegistrationsTab({ event }: RegistrationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch registrations
  const { data: registrations, isLoading } = useQuery<Registration[]>({
    queryKey: ['event-registrations', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/registrations`)
      if (!response.ok) throw new Error('Failed to fetch registrations')
      return response.json()
    },
  })

  const filteredRegistrations = registrations?.filter(reg => {
    const matchesSearch = 
      reg.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: registrations?.length || 0,
    confirmed: registrations?.filter(r => r.status === 'CONFIRMED').length || 0,
    checkedIn: registrations?.filter(r => r.checkedIn).length || 0,
    revenue: registrations?.reduce((sum, r) => sum + (r.finalAmount || 0), 0) || 0,
  }

  const exportToCSV = () => {
    if (!filteredRegistrations || filteredRegistrations.length === 0) return

    const headers = ['Name', 'Email', 'Status', 'Amount', 'Tickets', 'Checked In', 'Registration Date']
    const rows = filteredRegistrations.map(reg => [
      `${reg.user.firstName} ${reg.user.lastName}`,
      reg.user.email,
      reg.status,
      `$${reg.finalAmount}`,
      reg.ticketPurchases.reduce((sum, tp) => sum + tp.quantity, 0),
      reg.checkedIn ? 'Yes' : 'No',
      format(new Date(reg.createdAt), 'PPP'),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/\s+/g, '-')}-registrations.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading registrations...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold">{stats.checkedIn}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendee Registrations</CardTitle>
              <CardDescription>
                View and manage event registrations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!filteredRegistrations || filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No registrations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={registration.user.imageUrl || undefined} />
                          <AvatarFallback>
                            {registration.user.firstName?.[0]}
                            {registration.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {registration.user.firstName} {registration.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{registration.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {registration.ticketPurchases.map((tp) => (
                          <div key={tp.id} className="text-xs">
                            {tp.quantity}x {tp.ticketType.name}
                          </div>
                        ))}
                        {registration.ticketPurchases.length === 0 && (
                          <span className="text-xs text-gray-500">1x General</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${registration.finalAmount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          registration.paymentStatus === 'COMPLETED'
                            ? 'default'
                            : registration.paymentStatus === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {registration.paymentStatus || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {registration.checkedIn ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">
                            {registration.checkedInAt &&
                              format(new Date(registration.checkedInAt), 'PPp')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Not checked in</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-600">
                        {format(new Date(registration.createdAt), 'PPP')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}