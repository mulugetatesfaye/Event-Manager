'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useEvent } from '@/hooks'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'
import { EventForm } from '@/components/events/event-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/layout/navbar'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const { data: currentUser } = useCurrentUser()
  const eventId = resolvedParams.id

  const { data: event, isLoading, error } = useEvent(eventId)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.error('Please sign in to edit events')
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (event && currentUser) {
      // Check if user is the organizer or admin
      if (event.organizerId !== currentUser.id && currentUser.role !== 'ADMIN') {
        toast.error('You do not have permission to edit this event')
        router.push(`/events/${eventId}`)
      }
    }
  }, [event, currentUser, eventId, router])

  if (!isLoaded || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
            <p className="text-gray-600">The event you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
              <EventForm event={event} isEdit />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}