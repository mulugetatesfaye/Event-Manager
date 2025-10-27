// app/events/[id]/manage/page.tsx
'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEvent } from '@/hooks'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Ticket,
  Tag,
  Users,
  BarChart3,
  Settings,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import { format } from 'date-fns'
import Link from 'next/link'
import { TicketTypesTab } from '@/components/events/manage/ticket-types-tab'
import { PromoCodesTab } from '@/components/events/manage/promo-codes-tab'
import { RegistrationsTab } from '@/components/events/manage/registrations-tab'
import { AnalyticsTab } from '@/components/events/manage/analytics-tab'

interface ManageEventPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ManageEventPage({ params }: ManageEventPageProps) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const { data: currentUser } = useCurrentUser()
  const { data: event, isLoading, error } = useEvent(eventId)
  const [activeTab, setActiveTab] = useState('tickets')

  // Check permissions
  const isOrganizer = currentUser?.id === event?.organizerId
  const isAdmin = currentUser?.role === 'ADMIN'
  const hasAccess = isOrganizer || isAdmin

  if (!isLoaded || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  if (!isSignedIn) {
    router.push('/sign-in')
    return null
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
            <p className="text-gray-600 mb-4">The event you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (!hasAccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don&apos;t have permission to manage this event.</p>
            <Button onClick={() => router.push(`/events/${eventId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              View Event
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/events/${eventId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
              <Link href={`/events/${eventId}/edit`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Event
                </Button>
              </Link>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {event.title}
                  </h1>
                  <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.startDate), 'PPP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Ticket Types</span>
                <span className="sm:hidden">Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="promos" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Promo Codes</span>
                <span className="sm:hidden">Promos</span>
              </TabsTrigger>
              <TabsTrigger value="registrations" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Registrations</span>
                <span className="sm:hidden">Attendees</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              <TicketTypesTab event={event} />
            </TabsContent>

            <TabsContent value="promos">
              <PromoCodesTab event={event} />
            </TabsContent>

            <TabsContent value="registrations">
              <RegistrationsTab event={event} />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab event={event} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}